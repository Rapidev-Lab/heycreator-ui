'use client';

interface DateFieldProps {
  label: string;
  subLabel?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function DateField({
  label,
  subLabel,
  value,
  onChange,
  required,
}: DateFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-navy focus:border-brand-navy sm:text-sm"
      />
      {subLabel && <p className="mt-2 text-xs text-gray-500">{subLabel}</p>}
    </div>
  );
}
