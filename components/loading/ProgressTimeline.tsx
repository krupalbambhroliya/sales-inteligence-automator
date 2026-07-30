'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, Loader2, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ProgressTimelineProps {
  targetName?: string;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  targetName = 'https://www.springhilllandscaping.com',
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function executeAnalysis() {
      if (!targetName) return;

      try {
        setIsProcessing(true);
        setErrorMessage(null);
        setCurrentStep(1);

        // Step 1: Visiting Website
        const step1Timer = setTimeout(() => {
          if (isMounted) setCurrentStep(2);
        }, 800);

        // Step 2: Extracting Content
        const step2Timer = setTimeout(() => {
          if (isMounted) setCurrentStep(3);
        }, 1800);

        // Trigger API Call
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: targetName }),
        });

        clearTimeout(step1Timer);
        clearTimeout(step2Timer);

        const data = await response.json();

        if (!response.ok) {
          const detailMsg = data.details || data.error || 'An unexpected error occurred during analysis.';
          throw new Error(detailMsg);
        }

        if (isMounted) {
          setCurrentStep(4);
          // Store response in sessionStorage for the Result page
          sessionStorage.setItem('currentLead', JSON.stringify(data));

          setTimeout(() => {
            if (isMounted) {
              router.push(`/result?id=${data.id}`);
            }
          }, 600);
        }
      } catch (err) {
        if (isMounted) {
          setIsProcessing(false);
          const msg = err instanceof Error ? err.message : 'Analysis failed. Please check the website URL.';
          setErrorMessage(msg);
        }
      }
    }

    executeAnalysis();

    return () => {
      isMounted = false;
    };
  }, [targetName, router]);

  return (
    <div className="space-y-4">
      {/* Friendly Error Toast Notification */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-md flex items-start justify-between gap-4 transition animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">Analysis Could Not Be Completed</h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/research')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Main Centered Progress Card */}
      <Card className="max-w-2xl mx-auto p-8 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-6 text-center">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Researching Website...
          </h1>
          <p className="text-sm text-slate-500">
            Please wait while we gather information and analyze the website.
          </p>
        </div>

        {/* Vertical Steps Timeline */}
        <div className="max-w-md mx-auto py-4 space-y-6 text-left relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {/* Step 1 */}
          <div className="relative flex items-start gap-4 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors ${currentStep >= 2
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 text-white'
                }`}
            >
              {currentStep >= 2 ? <Check className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Visiting Website</h4>
              <p className="text-xs text-slate-500 mt-0.5">Fetching the website content</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-4 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors ${currentStep >= 3
                  ? 'bg-emerald-500 text-white'
                  : currentStep === 2
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'border-2 border-slate-200 bg-white text-slate-400'
                }`}
            >
              {currentStep >= 3 ? (
                <Check className="w-5 h-5" />
              ) : currentStep === 2 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5 opacity-40" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Extracting Content</h4>
              <p className="text-xs text-slate-500 mt-0.5">Extracting meaningful information</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-start gap-4 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors ${currentStep >= 4
                  ? 'bg-emerald-500 text-white'
                  : currentStep === 3
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'border-2 border-slate-200 bg-white text-slate-400'
                }`}
            >
              {currentStep >= 4 ? (
                <Check className="w-5 h-5" />
              ) : currentStep === 3 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5 opacity-40" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">AI Analyzing</h4>
              <p className="text-xs text-slate-500 mt-0.5">Analyzing data using AI</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex items-start gap-4 z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors ${currentStep === 4
                  ? 'bg-emerald-500 text-white'
                  : 'border-2 border-dashed border-blue-500 bg-blue-50 text-blue-600'
                }`}
            >
              {currentStep === 4 ? (
                <Check className="w-5 h-5" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Preparing Sales Brief</h4>
              <p className="text-xs text-slate-500 mt-0.5">Generating structured summary</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>This may take 30–60 seconds</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </Card>
    </div>
  );
};
