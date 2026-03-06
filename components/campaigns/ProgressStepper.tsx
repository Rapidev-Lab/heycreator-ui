'use client';

interface ProgressStepperProps {
  currentStep: number;
  steps: Array<{
    number: number;
    label: string;
  }>;
}

export default function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                currentStep >= step.number
                  ? 'bg-brand-navy text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-xs mt-2 font-medium uppercase tracking-wide ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 sm:w-24 mx-2 transition-colors ${
                currentStep > step.number ? 'bg-brand-navy' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
