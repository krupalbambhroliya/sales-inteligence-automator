'use client';

import React from 'react';
import { Globe, Building2, FileText } from 'lucide-react';

interface SearchTabsProps {
  activeTab: 'url' | 'company' | 'pdf';
  onSelectTab: (tab: 'url' | 'company' | 'pdf') => void;
}

export const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-xl w-full max-w-lg mx-auto">
      <button
        onClick={() => onSelectTab('url')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
          activeTab === 'url'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">Website URL</span>
        <span className="sm:hidden">URL</span>
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
        <span className="hidden sm:inline">Company Name</span>
        <span className="sm:hidden">Company</span>
      </button>

      <button
        onClick={() => onSelectTab('pdf')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
          activeTab === 'pdf'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Upload PDF</span>
        <span className="sm:hidden">PDF</span>
      </button>
    </div>
  );
};
