'use client';

import { useCallback, useEffect, useState } from 'react';

type MockRole = 'brand' | 'influencer';

export default function MockDevToolbar() {
  const [role, setRole] = useState<MockRole>('brand');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mock_user_role') as MockRole | null;
    setRole(stored || 'brand');
  }, []);

  const switchRole = useCallback((newRole: MockRole) => {
    localStorage.setItem('mock_user_role', newRole);
    setRole(newRole);
    // Hard-navigate to the new role's dashboard so MockAuthProvider re-initialises
    // from localStorage with the correct role (simulates logout + login as new role)
    window.location.href = newRole === 'brand' ? '/brands/dashboard' : '/influencers';
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
      >
        Mock
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-purple-600/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg p-3 space-y-2 min-w-[160px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Mock Mode</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-white/70 hover:text-white ml-2"
          aria-label="Collapse toolbar"
        >
          &times;
        </button>
      </div>

      <div className="text-purple-200">
        Role: <span className="font-medium text-white capitalize">{role}</span>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => switchRole('brand')}
          disabled={role === 'brand'}
          className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
            role === 'brand'
              ? 'bg-white/20 cursor-default'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Brand
        </button>
        <button
          onClick={() => switchRole('influencer')}
          disabled={role === 'influencer'}
          className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
            role === 'influencer'
              ? 'bg-white/20 cursor-default'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Influencer
        </button>
      </div>
    </div>
  );
}
