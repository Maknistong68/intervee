'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
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
  Layers,
} from 'lucide-react';
import type { PopupExtension } from './types';

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

interface ExtensionLauncherProps {
  extensions: PopupExtension[];
  onLaunch: (extension: PopupExtension) => void;
}

export default function ExtensionLauncher({ extensions, onLaunch }: ExtensionLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (extensions.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all border ${
          isOpen
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            : 'bg-surface-light text-gray-400 hover:text-purple-400 border-divider hover:border-purple-500/30'
        }`}
        title="Launch Extension"
      >
        <Layers className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">{extensions.length}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-divider rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-divider">
            <span className="text-xs text-gray-400 uppercase">Launch Extension</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {extensions.map((ext) => {
              const IconComponent = ICON_MAP[ext.icon] || Info;
              return (
                <button
                  key={ext.id}
                  onClick={() => {
                    onLaunch(ext);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-light transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${ext.color}20` }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: ext.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ext.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{ext.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
