'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAuthFetch } from '@/lib/hooks/useAuthFetch';
import { getAuth } from 'firebase/auth';
import type { InfluencerProfile } from '@/types/discovery';
import type { CreatorListResponse, ListAnalytics, UpdateListRequest } from '@/types/creator-list';
import {
  MyCreatorsHeader,
  MyCreatorsTabs,
  MyCreatorsTab,
  MyListsTab,
  SuggestionsTab,
  CreateListModal,
  AddToListModal,
  AddCreatorModal,
  ListDetailView,
} from '@/components/brands/creators';
import type { CreatorsTab } from '@/components/brands/creators';
import PageLoader from '@/components/ui/PageLoader';

function MyCreatorsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { get, post, patch, delete: del } = useAuthFetch();

  // Stable refs to avoid infinite re-render loops and stale closures in useEffect/useCallback
  const getRef = useRef(get);
  getRef.current = get;
  const postRef = useRef(post);
  postRef.current = post;
  const patchRef = useRef(patch);
  patchRef.current = patch;
  const delRef = useRef(del);
  delRef.current = del;

  // Tab state
  const [activeTab, setActiveTab] = useState<CreatorsTab>('creators');

  // Data — global influencers from database
  const [creators, setCreators] = useState<InfluencerProfile[]>([]);
  const [lists, setLists] = useState<CreatorListResponse[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  // List detail state
  const [selectedListId, setSelectedListId] = useState<string | null>(null); // null = grid, 'new' = create, id = edit
  const [listCreators, setListCreators] = useState<InfluencerProfile[]>([]);
  const [listSuggestions, setListSuggestions] = useState<InfluencerProfile[]>([]);
  const [listAnalytics, setListAnalytics] = useState<ListAnalytics | null>(null);
  const [isLoadingListDetail, setIsLoadingListDetail] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Modal state
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showAddCreatorModal, setShowAddCreatorModal] = useState(false);
  const [addToListTarget, setAddToListTarget] = useState<{
    creatorId: string;
    currentLists: string[];
  } | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Fetch creators from global_influencers
  const fetchCreators = useCallback(async () => {
    if (!user) return;
    setIsLoadingCreators(true);
    try {
      const res = await getRef.current('/api/brands/creators/global?limit=200');
      if (res.data?.success) {
        setCreators(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
    } finally {
      setIsLoadingCreators(false);
    }
  }, [user]);

  // Fetch lists
  const fetchLists = useCallback(async () => {
    if (!user) return;
    setIsLoadingLists(true);
    try {
      const res = await getRef.current('/api/brands/lists');
      if (res.data?.success) {
        setLists(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
    } finally {
      setIsLoadingLists(false);
    }
  }, [user]);

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchCreators();
      fetchLists();
    }
  }, [user, fetchCreators, fetchLists]);

  // Load list detail data when selectedListId changes
  const loadListDetail = useCallback(async (listId: string) => {
    if (listId === 'new') return; // Create mode — no data to load
    setIsLoadingListDetail(true);
    setIsLoadingSuggestions(true);
    try {
      const [creatorsRes, suggestionsRes] = await Promise.all([
        getRef.current(`/api/brands/lists/${listId}/creators`),
        getRef.current(`/api/brands/lists/${listId}/suggestions?limit=6`),
      ]);
      if (creatorsRes.data?.success) {
        setListCreators(creatorsRes.data.data || []);
        setListAnalytics(creatorsRes.data.analytics || null);
      }
      if (suggestionsRes.data?.success) {
        setListSuggestions(suggestionsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading list detail:', err);
    } finally {
      setIsLoadingListDetail(false);
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (selectedListId && selectedListId !== 'new') {
      loadListDetail(selectedListId);
    } else {
      setListCreators([]);
      setListSuggestions([]);
      setListAnalytics(null);
    }
  }, [selectedListId, loadListDetail]);

  // Handlers
  const handleViewCreator = (creatorId: string) => {
    router.push(`/brands/influencers/${creatorId}`);
  };

  const handleAddToList = (creatorId: string, currentLists: string[]) => {
    setAddToListTarget({ creatorId, currentLists });
  };

  const handleSaveListAssignment = async (
    addToLists: string[],
    removeFromLists: string[],
  ) => {
    if (!addToListTarget) return;
    try {
      await patchRef.current(`/api/brands/creators/${addToListTarget.creatorId}/lists`, {
        addToLists,
        removeFromLists,
      });
      await fetchLists();
      // Refresh list detail if we're viewing one
      if (selectedListId && selectedListId !== 'new') {
        loadListDetail(selectedListId);
      }
    } catch (err) {
      console.error('Error saving list assignment:', err);
    }
  };

  const handleListCreated = (list: CreatorListResponse) => {
    setLists(prev => [list, ...prev]);
    // If created from detail view, navigate to the new list
    if (selectedListId === 'new') {
      setSelectedListId(list.id);
    }
  };

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
  };

  const handleEditList = (list: CreatorListResponse) => {
    setSelectedListId(list.id);
  };

  const handleCreateListInline = () => {
    setSelectedListId('new');
  };

  const handleSaveListDetail = async (data: UpdateListRequest) => {
    if (selectedListId === 'new') {
      // Create new list
      try {
        const res = await postRef.current('/api/brands/lists', {
          name: data.name,
          description: data.description,
          tags: data.tags,
          mentions: data.mentions,
          locations: data.locations,
          influenceSize: data.influenceSize,
          visibility: data.visibility,
        });
        if (res.data?.success) {
          const newList = res.data.data;
          setLists(prev => [newList, ...prev]);
          setSelectedListId(newList.id);
          // Re-fetch lists from API to ensure consistency
          fetchLists();
        }
      } catch (err) {
        console.error('Error creating list:', err);
      }
      return;
    }

    // Update existing list
    if (!selectedListId) return;
    try {
      const res = await patchRef.current(`/api/brands/lists/${selectedListId}`, data);
      if (res.data?.success) {
        // Optimistic local update
        setLists(prev => prev.map(l => (l.id === selectedListId ? res.data.data : l)));
        // Refresh creators and suggestions (suggestions depend on list criteria)
        loadListDetail(selectedListId);
        // Re-fetch lists from API to ensure creator counts and all fields are in sync
        fetchLists();
      }
    } catch (err) {
      console.error('Error updating list:', err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this list? Creators will not be removed from your collection.',
      )
    ) {
      return;
    }
    try {
      const res = await delRef.current(`/api/brands/lists/${listId}`);
      if (res.data?.success) {
        setLists(prev => prev.filter(l => l.id !== listId));
        if (selectedListId === listId) {
          setSelectedListId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const handleRemoveCreatorFromList = async (creatorId: string) => {
    if (!selectedListId || selectedListId === 'new') return;
    try {
      await patchRef.current(`/api/brands/creators/${creatorId}/lists`, {
        removeFromLists: [selectedListId],
      });
      setListCreators(prev => prev.filter(c => c.id !== creatorId));
      // Refresh lists from API to get accurate creator counts
      fetchLists();
    } catch (err) {
      console.error('Error removing creator from list:', err);
    }
  };

  const handleAddSuggestionToList = async (creatorId: string) => {
    if (!selectedListId || selectedListId === 'new') return;
    try {
      await patchRef.current(`/api/brands/creators/${creatorId}/lists`, {
        addToLists: [selectedListId],
      });
      // Move from suggestions to creators
      const suggestion = listSuggestions.find(s => s.id === creatorId);
      if (suggestion) {
        setListSuggestions(prev => prev.filter(s => s.id !== creatorId));
        setListCreators(prev => [...prev, suggestion]);
      }
      // Refresh lists from API to get accurate creator counts
      fetchLists();
    } catch (err) {
      console.error('Error adding suggestion to list:', err);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const url = '/api/brands/creators/export';
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `my-creators-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreatorAdded = () => {
    fetchCreators();
  };

  const handleTabChange = (tab: CreatorsTab) => {
    setActiveTab(tab);
    // Reset list detail when switching tabs
    if (tab !== 'lists') {
      setSelectedListId(null);
    }
  };

  // Get the selected list object for detail view
  const selectedList = selectedListId && selectedListId !== 'new'
    ? lists.find(l => l.id === selectedListId)
    : undefined;

  // Determine if we're in list detail view
  const isListDetailView = activeTab === 'lists' && selectedListId !== null;

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
          <MyCreatorsHeader
            onAddCreator={() => setShowAddCreatorModal(true)}
            onCreateList={() => {
              setActiveTab('lists');
              handleCreateListInline();
            }}
            onExport={handleExport}
            isExporting={isExporting}
            isListsTabActive={activeTab === 'lists'}
          />

          <MyCreatorsTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            creatorsCount={creators.length}
            listsCount={lists.length}
          />
        </div>
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Tab Content */}
            {activeTab === 'creators' && (
              <MyCreatorsTab
                creators={creators}
                lists={lists}
                isLoading={isLoadingCreators}
                onRefresh={fetchCreators}
                onCardClick={handleViewCreator}
                onAddToList={(creatorId) => handleAddToList(creatorId, [])}
                onDeleteCreator={async (creatorId) => {
                  if (!window.confirm('Are you sure you want to delete this creator?')) return;
                  try {
                    await delRef.current(`/api/brands/creators/${creatorId}`);
                    setCreators(prev => prev.filter(c => c.id !== creatorId));
                  } catch (err) {
                    console.error('Error deleting creator:', err);
                  }
                }}
              />
            )}

            {activeTab === 'lists' && !isListDetailView && (
              <MyListsTab
                lists={lists}
                isLoading={isLoadingLists}
                onCreateList={handleCreateListInline}
                onSelectList={handleSelectList}
                onEditList={handleEditList}
                onDeleteList={handleDeleteList}
                onAddCreatorsToList={(listId) => {
                  setSelectedListId(listId);
                }}
              />
            )}

            {activeTab === 'lists' && isListDetailView && (
              <ListDetailView
                list={selectedList}
                onBack={() => setSelectedListId(null)}
                onSave={handleSaveListDetail}
                onDelete={selectedListId !== 'new' ? () => handleDeleteList(selectedListId!) : undefined}
                creators={listCreators}
                creatorsLoading={isLoadingListDetail}
                suggestions={listSuggestions}
                suggestionsLoading={isLoadingSuggestions}
                analytics={listAnalytics || undefined}
                onAddCreator={() => setShowAddCreatorModal(true)}
                onViewCreatorProfile={handleViewCreator}
                onAddToAnotherList={(creatorId) => handleAddToList(creatorId, [])}
                onMoveCreator={(creatorId) => handleAddToList(creatorId, [])}
                onRemoveCreator={handleRemoveCreatorFromList}
                onAddSuggestionToList={handleAddSuggestionToList}
              />
            )}

            {activeTab === 'suggestions' && <SuggestionsTab />}
          </div>
        </div>

        {/* Modals */}
        <CreateListModal
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
          onCreated={handleListCreated}
          authFetch={{ post }}
        />

        <AddToListModal
          isOpen={!!addToListTarget}
          onClose={() => setAddToListTarget(null)}
          creatorId={addToListTarget?.creatorId || ''}
          currentLists={addToListTarget?.currentLists || []}
          availableLists={lists}
          onSave={handleSaveListAssignment}
          onCreateList={() => {
            setAddToListTarget(null);
            setShowCreateListModal(true);
          }}
        />

        <AddCreatorModal
          isOpen={showAddCreatorModal}
          onClose={() => setShowAddCreatorModal(false)}
          onAdded={handleCreatorAdded}
          authFetch={{ post }}
        />
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function MyCreatorsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MyCreatorsPageContent />
    </Suspense>
  );
}
