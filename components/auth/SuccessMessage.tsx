'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export default function SuccessMessage({
  title = 'Success!',
  message,
  className = ''
}: SuccessMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
}
