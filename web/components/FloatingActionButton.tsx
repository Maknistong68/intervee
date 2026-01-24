'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, ArrowLeft, Trash2, Loader2, X, Plus } from 'lucide-react';
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
      {/* Quick Actions Menu - unified card container */}
      {isExpanded && !isPTTActive && (
        <div className="bg-surface/95 backdrop-blur-md border border-divider rounded-2xl p-2 shadow-xl animate-fade-in">
          {/* Back button */}
          {hasHistory && (
            <button
              onClick={handleBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition-all menu-item-stagger"
              aria-label="Go back to previous answer"
            >
              <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all menu-item-stagger"
            aria-label="Clear all messages"
          >
            <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Clear</span>
          </button>
        </div>
      )}

      {/* Menu toggle button - icon button above main PTT */}
      {!isPTTActive && !isProcessing && (
        <button
          onClick={toggleMenu}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-surface border border-divider/50 hover:bg-surface-light hover:border-divider transition-all shadow-sm"
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          aria-expanded={isExpanded}
        >
          <Plus
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-45' : ''
            }`}
          />
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

      {/* Helper text - pill style */}
      <div className="px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-sm border border-divider/50">
        <span className="text-xs font-medium text-gray-300">
          {isProcessing ? (
            <span className="text-amber-400">Processing...</span>
          ) : isCancelled ? (
            <span className="text-red-400">Release to cancel</span>
          ) : isPTTActive ? (
            <span className="text-green-400">Release to answer</span>
          ) : isExpanded ? (
            'Select an action'
          ) : (
            <span>Hold to speak <span className="text-gray-500">or Space</span></span>
          )}
        </span>
      </div>
    </div>
  );
}
