'use client';

import { useState, useRef } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';

// ===== TYPES =====

interface SocialRow {
  id: string;
  platform: string;
  value: string;
}

// ===== CONSTANTS =====

const SOCIAL_PLATFORM_OPTIONS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
];

// ===== HELPERS =====

function buildProfileUrl(platform: string, value: string): string {
  if (!value.trim()) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const handle = value.replace(/^@/, '');
  switch (platform) {
    case 'instagram': return `https://instagram.com/${handle}`;
    case 'tiktok': return `https://tiktok.com/@${handle}`;
    case 'facebook': return `https://facebook.com/${handle}`;
    case 'twitter': return `https://x.com/${handle}`;
    case 'youtube': return `https://youtube.com/@${handle}`;
    case 'linkedin': return `https://linkedin.com/in/${handle}`;
    default: return value;
  }
}

// ===== COMPONENT =====

export default function ProfileTab() {
  // Mock initial state — swap for real auth data when connected
  const [displayName, setDisplayName] = useState('Demo Brand');
  const [email] = useState('brand@demo.heycreator.com');
  const [userRole, setUserRole] = useState('Marketing Manager');
  const [description, setDescription] = useState('');

  // Social rows
  const [socialRows, setSocialRows] = useState<SocialRow[]>([]);
  const socialRowId = useRef(0);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Derived
  const avatarInitial = (displayName || email).charAt(0).toUpperCase();

  // ===== AVATAR HANDLERS =====

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploadError('');

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError('Image must be smaller than 5MB.');
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview('');
    setAvatarUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===== SOCIAL ROW HANDLERS =====

  const handleAddSocialRow = () => {
    setSocialRows(prev => [
      ...prev,
      { id: String(socialRowId.current++), platform: 'instagram', value: '' },
    ]);
  };

  const handleRemoveSocialRow = (rowId: string) => {
    setSocialRows(prev => prev.filter(r => r.id !== rowId));
  };

  const handleSocialPlatformChange = (rowId: string, platform: string) => {
    setSocialRows(prev => prev.map(r => r.id === rowId ? { ...r, platform } : r));
  };

  const handleSocialValueChange = (rowId: string, value: string) => {
    setSocialRows(prev => prev.map(r => r.id === rowId ? { ...r, value } : r));
  };

  // ===== SAVE HANDLER =====

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Simulate async save — replace with real API call when auth is wired
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== RENDER =====

  return (
    <div className="space-y-8">
      {/* Save Status */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-800">Profile updated successfully!</span>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-800">{saveError}</span>
        </div>
      )}

      {/* Personal Information */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Personal Information</h3>
        <p className="text-sm text-gray-500 mb-6">Update your name, role, and profile photo.</p>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={displayName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity border-2 border-gray-200"
                onClick={() => fileInputRef.current?.click()}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-brand-navy flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white text-3xl font-bold">{avatarInitial}</span>
              </div>
            )}
            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {/* Remove button — visible on hover when avatar is set */}
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {avatarUploadError && (
            <p className="text-xs text-red-600 mt-2">{avatarUploadError}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF or WebP &mdash; max 5 MB</p>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Your Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Your Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                placeholder="e.g., Marketing Manager, CEO"
              />
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none resize-none"
              placeholder="Tell creators a bit about yourself..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {description.length}/500 characters
            </p>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Social Media</h3>
            <p className="text-sm text-gray-500 mt-0.5">Link your company&apos;s social profiles.</p>
          </div>
          <button
            onClick={handleAddSocialRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {/* Table header */}
          {socialRows.length > 0 && (
            <div className="grid grid-cols-[140px_1fr_96px_36px] gap-3 items-center mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Platform
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                URL / Handle
              </span>
              <span />
              <span />
            </div>
          )}

          {/* Rows */}
          <div className="space-y-3">
            {socialRows.map((row) => {
              const profileUrl = buildProfileUrl(row.platform, row.value);
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[140px_1fr_96px_36px] gap-3 items-center"
                >
                  {/* Platform dropdown */}
                  <select
                    value={row.platform}
                    onChange={(e) => handleSocialPlatformChange(row.id, e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none bg-white"
                  >
                    {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* URL / Handle input */}
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => handleSocialValueChange(row.id, e.target.value)}
                    placeholder="@handle or https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  />

                  {/* Visit button */}
                  {row.value.trim() ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 w-full justify-center px-2.5 py-2 border border-brand-navy text-brand-navy rounded-lg text-xs font-medium hover:bg-brand-navy/5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 w-full justify-center px-2.5 py-2 border border-gray-200 text-gray-300 rounded-lg text-xs font-medium cursor-not-allowed">
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </span>
                  )}

                  {/* Trash */}
                  <button
                    onClick={() => handleRemoveSocialRow(row.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {socialRows.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              No social media accounts linked yet. Click &quot;+ Add&quot; to connect one.
            </div>
          )}
        </div>
      </section>

      {/* Save Changes */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
