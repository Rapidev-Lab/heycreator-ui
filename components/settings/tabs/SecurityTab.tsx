'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, Shield, Monitor } from 'lucide-react';

// ===== TYPES =====

interface PasswordState {
  current: string;
  next: string;
  confirm: string;
}

interface PasswordVisibility {
  current: boolean;
  next: boolean;
  confirm: boolean;
}

type PasswordField = keyof PasswordState;

// ===== HELPERS =====

function meetsMinLength(pw: string): boolean {
  return pw.length >= 8;
}

function meetsUppercase(pw: string): boolean {
  return /[A-Z]/.test(pw);
}

function meetsNumber(pw: string): boolean {
  return /[0-9]/.test(pw);
}

// ===== SUB-COMPONENTS =====

function SectionHeading({
  children,
  badge,
}: {
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <h3 className="text-base font-semibold text-gray-900">{children}</h3>
      {badge}
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      Coming Soon
    </span>
  );
}

interface RequirementRowProps {
  met: boolean;
  label: string;
}

function RequirementRow({ met, label }: RequirementRowProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={[
          'flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0 transition-colors',
          met ? 'bg-green-500' : 'bg-gray-200',
        ].join(' ')}
      >
        <Check className={['w-2.5 h-2.5', met ? 'text-white' : 'text-gray-400'].join(' ')} />
      </span>
      <span className={met ? 'text-green-700' : 'text-gray-500'}>{label}</span>
    </li>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  placeholder = '••••••••',
  onChange,
  onToggleVisibility,
}: PasswordInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  disabled = false,
  onToggle,
  label,
}: {
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={[
        'relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2',
        enabled ? 'bg-brand-navy' : 'bg-gray-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5',
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

// ===== MAIN EXPORT =====

export default function SecurityTab() {
  // Password form
  const [passwords, setPasswords] = useState<PasswordState>({
    current: '',
    next: '',
    confirm: '',
  });

  const [visibility, setVisibility] = useState<PasswordVisibility>({
    current: false,
    next: false,
    confirm: false,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 2FA (disabled — coming soon)
  const [twoFactorEnabled] = useState(false);

  // Derived requirements
  const reqLength = meetsMinLength(passwords.next);
  const reqUppercase = meetsUppercase(passwords.next);
  const reqNumber = meetsNumber(passwords.next);
  const passwordsMatch = passwords.next === passwords.confirm && passwords.confirm.length > 0;

  const canSubmit =
    passwords.current.length > 0 &&
    reqLength &&
    reqUppercase &&
    reqNumber &&
    passwordsMatch &&
    !isUpdating;

  const handleFieldChange = (field: PasswordField) => (value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const toggleVisibility = (field: PasswordField) => () => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async () => {
    if (!canSubmit) return;
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Simulate API call
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    setIsUpdating(false);
    setSuccessMessage('Password updated successfully.');
    setPasswords({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Password &amp; Security</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your password and manage account security settings.
        </p>
      </div>

      {/* ===== CHANGE PASSWORD ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SectionHeading>Change Password</SectionHeading>
        <p className="text-sm text-gray-500 mb-5">
          Choose a strong password you haven&apos;t used before.
        </p>

        <div className="space-y-4 max-w-md">
          <PasswordInput
            id="current-password"
            label="Current Password"
            value={passwords.current}
            visible={visibility.current}
            onChange={handleFieldChange('current')}
            onToggleVisibility={toggleVisibility('current')}
          />

          <PasswordInput
            id="new-password"
            label="New Password"
            value={passwords.next}
            visible={visibility.next}
            onChange={handleFieldChange('next')}
            onToggleVisibility={toggleVisibility('next')}
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={passwords.confirm}
            visible={visibility.confirm}
            onChange={handleFieldChange('confirm')}
            onToggleVisibility={toggleVisibility('confirm')}
          />

          {/* Requirements checklist */}
          <ul className="space-y-1.5 pt-1">
            <RequirementRow met={reqLength} label="At least 8 characters" />
            <RequirementRow met={reqUppercase} label="At least 1 uppercase letter" />
            <RequirementRow met={reqNumber} label="At least 1 number" />
            {passwords.confirm.length > 0 && (
              <RequirementRow met={passwordsMatch} label="Passwords match" />
            )}
          </ul>

          {/* Feedback */}
          {successMessage && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <Check className="w-4 h-4 flex-shrink-0" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={!canSubmit}
            className={[
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
              canSubmit
                ? 'bg-brand-navy text-white hover:bg-brand-navy-light'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isUpdating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>

      {/* ===== TWO-FACTOR AUTHENTICATION ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <SectionHeading badge={<ComingSoonBadge />}>
              Two-Factor Authentication
            </SectionHeading>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account.
            </p>
          </div>
          <div className="opacity-50 pointer-events-none">
            <ToggleSwitch
              enabled={twoFactorEnabled}
              disabled
              onToggle={() => {}}
              label="Enable two-factor authentication"
            />
          </div>
        </div>

        <div className="mt-4 opacity-50 pointer-events-none">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Authenticator App</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Use an app like Google Authenticator or Authy to generate codes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ACTIVE SESSIONS ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SectionHeading badge={<ComingSoonBadge />}>Active Sessions</SectionHeading>
        <p className="text-sm text-gray-500 mb-4">
          Devices that are currently signed into your account.
        </p>

        {/* Mock current session */}
        <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Current Session</p>
              <p className="text-xs text-gray-500">Chrome on macOS &middot; 197.xxx.xxx.xxx</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active now
          </span>
        </div>

        <div className="opacity-50 pointer-events-none">
          <button
            type="button"
            disabled
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Sign out all other sessions
          </button>
        </div>
      </div>

    </div>
  );
}
