'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2, LucideIcon } from 'lucide-react';

// ===== TYPES =====

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Border radius shape */
  shape?: ButtonShape;
  /** Show loading spinner */
  loading?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Whether button takes full width */
  fullWidth?: boolean;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Icon position relative to label */
  iconPosition?: 'left' | 'right';
  /** Render as a Next.js Link (href required) */
  href?: string;
}

// ===== STYLE MAPS =====

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-navy text-white hover:bg-brand-navy-light active:bg-brand-navy-dark border border-brand-navy shadow-brand-sm',
  secondary:
    'bg-white text-brand-navy border border-brand-navy hover:bg-brand-navy-50 active:bg-brand-navy-100',
  outline:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
  danger:
    'bg-status-error text-white border border-status-error hover:bg-red-600 active:bg-red-700',
  ghost:
    'bg-transparent text-brand-navy border border-transparent hover:bg-brand-navy-50 active:bg-brand-navy-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const shapeClasses: Record<ButtonShape, string> = {
  default: 'rounded-lg',
  pill: 'rounded-full',
};

// ===== COMPONENT =====

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'default',
      loading = false,
      loadingText,
      fullWidth = false,
      icon: Icon,
      iconPosition = 'left',
      href,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${shapeClasses[shape]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim();

    const iconClass = iconSizeClasses[size];

    const content = (
      <>
        {loading && <Loader2 className={`${iconClass} animate-spin`} />}
        {!loading && Icon && iconPosition === 'left' && <Icon className={iconClass} />}
        {loading && loadingText ? loadingText : children}
        {!loading && Icon && iconPosition === 'right' && <Icon className={iconClass} />}
      </>
    );

    // Render as Link if href provided and not disabled
    if (href && !isDisabled) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={baseClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
