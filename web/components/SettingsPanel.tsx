'use client';

import { useCallback, useEffect } from 'react';
import { X, Mic, MicOff, FileText, List } from 'lucide-react';
import type { SettingsPanelProps, InteractionMode, ResponseMode } from './types';

const MODES: { mode: InteractionMode; label: string; description: string; icon: typeof Mic }[] = [
  {
    mode: 'push-to-talk',
    label: 'Push-to-Talk',
    description: 'Hold button or spacebar to speak, release to get answer. Best for accuracy.',
    icon: Mic,
  },
  {
    mode: 'no-interact',
    label: 'No Interact',
    description: 'Passive listening only. View answers without triggering new questions.',
    icon: MicOff,
  },
];

export default function SettingsPanel({
  isOpen,
  onClose,
  interactionMode,
  onModeChange,
  responseMode,
  onResponseModeChange,
}: SettingsPanelProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: InteractionMode) => {
    onModeChange(mode);
  }, [onModeChange]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-md mx-4 bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <h2 id="settings-title" className="text-lg font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Interaction Mode
          </h3>

          <div className="space-y-3">
            {MODES.map(({ mode, label, description, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                  interactionMode === mode
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-surface-light border-divider hover:border-gray-600'
                }`}
                aria-pressed={interactionMode === mode}
              >
                <div className={`p-2 rounded-lg ${
                  interactionMode === mode ? 'bg-primary/20' : 'bg-surface'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    interactionMode === mode ? 'text-primary' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      interactionMode === mode ? 'text-primary' : 'text-white'
                    }`}>
                      {label}
                    </span>
                    {interactionMode === mode && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Response Mode Toggle */}
          <div className="mt-6 pt-5 border-t border-divider">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Answer Format
            </h3>

            <div className="flex rounded-xl border border-divider overflow-hidden">
              <button
                onClick={() => onResponseModeChange('concise')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all ${
                  responseMode === 'concise'
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-gray-400 hover:bg-surface'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Bullets</span>
              </button>
              <button
                onClick={() => onResponseModeChange('detailed')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all ${
                  responseMode === 'detailed'
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-gray-400 hover:bg-surface'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Full Script</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {responseMode === 'concise'
                ? 'Short, bulleted answers for quick reading'
                : 'Detailed, complete responses with full context'}
            </p>
          </div>

          {/* Info */}
          <div className="mt-5 p-3 bg-surface-light rounded-lg border border-divider">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Tip:</strong> In Push-to-Talk mode, you can also
              hold the <kbd className="px-1.5 py-0.5 bg-surface rounded text-gray-400">Space</kbd> key
              instead of the floating button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
