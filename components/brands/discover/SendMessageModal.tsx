'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { proxyImage } from '@/lib/utils';

interface CreatorInfo {
  name: string;
  handle: string;
  avatarUrl: string;
}

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorInfo;
}

export default function SendMessageModal({ isOpen, onClose, creator }: SendMessageModalProps) {
  // Hooks must be called before any conditional returns
  const [message, setMessage] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  if (!isOpen) return null;

  const quickTemplates = [
    'Collaboration Inquiry',
    'Rate Request',
    'Partnership Proposal',
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const proxiedAvatar = proxyImage(creator.avatarUrl);

  const handleTemplateClick = (template: string) => {
    setMessage(template); // Simple for now, could be more elaborate
  };

  const handleSubmit = () => {
    console.log('Message sent:', {
      creator: creator.name,
      message: message,
    });
    onClose();
    alert(`Message sent to ${creator.name}: "${message}"`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Send Message</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {proxiedAvatar && !avatarError ? (
              <Image src={proxiedAvatar} alt={creator.name} fill className="object-cover" onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(creator.name)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{creator.name}</p>
            <p className="text-sm text-gray-500">{creator.handle}</p>
            <p className="text-xs text-gray-400">Usually responds in 2-4 hours</p> {/* Example static text */}
          </div>
        </div>

        {/* Your Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Quick Templates */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">QUICK TEMPLATES</p>
          <div className="flex flex-wrap gap-2">
            {quickTemplates.map((template) => (
              <button
                key={template}
                onClick={() => handleTemplateClick(template)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-md hover:bg-brand-navy-light"
            disabled={!message.trim()}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
