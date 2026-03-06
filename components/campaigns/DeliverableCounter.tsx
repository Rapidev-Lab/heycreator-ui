
'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2, FileText, Video, Film } from 'lucide-react';

const deliverableTypes = [
  { id: 'post', name: 'Post', icon: <FileText className="w-4 h-4" /> },
  { id: 'reel', name: 'Reel', icon: <Film className="w-4 h-4" /> },
  { id: 'story', name: 'Story', icon: <Video className="w-4 h-4" /> },
];

export interface Deliverable {
  type: string;
  quantity: number;
}

interface DeliverableCounterProps {
  value: Deliverable[];
  onChange: (deliverables: Deliverable[]) => void;
}

export default function DeliverableCounter({ value, onChange }: DeliverableCounterProps) {

  const handleQuantityChange = (type: string, delta: number) => {
    const existing = value.find(d => d.type === type);
    if (existing) {
      const newQuantity = existing.quantity + delta;
      if (newQuantity > 0) {
        onChange(value.map(d => d.type === type ? { ...d, quantity: newQuantity } : d));
      } else {
        onChange(value.filter(d => d.type !== type));
      }
    } else if (delta > 0) {
      onChange([...value, { type, quantity: 1 }]);
    }
  };

  const getQuantity = (type: string) => {
    return value.find(d => d.type === type)?.quantity || 0;
  }

  return (
    <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Creator Requirements</h3>
        <div className="space-y-3">
        {deliverableTypes.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    {d.icon}
                    <span className="font-medium text-gray-800">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleQuantityChange(d.id, -1)}
                        className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        disabled={getQuantity(d.id) === 0}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{getQuantity(d.id)}</span>
                    <button
                        type="button"
                        onClick={() => handleQuantityChange(d.id, 1)}
                        className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
}
