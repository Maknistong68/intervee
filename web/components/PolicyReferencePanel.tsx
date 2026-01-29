'use client';

import { useEffect, useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import { policies, detectPolicyFromText, Policy } from '@/data/policies';

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
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);
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
        setExpandedPolicyId(detectedId); // Auto-expand detected policy
        return;
      }
    }
  }, [messages]);

  // Auto-scroll to highlighted policy
  useEffect(() => {
    if (highlightedPolicyId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [highlightedPolicyId]);

  const toggleExpand = (policyId: string) => {
    setExpandedPolicyId(expandedPolicyId === policyId ? null : policyId);
  };

  return (
    <div className="flex flex-col h-full bg-surface w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-divider bg-surface-light shrink-0">
        <BookOpen className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-gray-200">Policy Reference</h2>
      </div>

      {/* Policy List */}
      <div className="flex-1 overflow-y-auto p-2">
        {policies.map((policy) => {
          const isHighlighted = policy.id === highlightedPolicyId;
          const isExpanded = policy.id === expandedPolicyId;

          return (
            <div
              key={policy.id}
              ref={isHighlighted ? highlightedRef : null}
              className={`
                mb-2 rounded-lg transition-all overflow-hidden
                ${isHighlighted
                  ? 'bg-primary/20 border border-primary/50 shadow-lg shadow-primary/10'
                  : 'bg-surface-light/50 border border-transparent hover:bg-surface-light hover:border-divider'
                }
              `}
            >
              {/* Policy Header - Clickable */}
              <button
                onClick={() => toggleExpand(policy.id)}
                className="w-full px-3 py-2.5 text-left flex items-start gap-2"
              >
                <span className="mt-0.5">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`
                      text-xs font-bold px-1.5 py-0.5 rounded shrink-0
                      ${isHighlighted ? 'bg-primary/30 text-primary' : 'bg-gray-700/50 text-gray-400'}
                    `}>
                      {policy.ruleNumber}
                    </span>
                    {isHighlighted && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className={`
                    text-sm mt-1 truncate
                    ${isHighlighted ? 'text-gray-200 font-medium' : 'text-gray-400'}
                  `}>
                    {policy.title}
                  </p>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-divider/50 mt-1 pt-3">
                  {/* Full Title */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Full Title</p>
                    <p className="text-sm text-gray-300">{policy.fullTitle}</p>
                  </div>

                  {/* Key Points */}
                  {policy.keyPoints && policy.keyPoints.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Key Points
                      </p>
                      <ul className="space-y-1.5">
                        {policy.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Amendments Table */}
                  {policy.amendments && policy.amendments.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Amendments ({policy.amendments.length})
                      </p>
                      <div className="bg-surface rounded border border-divider overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-surface-light">
                              <th className="px-2 py-1.5 text-left text-gray-400 font-medium">Reference</th>
                              <th className="px-2 py-1.5 text-left text-gray-400 font-medium">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {policy.amendments.map((amendment, idx) => (
                              <tr key={idx} className="border-t border-divider/50">
                                <td className="px-2 py-1.5 text-primary font-medium whitespace-nowrap">
                                  {amendment.reference}
                                </td>
                                <td className="px-2 py-1.5 text-gray-400">
                                  {amendment.description || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-divider shrink-0">
        <p className="text-[10px] text-gray-500 text-center">
          Click to expand • Auto-detects from chat
        </p>
      </div>
    </div>
  );
}
