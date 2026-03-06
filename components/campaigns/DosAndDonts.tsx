'use client';

import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface DosAndDontsProps {
    dos: string[];
    donts: string[];
    onDosChange: (value: string[]) => void;
    onDontsChange: (value: string[]) => void;
}

const MAX_ITEMS = 5;

export default function DosAndDonts({ dos, donts, onDosChange, onDontsChange }: DosAndDontsProps) {
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');

  const dosAtLimit = dos.length >= MAX_ITEMS;
  const dontsAtLimit = donts.length >= MAX_ITEMS;

  const addDo = () => {
    if (newDo.trim() && !dosAtLimit) {
      onDosChange([...dos, newDo.trim()]);
      setNewDo('');
    }
  };

  const addDont = () => {
    if (newDont.trim() && !dontsAtLimit) {
      onDontsChange([...donts, newDont.trim()]);
      setNewDont('');
    }
  };

  const removeDo = (index: number) => {
    onDosChange(dos.filter((_, i) => i !== index));
  };

  const removeDont = (index: number) => {
    onDontsChange(donts.filter((_, i) => i !== index));
  };

  const handleDoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDo();
    }
  };

  const handleDontKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDont();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Guidelines</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do's Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Do&apos;s</span>
          </div>
          
          {/* Add New Do Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newDo}
              onChange={(e) => setNewDo(e.target.value)}
              onKeyDown={handleDoKeyDown}
              placeholder={dosAtLimit ? `Limit reached (${MAX_ITEMS})` : "Add a requirement..."}
              disabled={dosAtLimit}
              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400 ${dosAtLimit ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
            />
            <button
              type="button"
              onClick={addDo}
              disabled={dosAtLimit}
              className={`p-2 rounded-md transition-colors ${dosAtLimit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {dosAtLimit && (
            <p className="text-xs text-gray-400">Maximum of {MAX_ITEMS} items reached</p>
          )}

          {/* Do's List */}
          <div className="space-y-2">
            {dos.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg group"
              >
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button
                  type="button"
                  onClick={() => removeDo(index)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Don'ts Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Don&apos;ts</span>
          </div>
          
          {/* Add New Don't Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newDont}
              onChange={(e) => setNewDont(e.target.value)}
              onKeyDown={handleDontKeyDown}
              placeholder={dontsAtLimit ? `Limit reached (${MAX_ITEMS})` : "Add a restriction..."}
              disabled={dontsAtLimit}
              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400 ${dontsAtLimit ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
            />
            <button
              type="button"
              onClick={addDont}
              disabled={dontsAtLimit}
              className={`p-2 rounded-md transition-colors ${dontsAtLimit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {dontsAtLimit && (
            <p className="text-xs text-gray-400">Maximum of {MAX_ITEMS} items reached</p>
          )}

          {/* Don'ts List */}
          <div className="space-y-2">
            {donts.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg group"
              >
                <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button
                  type="button"
                  onClick={() => removeDont(index)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
