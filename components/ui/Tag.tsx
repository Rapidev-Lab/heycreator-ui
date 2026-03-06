'use client';

type TagVariant = 'default' | 'success' | 'info' | 'warning';
type TagSize = 'sm' | 'md' | 'lg';

interface TagProps {
  text: string;
  showDot?: boolean;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
}

const variantStyles: Record<TagVariant, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  },
  success: {
    bg: 'bg-[#E6F9F0]',
    text: 'text-[#00A855]',
    dot: 'bg-[#00A855]',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
};

const sizeStyles: Record<TagSize, { padding: string; fontSize: string; gap: string; dot: string }> = {
  sm: {
    padding: 'px-3 py-1',
    fontSize: 'text-xs',
    gap: 'gap-1.5',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    padding: 'px-4 py-1.5',
    fontSize: 'text-sm',
    gap: 'gap-2',
    dot: 'w-2 h-2',
  },
  lg: {
    padding: 'px-5 py-2.5',
    fontSize: 'text-base',
    gap: 'gap-2.5',
    dot: 'w-2.5 h-2.5',
  },
};

export default function Tag({ 
  text, 
  showDot = false, 
  variant = 'default',
  size = 'md',
  className = ''
}: TagProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  
  return (
    <span className={`inline-flex items-center ${sizeStyle.gap} ${sizeStyle.padding} ${variantStyle.bg} ${variantStyle.text} ${sizeStyle.fontSize} font-medium rounded-full ${className}`}>
      {showDot && (
        <span className={`${sizeStyle.dot} rounded-full ${variantStyle.dot}`} />
      )}
      {text}
    </span>
  );
}
