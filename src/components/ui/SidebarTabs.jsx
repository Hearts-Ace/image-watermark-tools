import React from 'react';

function SidebarTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
            activeTab === tab.id
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SidebarTabs;
