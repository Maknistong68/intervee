'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Loader2, X, ChevronLeft } from 'lucide-react';
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
  const isPTTRef = useRef(false);
  const startPosRef = useRef<number | null>(null);

  // Cancel threshold - 80px leftward drag triggers cancel
  const CANCEL_THRESHOLD = 80;

  // Handle press start (mouse/touch)
  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    // Store start X position for cancel detection
    if ('touches' in e) {
      startPosRef.current = e.touches[0].clientX;
    } else {
      startPosRef.current = e.clientX;
    }

    // Start PTT
    isPTTRef.current = true;
    setIsCancelling(false);
    setDragOffset(0);
    onPTTStart();
  }, [onPTTStart]);

  // Handle movement during press (horizontal slide-to-cancel)
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPTTRef.current || startPosRef.current === null) return;

    let currentX: number;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }

    // Calculate horizontal offset (negative = left, positive = right)
    const offset = currentX - startPosRef.current;

    // Only track leftward movement (negative offset)
    const leftOffset = Math.min(0, offset);
    setDragOffset(leftOffset);

    // If dragged left far enough, mark as cancelling
    if (leftOffset < -CANCEL_THRESHOLD && !isCancelling) {
      setIsCancelling(true);
    } else if (leftOffset >= -CANCEL_THRESHOLD && isCancelling) {
      // User came back, uncancelling
      setIsCancelling(false);
    }
  }, [isCancelling]);

  // Handle press end
  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    if (!isPTTRef.current) return;

    isPTTRef.current = false;
    startPosRef.current = null;
    setDragOffset(0);

    if (isCancelling) {
      // User cancelled - don't process
      setIsCancelling(false);
      onPTTCancel();
      return;
    }

    // Process the transcript
    onPTTEnd();
  }, [isCancelling, onPTTEnd, onPTTCancel]);

  // Handle mouse leave - cancel if still pressing
  const handleMouseLeave = useCallback(() => {
    if (isPTTRef.current) {
      isPTTRef.current = false;
      startPosRef.current = null;
      setDragOffset(0);
      setIsCancelling(false);
      onPTTCancel();
    }
  }, [onPTTCancel]);

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
            <div className="flex items-center gap-1 text-gray-400">
              <ChevronLeft className="w-4 h-4 animate-pulse" />
              <span className="text-xs">Slide to cancel</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <span className="text-gray-500 text-sm">Hold mic to speak</span>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-divider safe-area-bottom">
      <div className="flex items-center h-14 px-3 gap-3">
        {/* Left: Status/Transcript Area */}
        <div className="flex-1 h-10 bg-surface-light rounded-full px-4 flex items-center overflow-hidden">
          {getStatusContent()}
        </div>

        {/* Right: Mic Button */}
        <button
          ref={buttonRef}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseMove={handleMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchMove={handleMove}
          onTouchCancel={handleMouseLeave}
          disabled={isProcessing}
          style={{
            transform: isPTTActive ? `translateX(${dragOffset}px)` : 'none',
            transition: isPTTActive ? 'none' : 'transform 0.2s ease-out',
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors select-none touch-none ${getButtonStyles()}`}
          aria-label={
            isProcessing
              ? 'Processing your question'
              : isCancelling
                ? 'Release to cancel'
                : isPTTActive
                  ? 'Release to get answer'
                  : 'Hold to speak'
          }
          aria-pressed={isPTTActive}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isCancelling ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
