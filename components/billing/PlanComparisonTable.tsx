'use client';

import { Check, X } from 'lucide-react';
import { PLAN_TIERS, type PlanTier } from '@/types/workspace';

interface PlanComparisonTableProps {
  currentPlan: PlanTier;
}

interface ComparisonRow {
  feature: string;
  category: string;
  discovery: string | boolean;
  growth: string | boolean;
  scale: string | boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  // Seats & Access
  { feature: 'Team seats', category: 'Access', discovery: '1 seat', growth: '3 seats', scale: '10 seats' },
  { feature: 'Role-based permissions', category: 'Access', discovery: true, growth: true, scale: true },
  { feature: 'Multi-workspace support', category: 'Access', discovery: false, growth: false, scale: true },

  // Search & Discovery
  { feature: 'Monthly creator searches', category: 'Discovery', discovery: '20 searches', growth: '50 searches', scale: 'Unlimited' },
  { feature: 'Platform coverage', category: 'Discovery', discovery: '5 platforms', growth: '5 platforms', scale: '5 platforms' },
  { feature: 'AI-powered recommendations', category: 'Discovery', discovery: false, growth: true, scale: true },
  { feature: 'Saved creator lists', category: 'Discovery', discovery: true, growth: true, scale: true },

  // Campaigns
  { feature: 'Active campaigns', category: 'Campaigns', discovery: '5 campaigns', growth: '25 campaigns', scale: 'Unlimited' },
  { feature: 'Campaign collaboration links', category: 'Campaigns', discovery: false, growth: true, scale: true },
  { feature: 'Custom deliverables', category: 'Campaigns', discovery: true, growth: true, scale: true },
  { feature: 'Bulk campaign management', category: 'Campaigns', discovery: false, growth: false, scale: true },

  // Analytics
  { feature: 'Basic analytics', category: 'Analytics', discovery: true, growth: true, scale: true },
  { feature: 'Advanced analytics', category: 'Analytics', discovery: false, growth: true, scale: true },
  { feature: 'Enterprise analytics', category: 'Analytics', discovery: false, growth: false, scale: true },
  { feature: 'Data exports (CSV / JSON)', category: 'Analytics', discovery: false, growth: true, scale: true },
  { feature: 'Audit logs', category: 'Analytics', discovery: false, growth: false, scale: true },

  // Support
  { feature: 'Email support', category: 'Support', discovery: true, growth: true, scale: true },
  { feature: 'Priority support', category: 'Support', discovery: false, growth: true, scale: true },
  { feature: 'Dedicated account manager', category: 'Support', discovery: false, growth: false, scale: true },
  { feature: 'Custom integrations', category: 'Support', discovery: false, growth: false, scale: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    );
  }
  return <span className="text-sm text-gray-700 font-medium">{value}</span>;
}

const PLANS: PlanTier[] = ['discovery', 'growth', 'scale'];

export default function PlanComparisonTable({ currentPlan }: PlanComparisonTableProps) {
  // Group rows by category
  const categories = Array.from(new Set(COMPARISON_ROWS.map((r) => r.category)));

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500 w-1/2">
              Feature
            </th>
            {PLANS.map((planId) => {
              const plan = PLAN_TIERS[planId];
              const isCurrent = planId === currentPlan;
              return (
                <th
                  key={planId}
                  className={`px-4 py-4 text-center w-1/6 ${
                    isCurrent ? 'bg-brand-navy/5' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-brand-navy' : 'text-gray-900'
                      }`}
                    >
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-brand-navy bg-brand-navy/10 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-normal">
                      R{plan.price.toLocaleString('en-ZA')}/mo
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const rows = COMPARISON_ROWS.filter((r) => r.category === category);
            return (
              <>
                {/* Category header row */}
                <tr key={`cat-${category}`} className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {category}
                  </td>
                </tr>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={`${category}-${rowIdx}`}
                    className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{row.feature}</span>
                    </td>
                    {PLANS.map((planId) => {
                      const isCurrent = planId === currentPlan;
                      return (
                        <td
                          key={planId}
                          className={`px-4 py-3.5 text-center ${
                            isCurrent ? 'bg-brand-navy/5' : ''
                          }`}
                        >
                          <FeatureCell value={row[planId]} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
