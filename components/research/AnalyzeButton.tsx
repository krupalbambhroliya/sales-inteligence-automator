'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface AnalyzeButtonProps {
  targetQuery?: string;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ targetQuery = '' }) => {
  const router = useRouter();

  const handleAnalyze = () => {
    router.push(`/loading${targetQuery ? `?target=${encodeURIComponent(targetQuery)}` : ''}`);
  };

  return (
    <button
      onClick={handleAnalyze}
      className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition duration-150 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
    >
      <Search className="w-4 h-4" />
      <span>Analyze</span>
    </button>
  );
};
