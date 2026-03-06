'use client';

import { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Camera,
  X,
  ChevronDown,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import TagChipInput from '@/components/brands/creators/TagChipInput';
import { uploadProfilePhoto } from '@/lib/firebase/storage-utils';
import { InfluencerProfile, LinkedAccount, SocialPlatform, User } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';

const CATEGORY_OPTIONS = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel',
  'Technology', 'Gaming', 'Lifestyle', 'Music', 'Art',
  'Sports', 'Education', 'Business', 'Health', 'Entertainment'
];


const BANK_OPTIONS = [
  'FNB', 'Standard Bank', 'Absa', 'Nedbank', 'Capitec',
  'Investec', 'Discovery Bank', 'African Bank', 'TymeBank',
];

const ACCOUNT_TYPE_OPTIONS = ['Savings', 'Cheque', 'Current', 'Transmission'];

const PAYMENT_METHOD_OPTIONS = ['EFT', 'PayPal', 'Mobile Money', 'Crypto', 'Other'];

const INFLUENCE_SIZE_OPTIONS = [
  { value: '0-499', label: '0 – 499' },
  { value: '500-999', label: '500 – 999' },
  { value: '1000-3999', label: '1,000 – 3,999' },
  { value: '4000-8999', label: '4,000 – 8,999' },
  { value: '9000+', label: '9,000+' },
];

const PLATFORM_OPTIONS: { key: SocialPlatform; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
];

interface LinkedAccountRow {
  id: string;
  platform: SocialPlatform;
  username: string;
  status: 'empty' | 'pending' | 'connected';
  connecting?: boolean;
  error?: string;
  globalInfluencerId?: string;
}

interface SettingsTabProps {
  roleProfile: InfluencerProfile | null;
  userProfile: User | null;
  userEmail: string;
  phoneNumber?: string;
  userId: string;
  onSave: (data: SettingsFormData) => Promise<void>;
  onConnect?: (platform: string, username: string) => Promise<{ success: boolean; globalInfluencerId?: string }>;
  enrichedBio?: string;
}

export interface SettingsFormData {
  displayName: string;
  phoneNumber: string;
  bio: string;
  location: string;
  website: string;
  categories: string[];
  relevantTags: string[];
  mentionsBrands: string[];
  relevantLocations: string[];
  influenceSize: string[];
  avatarUrl?: string;
  paymentDetails: {
    bank: string;
    accountType: string;
    paymentMethod: string;
    paymentReference: string;
    accountNumber: string;
    branchCode: string;
  };
  linkedAccounts: LinkedAccount[];
}

