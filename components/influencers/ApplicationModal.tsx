'use client';

import { useState } from 'react';
import {
  X,
  Send,
  DollarSign,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  FileText,
  AlignJustify,
} from 'lucide-react';

interface ScreeningQuestion {
  question: string;
  answers: string[];
}

interface Deliverable {
  platform: string;
  contentType: string;
  quantity: number;
  description: string;
}

interface ApplicationSubmitData {
  pitchMessage: string;
  proposedRate?: number;
  questionAnswers?: { question: string; answer: string }[];
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationSubmitData) => Promise<void>;
  campaignTitle: string;
  campaignDescription?: string;
  brandName?: string;
  productImageUrl?: string;
  location?: string;
  campaignBudget: {
    compensationModel: 'fixed' | 'range' | string;
    fixedAmount?: number;
    minRangeAmount?: number;
    maxRangeAmount?: number;
    currency: string;
  };
  deliverables?: Deliverable[];
  screeningQuestions?: ScreeningQuestion[];
  onViewDetails?: () => void;
}

function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency + ' ';
  return `${symbol}${amount.toLocaleString()}`;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  campaignTitle,
  campaignDescription,
  brandName,
  productImageUrl,
  location,
  campaignBudget,
  deliverables = [],
  screeningQuestions = [],
  onViewDetails,
}: ApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [pitchMessage, setPitchMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const isRange = campaignBudget.compensationModel === 'range';
  const hasQuestions = screeningQuestions.length > 0;
  const totalSteps = hasQuestions ? 2 : 1;
  const isBidFlow = isRange;

  const budgetLabel = isRange ? 'BIDDING RANGE' : 'FIXED COST';
  const budgetValue = isRange
    ? `${formatCurrency(campaignBudget.minRangeAmount || 0, campaignBudget.currency)} - ${formatCurrency(campaignBudget.maxRangeAmount || 0, campaignBudget.currency)}`
    : formatCurrency(campaignBudget.fixedAmount || 0, campaignBudget.currency);

  const modalTitle = isBidFlow ? 'Bid for campaign' : 'Apply for campaign';

  // Group deliverables by platform+contentType for requirements display
  const requirementPills = deliverables.map((d) => {
    const qty = d.quantity || 1;
    const type = d.contentType || 'content';
    return `${qty} ${d.platform} ${type}${qty > 1 ? 's' : ''}`;
  });

  const allQuestionsAnswered =
    screeningQuestions.length === 0 ||
    screeningQuestions.every((q, i) => {
      const answer = questionAnswers[i];
      if (Array.isArray(answer)) return answer.length > 0;
      return !!answer;
    });

  const handleSubmit = async () => {
    setError('');

    if (!pitchMessage.trim()) {
      setError('Please provide a personal message');
      return;
    }

    if (isBidFlow && proposedRate) {
      const rate = Number(proposedRate);
      const min = campaignBudget.minRangeAmount || 0;
      const max = campaignBudget.maxRangeAmount || Infinity;
      if (rate < min || rate > max) {
        setError(`Your bid must be between ${formatCurrency(min, campaignBudget.currency)} and ${formatCurrency(max, campaignBudget.currency)}`);
        return;
      }
    }

    if (hasQuestions && !allQuestionsAnswered) {
      setError('Please answer all screening questions');
      return;
    }

    setIsSubmitting(true);

    try {
      const answers = screeningQuestions.map((q, i) => ({
        question: q.question,
        answer: Array.isArray(questionAnswers[i])
          ? (questionAnswers[i] as string[]).join(', ')
          : (questionAnswers[i] as string) || '',
      }));

      await onSubmit({
        pitchMessage: pitchMessage.trim(),
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
        questionAnswers: answers.length > 0 ? answers : undefined,
      });
      // Reset form
      setPitchMessage('');
      setProposedRate('');
      setQuestionAnswers({});
      setStep(1);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (!pitchMessage.trim()) {
      setError('Please provide a personal message');
      return;
    }
    if (isBidFlow && !proposedRate) {
      setError('Please enter your bid amount');
      return;
    }
    if (isBidFlow && proposedRate) {
      const rate = Number(proposedRate);
      const min = campaignBudget.minRangeAmount || 0;
      const max = campaignBudget.maxRangeAmount || Infinity;
      if (rate < min || rate > max) {
        setError(`Your bid must be between ${formatCurrency(min, campaignBudget.currency)} and ${formatCurrency(max, campaignBudget.currency)}`);
        return;
      }
    }
    setStep(2);
  };

  const handleClose = () => {
    setStep(1);
    setPitchMessage('');
    setProposedRate('');
    setQuestionAnswers({});
    setError('');
    onClose();
  };

  const toggleMultiSelect = (qIndex: number, value: string) => {
    setQuestionAnswers((prev) => {
      const current = prev[qIndex];
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          return { ...prev, [qIndex]: current.filter((v) => v !== value) };
        }
        return { ...prev, [qIndex]: [...current, value] };
      }
      return { ...prev, [qIndex]: [value] };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] min-h-[70vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-shrink-0">
          <h2 id="application-modal-title" className="text-lg font-bold text-brand-navy">
            {modalTitle}{totalSteps > 1 ? ` ${step}/${totalSteps}` : ''}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 1 ? (
            <div className="space-y-5">
              {/* Subtitle */}
              <p className="text-sm font-medium text-brand-navy">
                Your are applying for the the following campaign
              </p>

              {/* Campaign Info Card */}
              <div className="bg-[#F8F9FD] rounded-xl p-4 flex items-start gap-4">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {productImageUrl ? (
                    <img
                      src={productImageUrl}
                      alt={campaignTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#] leading-tight">{campaignTitle}</h3>
                  {brandName && (
                    <p className="text-xs text-[#FF385C] font-medium mt-0.5">{brandName}</p>
                  )}
                  {campaignDescription && (
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                      {campaignDescription}
                    </p>
                  )}
                </div>
                <button
                  onClick={onViewDetails}
                  className="text-xs text-[#FF385C] font-bold whitespace-nowrap flex-shrink-0"
                >
                  View details
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Budget / Bidding Range */}
                <div className="border border-gray-200 rounded-xl p-3 bg-[#F8F9FD]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      {budgetLabel}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-navy">{budgetValue}</p>
                </div>
                {/* Location */}
                <div className="border border-gray-200 rounded-xl p-3 bg-[#F8F9FD]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      Location
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-navy">{location || 'Anywhere'}</p>
                </div>
                {/* Requirements */}
                <div className="border border-gray-200 rounded-xl p-3 bg-[#F8F9FD]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <AlignJustify className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      Requirements
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {requirementPills.length > 0 ? (
                      requirementPills.map((pill, i) => (
                        <span key={i} className="text-[10px] text-brand-navy font-medium bg-[#E8E8E8] px-2 py-0.5 rounded-lg">
                          {pill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bid Input (only for range compensation) */}
              {isBidFlow && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Input your bid between {formatCurrency(campaignBudget.minRangeAmount || 0, campaignBudget.currency)} - {formatCurrency(campaignBudget.maxRangeAmount || 0, campaignBudget.currency)}
                  </label>
                  <input
                    type="text"
                    value={proposedRate ? `R${Number(proposedRate).toLocaleString()}` : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setProposedRate(raw);
                    }}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm disabled:bg-gray-50"
                    placeholder="R3700"
                  />
                </div>
              )}

              {/* Personal Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Personal Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm resize-none disabled:bg-gray-50 placeholder-brand-navy-dark/50"
                  placeholder="Hi there, my name is Sarah and I would like to apply to this campaign as I feel I would bring you value. Please check out my profile and content, feel free to message me"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Screening Questions */
            <div className="space-y-5">
              {screeningQuestions.map((q, qIndex) => {
                const isMultiSelect = q.answers.length > 0 && q.question.toLowerCase().includes('have you');
                const selectedValue = questionAnswers[qIndex];

                return (
                  <div key={qIndex}>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {q.question}
                    </label>
                    {q.answers.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(openDropdown === qIndex ? null : qIndex)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-400 transition-colors bg-white"
                        >
                          <span className={selectedValue ? 'text-gray-900' : 'text-gray-400'}>
                            {Array.isArray(selectedValue) && selectedValue.length > 0
                              ? selectedValue.join(', ')
                              : typeof selectedValue === 'string' && selectedValue
                                ? selectedValue
                                : isMultiSelect
                                  ? 'Select multiple...'
                                  : 'Select your answer...'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === qIndex ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === qIndex && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {q.answers.map((answer, aIndex) => {
                              const isSelected = isMultiSelect
                                ? Array.isArray(selectedValue) && selectedValue.includes(answer)
                                : selectedValue === answer;
                              return (
                                <button
                                  key={aIndex}
                                  type="button"
                                  onClick={() => {
                                    if (isMultiSelect) {
                                      toggleMultiSelect(qIndex, answer);
                                    } else {
                                      setQuestionAnswers((prev) => ({ ...prev, [qIndex]: answer }));
                                      setOpenDropdown(null);
                                    }
                                  }}
                                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2 ${
                                    isSelected ? 'bg-blue-50 text-brand-navy font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  {isMultiSelect && (
                                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? 'bg-brand-navy border-brand-navy' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </span>
                                  )}
                                  {answer}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={(questionAnswers[qIndex] as string) || ''}
                        onChange={(e) =>
                          setQuestionAnswers((prev) => ({ ...prev, [qIndex]: e.target.value }))
                        }
                        disabled={isSubmitting}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy text-sm resize-none disabled:bg-gray-50"
                        placeholder="Type your answer..."
                      />
                    )}
                  </div>
                );
              })}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-4 flex-shrink-0 mt-auto">
          <button
            type="button"
            onClick={step === 1 ? handleClose : () => { setStep(1); setError(''); }}
            disabled={isSubmitting}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 text-center"
          >
            Back
          </button>

          {step === 1 && hasQuestions ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting || !pitchMessage.trim()}
              className="flex-1 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !pitchMessage.trim() || (hasQuestions && !allQuestionsAnswered)}
              className="flex-1 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isBidFlow ? 'Bid now' : 'Apply now'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
