'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'default' | 'danger';

interface SecondaryOutlinedButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: ButtonVariant;
}

export default function SecondaryOutlinedButton({
  label,
  href,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  disabled = false,
  variant = 'default',
}: SecondaryOutlinedButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    default: 'border-brand-navy-dark text-brand-navy-dark hover:bg-gray-50',
    danger: 'border-red-500 text-red-500 hover:bg-red-50',
  };

  const baseStyles = `inline-flex justify-center items-center gap-2 py-2.5 px-5 rounded-full border bg-white text-sm font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {label}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={`${baseStyles} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
    >
      {content}
    </button>
  );
}
