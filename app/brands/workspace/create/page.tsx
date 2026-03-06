'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/ui/ToastContainer';

import StepNameLogo from '@/components/workspace/create/StepNameLogo';
import StepBrandDetails from '@/components/workspace/create/StepBrandDetails';
import StepSelectPlan from '@/components/workspace/create/StepSelectPlan';
import StepInviteTeam from '@/components/workspace/create/StepInviteTeam';

import {
  WorkspaceFormData,
  ValidationErrors,
  WIZARD_STEPS,
  initialFormData,
  validateStep,
} from '@/components/workspace/create/types';

// ===== STEP INDICATOR =====

interface StepIndicatorProps {
  currentStep: number;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#001F54] text-white'
                    : isActive
                    ? 'bg-[#001F54] text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-semibold uppercase tracking-wide hidden sm:block ${
                  isActive
                    ? 'text-[#001F54]'
                    : isCompleted
                    ? 'text-gray-500'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-2 transition-colors duration-300 ${
                  currentStep > step.number ? 'bg-[#001F54]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== SUCCESS MODAL =====

interface SuccessModalProps {
  workspaceName: string;
  onDashboard: () => void;
}

function SuccessModal({ workspaceName, onDashboard }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transition-all duration-300">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-green-600" strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-bold text-[#001F54] mb-2">
          Workspace Created!
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          <span className="font-semibold text-gray-700">{workspaceName}</span>{' '}
          is ready to go.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Your 14-day free trial has started. No credit card required.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onDashboard}
            className="w-full py-3 bg-[#001F54] text-white rounded-xl font-semibold text-sm hover:bg-[#002a6e] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== WIZARD CONTENT =====

function WorkspaceCreateContent() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WorkspaceFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSteps = WIZARD_STEPS.length;

  // ===== NAVIGATION =====

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ===== SUBMIT =====

  const handleCreate = async () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate workspace creation API call
      await new Promise((resolve) => setTimeout(resolve, 1400));

      toast.success(
        `Workspace "${formData.name}" created successfully!`,
        4000
      );
      setShowSuccess(true);
    } catch {
      toast.error('Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDashboardRedirect = () => {
    router.push('/brands/workspace/dashboard');
  };

  // ===== STEP RENDERER =====

  const renderStep = () => {
    const stepProps = { formData, setFormData, errors, setErrors };
    switch (step) {
      case 1:
        return <StepNameLogo {...stepProps} />;
      case 2:
        return <StepBrandDetails {...stepProps} />;
      case 3:
        return <StepSelectPlan {...stepProps} />;
      case 4:
        return <StepInviteTeam {...stepProps} />;
      default:
        return null;
    }
  };

  const isFinalStep = step === totalSteps;

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          workspaceName={formData.name}
          onDashboard={handleDashboardRedirect}
        />
      )}

      {/* Full-page background */}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-[#001F54] flex items-center justify-center">
              <span className="text-white text-xs font-black">HC</span>
            </div>
            <span className="text-sm font-semibold text-[#001F54] hidden sm:block">
              HeyCreator
            </span>
          </div>

          <p className="text-xs text-gray-400 font-medium">
            Step {step} of {totalSteps}
          </p>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
          <div className="w-full max-w-3xl space-y-8">
            {/* Step Indicator */}
            <StepIndicator currentStep={step} />

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 md:p-8 lg:p-10">
                {renderStep()}
              </div>

              {/* Navigation Footer */}
              <div className="border-t border-gray-100 px-6 md:px-8 lg:px-10 py-5 flex items-center justify-between bg-gray-50">
                {/* Back Button */}
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {/* Right Side: Skip (step 4) + Primary Action */}
                <div className="flex items-center gap-3">
                  {/* Skip option on invite step */}
                  {isFinalStep && !isSubmitting && (
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                    >
                      Skip for now
                    </button>
                  )}

                  {/* Next / Create Button */}
                  {isFinalStep ? (
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#001F54] text-white rounded-xl text-sm font-semibold hover:bg-[#002a6e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Create Workspace
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-[#001F54] text-white rounded-xl text-sm font-semibold hover:bg-[#002a6e] transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-1.5">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#001F54] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                {Math.round((step / totalSteps) * 100)}% complete
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ===== PAGE EXPORT (wraps with ToastProvider) =====

export default function WorkspaceCreatePage() {
  return (
    <ToastProvider>
      <WorkspaceCreateContent />
    </ToastProvider>
  );
}
