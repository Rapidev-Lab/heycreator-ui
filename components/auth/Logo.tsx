import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  src?: string; // Optional: path to the logo image
  brand?:string;
  variant?:string;
  clickable?: boolean; // Whether the logo should be clickable
  href?: string; // Custom link destination
}

export default function Logo({
  size = 'md',
  className = '',
  src = '/logo.svg', // Default to /logo.svg if no src is provided
  clickable = true, // Clickable by default
  href = '/', // Default to home page
}: LogoProps) {
  const sizeClasses = {
    sm: { width: 100, height: 20 },
    md: { width: 150, height: 30 },
    lg: { width: 200, height: 40 },
  };

  const { width, height } = sizeClasses[size];

  const logoImage = (
    <Image
      src={src}
      alt="HeyCreator Logo"
      width={width}
      height={height}
    />
  );

  if (!clickable) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {logoImage}
      </div>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
      {logoImage}
    </Link>
  );
}