export function SettingsTab({ roleProfile, userProfile, userEmail, phoneNumber, userId, onSave, onConnect, enrichedBio }: SettingsTabProps) {
  // Basic Info
  const [displayName, setDisplayName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [websiteError, setWebsiteError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Tags & Metadata
  const [relevantTags, setRelevantTags] = useState<string[]>([]);
  const [mentionsBrands, setMentionsBrands] = useState<string[]>([]);
  const [relevantLocations, setRelevantLocations] = useState<string[]>([]);
  const [influenceSize, setInfluenceSize] = useState<string[]>([]);

  // Payment Details
  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');

  // Avatar
  const existingAvatarUrl = (roleProfile as any)?.avatarUrl || userProfile?.photoURL || '';
  const [avatarError, setAvatarError] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The displayed avatar URL: preview (selected but not saved) > existing (persisted)
  const displayAvatarUrl = avatarPreview || existingAvatarUrl;

  // Linked Accounts (row-based)
  const [accountRows, setAccountRows] = useState<LinkedAccountRow[]>([]);
  const rowIdCounter = useRef(0);

  // Website validation
  const validateWebsite = (value: string): string => {
    if (!value) return '';
    if (value.length < 2) return 'Website must be at least 2 characters long.';
    const allowedCharsRegex = /^[a-zA-Z0-9.\-/:_]{2,}$/;
    if (!allowedCharsRegex.test(value)) {
      return 'Website contains invalid characters. Use letters, numbers, dots, hyphens, slashes, or colons.';
    }
    return '';
  };

  // Avatar selection handler
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

    // Revoke previous preview URL to avoid memory leaks
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarError(false);
    // Clear file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load profile data
  useEffect(() => {
    if (roleProfile) {
      setDisplayName(roleProfile.displayName || '');
      const manualBio = (roleProfile as any).bio || '';
      if (manualBio && enrichedBio && !manualBio.includes(enrichedBio)) {
        setBio(`${manualBio}\n\n${enrichedBio}`);
      } else {
        setBio(manualBio || enrichedBio || '');
      }
      setLocation((roleProfile as any).location || '');
      setWebsite((roleProfile as any).website || '');
      setCategories((roleProfile as any).categories || []);
      setRelevantTags((roleProfile as any).relevantTags || []);
      setMentionsBrands((roleProfile as any).mentionsBrands || []);
      setRelevantLocations((roleProfile as any).relevantLocations || []);
      setInfluenceSize((roleProfile as any).influenceSize || []);

      const pd = (roleProfile as any).paymentDetails || {};
      setBank(pd.bank || '');
      setAccountType(pd.accountType || '');
      setPaymentMethod(pd.paymentMethod || '');
      setPaymentReference(pd.paymentReference || '');
      setAccountNumber(pd.accountNumber || '');
      setBranchCode(pd.branchCode || '');

      // Load linked accounts into rows
      const linked = roleProfile.linkedAccounts || [];
      const rows: LinkedAccountRow[] = linked.map((acct) => {
        const id = String(rowIdCounter.current++);
        const hasUsername = !!(acct.username?.trim());
        const accountGlobalId = (acct as any).globalInfluencerId;
        const isVerified = acct.verificationStatus === 'verified' || (acct as any).verificationStatus === 'verified';
        let status: LinkedAccountRow['status'] = 'empty';
        if (hasUsername) {
          status = (accountGlobalId || isVerified) ? 'connected' : 'pending';
        }
        return {
          id,
          platform: acct.platform as SocialPlatform,
          username: acct.username || '',
          status,
          globalInfluencerId: accountGlobalId,
        };
      });
      setAccountRows(rows);
    }
    if (phoneNumber) {
      setMobile(phoneNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleProfile, phoneNumber, enrichedBio]);

  // Linked account row handlers
  const handleAddRow = () => {
    setAccountRows(prev => [
      ...prev,
      { id: String(rowIdCounter.current++), platform: 'instagram', username: '', status: 'empty' },
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    setAccountRows(prev => prev.filter(r => r.id !== rowId));
  };

  const handleRowPlatformChange = (rowId: string, platform: SocialPlatform) => {
    setAccountRows(prev => prev.map(r => r.id === rowId ? { ...r, platform } : r));
  };

  const handleRowUsernameChange = (rowId: string, username: string) => {
    setAccountRows(prev => prev.map(r => r.id === rowId ? { ...r, username } : r));
  };

  const handleRowConnect = async (rowId: string) => {
    const row = accountRows.find(r => r.id === rowId);
    if (!row || !row.username.trim()) return;

    if (!onConnect) {
      // Fallback: just set pending if no onConnect handler
      setAccountRows(prev => prev.map(r =>
        r.id === rowId ? { ...r, status: 'pending' as const } : r
      ));
      return;
    }

    // Set connecting state
    setAccountRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, connecting: true, error: undefined } : r
    ));

    try {
      const result = await onConnect(row.platform, row.username);
      if (result.success) {
        setAccountRows(prev => prev.map(r =>
          r.id === rowId ? { ...r, status: 'connected' as const, connecting: false, globalInfluencerId: result.globalInfluencerId } : r
        ));
      } else {
        setAccountRows(prev => prev.map(r =>
          r.id === rowId ? { ...r, connecting: false, error: 'Failed to connect' } : r
        ));
      }
    } catch {
      setAccountRows(prev => prev.map(r =>
        r.id === rowId ? { ...r, connecting: false, error: 'Connection failed' } : r
      ));
    }
  };

  const handleRowDisconnect = (rowId: string) => {
    setAccountRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return { ...r, username: '', status: 'empty' as const };
    }));
  };

  // Helper: convert a Timestamp-like value to an ISO string for safe JSON serialization
  const toISOString = (val: any): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (val.toDate) return val.toDate().toISOString(); // Firestore Timestamp from server
    if (val.seconds != null) return new Date(val.seconds * 1000).toISOString(); // plain {seconds, nanoseconds}
    if (typeof val === 'string') return val; // already ISO string
    return new Date().toISOString();
  };

  // Build form data for parent save handler
  const getFormData = async (): Promise<SettingsFormData> => {
    const linkedAccounts: LinkedAccount[] = [];
    for (const row of accountRows) {
      const username = row.username?.trim();
      if (!username) continue;
      const existing = roleProfile?.linkedAccounts?.find(
        a => a.platform === row.platform && a.username === username
      );
      linkedAccounts.push({
        platform: row.platform,
        username,
        profileUrl: existing?.profileUrl || '',
        followerCount: existing?.followerCount ?? 0,
        isVerified: row.status === 'connected' ? (existing?.isVerified ?? false) : false,
        verificationStatus: row.status === 'connected' ? 'verified' : 'pending',
        connectedAt: toISOString(existing?.connectedAt) as any,
        lastSyncedAt: existing?.lastSyncedAt ? toISOString(existing.lastSyncedAt) as any : null,
        globalInfluencerId: row.globalInfluencerId || (existing as any)?.globalInfluencerId,
      } as any);
    }
    console.log('[SettingsTab] getFormData linkedAccounts:', linkedAccounts);

    // Upload avatar if a new file was selected
    let resolvedAvatarUrl = existingAvatarUrl;
    if (avatarFile) {
      setIsUploadingAvatar(true);
      setAvatarUploadError('');
      try {
        const uploaded = await uploadProfilePhoto(userId, avatarFile);
        resolvedAvatarUrl = uploaded.url;
        // Clear the file so subsequent saves don't re-upload
        setAvatarFile(null);
      } catch (err) {
        setAvatarUploadError('Failed to upload photo. Please try again.');
        setIsUploadingAvatar(false);
        throw err; // Propagate to prevent saving with stale URL
      } finally {
        setIsUploadingAvatar(false);
      }
    }

    return {
      displayName,
      phoneNumber: mobile,
      bio,
      location,
      website,
      categories,
      relevantTags,
      mentionsBrands,
      relevantLocations,
      influenceSize,
      avatarUrl: resolvedAvatarUrl || undefined,
      paymentDetails: {
        bank,
        accountType,
        paymentMethod,
        paymentReference,
        accountNumber,
        branchCode,
      },
      linkedAccounts,
    };
  };

  // Expose getFormData to parent via a custom handler
  // The parent calls onSave which triggers getFormData
  const handleSave = async () => onSave(await getFormData());

  // Attach handleSave to a ref that the parent can call
  // We use a simpler pattern: parent passes onSave, we call it.
  // But the parent's Save button needs to trigger this. So we expose via useEffect.
  useEffect(() => {
    // Store getFormData so parent can access it
    (window as any).__settingsFormData = getFormData;
    return () => { delete (window as any).__settingsFormData; };
  });

  // Profile completion
  const completionPercentage = userProfile && roleProfile
    ? calculateProfileCompletion(userProfile, roleProfile)
    : 0;

  return (
    <div className="space-y-6">
      {/* Profile Completion Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-semibold text-brand-navy">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Card 1: Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            {displayAvatarUrl && !avatarError ? (
              <img
                src={avatarPreview || displayAvatarUrl}
                alt={displayName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-brand-navy flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {/* Remove button — shows on hover when there's a photo */}
            {(displayAvatarUrl || avatarPreview) && !avatarError && (
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
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Add full name..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
          />
        </div>

        {/* Email + Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">E-mail</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="Add email address..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Add mobile number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
        </div>

        {/* Location + Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setWebsiteError(validateWebsite(e.target.value));
                }}
                placeholder="https://yourwebsite.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none ${
                  websiteError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {websiteError && (
              <p className="text-xs text-red-600 mt-1">{websiteError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card: Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-bold text-brand-navy mb-1">Categories</h3>
        <p className="text-sm text-gray-500 mb-4">Select categories that best describe your content</p>

        {/* Selected Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-brand-navy text-white rounded-full text-sm"
              >
                {category}
                <button
                  onClick={() => setCategories(categories.filter(c => c !== category))}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Available Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.filter(cat => !categories.includes(cat)).map((category) => (
            <button
              key={category}
              onClick={() => setCategories([...categories, category])}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              + {category}
            </button>
          ))}
        </div>
      </div>

      {/* Card 2: Tags & Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TagChipInput
            tags={relevantTags}
            onChange={setRelevantTags}
            label="Relevant Tags"
            placeholder="#summer #brand #ad"
          />
          <TagChipInput
            tags={mentionsBrands}
            onChange={setMentionsBrands}
            label="Mentions / Tags / Brands"
            placeholder="@ecoglowsa @sustainablebeautysa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagChipInput
            tags={relevantLocations}
            onChange={setRelevantLocations}
            label="Relevant Locations"
            placeholder="E.g. Cape Town, Johannesburg..."
            commaSeparatedOnly
          />
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Size of Influence
            </label>
            <div className="flex flex-wrap gap-2">
              {INFLUENCE_SIZE_OPTIONS.map((opt) => {
                const isSelected = influenceSize.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setInfluenceSize(
                        isSelected
                          ? influenceSize.filter(s => s !== opt.value)
                          : [...influenceSize, opt.value]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-brand-navy text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Payment Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-bold text-brand-navy mb-4">Payment Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Bank */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Bank</label>
            <div className="relative">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none appearance-none bg-white"
              >
                <option value="">Select bank...</option>
                {BANK_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Type of Account */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Type of Account</label>
            <div className="relative">
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none appearance-none bg-white"
              >
                <option value="">Select account type...</option>
                {ACCOUNT_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Payment Method</label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none appearance-none bg-white"
              >
                <option value="">Select payment method...</option>
                {PAYMENT_METHOD_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Payment Reference</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Add a payment reference..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Number */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
            />
          </div>

          {/* Branch Code */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Branch Code</label>
            <input
              type="text"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              placeholder="Add a branch code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
            />
          </div>
        </div>
      </div>

      {/* Card 4: My Linked Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-brand-navy">My Linked Accounts</h3>
          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Table header */}
        {accountRows.length > 0 && (
          <div className="grid grid-cols-[140px_1fr_160px_140px_40px] gap-3 items-center mb-3 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Handle</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* Rows */}
        <div className="space-y-3">
          {accountRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[140px_1fr_160px_140px_40px] gap-3 items-center"
            >
              {/* Platform dropdown */}
              <div className="relative">
                <select
                  value={row.platform}
                  onChange={(e) => handleRowPlatformChange(row.id, e.target.value as SocialPlatform)}
                  disabled={row.status === 'connected' || row.connecting}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {PLATFORM_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Handle input */}
              <input
                type="text"
                value={row.username}
                onChange={(e) => handleRowUsernameChange(row.id, e.target.value)}
                placeholder="@"
                disabled={row.status === 'connected' || row.connecting}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />

              {/* Status badge */}
              <div>
                {row.connecting && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting...
                  </span>
                )}
                {!row.connecting && row.status === 'pending' && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Pending Activation
                  </span>
                )}
                {!row.connecting && row.status === 'connected' && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Connected
                  </span>
                )}
                {row.error && (
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full mt-1">
                    {row.error}
                  </span>
                )}
              </div>

              {/* Connect / Disconnect button */}
              <div>
                {row.status === 'connected' ? (
                  <button
                    onClick={() => handleRowDisconnect(row.id)}
                    className="w-full px-4 py-2 border border-red-400 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleRowConnect(row.id)}
                    disabled={!row.username.trim() || row.connecting}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      row.username.trim() && !row.connecting
                        ? 'bg-brand-navy text-white hover:bg-opacity-90'
                        : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {row.connecting ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Connecting
                      </span>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>

              {/* Trash icon */}
              <button
                onClick={() => handleRemoveRow(row.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {accountRows.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            No linked accounts yet. Click &quot;+ Add&quot; to connect a social media account.
          </div>
        )}
      </div>

      {/* Delete Account */}
      <div className="text-center py-4">
        <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
          Delete My Account
        </button>
      </div>
    </div>
  );
}
