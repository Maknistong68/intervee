'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import type { FloatingActionButtonProps } from './types';

export default function FloatingActionButton({
  isPTTActive,
  isProcessing,
  isVisible,
  onPTTStart,
  onPTTEnd,
  onBack,
  onClear,
  hasHistory,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPTTRef = useRef(false);

  // Handle press start (mouse/touch)
  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isPTTRef.current = false;

    // Start long press timer for quick actions
    longPressTimerRef.current = setTimeout(() => {
      setIsExpanded(prev => !prev);
      isPTTRef.current = false; // Mark that this was a long press, not PTT
    }, 500);

    // Start PTT immediately
    onPTTStart();
    isPTTRef.current = true;
  }, [onPTTStart]);

  // Handle press end (mouse/touch)
  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Only trigger PTT end if it was an actual PTT press
    if (isPTTRef.current) {
      onPTTEnd();
    }
    isPTTRef.current = false;
  }, [onPTTEnd]);

  // Handle quick action clicks
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBack();
    setIsExpanded(false);
  }, [onBack]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setIsExpanded(false);
  }, [onClear]);

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      // Delay to avoid immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isExpanded]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  // Determine button state and styling
  const getButtonStyles = () => {
    if (isProcessing) {
      return 'bg-amber-500 shadow-lg shadow-amber-500/30';
    }
    if (isPTTActive) {
      return 'bg-red-500 fab-pulse shadow-lg shadow-red-500/50';
    }
    return 'bg-green-500 fab-float shadow-lg shadow-green-500/30 hover:bg-green-400';
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {/* Quick Actions - show when expanded */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {/* Back button */}
          {hasHistory && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 bg-surface border border-divider rounded-full text-gray-300 hover:bg-surface-light hover:text-white transition-all shadow-lg"
              aria-label="Go back to previous answer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-divider rounded-full text-gray-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all shadow-lg"
            aria-label="Clear all messages"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clear</span>
          </button>
        </div>
      )}

      {/* Main PTT Button */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        disabled={isProcessing}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all select-none touch-none ${getButtonStyles()}`}
        aria-label={
          isProcessing
            ? 'Processing your question'
            : isPTTActive
              ? 'Release to get answer'
              : 'Hold to speak'
        }
        aria-pressed={isPTTActive}
      >
        {isProcessing ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : (
          <Mic className={`w-7 h-7 text-white ${isPTTActive ? 'scale-110' : ''}`} />
        )}
      </button>

      {/* Helper text */}
      <div className="text-[10px] text-gray-500 text-center mr-2">
        {isProcessing ? (
          'Processing...'
        ) : isPTTActive ? (
          'Release to answer'
        ) : (
          <>
            Hold to speak
            <br />
            <span className="text-gray-600">or press Space</span>
          </>
        )}
      </div>
    </div>
  );
}
