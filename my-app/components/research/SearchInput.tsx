'use client';

import React from 'react';
import { Link2, Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  activeMode: 'url' | 'company';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  activeMode,
}) => {
  const placeholder =
    activeMode === 'url'
      ? 'https://www.springhilllandscaping.com'
      : 'e.g. Spring Hill Landscaping';

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {activeMode === 'url' ? <Link2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-inner font-medium"
      />
    </div>
  );
};
