'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Shield, Edit3, Eye, Check } from 'lucide-react';
import { ROLE_PERMISSIONS } from '@/types/team';

// ===== TYPES =====

export type SelectableRole = 'admin' | 'editor' | 'viewer';

interface RoleSelectorProps {
  value: SelectableRole;
  onChange: (role: SelectableRole) => void;
  showPermissions?: boolean;
  disabled?: boolean;
}

// ===== ROLE METADATA =====

interface RoleMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const ROLE_META: Record<SelectableRole, RoleMeta> = {
  admin: {
    label: 'Admin',
    description: 'Full access to workspace settings and team management',
    icon: <Shield className="w-4 h-4" />,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit campaigns, manage creators',
    icon: <Edit3 className="w-4 h-4" />,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to campaigns and analytics',
    icon: <Eye className="w-4 h-4" />,
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-600',
  },
};

const ROLE_ORDER: SelectableRole[] = ['admin', 'editor', 'viewer'];

// ===== PERMISSION LIST =====

function PermissionList({ role }: { role: SelectableRole }) {
  const relevant = ROLE_PERMISSIONS.filter((p) => p[role] === true);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Permissions for {ROLE_META[role].label}
      </p>
      <ul className="space-y-1.5">
        {relevant.map((perm) => (
          <li key={perm.key} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-medium text-gray-700">{perm.label}</span>
              <span className="text-xs text-gray-400 ml-1">— {perm.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function RoleSelector({
  value,
  onChange,
  showPermissions = false,
  disabled = false,
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = ROLE_META[value];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleSelect = useCallback(
    (role: SelectableRole) => {
      onChange(role);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selected role: ${selected.label}. Click to change.`}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors
          ${disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
            : isOpen
              ? 'border-brand-navy bg-white shadow-sm'
              : 'border-gray-300 bg-white hover:border-brand-navy/50'
          }
        `}
      >
        {/* Role icon */}
        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${selected.iconBg} ${selected.iconColor}`}>
          {selected.icon}
        </div>

        {/* Label + description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{selected.label}</p>
          <p className="text-xs text-gray-500 truncate">{selected.description}</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select role"
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-1 space-y-0.5">
            {ROLE_ORDER.map((role) => {
              const meta = ROLE_META[role];
              const isSelected = role === value;

              return (
                <button
                  key={role}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(role)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors
                    ${isSelected ? 'bg-brand-navy/5' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Icon */}
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${meta.iconBg} ${meta.iconColor}`}>
                    {meta.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                    <p className="text-xs text-gray-500">{meta.description}</p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-navy flex-shrink-0" aria-label="Selected" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible permissions section */}
      {showPermissions && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setPermissionsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-medium text-brand-navy hover:text-brand-navy/80 transition-colors"
          >
            {permissionsExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {permissionsExpanded ? 'Hide permissions' : 'Show permissions'}
          </button>

          {permissionsExpanded && <PermissionList role={value} />}
        </div>
      )}
    </div>
  );
}
