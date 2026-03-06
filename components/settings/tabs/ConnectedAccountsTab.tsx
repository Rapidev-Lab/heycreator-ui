'use client';

import { useState } from 'react';
import { Check, X, Mail, AlertTriangle } from 'lucide-react';

// ===== TYPES =====

interface OAuthProvider {
  id: string;
  name: string;
  connected: boolean;
  connectedEmail?: string;
}

// ===== MOCK DATA =====

const INITIAL_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    connected: true,
    connectedEmail: 'brand@demo.heycreator.com',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    connected: false,
  },
  {
    id: 'apple',
    name: 'Apple',
    connected: false,
  },
];

// ===== PROVIDER LOGO =====

function ProviderLogo({ providerId }: { providerId: string }) {
  if (providerId === 'google') {
    return (
      <div className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 text-base font-bold select-none">
        <span className="bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">
          G
        </span>
      </div>
    );
  }

  if (providerId === 'facebook') {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0 select-none">
        <span className="text-white font-bold text-base leading-none">f</span>
      </div>
    );
  }

  if (providerId === 'apple') {
    return (
      <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0 select-none">
        {/* Apple logo approximation using unicode */}
        <span className="text-white text-base leading-none"></span>
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 select-none">
      <span className="text-gray-600 font-bold text-sm">{providerId[0].toUpperCase()}</span>
    </div>
  );
}

// ===== PROVIDER CARD =====

interface ProviderCardProps {
  provider: OAuthProvider;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

function ProviderCard({ provider, onConnect, onDisconnect }: ProviderCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <ProviderLogo providerId={provider.id} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
          {provider.connected ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              <Check className="w-3 h-3" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Not connected
            </span>
          )}
        </div>

        {provider.connected && provider.connectedEmail && (
          <p className="text-xs text-gray-500 truncate">{provider.connectedEmail}</p>
        )}
        {!provider.connected && (
          <p className="text-xs text-gray-400">Not linked to your account</p>
        )}
      </div>

      <div className="flex-shrink-0">
        {provider.connected ? (
          <button
            type="button"
            onClick={() => onDisconnect(provider.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onConnect(provider.id)}
            className="px-3 py-1.5 bg-brand-navy text-white rounded-lg text-xs font-medium hover:bg-brand-navy-light transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function ConnectedAccountsTab() {
  const [providers, setProviders] = useState<OAuthProvider[]>(INITIAL_PROVIDERS);

  const handleConnect = (id: string) => {
    // Placeholder: in production this would trigger an OAuth popup
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, connected: true, connectedEmail: 'brand@demo.heycreator.com' } : p
      )
    );
  };

  const handleDisconnect = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, connected: false, connectedEmail: undefined } : p
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your connected sign-in methods.
        </p>
      </div>

      {/* ===== OAUTH PROVIDERS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      {/* ===== EMAIL & PASSWORD ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Email &amp; Password</h3>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Current email:</span>
            <span className="text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
              brand@demo.heycreator.com
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Password:</span>
            <span className="text-xs text-gray-600">Last changed 15 days ago</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Want to update your password?{' '}
          <span className="text-brand-navy font-medium underline underline-offset-2 cursor-pointer hover:text-brand-navy-light transition-colors">
            Change your password in Security settings
          </span>
        </p>
      </div>

      {/* ===== WARNING ===== */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          You must keep at least one sign-in method connected. If you disconnect all providers,
          you won&apos;t be able to log in.
        </p>
      </div>

    </div>
  );
}
