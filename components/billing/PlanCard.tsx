'use client';

import { Check, Sparkles, Star } from 'lucide-react';
import type { PlanTierConfig, PlanTier } from '@/types/workspace';

interface PlanCardProps {
  plan: PlanTierConfig;
  isCurrentPlan: boolean;
  isRecommended: boolean;
  onSelect: (plan: PlanTier) => void;
  billingCycle?: 'monthly' | 'annual';
}

export default function PlanCard({
  plan,
  isCurrentPlan,
  isRecommended,
  onSelect,
  billingCycle = 'monthly',
}: PlanCardProps) {
  const annualDiscount = 0.2;
  const displayPrice =
    billingCycle === 'annual'
      ? Math.round(plan.price * (1 - annualDiscount))
      : plan.price;

  const isSelected = isCurrentPlan;

  return (
    <div
      className={`
        relative flex flex-col rounded-xl border-2 p-6 transition-all duration-200
        ${
          isSelected
            ? 'border-brand-navy bg-brand-navy text-white shadow-xl scale-[1.02]'
            : plan.isPopular
            ? 'border-brand-cyan bg-white shadow-md hover:shadow-lg hover:scale-[1.01]'
            : 'border-gray-200 bg-white hover:border-brand-navy/30 hover:shadow-md hover:scale-[1.01]'
        }
      `}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 min-h-[28px]">
        {plan.isPopular && !isSelected && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-cyan text-white text-xs font-bold rounded-full">
            <Star className="w-3 h-3 fill-white" />
            Most Popular
          </span>
        )}
        {isRecommended && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
              isSelected
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI Recommended
          </span>
        )}
        {isSelected && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
            <Check className="w-3 h-3" />
            Current Plan
          </span>
        )}
      </div>

      {/* Plan Name */}
      <h3
        className={`text-xl font-bold mb-1 ${
          isSelected ? 'text-white' : 'text-gray-900'
        }`}
      >
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-sm font-medium ${
              isSelected ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            R
          </span>
          <span
            className={`text-4xl font-extrabold tracking-tight ${
              isSelected ? 'text-white' : 'text-gray-900'
            }`}
          >
            {displayPrice.toLocaleString('en-ZA')}
          </span>
        </div>
        <p
          className={`text-xs mt-1 ${
            isSelected ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          per month
          {billingCycle === 'annual' && (
            <span className="ml-1 font-medium text-green-400">
              (20% off — billed annually)
            </span>
          )}
        </p>
      </div>

      {/* Divider */}
      <div
        className={`my-5 border-t ${
          isSelected ? 'border-white/20' : 'border-gray-100'
        }`}
      />

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-6">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                isSelected ? 'bg-white/20' : 'bg-brand-navy/10'
              }`}
            >
              <Check
                className={`w-3 h-3 ${
                  isSelected ? 'text-white' : 'text-brand-navy'
                }`}
              />
            </div>
            <span
              className={`text-sm ${
                isSelected ? 'text-white/90' : 'text-gray-600'
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => !isCurrentPlan && onSelect(plan.id)}
        disabled={isCurrentPlan}
        className={`
          w-full py-3 rounded-xl text-sm font-bold transition-all duration-150
          ${
            isCurrentPlan
              ? isSelected
                ? 'bg-white/20 text-white/60 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isSelected
              ? 'bg-white text-brand-navy hover:bg-gray-50'
              : plan.isPopular
              ? 'bg-brand-navy text-white hover:bg-brand-navy/90'
              : 'bg-brand-navy text-white hover:bg-brand-navy/90'
          }
        `}
      >
        {isCurrentPlan ? 'Current Plan' : `Select ${plan.name}`}
      </button>
    </div>
  );
}
