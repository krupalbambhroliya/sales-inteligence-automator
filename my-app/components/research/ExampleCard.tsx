'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface ExampleCardProps {
  onSelectExample?: (url: string) => void;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ onSelectExample }) => {
  const col1 = [
    'https://www.houstonroofingonline.com',
    'https://www.springhilllandscaping.com',
    'https://www.centraltexasbarkery.com',
  ];

  const col2 = [
    'https://www.bostonplumbing.com',
    'https://www.piedmontmoving.com',
    "Joe's Backyard Landscaping – Phoenix AZ",
  ];

  const handleClick = (item: string) => {
    if (onSelectExample) {
      if (item.startsWith('http')) {
        onSelectExample(item);
      } else {
        onSelectExample("Joe's Backyard Landscaping");
      }
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
      <h3 className="font-bold text-sm text-slate-900 tracking-tight">Examples to try</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-xs text-slate-600 font-medium">
        <div className="space-y-2.5">
          {col1.map((url, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(url)}
              className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition truncate"
            >
              <span className="text-slate-400">•</span>
              <span className="truncate">{url}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {col2.map((url, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(url)}
              className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition truncate"
            >
              <span className="text-slate-400">•</span>
              <span className="truncate">{url}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
