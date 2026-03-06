'use client';

import { UserPlus, FolderPlus, Download } from 'lucide-react';

interface MyCreatorsHeaderProps {
  onAddCreator: () => void;
  onCreateList: () => void;
  onExport: () => void;
  isExporting?: boolean;
  isListsTabActive?: boolean;
}

export default function MyCreatorsHeader({
  onAddCreator,
  onCreateList,
  onExport,
  isExporting = false,
  isListsTabActive = false,
}: MyCreatorsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">My Creators</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage your saved Creators</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAddCreator}
          className="hidden items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Add a Creator
        </button>
        <button
          onClick={onCreateList}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isListsTabActive
              ? 'bg-brand-navy text-white hover:bg-opacity-90'
              : 'border-2 border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Create a List
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#E0E0E0] rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}
