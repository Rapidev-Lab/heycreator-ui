'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthFooter() {
  return (
    <p className="text-center text-sm text-[#666] mt-6">
      By signing up you agree to the{' '}
      <Link href="/terms" className="underline text-brand-navy-dark">
        Terms of use
      </Link>
      {' '}and{' '}
      <Link href="/privacy" className="underline text-brand-navy-dark">
        Privacy Policy
      </Link>
    </p>
  );
}
