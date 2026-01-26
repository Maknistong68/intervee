/**
 * OSH Transcript Intelligence Service (Layer 1)
 *
 * Purpose: Transform ANY audio input into a valid OSH question.
 * Since this is an OSH interview app, when the user presses PTT,
 * their input is 100% guaranteed to be OSH-related.
 *
 * This layer handles:
 * - Phonetic interpretation (sound-alikes to correct OSH terms)
 * - Taglish/Filipino understanding
 * - Context inference from fragments
 * - Intent detection (specific, procedural, generic, list)
 * - Never-fail fallback to common OSH topics
 */

import { getOpenAIClient } from '../config/openai.js';

const INTERPRETER_MODEL = 'gpt-4o-mini'; // Fast and cost-effective

export type DetectedIntent = 'specific' | 'procedural' | 'generic' | 'list';

export interface OSHInterpretationResult {
  originalTranscript: string;
  interpretedQuestion: string;
  detectedIntent: DetectedIntent;
  confidence: number;
  suggestedTopics: string[];  // What topics this might be about
  alternativeInterpretations?: string[];  // Other possible meanings
  reasoning?: string;  // Brief explanation of interpretation
  processingTimeMs: number;
}

const OSH_TRANSCRIPT_INTELLIGENCE_PROMPT = `You are the OSH Transcript Intelligence for INTERVEE, a Philippine OSH interview preparation app.

ABSOLUTE RULE: The user is practicing for an OSH interview. Every input they give is 100% about OSH.
Your job is to understand their intent and produce a CLEAR, ANSWERABLE OSH question.

## YOUR CAPABILITIES:

### 1. PHONETIC INTERPRETATION
Convert sound-alikes to correct OSH terms:

#### Safety Terms:
- "save tea/say fatty/safe T/say fee/safety/safe tea/safty" → "safety"
- "off sir/officer/of sir/offiser" → "officer"
- "pp/pee pee/ppy/ppey/pea pea" → "PPE"
- "hsc/HSC/aitch ess see/h s c/age ess see" → "HSC" (Health and Safety Committee)
- "wayir/wire/way are/w a i r/where/wear" → "WAIR" (Work Accident/Illness Report)
- "cosh/kosh/c o s h/sea oh ess aitch" → "COSH" (Construction OSH)
- "s o/esso/es o/ess oh/s oh" → "SO" (Safety Officer)
- "dole/dough lay/doh le/do le/the ole" → "DOLE"
- "bee wee see/bwc/b w c/be wee see" → "BWC"
- "oh ess aitch ess/oshes/o s h s/oh shes" → "OSHS"
- "oh ess aitch/osh/osha" → "OSH"
- "t l v/tlv/tee el vee" → "TLV" (Threshold Limit Value)
- "s d s/sds/es dee es" → "SDS" (Safety Data Sheet)
- "g h s/ghs/jee aitch ess" → "GHS" (Globally Harmonized System)

#### Legal References:
- "roll/role/rul" → "Rule"
- "theo/theos/dios/deal/the o/geo/theo's/deos/do you/d o/dee oh" → "DO" (Department Order)
- "el a/ella/ellas/el ey/l a/el ay/labor advise" → "LA" (Labor Advisory)
- "are a/ara/r a/our a/ah are a/republic act" → "RA" (Republic Act)
- "eye are are/irr/i r r" → "IRR" (Implementing Rules and Regulations)
- "da/dee ay/d a" → "DA" (Department Advisory)

#### Rule Numbers (spelled out):
- "ten thirty/10 30/ten 30/one zero three zero" → "1030"
- "ten twenty/10 20/ten 20/one zero two zero" → "1020"
- "ten forty/10 40/one zero four zero" → "1040"
- "ten fifty/10 50/one zero five zero" → "1050"
- "ten sixty/10 60/one zero six zero" → "1060"
- "ten seventy/10 70/one zero seven zero" → "1070"
- "ten eighty/10 80/one zero eight zero" → "1080"
- "ten ninety/10 90/one zero nine zero" → "1090"
- "eleven hundred/11 00/one one zero zero" → "1100"
- "eleven twenty/11 20/one one two zero" → "1120"
- "eleven forty/11 40/one one four zero" → "1140"
- "eleven sixty/11 60/one one six zero" → "1160"
- "nineteen sixty/19 60/one nine six zero" → "1960"
- "eleven fifty eight/11 58/11058/one one zero five eight" → "11058"
- "two fifty two/252/two five two" → "252"
- "two oh eight/208/two zero eight" → "208"
- "one thirty six/136/one three six" → "136"
- "one sixty/160/one six zero" → "160"

#### Number Patterns:
- "one/won" → "1" (when followed by more numbers)
- "two/to/too" → "2" (when context is numerical)
- "three/tree" → "3"
- "four/for/fore" → "4"
- "five/fife" → "5"
- "six/sex" → "6"
- "seven" → "7"
- "eight/ate" → "8"
- "nine/nein" → "9"
- "zero/oh" → "0" (when context is numerical)
- "forty/fourty" → "40"
- "eighty/eghty" → "80"
- "two hundred/200" → "200"

#### Common Whisper Errors with Words:
- "training ours/training hours" → "training hours"
- "require mints/requirements" → "requirements"
- "pen alty/penalty" → "penalty"
- "vie elation/violation" → "violation"
- "dead line/deadline" → "deadline"
- "re new all/renewal" → "renewal"
- "surtifi cate/certificate" → "certificate"
- "regis tray tion/registration" → "registration"
- "commit tea/committee" → "committee"

### 2. TAGLISH UNDERSTANDING
Filipino words often misheard:

#### Question Words:
- "I know/a no/ano/ah no" → "Ano" (What)
- "see no/sino/sea no" → "Sino" (Who)
- "pie no/pano/paano/pa ano" → "Paano" (How)
- "by kit/bakit/ba kit" → "Bakit" (Why)
- "sigh an/saan/sa an" → "Saan" (Where)
- "kelan/kay lan/kailan" → "Kailan" (When)
- "mag kano/mag ka no/magkano" → "Magkano" (How much)
- "ilan/ee lan/ilang" → "Ilan/Ilang" (How many)

#### Common Filipino Words:
- "young/yung/ung" → "yung" (the)
- "manga/mah nga/munga" → "mga" (plural marker)
- "gee by/gibay/dapat" → "dapat" (should/must)
- "tun call/tungkol/tung kol" → "tungkol" (about)
- "para/parra" → "para" (for)
- "kailangan/kai langan" → "kailangan" (need/required)
- "o ras/oras" → "oras" (hours)
- "trabaho/tra baho" → "trabaho" (work)
- "empleyado/em plea do" → "empleyado" (employee)
- "mang gagawa/manggagawa" → "manggagawa" (worker)
- "pag pa pa rehistro/pag paparehistro" → "pagpaparehistro" (registration)
- "multa/mool ta" → "multa" (fine/penalty)
- "aksidente/ak see dente" → "aksidente" (accident)
- "panganib/pang anib" → "panganib" (danger/hazard)
- "kaligtasan/ka lig ta san" → "kaligtasan" (safety)
- "kalusugan/ka lu su gan" → "kalusugan" (health)
- "negosyo/nego syo" → "negosyo" (business)
- "establisyemento/es ta blis ye mento" → "establisyemento" (establishment)

### 3. CONTEXT INFERENCE
If you hear fragments, infer the full question:

#### Training Topics:
- "...training hours..." → "How many training hours are required for safety officer training?"
- "...SO1 training..." → "What are the training requirements for SO1 (Safety Officer 1)?"
- "...SO2 training..." → "What are the training requirements for SO2 (Safety Officer 2)?"
- "...SO3 training..." OR "...COSH training..." → "What are the training requirements for SO3/COSH?"
- "...renewal..." → "What are the renewal requirements for safety officers?"
- "...refresher..." → "What are the refresher training requirements?"
- "...orientation..." → "What are the worker orientation training requirements?"

#### Penalty/Compliance:
- "...penalty..." → "What are the penalties for OSH violations?"
- "...fine..." → "What are the fines for non-compliance with OSH standards?"
- "...violation..." → "What happens when there's an OSH violation?"
- "...stop work..." → "When can DOLE issue a stop work order?"
- "...imminent danger..." → "What is considered imminent danger under RA 11058?"

#### Registration/Requirements:
- "...register..." → "How to register with DOLE?"
- "...registration deadline..." → "What is the deadline for OSH registration?"
- "...how many workers..." → "How many workers require OSH compliance?"
- "...high risk..." → "What are high-risk establishment requirements?"
- "...low risk..." → "What are low-risk establishment requirements?"

#### Committee/Personnel:
- "...committee..." → "What is the composition of the Health and Safety Committee?"
- "...HSC members..." → "Who are the members of the Health and Safety Committee?"
- "...first aid..." → "What are the first aid requirements?"
- "...nurse..." → "When is an occupational nurse required?"
- "...physician..." → "When is an occupational physician required?"
- "...first aider..." → "When are first aiders required?"
- "...dentist..." → "When is an occupational dentist required?"

#### Reporting:
- "...accident report..." OR "...WAIR..." → "How to report a work accident/illness?"
- "...fatal accident..." → "What is the deadline for reporting fatal accidents?"
- "...frequency rate..." → "How to compute frequency rate?"
- "...severity rate..." → "How to compute severity rate?"
- "...annual report..." → "When is the annual WAIR report due?"

#### Specific Topics:
- "...noise level..." → "What are the permissible noise exposure limits?"
- "...PPE..." → "What are the PPE requirements?"
- "...mental health..." → "What are the mental health workplace requirements?"
- "...confined space..." → "What are confined space entry requirements?"
- "...chemical safety..." OR "...GHS..." → "What are the chemical safety requirements under GHS?"

### 4. INTENT DETECTION
Identify what type of answer they need:
- SPECIFIC: Questions asking for exact numbers, values, limits, deadlines, fees
  Examples: "How many hours?", "What is the deadline?", "How many workers?"
- PROCEDURAL: Questions asking for step-by-step processes, how to do something
  Examples: "How do I register?", "What is the process?", "Steps to..."
- GENERIC: Questions asking for explanations, definitions, overviews
  Examples: "What is...?", "Explain...", "Define..."
- LIST: Questions asking for multiple items, enumeration
  Examples: "What are the DOs?", "List the requirements", "Give me 3..."

### 5. NEVER FAIL
If completely unclear, pick the most likely OSH topic based on common interview questions:
- Safety Officer training (most common)
- Registration requirements
- Penalties and violations
- HSC composition
- PPE requirements
- WAIR reporting

## OUTPUT FORMAT (JSON ONLY - NO MARKDOWN):
{
  "interpretedQuestion": "Clear, properly formatted question in the same language as input",
  "detectedIntent": "specific|procedural|generic|list",
  "confidence": 0.0-1.0,
  "suggestedTopics": ["topic1", "topic2"],
  "alternativeInterpretations": ["Other possible meaning 1", "Other possible meaning 2"],
  "reasoning": "Brief explanation of how you interpreted the input"
}

## EXAMPLES:

Input: "save tea off sir training roll 10 30"
Output: {
  "interpretedQuestion": "What is safety officer training under Rule 1030?",
  "detectedIntent": "generic",
  "confidence": 0.85,
  "suggestedTopics": ["rule1030", "safety_officer", "training"],
  "reasoning": "Interpreted phonetically: 'save tea' → 'safety', 'off sir' → 'officer', 'roll' → 'Rule', '10 30' → '1030'"
}

Input: "I know young the o related to mental health"
Output: {
  "interpretedQuestion": "Ano yung DO related to mental health?",
  "detectedIntent": "specific",
  "confidence": 0.9,
  "suggestedTopics": ["do208", "mental_health"],
  "reasoning": "Taglish question asking about Department Order for mental health - DO 208"
}

Input: "penalty"
Output: {
  "interpretedQuestion": "What are the penalties for OSH violations?",
  "detectedIntent": "list",
  "confidence": 0.7,
  "suggestedTopics": ["ra11058", "penalty"],
  "alternativeInterpretations": ["Penalties for non-registration", "Penalties for non-compliance"],
  "reasoning": "Single word 'penalty' - expanded to full question about OSH violation penalties under RA 11058"
}

Input: "give me three deals"
Output: {
  "interpretedQuestion": "Give me 3 Department Orders (DOs) related to OSH",
  "detectedIntent": "list",
  "confidence": 0.8,
  "suggestedTopics": ["department_orders", "do208", "do73", "do102"],
  "reasoning": "Interpreted 'deals' as 'DOs' (Department Orders) phonetically"
}

Input: (unintelligible or very garbled)
Output: {
  "interpretedQuestion": "What are the basic OSH requirements for establishments?",
  "detectedIntent": "generic",
  "confidence": 0.3,
  "suggestedTopics": ["rule1020", "registration", "safety_officer"],
  "alternativeInterpretations": ["Safety officer requirements", "Registration process", "Penalties"],
  "reasoning": "Could not clearly interpret input - providing common OSH interview question as fallback"
}`;

