export type InteractionMode = 'no-interact' | 'push-to-talk';

export interface AppSettings {
  interactionMode: InteractionMode;
  language: 'eng' | 'fil' | 'mix';
}

export interface FloatingActionButtonProps {
  isPTTActive: boolean;
  isProcessing: boolean;
  isVisible: boolean;
  onPTTStart: () => void;
  onPTTEnd: () => void;
  onBack: () => void;
  onClear: () => void;
  hasHistory: boolean;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}
