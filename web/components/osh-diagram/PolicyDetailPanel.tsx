'use client';

import { X, Calendar, FileText, Users, Link2, CheckCircle, AlertCircle } from 'lucide-react';
import { OSHPolicy, POLICY_TYPE_COLORS, POLICY_TYPE_LABELS, getRelatedPolicies, getPolicyById } from '@/lib/oshPolicyData';
import { formatRelationshipType } from '@/lib/oshDiagramUtils';

interface PolicyDetailPanelProps {
  policy: OSHPolicy | null;
  onClose: () => void;
  onNavigate: (policyId: string) => void;
}

export default function PolicyDetailPanel({ policy, onClose, onNavigate }: PolicyDetailPanelProps) {
  if (!policy) return null;

  const colors = POLICY_TYPE_COLORS[policy.type];
  const typeLabel = POLICY_TYPE_LABELS[policy.type];
  const relatedPolicies = getRelatedPolicies(policy);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface border-l border-divider shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
      {/* Header */}
      <div className={`sticky top-0 bg-surface border-b border-divider p-4 ${colors.bg}`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
              {typeLabel}
            </span>
            <h2 className={`text-xl font-bold mt-2 ${colors.text}`}>
              {policy.shortName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{policy.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-light text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status and Date */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-300">{formatDate(policy.effectiveDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {policy.status === 'current' ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-400">Current</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-400">Superseded</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Why This Policy Exists */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <FileText className="w-4 h-4" />
            Why This Policy Exists
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {policy.reason}
          </p>
        </section>

        {/* Key Provisions */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <CheckCircle className="w-4 h-4" />
            Key Provisions
          </h3>
          <ul className="space-y-2">
            {policy.keyProvisions.map((provision, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-primary mt-1">•</span>
                <span>{provision}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Coverage */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <Users className="w-4 h-4" />
            Coverage
          </h3>
          <p className="text-sm text-gray-300">
            {policy.coverage}
          </p>
        </section>

        {/* Relationships */}
        {policy.relationships.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
              <Link2 className="w-4 h-4" />
              Legal Relationships
            </h3>
            <div className="space-y-2">
              {policy.relationships.map((rel, index) => {
                const targetPolicy = getPolicyById(rel.targetId);
                if (!targetPolicy) return null;
                return (
                  <button
                    key={index}
                    onClick={() => onNavigate(rel.targetId)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-light hover:bg-primary/10 transition-colors text-left group"
                  >
                    <div>
                      <span className="text-xs text-gray-500">{formatRelationshipType(rel.type)}</span>
                      <p className="text-sm text-gray-300 group-hover:text-primary">
                        {targetPolicy.shortName}
                      </p>
                    </div>
                    <span className="text-gray-500 group-hover:text-primary">→</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Policies */}
        {relatedPolicies.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
              <Link2 className="w-4 h-4" />
              Related Policies
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedPolicies.map((relPolicy) => {
                const relColors = POLICY_TYPE_COLORS[relPolicy.type];
                return (
                  <button
                    key={relPolicy.id}
                    onClick={() => onNavigate(relPolicy.id)}
                    className={`px-2 py-1 text-xs rounded border ${relColors.border} ${relColors.bg} ${relColors.text} hover:opacity-80 transition-opacity`}
                  >
                    {relPolicy.shortName}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
