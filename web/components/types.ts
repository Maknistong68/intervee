export type InteractionMode = 'no-interact' | 'push-to-talk';

export interface AppSettings {
  interactionMode: InteractionMode;
  language: 'eng' | 'fil' | 'mix';
}

export interface ChatInputBarProps {
  isPTTActive: boolean;
  isProcessing: boolean;
  isVisible: boolean;
  onPTTStart: () => void;
  onPTTEnd: () => void;
  onPTTCancel: () => void;
  currentTranscript: string;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

// Self Tuner types
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SelfTunerQuestion {
  id: string;
  topic: string;
  type: 'SPECIFIC' | 'GENERIC' | 'PROCEDURAL' | 'SITUATIONAL' | 'TRICKY';
  difficulty: Difficulty;
  question: string;
  citation: string;
}

export interface SelfTunerResult {
  question: SelfTunerQuestion;
  answer: string;
  timestamp: Date;
}

export interface SelfTunerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
