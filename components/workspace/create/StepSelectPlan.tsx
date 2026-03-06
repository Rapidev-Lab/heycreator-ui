'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { PLAN_TIERS, PlanTier } from '@/types/workspace';
import { StepProps } from './types';

// ===== COMPARISON TABLE DATA =====

type ComparisonRow = {
  feature: string;
  discovery: string;
  growth: string;
  scale: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Team Seats',
    discovery: '1 seat',
    growth: '3 seats',
    scale: '10 seats',
  },
  {
    feature: 'Monthly Searches',
    discovery: '20',
    growth: '50',
    scale: 'Unlimited',
  },
  {
    feature: 'Active Campaigns',
    discovery: '5',
    growth: '25',
    scale: 'Unlimited',
  },
  {
    feature: 'Analytics',
    discovery: 'Basic',
    growth: 'Advanced',
    scale: 'Enterprise',
  },
  {
    feature: 'Shared Campaign Links',
    discovery: '—',
    growth: '✓',
    scale: '✓',
  },
  {
    feature: 'Dedicated Account Manager',
    discovery: '—',
    growth: '—',
    scale: '✓',
  },
  {
    feature: 'Custom Integrations',
    discovery: '—',
    growth: '—',
    scale: '✓',
  },
  {
    feature: 'Audit Logs',
    discovery: '—',
    growth: '—',
    scale: '✓',
  },
  {
    feature: 'Support',
    discovery: 'Email',
    growth: 'Priority',
    scale: 'Dedicated',
  },
];

// ===== PLAN CARD =====

interface PlanCardProps {
  planKey: PlanTier;
  isSelected: boolean;
  onSelect: (plan: PlanTier) => void;
}

function PlanCard({ planKey, isSelected, onSelect }: PlanCardProps) {
  const plan = PLAN_TIERS[planKey];

  const formattedPrice = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(plan.price);

  return (
    <div
      onClick={() => onSelect(planKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(planKey)}
      className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#001F54] bg-[#001F54] text-white shadow-xl scale-[1.02]'
          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:shadow-md'
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#00A8CC] text-white text-xs font-semibold shadow-sm">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="flex items-center justify-between mb-1">
        <h3
          className={`text-base font-bold ${
            isSelected ? 'text-white' : 'text-[#001F54]'
          }`}
        >
          {plan.name}
        </h3>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-[#001F54]" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Tagline */}
      <p
        className={`text-xs mb-4 ${
          isSelected ? 'text-blue-200' : 'text-gray-400'
        }`}
      >
        {plan.features[0]}
      </p>

      {/* Price */}
      <div className="mb-5">
        <span
          className={`text-3xl font-black ${
            isSelected ? 'text-white' : 'text-[#001F54]'
          }`}
        >
          {formattedPrice}
        </span>
        <span
          className={`text-sm ml-1 ${
            isSelected ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          / month
        </span>
      </div>

      {/* Divider */}
      <div
        className={`border-t mb-4 ${
          isSelected ? 'border-white/20' : 'border-gray-100'
        }`}
      />

      {/* Features List */}
      <ul className="space-y-2 flex-1">
        {plan.features.slice(1).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isSelected ? 'text-[#00A8CC]' : 'text-[#00A8CC]'
              }`}
              strokeWidth={2.5}
            />
            <span
              className={`text-xs leading-relaxed ${
                isSelected ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Select Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planKey);
        }}
        className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isSelected
            ? 'bg-white text-[#001F54] hover:bg-gray-100'
            : 'bg-[#001F54] text-white hover:bg-[#002a6e]'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
}

// ===== COMPARISON TABLE =====

function ComparisonTable({ selectedPlan }: { selectedPlan: PlanTier }) {
  const plans: PlanTier[] = ['discovery', 'growth', 'scale'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-gray-500 font-medium w-1/2">
              Feature
            </th>
            {plans.map((p) => (
              <th
                key={p}
                className={`text-center py-3 px-4 font-semibold capitalize ${
                  selectedPlan === p ? 'text-[#001F54]' : 'text-gray-500'
                }`}
              >
                {PLAN_TIERS[p].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, idx) => (
            <tr
              key={row.feature}
              className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="py-2.5 px-4 text-gray-700 font-medium">
                {row.feature}
              </td>
              {(['discovery', 'growth', 'scale'] as PlanTier[]).map((p) => (
                <td
                  key={p}
                  className={`py-2.5 px-4 text-center ${
                    selectedPlan === p
                      ? 'text-[#001F54] font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {row[p]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function StepSelectPlan({
  formData,
  setFormData,
  errors,
  setErrors,
}: StepProps) {
  const [isTableOpen, setIsTableOpen] = useState(false);

  const handleSelectPlan = (plan: PlanTier) => {
    setFormData((prev) => ({ ...prev, selectedPlan: plan }));
    if (errors.selectedPlan)
      setErrors((prev) => ({ ...prev, selectedPlan: '' }));
  };

  const plans: PlanTier[] = ['discovery', 'growth', 'scale'];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-[#001F54]">Choose Your Plan</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Select the plan that fits your team. All plans include a 14-day free
          trial.
        </p>
      </div>

      {/* Free Trial Banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200">
        <Sparkles className="w-4 h-4 text-[#00A8CC] flex-shrink-0" />
        <p className="text-sm text-[#001F54]">
          <span className="font-semibold">14-day free trial included</span> — no
          credit card required. Cancel or change plans anytime.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan}
            planKey={plan}
            isSelected={formData.selectedPlan === plan}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      {errors.selectedPlan && (
        <p className="text-xs text-red-500">{errors.selectedPlan}</p>
      )}

      {/* Comparison Table (Collapsible) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTableOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <span className="text-sm font-semibold text-[#001F54]">
            Compare all features
          </span>
          {isTableOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isTableOpen && (
          <div className="border-t border-gray-200">
            <ComparisonTable selectedPlan={formData.selectedPlan} />
          </div>
        )}
      </div>
    </div>
  );
}
