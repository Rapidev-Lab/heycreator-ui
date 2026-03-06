'use client';

import { useState } from 'react';
import { CreditCard, Lock, User } from 'lucide-react';

interface CreditCardFormProps {
  onSubmit: (data: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    holderName: string;
    brand: 'visa' | 'mastercard' | 'unknown';
  }) => void;
  submitLabel?: string;
  amount?: number;
  isLoading?: boolean;
}

function detectCardBrand(number: string): 'visa' | 'mastercard' | 'unknown' {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (cleaned.startsWith('5')) return 'mastercard';
  return 'unknown';
}

function VisaIcon() {
  return (
    <div className="flex items-center justify-center w-10 h-6 bg-blue-600 rounded text-white text-[10px] font-black italic tracking-tight">
      VISA
    </div>
  );
}

function MastercardIcon() {
  return (
    <div className="flex items-center w-10 h-6">
      <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
      <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90 -ml-2.5" />
    </div>
  );
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export default function CreditCardForm({
  onSubmit,
  submitLabel = 'Pay Now',
  amount,
  isLoading = false,
}: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [holderName, setHolderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const brand = detectCardBrand(cardNumber);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const rawNumber = cardNumber.replace(/\s/g, '');

    if (rawNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = 'Please enter a valid expiry (MM/YY)';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const fullYear = 2000 + year;
      if (month < 1 || month > 12) newErrors.expiry = 'Invalid month';
      else if (fullYear < now.getFullYear() || (fullYear === now.getFullYear() && month < now.getMonth() + 1)) {
        newErrors.expiry = 'Card has expired';
      }
    }
    if (cvc.length < 3) {
      newErrors.cvc = 'CVC must be 3 digits';
    }
    if (!holderName.trim()) {
      newErrors.holderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ cardNumber, expiry, cvc, holderName, brand });
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
        : focused === field
        ? 'border-brand-navy ring-2 ring-brand-navy/20'
        : 'border-gray-300 hover:border-gray-400'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Card Number
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onFocus={() => setFocused('cardNumber')}
            onBlur={() => setFocused(null)}
            className={`${inputClass('cardNumber')} pl-10 pr-14 font-mono tracking-wider`}
            autoComplete="cc-number"
          />
          <div className="absolute right-3 top-2">
            {brand === 'visa' && <VisaIcon />}
            {brand === 'mastercard' && <MastercardIcon />}
          </div>
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expiry Date
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onFocus={() => setFocused('expiry')}
            onBlur={() => setFocused(null)}
            className={`${inputClass('expiry')} font-mono`}
            autoComplete="cc-exp"
            maxLength={5}
          />
          {errors.expiry && (
            <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CVC
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onFocus={() => setFocused('cvc')}
            onBlur={() => setFocused(null)}
            className={`${inputClass('cvc')} font-mono`}
            autoComplete="cc-csc"
            maxLength={4}
          />
          {errors.cvc && (
            <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>
          )}
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cardholder Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Name as on card"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            onFocus={() => setFocused('holderName')}
            onBlur={() => setFocused(null)}
            className={`${inputClass('holderName')} pl-10`}
            autoComplete="cc-name"
          />
        </div>
        {errors.holderName && (
          <p className="mt-1 text-xs text-red-500">{errors.holderName}</p>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          Your card details are encrypted and never stored on our servers.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            {amount
              ? `${submitLabel} — R${amount.toLocaleString('en-ZA')}`
              : submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
