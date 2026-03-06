"use client";

import React from "react";

interface Step {
  number: number;
  label: string;
}

interface SteppedProgressIndicatorProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

/**
 * Stepped Progress Indicator for Brand Signup Flow
 * Shows circular numbered steps with labels and connecting lines
 */
export default function SteppedProgressIndicator({
  currentStep,
  steps,
  className = "",
}: SteppedProgressIndicatorProps) {
  return (
    <div className={`flex items-start justify-center gap-2 sm:gap-4 ${className}`}>
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isPast = step.number < currentStep;
        const isCompleted = isPast;

        return (
          <React.Fragment key={step.number}>
            {/* Step */}
            <div className="flex flex-col items-center">
              {/* Circle with number */}
              <div
                className={`
                  w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-brand-navy-dark text-white"
                      : isCompleted
                      ? "bg-brand-navy-dark text-white"
                      : "bg-gray-200 text-gray-400"
                  }
                `}
              >
                {step.number}
              </div>

              {/* Label */}
              <div
                className={`
                  mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-center whitespace-nowrap
                  ${
                    isActive || isCompleted
                      ? "text-brand-navy-dark"
                      : "text-gray-400"
                  }
                `}
              >
                {step.label}
              </div>
            </div>

            {/* Connecting line (except after last step) */}
            {index < steps.length - 1 && (
              <div className="flex items-center pt-6">
                <div
                  className={`
                    h-0.5 w-8 sm:w-12 transition-colors duration-200
                    ${
                      step.number < currentStep
                        ? "bg-brand-navy-dark"
                        : "bg-gray-200"
                    }
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
