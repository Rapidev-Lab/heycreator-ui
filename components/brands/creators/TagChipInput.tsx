'use client';

import { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';

interface TagChipInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  /** When true, only split on commas (not spaces). Use for multi-word entries like locations. */
  commaSeparatedOnly?: boolean;
}

export default function TagChipInput({
  tags,
  onChange,
  placeholder = '#summer #brand #ad',
  label,
  commaSeparatedOnly = false,
}: TagChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTags = () => {
    const value = inputValue.trim();
    if (!value) return;
    const splitter = commaSeparatedOnly ? /,/ : /[,\s]+/;
    const newTags = value
      .split(splitter)
      .map(t => t.trim())
      .filter(t => t && !tags.includes(t));
    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTags();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      )}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
        />
        <button
          type="button"
          onClick={addTags}
          className="p-2.5 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 pl-4 pr-3 py-2 bg-brand-navy text-white text-sm rounded-full font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-white/20 rounded-full transition-colors leading-none text-white/80 hover:text-white text-base"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
