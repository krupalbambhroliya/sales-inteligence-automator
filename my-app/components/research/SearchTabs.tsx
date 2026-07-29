'use client';

import React from 'react';
import { Globe, Building2 } from 'lucide-react';

interface SearchTabsProps {
  activeTab: 'url' | 'company';
  onSelectTab: (tab: 'url' | 'company') => void;
}

export const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-xl w-full max-w-md mx-auto">
      <button
        onClick={() => onSelectTab('url')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
          activeTab === 'url'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>Website URL</span>
      </button>

      <button
        onClick={() => onSelectTab('company')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
          activeTab === 'company'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span>Company Name</span>
      </button>
    </div>
  );
};
