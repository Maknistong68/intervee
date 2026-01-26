// Legal Document Types for Hierarchical Knowledge Base
// Supports section-level retrieval and hybrid search

/**
 * Numerical value found in legal text (e.g., "PHP 100,000", "40 hours")
 */
export interface NumericalValue {
  value: number;
  unit: string;           // "PHP", "hours", "days", "workers", "percent"
  context: string;        // "penalty for first offense"
  sectionId: string;
}

/**
 * A section within a legal document
 * This is the atomic unit for search and retrieval
 */
export interface LegalSection {
  id: string;                      // Unique ID: "ra11058-s28-p1"
  sectionNumber: string;           // "Section 28", "Section 28(a)", "Rule 1031.01"
  title: string;                   // Section title if any

  // Hierarchy
  lawId: string;                   // "ra11058", "rule1030", "do252"
  lawName: string;                 // "RA 11058", "OSHS Rule 1030", "DO 252, s. 2025"
  lawType: LawType;
  chapterId?: string;              // "chapter-2"
  chapterTitle?: string;           // "General Provisions"
  articleId?: string;              // For RA articles
  articleTitle?: string;

  // Content
  content: string;                 // Full legal text with formatting
  contentPlain: string;            // Plain text (no formatting) for search

  // Metadata
  topicTags: string[];             // ["penalty", "violation", "employer"]
  effectiveDate?: string;          // ISO date string
  status: SectionStatus;

  // Search optimization
  embedding?: number[];            // Vector for semantic search (1536 dimensions)
  keyTerms: string[];              // Extracted key terms for exact search
  numericalValues: NumericalValue[];

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Types of Philippine OSH legal documents
 */
export type LawType = 'ra' | 'oshs_rule' | 'do' | 'la' | 'da';

/**
 * Section status for version tracking
 */
export type SectionStatus = 'current' | 'amended' | 'superseded' | 'repealed';

/**
 * A complete law/regulation
 */
export interface Law {
  id: string;                      // "ra11058"
  type: LawType;
  name: string;                    // "Republic Act No. 11058"
  shortName: string;               // "RA 11058"
  title: string;                   // "An Act Strengthening Compliance..."
  description?: string;
  effectiveDate?: string;
  status: 'current' | 'superseded' | 'repealed';

  // Related documents
  amendsLaws?: string[];           // Law IDs this amends
  amendedByLaws?: string[];        // Law IDs that amend this
  implementsLaws?: string[];       // Laws this implements (IRR)
  implementedByLaws?: string[];    // Laws that implement this

  // Metadata
  dateApproved?: string;
  datePublished?: string;
  keywords: string[];

  // Sections
  sections?: LegalSection[];

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Amendment tracking
 */
export interface SectionAmendment {
  id: string;
  originalSectionId: string;
  amendedSectionId: string;
  amendingLawId: string;           // Law that made the amendment
  amendingLawName: string;
  effectiveDate: string;
  changeType: 'modified' | 'added' | 'deleted' | 'superseded';
  changeSummary: string;
  createdAt?: Date;
}

// ================================
// Enhanced Question Classification
// ================================

/**
 * Extended question types for interview scenarios
 */
export type EnhancedQuestionType =
  | 'SPECIFIC'      // Exact values, numbers: "How many hours?"
  | 'PROCEDURAL'    // Steps, process: "How do I register?"
  | 'GENERIC'       // Broad, conceptual: "What is a safety officer?"
  | 'DEFINITION'    // Define terms: "Define PPE"
  | 'SCENARIO'      // If/then situations: "If a worker refuses..."
  | 'COMPARISON'    // Differences: "SO1 vs SO2?"
  | 'EXCEPTION'     // Exemptions: "Are there exceptions?"
  | 'LIST'          // Enumeration: "List the penalties"
  | 'SECTION_QUERY' // Direct section lookup: "What does Section 28 say?"
  | 'CITATION_QUERY'; // Law-specific: "Under RA 11058..."

/**
 * Legal reference extracted from a question
 */
export interface LegalReference {
  type: LawType | 'section';
  identifier: string;              // "11058", "1030", "28"
  fullReference: string;           // "RA 11058", "Rule 1030", "Section 28"
  confidence: number;
}

/**
 * Numerical query extracted from question
 */
export interface NumericalQuery {
  value: number;
  unit?: string;
  operator: 'exact' | 'minimum' | 'maximum' | 'range';
  rangeMax?: number;
}

/**
 * Enhanced classification result
 */
export interface EnhancedClassificationResult {
  type: EnhancedQuestionType;
  confidence: number;
  topic?: string;

  // Extracted elements
  legalReferences: LegalReference[];
  numericalQueries: NumericalQuery[];

  // Context
  isFollowUp: boolean;
  requiresContext: boolean;

  // Intent modifiers
  wantsComparison: boolean;
  wantsException: boolean;
  wantsExample: boolean;
  wantsSteps: boolean;
}

// ================================
// Search Types
// ================================

/**
 * Search result from hybrid search
 */
export interface SearchResult {
  section: LegalSection;
  score: number;                   // Combined score (0-1)
  matchType: SearchMatchType[];
  highlights?: string[];           // Relevant excerpts
}

export type SearchMatchType =
  | 'vector'                       // Semantic similarity
  | 'section_number'               // Exact section match
  | 'law_id'                       // Law filter match
  | 'keyword'                      // Keyword match
  | 'numerical';                   // Numerical value match

/**
 * Hybrid search options
 */
export interface HybridSearchOptions {
  query: string;
  embedding?: number[];
  lawTypes?: LawType[];
  lawIds?: string[];
  sectionNumbers?: string[];
  topicTags?: string[];
  numericalQuery?: NumericalQuery;
  limit?: number;
  minScore?: number;
}

// ================================
// Confidence & Answer Types
// ================================

/**
 * Confidence evaluation for an answer
 */
export interface ConfidenceEvaluation {
  score: number;                   // Overall confidence (0-1)
  factors: ConfidenceFactor[];
  recommendation: 'confident' | 'qualified' | 'refuse';
  refusalReason?: string;
}

export interface ConfidenceFactor {
  name: string;
  weight: number;
  score: number;
  reason: string;
}

/**
 * Structured answer format
 */
export interface StructuredAnswer {
  shortAnswer: string;             // 30-50 words, first person
  legalBasis: {
    primary: string;               // "RA 11058, Section 28(a)"
    secondary?: string[];
    effectiveDate?: string;
    excerpt?: string;              // Relevant quote
  };
  explanation?: string;            // 60-100 words for complex questions
  followUpSuggestions?: string[];  // 1-3 related questions
  confidence: ConfidenceEvaluation;
  metadata: {
    questionType: EnhancedQuestionType;
    searchResults: number;
    topScore: number;
    processingTimeMs: number;
  };
}

// ================================
// Document Parsing Types
// ================================

/**
 * Raw document for parsing
 */
export interface RawDocument {
  filename: string;
  content: string;
  type: LawType;
}

/**
 * Section marker pattern for parsing documents
 */
export interface SectionPattern {
  regex: RegExp;
  type: 'section' | 'article' | 'chapter' | 'rule' | 'paragraph';
  extractTitle: boolean;
}

/**
 * Parsed section from raw document
 */
export interface ParsedSection {
  sectionNumber: string;
  title?: string;
  content: string;
  parentSection?: string;
  childSections?: string[];
}
