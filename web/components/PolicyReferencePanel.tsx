'use client';

import { useEffect, useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronRight, FileText, CheckCircle, AlertTriangle, Info, Search } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get the detected policy object
  const detectedPolicy = highlightedPolicyId
    ? policies.find(p => p.id === highlightedPolicyId)
    : null;

  // Detect policy from QUESTIONS ONLY (not answers)
  useEffect(() => {
    // Reset when messages are cleared (spacebar pressed for new recording)
    if (messages.length === 0) {
      setHighlightedPolicyId(null);
      setExpandedPolicyId(null);
      return;
    }

    // Filter to only questions and check the latest one
    const questions = messages.filter(msg => msg.type === 'question');

    if (questions.length === 0) {
      return;
    }

    // Check the latest question for policy keywords
    const latestQuestion = questions[questions.length - 1];
    const detectedId = detectPolicyFromText(latestQuestion.content);

    if (detectedId) {
      setHighlightedPolicyId(detectedId);
      setExpandedPolicyId(detectedId); // Auto-expand detected policy
    } else {
      // No policy detected in latest question
      setHighlightedPolicyId(null);
      setExpandedPolicyId(null);
    }
  }, [messages]);

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

      {/* Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2 pb-2">
        {/* 15% top threshold space */}
        <div className="h-[15vh] shrink-0" />

        {/* Show detected policy OR empty state */}
        {detectedPolicy ? (
          /* Detected Policy Card */
          <div className="bg-primary/20 border-2 border-primary/60 shadow-lg shadow-primary/20 rounded-lg overflow-hidden">
            {/* Policy Header */}
            <button
              onClick={() => toggleExpand(detectedPolicy.id)}
              className="w-full px-3 py-3 text-left flex items-start gap-2"
            >
              <span className="mt-0.5">
                {expandedPolicyId === detectedPolicy.id ? (
                  <ChevronDown className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-primary" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary/40 text-primary">
                    {detectedPolicy.ruleNumber}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    DETECTED
                  </span>
                </div>
                <p className="text-sm mt-1 text-gray-100 font-semibold">
                  {detectedPolicy.title}
                </p>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedPolicyId === detectedPolicy.id && (
              <div className="px-3 pb-3 border-t border-primary/30 mt-1 pt-3 space-y-4">
                {/* Full Title */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1 font-medium">Full Title</p>
                  <p className="text-sm text-gray-200 font-medium">{detectedPolicy.fullTitle}</p>
                </div>

                {/* Summary */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1.5 flex items-center gap-1 font-medium">
                    <Info className="w-3 h-3" />
                    Summary
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed bg-surface/50 rounded p-2 border border-divider/30">
                    {detectedPolicy.summary}
                  </p>
                </div>

                {/* Key Requirements */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Key Requirements
                  </p>
                  <ul className="space-y-1.5">
                    {detectedPolicy.keyRequirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Penalties */}
                {detectedPolicy.penalties && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                    <p className="text-[10px] text-red-400 uppercase mb-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Penalties
                    </p>
                    <p className="text-xs text-red-300">{detectedPolicy.penalties}</p>
                  </div>
                )}

                {/* Amendments Table */}
                {detectedPolicy.amendments && detectedPolicy.amendments.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1 font-medium">
                      <FileText className="w-3 h-3" />
                      Amendments & Related Issuances ({detectedPolicy.amendments.length})
                    </p>
                    <div className="space-y-2">
                      {detectedPolicy.amendments.map((amendment, idx) => (
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
        ) : (
          /* Empty State - No policy detected */
          <div className="flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-1">No policy detected</p>
            <p className="text-xs text-gray-500">
              Ask a question about OSH rules, D.O.s, or L.A.s
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-divider shrink-0 bg-surface-light/30">
        <p className="text-[10px] text-gray-500 text-center">
          Auto-detects policy from your questions
        </p>
      </div>
    </div>
  );
}
