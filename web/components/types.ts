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
