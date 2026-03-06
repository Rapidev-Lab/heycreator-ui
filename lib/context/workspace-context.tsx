'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  RolePermissions,
  ROLE_PERMISSIONS,
  WorkspaceContextType,
} from '@/types/workspace';
import { mockWorkspaces } from '@/lib/mock/seed/workspaces';
import { mockWorkspaceMembers } from '@/lib/mock/seed/workspace-members';

const STORAGE_KEY = 'heycreator_current_workspace';
const MOCK_USER_ID = 'mock-brand-user-1';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces] = useState<Workspace[]>(() =>
    mockWorkspaces.map((ws) => ws.data)
  );
  const [allMembers] = useState<WorkspaceMember[]>(() =>
    mockWorkspaceMembers.map((m) => m.data)
  );
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved workspace from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && workspaces.some((ws) => ws.id === saved)) {
      setCurrentWorkspaceId(saved);
    } else if (workspaces.length > 0) {
      setCurrentWorkspaceId(workspaces[0].id);
    }
    setIsLoading(false);
  }, [workspaces]);

  const currentWorkspace = useMemo(
    () => workspaces.find((ws) => ws.id === currentWorkspaceId) ?? null,
    [workspaces, currentWorkspaceId]
  );

  const members = useMemo(
    () => allMembers.filter((m) => m.workspaceId === currentWorkspaceId),
    [allMembers, currentWorkspaceId]
  );

  const userRole: WorkspaceRole | null = useMemo(() => {
    if (!currentWorkspaceId) return null;
    const member = allMembers.find(
      (m) => m.workspaceId === currentWorkspaceId && m.userId === MOCK_USER_ID
    );
    return member?.role ?? null;
  }, [allMembers, currentWorkspaceId]);

  const permissions: RolePermissions | null = useMemo(
    () => (userRole ? ROLE_PERMISSIONS[userRole] : null),
    [userRole]
  );

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      if (workspaces.some((ws) => ws.id === workspaceId)) {
        setCurrentWorkspaceId(workspaceId);
        localStorage.setItem(STORAGE_KEY, workspaceId);
      }
    },
    [workspaces]
  );

  const value: WorkspaceContextType = useMemo(
    () => ({
      currentWorkspace,
      workspaces,
      members,
      switchWorkspace,
      isLoading,
      userRole,
      permissions,
    }),
    [currentWorkspace, workspaces, members, switchWorkspace, isLoading, userRole, permissions]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
