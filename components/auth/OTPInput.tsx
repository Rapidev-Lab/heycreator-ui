'use client';

import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  className = ''
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [localValues, setLocalValues] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );

  // Update local values when external value changes
  useEffect(() => {
    const newValues = value.split('').concat(Array(length - value.length).fill(''));
    setLocalValues(newValues.slice(0, length));
  }, [value, length]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    const newValues = [...localValues];
    newValues[index] = digit;
    setLocalValues(newValues);

    // Notify parent of the change
    onChange(newValues.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!localValues[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputsRef.current[index - 1]?.focus();
        const newValues = [...localValues];
        newValues[index - 1] = '';
        setLocalValues(newValues);
        onChange(newValues.join(''));
      } else if (localValues[index]) {
        // If current input has value, just clear it
        const newValues = [...localValues];
        newValues[index] = '';
        setLocalValues(newValues);
        onChange(newValues.join(''));
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const digits = pastedData.slice(0, length).split('');

    const newValues = [...localValues];
    digits.forEach((digit, i) => {
      newValues[i] = digit;
    });
    setLocalValues(newValues);
    onChange(newValues.join(''));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex((v) => !v);
    if (nextEmptyIndex !== -1) {
      inputsRef.current[nextEmptyIndex]?.focus();
    } else {
      inputsRef.current[length - 1]?.focus();
    }
  };

  return (
    <div className={`flex gap-1.5 sm:gap-2 justify-center ${className}`}>
      {localValues.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="
            w-9 h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-semibold
            border-2 border-gray-300 rounded-lg
            focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20
            focus:outline-none
            transition-all duration-200
            bg-white text-gray-900
          "
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
