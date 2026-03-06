'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';

interface DeliverableProgressEntry {
  total: number;
  completed: number;
  percentage: number;
  completedTypes: Set<string>;
}

export type DeliverableProgressMap = Record<string, DeliverableProgressEntry>;

const BATCH_SIZE = 5;

export function useDeliverableProgress(applicationIds: string[]) {
  const { firebaseUser } = useAuth();
  const [progressMap, setProgressMap] = useState<DeliverableProgressMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!firebaseUser || applicationIds.length === 0) return;

    // Only fetch IDs we haven't fetched yet
    const newIds = applicationIds.filter((id) => !fetchedRef.current.has(id));
    if (newIds.length === 0) return;

    let cancelled = false;

    async function fetchProgress() {
      setIsLoading(true);
      try {
        const token = await firebaseUser!.getIdToken();

        // Batch requests in groups
        for (let i = 0; i < newIds.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = newIds.slice(i, i + BATCH_SIZE);

          const results = await Promise.allSettled(
            batch.map(async (appId) => {
              const res = await fetch(`/api/deliverables?applicationId=${appId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) return { appId, deliverables: [] };
              const data = await res.json();
              return { appId, deliverables: data.data?.deliverables || [] };
            })
          );

          if (cancelled) return;

          const updates: DeliverableProgressMap = {};

          for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            const { appId, deliverables } = result.value;

            fetchedRef.current.add(appId);

            // Group submissions by platform:type and check for completed/approved
            const completedTypes = new Set<string>();
            for (const d of deliverables) {
              const status = (d.status || '').toLowerCase();
              if (status === 'approved' || status === 'completed') {
                const key = `${(d.platform || '').toLowerCase()}:${(d.deliverableType || '').toLowerCase()}`;
                completedTypes.add(key);
              }
            }

            updates[appId] = {
              total: 0,
              completed: 0,
              percentage: 0,
              completedTypes,
            };
          }

          setProgressMap((prev) => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error('Error fetching deliverable progress:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProgress();
    return () => { cancelled = true; };
  }, [firebaseUser, applicationIds.join(',')]);

  // Allow external callers to inject fresh deliverable data (e.g. after modal fetch)
  const updateProgressFromDeliverables = useCallback((appId: string, deliverables: any[]) => {
    const completedTypes = new Set<string>();
    for (const d of deliverables) {
      const status = (d.status || '').toLowerCase();
      if (status === 'approved' || status === 'completed') {
        const key = `${(d.platform || '').toLowerCase()}:${(d.deliverableType || '').toLowerCase()}`;
        completedTypes.add(key);
      }
    }
    fetchedRef.current.add(appId);
    setProgressMap((prev) => ({
      ...prev,
      [appId]: { total: 0, completed: 0, percentage: 0, completedTypes },
    }));
  }, []);

  // Invalidate cached state for an appId and re-fetch fresh data from the API
  const invalidateAndRefetch = useCallback(async (appId: string) => {
    if (!firebaseUser) return;

    fetchedRef.current.delete(appId);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/deliverables?applicationId=${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      const deliverables = data.data?.deliverables || [];

      const completedTypes = new Set<string>();
      for (const d of deliverables) {
        const status = (d.status || '').toLowerCase();
        if (status === 'approved' || status === 'completed') {
          const key = `${(d.platform || '').toLowerCase()}:${(d.deliverableType || '').toLowerCase()}`;
          completedTypes.add(key);
        }
      }

      fetchedRef.current.add(appId);
      setProgressMap((prev) => ({
        ...prev,
        [appId]: { total: 0, completed: 0, percentage: 0, completedTypes },
      }));
    } catch (err) {
      console.error('Error in invalidateAndRefetch:', err);
    }
  }, [firebaseUser]);

  return { progressMap, isLoading, updateProgressFromDeliverables, invalidateAndRefetch };
}
