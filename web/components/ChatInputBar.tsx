'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Loader2, X, ChevronLeft, Square } from 'lucide-react';
import type { ChatInputBarProps } from './types';

export default function ChatInputBar({
  isPTTActive,
  isProcessing,
  isVisible,
  onPTTStart,
  onPTTEnd,
  onPTTCancel,
  currentTranscript,
}: ChatInputBarProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startPosRef = useRef<number | null>(null);
  const lastSpaceTimeRef = useRef<number>(0);

  // Cancel threshold - 80px leftward drag triggers cancel
  const CANCEL_THRESHOLD = 80;
  // Double-spacebar threshold in ms
  const DOUBLE_SPACE_THRESHOLD = 300;

  // Double-spacebar to cancel (web only)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Only handle spacebar when PTT is active
      if (e.code === 'Space' && isPTTActive && !isProcessing) {
        const now = Date.now();
        if (now - lastSpaceTimeRef.current < DOUBLE_SPACE_THRESHOLD) {
          // Double-space detected - cancel recording
          e.preventDefault();
          setIsCancelling(false);
          onPTTCancel();
          console.log('[ChatInputBar] Double-spacebar cancel');
        }
        lastSpaceTimeRef.current = now;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isPTTActive, isProcessing, onPTTCancel]);

  // Handle click (toggle mode - ChatGPT style)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    if (isPTTActive) {
      // Currently recording - stop and process
      onPTTEnd();
    } else {
      // Not recording - start recording
      setIsCancelling(false);
      setDragOffset(0);
      onPTTStart();
    }
  }, [isPTTActive, isProcessing, onPTTStart, onPTTEnd]);

  // Handle movement during press (horizontal slide-to-cancel) - for touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isPTTActive) return;
    startPosRef.current = e.touches[0].clientX;
  }, [isPTTActive]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPTTActive || startPosRef.current === null) return;

    const currentX = e.touches[0].clientX;
    const offset = currentX - startPosRef.current;

    // Only track leftward movement (negative offset)
    const leftOffset = Math.min(0, offset);
    setDragOffset(leftOffset);

    // If dragged left far enough, mark as cancelling
    if (leftOffset < -CANCEL_THRESHOLD && !isCancelling) {
      setIsCancelling(true);
    } else if (leftOffset >= -CANCEL_THRESHOLD && isCancelling) {
      setIsCancelling(false);
    }
  }, [isPTTActive, isCancelling]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isPTTActive) return;

    startPosRef.current = null;
    setDragOffset(0);

    if (isCancelling) {
      setIsCancelling(false);
      onPTTCancel();
      return;
    }

    // Touch end without cancel = stop and process (same as click)
    // But only if touch moved, otherwise the click handler handles it
  }, [isPTTActive, isCancelling, onPTTCancel]);

  // Handle cancel button click (explicit cancel)
  const handleCancelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPTTActive) {
      onPTTCancel();
    }
  }, [isPTTActive, onPTTCancel]);

  if (!isVisible) return null;

  // Determine button state and styling
  const getButtonStyles = () => {
    if (isProcessing) {
      return 'bg-amber-500';
    }
    if (isCancelling) {
      return 'bg-gray-500';
    }
    if (isPTTActive) {
      return 'bg-red-500';
    }
    return 'bg-green-500 hover:bg-green-400';
  };

  // Get status area content based on state
  const getStatusContent = () => {
    if (isProcessing) {
      return (
        <span className="text-amber-400 text-sm">Processing...</span>
      );
    }
    if (isCancelling) {
      return (
        <span className="text-red-400 text-sm font-medium">Release to cancel</span>
      );
    }
    if (isPTTActive) {
      return (
        <div className="flex items-center gap-2 w-full">
          {/* Recording indicator */}
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />

          {/* Transcript or hint */}
          {currentTranscript ? (
            <span className="text-gray-200 text-sm truncate flex-1">{currentTranscript}</span>
          ) : (
            <span className="text-gray-400 text-xs">Recording... (tap to stop, double-space to cancel)</span>
          )}

          {/* Cancel button */}
          <button
            onClick={handleCancelClick}
            className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
            aria-label="Cancel recording"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      );
    }
    return (
      <span className="text-gray-500 text-sm">Tap mic to record</span>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-divider safe-area-bottom">
      <div className="flex items-center h-14 px-3 gap-3">
        {/* Left: Status/Transcript Area */}
        <div
          className="flex-1 h-10 bg-surface-light rounded-full px-4 flex items-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isPTTActive ? `translateX(${dragOffset}px)` : 'none',
            transition: isPTTActive && dragOffset !== 0 ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {getStatusContent()}
        </div>

        {/* Right: Mic Button (Toggle) */}
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={isProcessing}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors select-none ${getButtonStyles()}`}
          aria-label={
            isProcessing
              ? 'Processing your question'
              : isCancelling
                ? 'Release to cancel'
                : isPTTActive
                  ? 'Tap to stop recording'
                  : 'Tap to start recording'
          }
          aria-pressed={isPTTActive}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isCancelling ? (
            <X className="w-5 h-5 text-white" />
          ) : isPTTActive ? (
            <Square className="w-4 h-4 text-white fill-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
