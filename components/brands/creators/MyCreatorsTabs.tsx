'use client';

export type CreatorsTab = 'creators' | 'lists' | 'suggestions';

interface MyCreatorsTabsProps {
  activeTab: CreatorsTab;
  onTabChange: (tab: CreatorsTab) => void;
  creatorsCount?: number;
  listsCount?: number;
}

const tabs: { id: CreatorsTab; label: string }[] = [
  { id: 'creators', label: 'My Creators' },
  { id: 'lists', label: 'My Lists' },
  { id: 'suggestions', label: 'Suggestions' },
];

export default function MyCreatorsTabs({
  activeTab,
  onTabChange,
  creatorsCount,
  listsCount,
}: MyCreatorsTabsProps) {
  const getCount = (id: CreatorsTab) => {
    if (id === 'creators' && creatorsCount !== undefined) return creatorsCount;
    if (id === 'lists' && listsCount !== undefined) return listsCount;
    return undefined;
  };

  return (
    <div className="">
      <nav className="flex gap-8">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-brand-navy border-b-2 border-brand-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count !== undefined && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
              {tab.id === 'suggestions' && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
