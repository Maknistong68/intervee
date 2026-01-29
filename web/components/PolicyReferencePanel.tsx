'use client';

import { useEffect, useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronRight, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
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

  // Detect policy from QUESTIONS ONLY (not answers)
  useEffect(() => {
    if (messages.length === 0) {
      setHighlightedPolicyId(null);
      return;
    }

    // Filter to only questions and check recent ones
    const recentQuestions = messages
      .filter(msg => msg.type === 'question')
      .slice(-3);

    for (let i = recentQuestions.length - 1; i >= 0; i--) {
      const question = recentQuestions[i];
      const detectedId = detectPolicyFromText(question.content);
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
                  ? 'bg-primary/20 border-2 border-primary/60 shadow-lg shadow-primary/20'
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
                      ${isHighlighted ? 'bg-primary/40 text-primary' : 'bg-gray-700/50 text-gray-400'}
                    `}>
                      {policy.ruleNumber}
                    </span>
                    {isHighlighted && (
                      <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        DETECTED
                      </span>
                    )}
                  </div>
                  <p className={`
                    text-sm mt-1
                    ${isHighlighted ? 'text-gray-100 font-semibold' : 'text-gray-400'}
                  `}>
                    {policy.title}
                  </p>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-divider/50 mt-1 pt-3 space-y-4">
                  {/* Full Title */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1 font-medium">Full Title</p>
                    <p className="text-sm text-gray-200 font-medium">{policy.fullTitle}</p>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1.5 flex items-center gap-1 font-medium">
                      <Info className="w-3 h-3" />
                      Summary
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed bg-surface/50 rounded p-2 border border-divider/30">
                      {policy.summary}
                    </p>
                  </div>

                  {/* Key Requirements */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Key Requirements
                    </p>
                    <ul className="space-y-1.5">
                      {policy.keyRequirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Penalties */}
                  {policy.penalties && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                      <p className="text-[10px] text-red-400 uppercase mb-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Penalties
                      </p>
                      <p className="text-xs text-red-300">{policy.penalties}</p>
                    </div>
                  )}

                  {/* Amendments Table */}
                  {policy.amendments && policy.amendments.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1 font-medium">
                        <FileText className="w-3 h-3" />
                        Amendments & Related Issuances ({policy.amendments.length})
                      </p>
                      <div className="space-y-2">
                        {policy.amendments.map((amendment, idx) => (
                          <div
                            key={idx}
                            className="bg-surface rounded border border-divider/50 p-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-primary">
                                {amendment.reference}
                              </span>
                              <span className="text-[10px] text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded">
                                {amendment.year}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {amendment.description}
                            </p>
                          </div>
                        ))}
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
      <div className="px-4 py-2 border-t border-divider shrink-0 bg-surface-light/30">
        <p className="text-[10px] text-gray-500 text-center">
          Detects from your questions • Click to expand details
        </p>
      </div>
    </div>
  );
}
