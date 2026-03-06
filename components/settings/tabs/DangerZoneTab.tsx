'use client';

import { useState } from 'react';
import { Shield, Archive, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';

export default function DangerZoneTab() {
  const { currentWorkspace, userRole } = useWorkspace();
  const isOwner = userRole === 'owner';

  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-1">
            Irreversible workspace actions.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Shield className="w-10 h-10" />
          <p className="text-sm">Only the workspace owner can access danger zone settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
        <p className="text-sm text-gray-500 mt-1">
          These actions are irreversible. Please proceed with caution.
        </p>
      </div>

      {/* Archive Workspace */}
      <div className="border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Archive className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">Archive Workspace</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Archiving disables the workspace and removes it from your sidebar. All data is
              preserved and can be restored.
            </p>
            {!archiveConfirm ? (
              <button
                onClick={() => setArchiveConfirm(true)}
                className="px-4 py-1.5 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                Archive this workspace
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setArchiveConfirm(false)}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  Confirm Archive
                </button>
                <button
                  onClick={() => setArchiveConfirm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Workspace */}
      <div className="border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">Delete Workspace Permanently</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              This will permanently delete the workspace, all campaigns, creator lists, and team
              data after a 30-day grace period. This action cannot be undone.
            </p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-1.5 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Delete this workspace
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-600 font-medium">
                  Type{' '}
                  <span className="font-mono bg-red-50 px-1 rounded">
                    {currentWorkspace?.slug}
                  </span>{' '}
                  to confirm:
                </p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder={currentWorkspace?.slug}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    disabled={deleteText !== currentWorkspace?.slug}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete Permanently
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm(false);
                      setDeleteText('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Ownership */}
      <div className="border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">Transfer Ownership</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Transfer this workspace to another team member. You&apos;ll become an Admin.
            </p>
            <button className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Transfer ownership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
