'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Package,
  Target,
  BarChart2,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface LeadData {
  id?: string;
  companyName: string;
  website: string;
  companyOverview: string;
  coreProduct: string;
  targetCustomer: string;
  b2bDecision: string;
  salesQuestions: string[] | any;
}

const DEFAULT_LEAD: LeadData = {
  companyName: 'Spring Hill Landscaping',
  website: 'https://www.springhilllandscaping.com',
  companyOverview:
    'Spring Hill Landscaping provides professional landscaping, lawn care, garden maintenance, irrigation, and outdoor living services for residential and commercial customers.',
  coreProduct: 'Landscaping Design & Installation, Lawn Care & Maintenance, Irrigation Services, Outdoor Living Spaces',
  targetCustomer: 'Residential Homeowners, Commercial Properties, HOA & Property Managers',
  b2bDecision: 'YES',
  salesQuestions: [
    'Do you currently manage leads and customer inquiries through a CRM or any software?',
    'How do you handle scheduling, estimates, and follow-ups with clients?',
    'Are you looking to expand your commercial client base or improve operational efficiency?',
  ],
};

function ResultContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');

  const [lead, setLead] = useState<LeadData>(DEFAULT_LEAD);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // 1. Try reading from sessionStorage
      const cached = sessionStorage.getItem('currentLead');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!leadId || parsed.id === leadId) {
            setLead(parsed);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fallthrough to fetch
        }
      }

      // 2. Try fetching by ID from API
      if (leadId) {
        try {
          const res = await fetch(`/api/leads?id=${encodeURIComponent(leadId)}`);
          if (res.ok) {
            const data = await res.json();
            setLead(data);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fallthrough to default
        }
      }

      setIsLoading(false);
    }

    loadData();
  }, [leadId]);

  const handleCopy = () => {
    const textToCopy = `Company: ${lead.companyName}\nWebsite: ${lead.website}\nB2B Lead: ${lead.b2bDecision}\n\nOverview:\n${lead.companyOverview}\n\nCore Products:\n${lead.coreProduct}\n\nTarget Audience:\n${lead.targetCustomer}\n\nSales Questions:\n${
      Array.isArray(lead.salesQuestions)
        ? lead.salesQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')
        : lead.salesQuestions
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseListItems = (raw: string): string[] => {
    if (!raw) return [];
    if (raw.includes(',')) {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (raw.includes('\n')) {
      return raw.split('\n').map((s) => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
    return [raw];
  };

  const coreProductList = parseListItems(lead.coreProduct);
  const targetCustomerList = parseListItems(lead.targetCustomer);
  const salesQuestionsList = Array.isArray(lead.salesQuestions)
    ? lead.salesQuestions
    : parseListItems(String(lead.salesQuestions));

  const isB2B = lead.b2bDecision?.toUpperCase() === 'YES';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {/* B2B Lead YES/NO Badge */}
          <div
            className={`px-3 py-1 rounded-xl border text-center ${
              isB2B ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isB2B ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              B2B Lead
            </div>
            <div
              className={`text-xs font-extrabold font-mono ${
                isB2B ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isB2B ? 'YES' : 'NO'}
            </div>
          </div>
        </div>
      </div>

      {/* Company Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {lead.companyName}
        </h1>
        <a
          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-1"
        >
          <span>{lead.website}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 2x2 Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Company Overview */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Company Overview</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {lead.companyOverview}
          </p>
        </Card>

        {/* Card 2: Core Product / Service */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Core Product / Service</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            {coreProductList.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-slate-400">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Card 3: Target Customer / Audience */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Target Customer / Audience</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
            {targetCustomerList.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-slate-400">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Card 4: B2B Qualification Decision */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">B2B Qualification Decision</h3>
          </div>
          <div>
            <div
              className={`text-lg font-bold font-mono ${
                isB2B ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isB2B ? 'YES' : 'NO'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
              {isB2B
                ? 'The company offers services for commercial properties and works with businesses and property managers.'
                : 'The company exclusively targets B2C individual retail consumers.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Full Card: Three Sales Questions */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Three Sales Questions</h3>
        </div>

        <ol className="space-y-3 text-xs text-slate-700 font-medium leading-relaxed pl-1">
          {salesQuestionsList.slice(0, 3).map((q: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="font-bold text-rose-500">{idx + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Bottom Section: Extracted Website Data */}
      <Card className="p-6 bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Extracted Website Data (Summary)</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Pages Visited</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">12</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Headings Found</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">24</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Paragraphs Extracted</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">86</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Characters</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">14,562</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ResultPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </DashboardLayout>
  );
}
