'use client';

import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface QualificationCheck {
  requirement: string;
  met: boolean;
  userValue: number | string;
  requiredValue: number | string;
}

interface QualificationCheckerProps {
  qualification: {
    qualifies: boolean;
    score: number;
    checks: QualificationCheck[];
  };
}

export default function QualificationChecker({ qualification }: QualificationCheckerProps) {
  const { qualifies, score, checks } = qualification;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 border-b ${
        qualifies
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {qualifies ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {qualifies ? 'You Qualify!' : 'Requirements Not Met'}
              </h3>
              <p className="text-sm text-gray-600">
                {qualifies
                  ? 'Your profile meets all campaign requirements'
                  : 'Your profile doesn\'t meet some requirements'}
              </p>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
              score === 100
                ? 'border-green-500 bg-green-50'
                : score >= 75
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-300 bg-gray-50'
            }`}>
              <span className={`text-xl font-bold ${
                score === 100
                  ? 'text-green-700'
                  : score >= 75
                  ? 'text-yellow-700'
                  : 'text-gray-600'
              }`}>
                {score}%
              </span>
            </div>
            <span className="text-xs text-gray-600 mt-1">Match Score</span>
          </div>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-navy" />
          <h4 className="font-semibold text-gray-900">Requirement Breakdown</h4>
        </div>

        <div className="space-y-3">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                check.met
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {check.met ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm font-medium ${
                      check.met ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {check.requirement}
                    </p>
                    {check.met ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                        Met
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">
                        Not Met
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={check.met ? 'text-green-700' : 'text-red-700'}>
                      Your value:
                    </span>
                    <span className={`font-semibold ${check.met ? 'text-green-800' : 'text-red-800'}`}>
                      {typeof check.userValue === 'number'
                        ? check.userValue.toLocaleString()
                        : check.userValue}
                    </span>
                    <span className={check.met ? 'text-green-600' : 'text-red-600'}>•</span>
                    <span className={check.met ? 'text-green-700' : 'text-red-700'}>
                      Required:
                    </span>
                    <span className={`font-semibold ${check.met ? 'text-green-800' : 'text-red-800'}`}>
                      {typeof check.requiredValue === 'number'
                        ? check.requiredValue.toLocaleString()
                        : check.requiredValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        {!qualifies && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Keep Building Your Profile
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Work on meeting the requirements above to qualify for this campaign.
                  You can still browse other campaigns that match your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {qualifies && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Perfect Match!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your profile meets all the requirements. You can proceed with your application
                  and include a compelling pitch message to stand out.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
