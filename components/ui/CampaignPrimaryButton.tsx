'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CampaignPrimaryButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function CampaignPrimaryButton({
  label,
  href,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  loadingText,
  type = 'button',
  className = '',
}: CampaignPrimaryButtonProps) {
  const baseStyles =
    `flex justify-center items-start gap-[7.945px] pt-[11.5px] pb-[10.5px] px-[25px] rounded-full border border-brand-navy-dark bg-brand-navy-dark text-white text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {loading ? (loadingText || 'Loading...') : label}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseStyles}
    >
      {content}
    </button>
  );
}
