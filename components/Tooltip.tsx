'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Tooltip({ content, children, maxWidth = '300px' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-[100] bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg transform -translate-x-1/2"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: maxWidth,
          }}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          {/* Arrow */}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2"
            style={{
              top: '-4px',
              left: '50%',
            }}
          />
        </div>
      )}
    </>
  );
}
