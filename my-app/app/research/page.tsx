'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { SearchTabs } from '@/components/research/SearchTabs';
import { SearchInput } from '@/components/research/SearchInput';
import { AnalyzeButton } from '@/components/research/AnalyzeButton';
import { ExampleCard } from '@/components/research/ExampleCard';

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<'url' | 'company'>('url');
  const [inputValue, setInputValue] = useState('https://www.springhilllandscaping.com');

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pt-4">
        {/* Large Centered Card */}
        <Card className="p-8 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-6 text-center">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Research a Company
            </h1>
            <p className="text-sm text-slate-500">
              Enter a website URL or company name to generate an AI-powered sales brief.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <SearchTabs activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Input & Button Container */}
          <div className="space-y-4 pt-2">
            <SearchInput
              value={inputValue}
              onChange={setInputValue}
              activeMode={activeTab}
            />
            <AnalyzeButton targetQuery={inputValue} />
          </div>
        </Card>

        {/* Examples Card */}
        <ExampleCard onSelectExample={(url) => setInputValue(url)} />
      </div>
    </DashboardLayout>
  );
}
