'use client';

import { useCallback, useEffect } from 'react';
import {
  X,
  Info,
  List,
  FileText,
  AlertTriangle,
  HelpCircle,
  Bell,
  Settings,
  Zap,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import type { PopupExtension, PopupContentItem } from './types';

const ICON_MAP: Record<string, typeof Info> = {
  info: Info,
  list: List,
  file: FileText,
  alert: AlertTriangle,
  help: HelpCircle,
  bell: Bell,
  settings: Settings,
  zap: Zap,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  message: MessageSquare,
};

const SIZE_MAP: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-3xl',
};

interface PopupRendererProps {
  extension: PopupExtension | null;
  isOpen: boolean;
  onClose: () => void;
  onButtonClick?: (buttonLabel: string) => void;
}

export default function PopupRenderer({ extension, isOpen, onClose, onButtonClick }: PopupRendererProps) {
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
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && extension?.backdropClose) {
        onClose();
      }
    },
    [extension?.backdropClose, onClose]
  );

  // Handle button click
  const handleButtonClick = useCallback(
    (label: string) => {
      onButtonClick?.(label);
    },
    [onButtonClick]
  );

  // Render content item
  const renderContentItem = (item: PopupContentItem, color: string) => {
    switch (item.type) {
      case 'heading':
        return (
          <h3 key={item.id} className="text-lg font-bold text-white mb-2">
            {item.content}
          </h3>
        );
      case 'text':
        return (
          <p key={item.id} className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
            {item.content}
          </p>
        );
      case 'list':
        return (
          <ul key={item.id} className="list-disc list-inside text-gray-300 text-sm mb-3 space-y-1">
            {item.content.split('\n').filter(Boolean).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        );
      case 'divider':
        return <hr key={item.id} className="border-divider my-3" />;
      case 'button':
        return (
          <button
            key={item.id}
            onClick={() => handleButtonClick(item.content)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-80 mb-3"
            style={{ backgroundColor: color }}
          >
            {item.content}
          </button>
        );
      default:
        return null;
    }
  };

  if (!isOpen || !extension) return null;

  const IconComponent = ICON_MAP[extension.icon] || Info;
  const sizeClass = SIZE_MAP[extension.size] || 'max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={`popup-${extension.id}-title`}
    >
      <div
        className={`w-full ${sizeClass} mx-4 bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${extension.color}20` }}
            >
              <IconComponent className="w-5 h-5" style={{ color: extension.color }} />
            </div>
            <div>
              <h3 id={`popup-${extension.id}-title`} className="font-bold text-white">
                {extension.title}
              </h3>
              {extension.subtitle && (
                <p className="text-xs text-gray-400">{extension.subtitle}</p>
              )}
            </div>
          </div>
          {extension.showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-light transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {extension.content.map((item) => renderContentItem(item, extension.color))}
        </div>
      </div>
    </div>
  );
}
