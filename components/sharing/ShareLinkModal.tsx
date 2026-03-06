'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, X, Copy, Check, Lock, Calendar, Eye } from 'lucide-react';

// ===== TYPES =====

type ResourceType = 'campaign' | 'creator_profile' | 'creator_list';
type ExpiryOption = '7days' | '30days' | '90days' | 'never';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
}

// ===== HELPERS =====

function generateToken(): string {
  return Math.random().toString(36).substring(2, 10);
}

function buildShareUrl(resourceType: ResourceType, token: string): string {
  const base = 'https://app.heycreator.com/shared';
  const segment =
    resourceType === 'campaign'
      ? 'campaign'
      : resourceType === 'creator_profile'
      ? 'creator'
      : 'list';
  return `${base}/${segment}/${token}`;
}

function getResourceLabel(resourceType: ResourceType): string {
  if (resourceType === 'campaign') return 'campaign';
  if (resourceType === 'creator_profile') return 'creator profile';
  return 'creator list';
}

const EXPIRY_LABELS: Record<ExpiryOption, string> = {
  '7days': '7 days',
  '30days': '30 days',
  '90days': '90 days',
  never: 'Never',
};

// ===== TOGGLE SWITCH =====

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ id, checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-800 cursor-pointer">
          {label}
        </label>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:ring-offset-1 ${
          checked ? 'bg-brand-navy' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function ShareLinkModal({
  isOpen,
  onClose,
  resourceType,
  resourceId: _resourceId,
  resourceName,
}: ShareLinkModalProps) {
  const [token] = useState<string>(() => generateToken());
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>('7days');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [allowDownload, setAllowDownload] = useState(
    resourceType === 'campaign'
  );
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrl = buildShareUrl(resourceType, token);
  const resourceLabel = getResourceLabel(resourceType);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Reset state when modal opens with a new resource
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setExpiry('7days');
      setPasswordEnabled(false);
      setPassword('');
      setAllowDownload(resourceType === 'campaign');
    }
  }, [isOpen, resourceType]);

  if (!isOpen) return null;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).catch(() => {
      // Fallback for environments without clipboard API
    });
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-brand-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="share-modal-title" className="text-base font-bold text-gray-900 leading-tight">
              Share {resourceName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {resourceType.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 flex-1">
          {/* Link Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 min-w-0 px-3 py-2.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none cursor-default truncate"
                aria-label="Share link URL"
              />
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  copied
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
                aria-label={copied ? 'Copied!' : 'Copy link'}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Anyone with this link can view this {resourceLabel}.
            </p>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Expiry */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Link Expires
            </label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value as ExpiryOption)}
              className="w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy/40 cursor-pointer appearance-none"
            >
              {(Object.entries(EXPIRY_LABELS) as [ExpiryOption, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Password Protection */}
          <div className="space-y-3">
            <Toggle
              id="toggle-password"
              checked={passwordEnabled}
              onChange={setPasswordEnabled}
              label="Password Protection"
              description="Require a password to view this link"
            />
            {passwordEnabled && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy/40 placeholder:text-gray-400"
                  aria-label="Link password"
                />
              </div>
            )}
          </div>

          {/* Allow Downloads */}
          <Toggle
            id="toggle-download"
            checked={allowDownload}
            onChange={setAllowDownload}
            label="Allow Downloads"
            description={
              resourceType === 'campaign'
                ? 'Viewers can download campaign brief as PDF'
                : 'Viewers can export creator profile data'
            }
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Eye className="w-3.5 h-3.5" />
            <span>Read-only access</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-navy rounded-lg hover:bg-brand-navy/90 active:bg-brand-navy/95 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:ring-offset-1"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
