'use client';

import React from 'react';
import { Sun } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 px-8 flex items-center justify-end border-b border-slate-200/60 bg-white/60 backdrop-blur-sm sticky top-0 z-20">
      <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition">
        <Sun className="w-5 h-5" />
      </button>
    </header>
  );
};
