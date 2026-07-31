'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { SearchTabs } from '@/components/research/SearchTabs';
import { SearchInput } from '@/components/research/SearchInput';
import { ExampleCard } from '@/components/research/ExampleCard';
import { FileText, Loader2, Search } from 'lucide-react';

export default function ResearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'company' | 'pdf'>('url');
  const [inputValue, setInputValue] = useState('https://www.springhilllandscaping.com');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setPdfError('Please upload a valid PDF file.');
        setPdfFile(null);
      } else {
        setPdfError(null);
        setPdfFile(file);
      }
    }
  };

  const handleAnalyzePdf = async () => {
    if (!pdfFile) return;

    try {
      setIsAnalyzingPdf(true);
      setPdfError(null);

      const formData = new FormData();
      formData.append('file', pdfFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to analyze PDF file.');
      }

      // Store in sessionStorage and redirect to result page
      sessionStorage.setItem('currentLead', JSON.stringify(data));
      router.push(`/result?id=${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze PDF file.';
      setPdfError(msg);
    } finally {
      setIsAnalyzingPdf(false);
    }
  };

  const handleTabSelect = (tab: 'url' | 'company' | 'pdf') => {
    setActiveTab(tab);
    if (tab === 'url') {
      setInputValue('https://www.springhilllandscaping.com');
    } else if (tab === 'company') {
      setInputValue('');
    }
  };

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
              Enter a website URL, company name, or upload a PDF document to generate an AI-powered sales brief.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <SearchTabs activeTab={activeTab} onSelectTab={handleTabSelect} />

          {/* Input & Button Container */}
          {activeTab === 'pdf' ? (
            <div className="space-y-4 pt-2">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-slate-100/50 transition cursor-pointer relative flex flex-col items-center justify-center gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isAnalyzingPdf}
                />
                <FileText className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">
                  {pdfFile ? pdfFile.name : 'Select or drag a PDF file here'}
                </span>
                <span className="text-xs text-slate-400">PDF files up to 10MB</span>
              </div>

              {pdfError && (
                <p className="text-xs text-rose-600 font-semibold text-left bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                  {pdfError}
                </p>
              )}

              <button
                onClick={handleAnalyzePdf}
                disabled={!pdfFile || isAnalyzingPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isAnalyzingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing PDF Content...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Analyze PDF Document</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <SearchInput
                value={inputValue}
                onChange={setInputValue}
                activeMode={activeTab}
              />
              <button
                onClick={() => {
                  router.push(`/loading?type=${activeTab}&target=${encodeURIComponent(inputValue)}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            </div>
          )}
        </Card>

        {/* Examples Card (Only show for URL/Company tabs) */}
        {activeTab !== 'pdf' && (
          <ExampleCard onSelectExample={(url) => setInputValue(url)} />
        )}
      </div>
    </DashboardLayout>
  );
}
