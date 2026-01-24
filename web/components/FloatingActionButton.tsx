'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, ArrowLeft, Trash2, Loader2, X } from 'lucide-react';
import type { FloatingActionButtonProps } from './types';

export default function FloatingActionButton({
  isPTTActive,
  isProcessing,
  isVisible,
  onPTTStart,
  onPTTEnd,
  onPTTCancel,
  onBack,
  onClear,
  hasHistory,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isPTTRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Cancel threshold - if user drags more than 50px away, cancel the recording
  const CANCEL_THRESHOLD = 50;

  // Handle press start (mouse/touch)
  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    // Don't start PTT if menu is expanded - let user interact with menu
    if (isExpanded) {
      return;
    }

    // Store start position for cancel detection
    if ('touches' in e) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }

    // Start PTT
    isPTTRef.current = true;
    setIsCancelled(false);
    onPTTStart();
  }, [isExpanded, onPTTStart]);

  // Handle movement during press (for cancel detection)
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPTTRef.current || !startPosRef.current) return;

    let currentX: number, currentY: number;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const distance = Math.sqrt(
      Math.pow(currentX - startPosRef.current.x, 2) +
      Math.pow(currentY - startPosRef.current.y, 2)
    );

    // If dragged far enough, mark as cancelled
    if (distance > CANCEL_THRESHOLD && !isCancelled) {
      setIsCancelled(true);
      console.log('[PTT] Cancelled - dragged away');
    } else if (distance <= CANCEL_THRESHOLD && isCancelled) {
      // User came back, uncancel
      setIsCancelled(false);
    }
  }, [isCancelled]);

  // Handle press end - IMMEDIATELY process if not cancelled
  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    if (!isPTTRef.current) return;

    isPTTRef.current = false;
    startPosRef.current = null;

    if (isCancelled) {
      // User cancelled - don't process, just reset state
      console.log('[PTT] Release ignored - was cancelled');
      setIsCancelled(false);
      onPTTCancel();
      return;
    }

    // IMMEDIATELY process the transcript
    console.log('[PTT] Button released - processing immediately');
    onPTTEnd();
  }, [isCancelled, onPTTEnd, onPTTCancel]);

  // Handle mouse leave - cancel if still pressing
  const handleMouseLeave = useCallback(() => {
    if (isPTTRef.current) {
      // Mouse left while pressing - treat as cancel, don't process
      console.log('[PTT] Mouse left button - cancelling');
      isPTTRef.current = false;
      startPosRef.current = null;
      setIsCancelled(false);
      // Call cancel to reset parent state without processing
      onPTTCancel();
    }
  }, [onPTTCancel]);

  // Toggle menu (separate from PTT)
  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(prev => !prev);
  }, []);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
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

  if (!isVisible) return null;

  // Determine button state and styling
  const getButtonStyles = () => {
    if (isProcessing) {
      return 'bg-amber-500 shadow-lg shadow-amber-500/30';
    }
    if (isCancelled) {
      return 'bg-gray-500 shadow-lg shadow-gray-500/30';
    }
    if (isPTTActive) {
      return 'bg-red-500 fab-pulse shadow-lg shadow-red-500/50';
    }
    return 'bg-green-500 fab-float shadow-lg shadow-green-500/30 hover:bg-green-400';
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {/* Quick Actions - show when expanded */}
      {isExpanded && !isPTTActive && (
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

          {/* Close menu button */}
          <button
            onClick={toggleMenu}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-divider rounded-full text-gray-300 hover:bg-surface-light hover:text-white transition-all shadow-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Close</span>
          </button>
        </div>
      )}

      {/* Menu toggle button - small button above main PTT */}
      {!isPTTActive && !isProcessing && (
        <button
          onClick={toggleMenu}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isExpanded
              ? 'bg-primary shadow-lg shadow-primary/30'
              : 'bg-surface-light border border-divider hover:bg-surface'
          }`}
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          aria-expanded={isExpanded}
        >
          <span className={`text-xs font-bold ${isExpanded ? 'text-white' : 'text-gray-400'}`}>
            {isExpanded ? '×' : '⋮'}
          </span>
        </button>
      )}

      {/* Main PTT Button */}
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
        disabled={isProcessing || isExpanded}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all select-none touch-none ${getButtonStyles()} ${isExpanded ? 'opacity-50' : ''}`}
        aria-label={
          isProcessing
            ? 'Processing your question'
            : isCancelled
              ? 'Release to cancel'
              : isPTTActive
                ? 'Release to get answer'
                : 'Hold to speak'
        }
        aria-pressed={isPTTActive}
      >
        {isProcessing ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : isCancelled ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <Mic className={`w-7 h-7 text-white ${isPTTActive ? 'scale-110' : ''}`} />
        )}
      </button>

      {/* Helper text */}
      <div className="text-[10px] text-gray-500 text-center mr-2">
        {isProcessing ? (
          'Processing...'
        ) : isCancelled ? (
          <span className="text-red-400">Release to cancel</span>
        ) : isPTTActive ? (
          <>
            <span className="text-green-400">Release to answer</span>
            <br />
            <span className="text-gray-600">Drag away to cancel</span>
          </>
        ) : isExpanded ? (
          'Select an action'
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
