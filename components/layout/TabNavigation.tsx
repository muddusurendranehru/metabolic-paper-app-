"use client";

interface TabNavigationProps {
  tabs: { name: string }[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabChange(index)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === index
                  ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
