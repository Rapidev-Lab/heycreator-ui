'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface ViralityCTAProps {
  className?: string;
}

const DISMISSED_KEY = 'heycreator_virality_cta_dismissed';

export default function ViralityCTA({ className = '' }: ViralityCTAProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on client mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
      setDismissed(wasDismissed);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
  }

  // Avoid rendering until client is mounted to prevent hydration mismatch
  if (!mounted || dismissed) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, #001F54 0%, #004A8C 50%, #00A8CC 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white leading-snug">
            Discover the right creators for your brand
          </p>
          <p className="text-sm text-white/70 mt-1 leading-relaxed">
            HeyCreator helps you find, analyze, and manage influencer partnerships
          </p>
          {/* Wordmark */}
          <p className="text-xs text-white/40 mt-2 font-medium tracking-wide uppercase">
            Powered by HeyCreator
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <a
            href="https://app.heycreator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-brand-navy bg-white rounded-lg hover:bg-white/90 active:bg-white/80 transition-colors shadow-sm"
          >
            Start Free Trial
          </a>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
