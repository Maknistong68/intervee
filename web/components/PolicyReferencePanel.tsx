'use client';

import { useEffect, useState, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { policies, detectPolicyFromText } from '@/data/policies';

interface Message {
  id: string;
  type: 'question' | 'answer';
  content: string;
}

interface PolicyReferencePanelProps {
  messages: Message[];
}

export default function PolicyReferencePanel({ messages }: PolicyReferencePanelProps) {
  const [highlightedPolicyId, setHighlightedPolicyId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Detect policy from latest messages
  useEffect(() => {
    if (messages.length === 0) {
      setHighlightedPolicyId(null);
      return;
    }

    // Check the last few messages for policy keywords
    const recentMessages = messages.slice(-4);
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      const detectedId = detectPolicyFromText(msg.content);
      if (detectedId) {
        setHighlightedPolicyId(detectedId);
        return;
      }
    }
  }, [messages]);

  // Auto-scroll to highlighted policy
  useEffect(() => {
    if (highlightedPolicyId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedPolicyId]);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-divider bg-surface-light">
        <BookOpen className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-gray-200">Policy Reference</h2>
      </div>

      {/* Policy List */}
      <div className="flex-1 overflow-y-auto p-2">
        {policies.map((policy) => {
          const isHighlighted = policy.id === highlightedPolicyId;

          return (
            <div
              key={policy.id}
              ref={isHighlighted ? highlightedRef : null}
              className={`
                px-3 py-2.5 mb-1.5 rounded-lg transition-all cursor-default
                ${isHighlighted
                  ? 'bg-primary/20 border border-primary/50 shadow-lg shadow-primary/10'
                  : 'bg-surface-light/50 border border-transparent hover:bg-surface-light hover:border-divider'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className={`
                  text-xs font-bold px-1.5 py-0.5 rounded
                  ${isHighlighted ? 'bg-primary/30 text-primary' : 'bg-gray-700/50 text-gray-400'}
                `}>
                  {policy.ruleNumber}
                </span>
                {isHighlighted && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p className={`
                text-sm mt-1
                ${isHighlighted ? 'text-gray-200 font-medium' : 'text-gray-400'}
              `}>
                {policy.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-divider">
        <p className="text-[10px] text-gray-500 text-center">
          Auto-highlights based on conversation
        </p>
      </div>
    </div>
  );
}