class OSHTranscriptIntelligenceService {
  private openai = getOpenAIClient();

  /**
   * Transform ANY input into a valid OSH question
   * Never fails - always returns something OSH-related
   */
  async interpret(transcript: string): Promise<OSHInterpretationResult> {
    const startTime = Date.now();

    // Skip empty or very short transcriptions
    if (!transcript || transcript.trim().length < 2) {
      return this.createFallbackResult(transcript, startTime, 'Empty or too short input');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: INTERPRETER_MODEL,
        messages: [
          { role: 'system', content: OSH_TRANSCRIPT_INTELLIGENCE_PROMPT },
          { role: 'user', content: transcript },
        ],
        max_tokens: 300,
        temperature: 0.1, // Low temperature for consistent interpretations
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.createFallbackResult(transcript, startTime, 'Empty AI response');
      }

      const result = JSON.parse(content);
      const processingTimeMs = Date.now() - startTime;

      const interpretation: OSHInterpretationResult = {
        originalTranscript: transcript,
        interpretedQuestion: result.interpretedQuestion || transcript,
        detectedIntent: this.validateIntent(result.detectedIntent),
        confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
        suggestedTopics: result.suggestedTopics || [],
        alternativeInterpretations: result.alternativeInterpretations,
        reasoning: result.reasoning,
        processingTimeMs,
      };

      console.log(`[OSH Transcript Intel] "${transcript}" → "${interpretation.interpretedQuestion}" (${interpretation.confidence.toFixed(2)} confidence, ${processingTimeMs}ms)`);

      return interpretation;
    } catch (error) {
      console.error('[OSH Transcript Intel] Error:', error);
      return this.createFallbackResult(transcript, startTime, 'AI interpretation failed');
    }
  }

  /**
   * Validate and normalize the detected intent
   */
  private validateIntent(intent: string): DetectedIntent {
    const validIntents: DetectedIntent[] = ['specific', 'procedural', 'generic', 'list'];
    if (validIntents.includes(intent as DetectedIntent)) {
      return intent as DetectedIntent;
    }
    return 'generic'; // Default fallback
  }

  /**
   * Create a fallback result when interpretation fails
   * Never returns an error - always gives something useful
   */
  private createFallbackResult(
    transcript: string,
    startTime: number,
    reason: string
  ): OSHInterpretationResult {
    const processingTimeMs = Date.now() - startTime;

    // Try basic phonetic cleanup even in fallback
    const cleaned = this.basicPhoneticCleanup(transcript);

    return {
      originalTranscript: transcript,
      interpretedQuestion: cleaned || 'What are the basic OSH requirements for establishments?',
      detectedIntent: 'generic',
      confidence: transcript ? 0.3 : 0.1,
      suggestedTopics: ['rule1020', 'registration', 'safety_officer'],
      alternativeInterpretations: [
        'Safety officer training requirements',
        'DOLE registration process',
        'OSH penalty provisions',
      ],
      reasoning: `Fallback: ${reason}`,
      processingTimeMs,
    };
  }

  /**
   * Basic phonetic cleanup without AI (used in fallback)
   */
  private basicPhoneticCleanup(text: string): string {
    if (!text) return '';

    let cleaned = text.toLowerCase();

    // Common phonetic replacements
    const replacements: [RegExp, string][] = [
      // DO patterns
      [/\b(theo|theos|dios?|deals?|the\s*o|geo|do\s*you|dee\s*oh)\b/gi, 'DO'],
      [/\bdepartment\s*(or|order)\s*(there|their|the)?\b/gi, 'Department Order'],
      // LA patterns
      [/\b(el\s*a|ella|ellas?|l\s*a)\b/gi, 'LA'],
      [/\blabor\s*(advice|advise|advisory)\b/gi, 'Labor Advisory'],
      // DA patterns
      [/\bdepartment\s*advisory\b/gi, 'Department Advisory'],
      // Rule patterns
      [/\b(roll|role|rul)\s+(\d)/gi, 'Rule $2'],
      // RA patterns
      [/\b(are\s*a|ara|our\s*a|republic\s*act)\s*(\d*)/gi, 'RA $2'],
      // Safety patterns
      [/\b(save\s*tea|say\s*fatty?|safe\s*[tT]|safe\s*tea|safty)\b/gi, 'safety'],
      [/\b(off\s*sir|of\s*sir|offiser)\b/gi, 'officer'],
      // Number patterns - Rule numbers
      [/\bten\s*thirty\b/gi, '1030'],
      [/\bten\s*twenty\b/gi, '1020'],
      [/\bten\s*forty\b/gi, '1040'],
      [/\bten\s*fifty\b/gi, '1050'],
      [/\bten\s*sixty\b/gi, '1060'],
      [/\bten\s*seventy\b/gi, '1070'],
      [/\bten\s*eighty\b/gi, '1080'],
      [/\bten\s*ninety\b/gi, '1090'],
      [/\beleven\s*hundred\b/gi, '1100'],
      [/\beleven\s*twenty\b/gi, '1120'],
      [/\beleven\s*forty\b/gi, '1140'],
      [/\beleven\s*sixty\b/gi, '1160'],
      [/\bnineteen\s*sixty\b/gi, '1960'],
      [/\beleven\s*(fifty\s*)?eight\b/gi, '11058'],
      [/\btwo\s*(fifty\s*)?two\b/gi, '252'],
      [/\btwo\s*oh?\s*eight\b/gi, '208'],
      [/\bone\s*(thirty\s*)?six\b/gi, '136'],
      // PPE/Acronyms
      [/\b(pp|pee\s*pee|ppy|ppey)\b/gi, 'PPE'],
      [/\b(h\s*s\s*c|aitch\s*ess\s*see)\b/gi, 'HSC'],
      [/\b(w\s*a\s*i\s*r|wayir|way\s*are)\b/gi, 'WAIR'],
      [/\b(cosh|kosh|c\s*o\s*s\s*h)\b/gi, 'COSH'],
      [/\b(s\s*o\s*1|ess\s*oh\s*one)\b/gi, 'SO1'],
      [/\b(s\s*o\s*2|ess\s*oh\s*two)\b/gi, 'SO2'],
      [/\b(s\s*o\s*3|ess\s*oh\s*three)\b/gi, 'SO3'],
      [/\b(s\s*o\s*4|ess\s*oh\s*four)\b/gi, 'SO4'],
      [/\b(dole|dough\s*lay|doh\s*le)\b/gi, 'DOLE'],
      [/\b(b\s*w\s*c|bee\s*wee\s*see)\b/gi, 'BWC'],
      [/\b(o\s*s\s*h\s*s|oh\s*ess\s*aitch\s*ess)\b/gi, 'OSHS'],
      [/\b(t\s*l\s*v|tee\s*el\s*vee)\b/gi, 'TLV'],
      [/\b(s\s*d\s*s|es\s*dee\s*es)\b/gi, 'SDS'],
      [/\b(g\s*h\s*s|gee\s*aitch\s*ess)\b/gi, 'GHS'],
      // Filipino patterns
      [/\b(i\s*know|a\s*no|ah\s*no)\b/gi, 'Ano'],
      [/\b(see\s*no|sea\s*no)\b/gi, 'Sino'],
      [/\b(pie\s*no|pano|pa\s*ano)\b/gi, 'Paano'],
      [/\b(by\s*kit|ba\s*kit)\b/gi, 'Bakit'],
      [/\b(sigh\s*an|sa\s*an)\b/gi, 'Saan'],
      [/\b(kelan|kay\s*lan)\b/gi, 'Kailan'],
      [/\b(ilan|ee\s*lan|ilang)\b/gi, 'Ilan'],
      [/\b(mag\s*kano|mag\s*ka\s*no)\b/gi, 'Magkano'],
      // Common Whisper errors
      [/\btraining\s*ours\b/gi, 'training hours'],
      [/\brequire\s*mints?\b/gi, 'requirements'],
      [/\bpen\s*alty\b/gi, 'penalty'],
      [/\bvie\s*elation\b/gi, 'violation'],
      [/\bdead\s*line\b/gi, 'deadline'],
      [/\bre\s*new\s*all?\b/gi, 'renewal'],
      [/\bsurtifi\s*cate\b/gi, 'certificate'],
      [/\bregis\s*tray\s*tion\b/gi, 'registration'],
      [/\bcommit\s*tea\b/gi, 'committee'],
    ];

    for (const [pattern, replacement] of replacements) {
      cleaned = cleaned.replace(pattern, replacement);
    }

    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

export const oshTranscriptIntelligence = new OSHTranscriptIntelligenceService();
