export type InteractionMode = 'no-interact' | 'push-to-talk';
export type ResponseMode = 'detailed' | 'concise';

export interface AppSettings {
  interactionMode: InteractionMode;
  responseMode: ResponseMode;
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
  responseMode: ResponseMode;
  onResponseModeChange: (mode: ResponseMode) => void;
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

// Popup Extension Creator types
export interface PopupContentItem {
  id: string;
  type: 'text' | 'heading' | 'list' | 'divider' | 'button';
  content: string;
}

export interface PopupExtension {
  id: string;
  name: string;
  icon: string;
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title: string;
  subtitle?: string;
  content: PopupContentItem[];
  showCloseButton: boolean;
  backdropClose: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopupExtensionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (extension: PopupExtension) => void;
  extensions: PopupExtension[];
  onDelete: (id: string) => void;
}
