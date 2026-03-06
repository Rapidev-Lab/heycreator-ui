'use client';

import React, { useState } from 'react';
import {
  Mail,
  UserPlus,
  X,
  ChevronDown,
  Users,
  Sparkles,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { suggestRole, RoleSuggestion } from '@/lib/mock/ai-suggestions';
import { PLAN_TIERS } from '@/types/workspace';
import { WORKSPACE_ROLE_LABELS } from '@/types/workspace';
import { StepProps, InviteEntry, InviteRole } from './types';

// ===== ROLE SELECTOR =====

interface RoleSelectorProps {
  value: InviteRole;
  onChange: (role: InviteRole) => void;
}

const INVITE_ROLES: InviteRole[] = ['admin', 'editor', 'viewer'];

function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#001F54]"
      >
        <span className="capitalize">{WORKSPACE_ROLE_LABELS[value]}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          {INVITE_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                onChange(role);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 capitalize ${
                value === role ? 'text-[#001F54] font-semibold' : 'text-gray-700'
              }`}
            >
              {WORKSPACE_ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== INVITE ROW =====

interface InviteRowProps {
  entry: InviteEntry;
  suggestion: RoleSuggestion | null;
  onRoleChange: (role: InviteRole) => void;
  onRemove: () => void;
}

function InviteRow({
  entry,
  suggestion,
  onRoleChange,
  onRemove,
}: InviteRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
        <div className="w-8 h-8 rounded-full bg-[#001F54] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white uppercase">
            {entry.email[0]}
          </span>
        </div>
        <span className="flex-1 text-sm text-gray-700 truncate min-w-0">
          {entry.email}
        </span>
        <RoleSelector value={entry.role} onChange={onRoleChange} />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label={`Remove ${entry.email}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* AI Role Suggestion */}
      {suggestion && suggestion.confidence > 0.6 && (
        <div className="flex items-center gap-1.5 ml-11 px-2">
          <Sparkles className="w-3 h-3 text-[#00A8CC] flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Suggested:{' '}
            <button
              type="button"
              onClick={() => onRoleChange(suggestion.suggestedRole)}
              className="text-[#00A8CC] font-medium capitalize hover:underline"
            >
              {WORKSPACE_ROLE_LABELS[suggestion.suggestedRole]}
            </button>{' '}
            — {suggestion.reason}
          </p>
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function StepInviteTeam({
  formData,
  setFormData,
}: StepProps) {
  const [emailInput, setEmailInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [inviteEntries, setInviteEntries] = useState<InviteEntry[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<
    Record<string, RoleSuggestion | null>
  >({});

  const plan = PLAN_TIERS[formData.selectedPlan];
  const seatLimit = plan.seats;
  const seatsUsed = inviteEntries.length;
  const seatsRemaining = seatLimit - seatsUsed;
  const isAtLimit = seatsUsed >= seatLimit;

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = async () => {
    const trimmed = emailInput.trim().toLowerCase();

    if (!trimmed) {
      setInputError('Please enter an email address.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setInputError('Please enter a valid email address.');
      return;
    }

    if (inviteEntries.some((e) => e.email === trimmed)) {
      setInputError('This email has already been added.');
      return;
    }

    if (isAtLimit) {
      setInputError(
        `Your ${plan.name} plan includes ${seatLimit} seat${
          seatLimit > 1 ? 's' : ''
        }. Upgrade to add more members.`
      );
      return;
    }

    setInputError('');
    setIsAddingEmail(true);

    const newEntry: InviteEntry = { email: trimmed, role: 'editor' };

    // Fetch AI role suggestion in parallel
    let suggestion: RoleSuggestion | null = null;
    try {
      suggestion = await suggestRole(trimmed);
    } catch {
      // Non-critical — proceed without suggestion
    }

    setInviteEntries((prev) => [...prev, newEntry]);
    setRoleSuggestions((prev) => ({ ...prev, [trimmed]: suggestion }));
    setFormData((prev) => ({
      ...prev,
      inviteEmails: [...prev.inviteEmails, trimmed],
    }));
    setEmailInput('');
    setIsAddingEmail(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEntry = (email: string) => {
    setInviteEntries((prev) => prev.filter((e) => e.email !== email));
    setRoleSuggestions((prev) => {
      const next = { ...prev };
      delete next[email];
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email),
    }));
  };

  const updateRole = (email: string, role: InviteRole) => {
    setInviteEntries((prev) =>
      prev.map((e) => (e.email === email ? { ...e, role } : e))
    );
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-gray-200 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-[#001F54]">Invite Your Team</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Add team members to get started. You can always do this later.
        </p>
      </div>

      <div className="space-y-6">
        {/* Seat Counter */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#001F54] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#001F54]">
                {plan.name} Plan — {seatLimit} seat
                {seatLimit > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {seatsUsed} used &bull; {seatsRemaining} remaining
              </p>
            </div>
          </div>

          {/* Seat Indicator Pills */}
          <div className="flex gap-1">
            {Array.from({ length: seatLimit }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < seatsUsed ? 'bg-[#001F54]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#001F54]">
            Add Team Member
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (inputError) setInputError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="colleague@company.com"
                disabled={isAtLimit}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F54] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  inputError ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={addEmail}
              disabled={isAddingEmail || isAtLimit}
              className="flex items-center gap-1.5 px-4 py-3 bg-[#001F54] text-white rounded-lg text-sm font-semibold hover:bg-[#002a6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isAddingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>

          {inputError && (
            <p className="text-xs text-red-500">{inputError}</p>
          )}
        </div>

        {/* Upgrade Prompt when at limit */}
        {isAtLimit && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <ArrowUpRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Seat limit reached
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your {plan.name} plan supports {seatLimit} seat
                {seatLimit > 1 ? 's' : ''}. Go back to Step 3 to upgrade your
                plan and unlock more seats.
              </p>
            </div>
          </div>
        )}

        {/* Invite List */}
        {inviteEntries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {inviteEntries.length} invitation
              {inviteEntries.length > 1 ? 's' : ''} to send
            </p>
            <div className="space-y-2">
              {inviteEntries.map((entry) => (
                <InviteRow
                  key={entry.email}
                  entry={entry}
                  suggestion={roleSuggestions[entry.email] ?? null}
                  onRoleChange={(role) => updateRole(entry.email, role)}
                  onRemove={() => removeEntry(entry.email)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {inviteEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No team members added yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You can invite teammates above, or skip and do it later from
              Settings.
            </p>
          </div>
        )}

        {/* Role Descriptions */}
        <div className="rounded-xl border border-gray-200 p-4 space-y-2.5 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Role Permissions
          </p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex gap-2">
              <span className="font-semibold text-[#001F54] w-14 flex-shrink-0">
                Admin
              </span>
              <span>
                Full workspace access — manage members, campaigns, and settings.
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[#001F54] w-14 flex-shrink-0">
                Editor
              </span>
              <span>
                Create and manage campaigns, search influencers, and add notes.
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-[#001F54] w-14 flex-shrink-0">
                Viewer
              </span>
              <span>
                Read-only access to campaigns and influencer profiles.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
