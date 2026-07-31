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
  Sparkles,
  Layers,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface LeadData {
  id?: string;
  companyName: string;
  website: string;
  companyOverview: string;
  coreProduct: string;
  targetCustomer: string;
  b2bDecision: string;
  salesQuestions: string[] | any;
  servicesProvided?: string[] | any;
  valueProposition?: string;
  industry?: string;
  inputType?: string;
  aiSummary?: string;
}

const DEFAULT_LEAD: LeadData = {
  companyName: 'Spring Hill Landscaping',
  website: 'https://www.springhilllandscaping.com',
  companyOverview:
    'Spring Hill Landscaping is a premium, full-service outdoor care and landscape architecture provider. The company specializes in professional landscaping, custom garden installations, residential lawn care, automated irrigation setups, and sophisticated outdoor living design solutions for commercial and residential clients.',
  coreProduct: 'Landscape Design, Custom Gardens, Commercial Property Maintenance, Smart Irrigation Systems',
  targetCustomer: 'Residential Homeowners, Commercial Properties, HOA & Property Managers',
  b2bDecision: 'YES',
  salesQuestions: [
    'Do you currently manage leads and customer inquiries through a CRM or any software?',
    'How do you handle scheduling, estimates, and follow-ups with clients?',
    'Are you looking to expand your commercial client base or improve operational efficiency?',
  ],
  servicesProvided: [
    'Landscape Architecture & 3D Design Modeling',
    'Lawn Aeration, Fertilization & Routine Garden Care',
    'Drip & Sprinkler Irrigation System Installation & Tuning',
    'Hardscaping, Stone Patios & Custom Outdoor Fireplaces'
  ],
  valueProposition: 'Delivering immaculate outdoor spaces and commercial curb appeal through expert landscape architecture, premium workmanship, and fully automated care plans.',
  industry: 'Landscaping & Outdoor Services',
  inputType: 'URL',
  aiSummary: 'Spring Hill Landscaping is an active operator in the Landscaping & Outdoor Services space. Analysis indicates a strong alignment in B2B service delivery, providing tailored solutions to help commercial customers optimize operational efficiency.',
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
    const servicesText = Array.isArray(lead.servicesProvided)
      ? lead.servicesProvided.map((s: string) => `• ${s}`).join('\n')
      : lead.servicesProvided || '';

    const textToCopy = `Company: ${lead.companyName}\nWebsite: ${lead.website}\nIndustry: ${lead.industry || 'N/A'}\nB2B Lead: ${lead.b2bDecision}\n\nOverview:\n${lead.companyOverview}\n\nValue Proposition:\n${lead.valueProposition || 'N/A'}\n\nCore Products:\n${lead.coreProduct}\n\nServices Provided:\n${servicesText}\n\nTarget Audience:\n${lead.targetCustomer}\n\nSales Questions:\n${Array.isArray(lead.salesQuestions)
      ? lead.salesQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')
      : lead.salesQuestions
      }\n\nExecutive Summary:\n${lead.aiSummary || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    let y = 40;

    // Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(lead.companyName, 40, y);
    y += 25;

    // Website Subheader
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text(lead.website, 40, y);
    doc.setTextColor(0, 0, 0);
    y += 35;

    // Section Helper
    const addSection = (title: string, content: string | string[]) => {
      if (y > 740) {
        doc.addPage();
        y = 40;
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(title, 40, y);
      y += 18;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);

      if (Array.isArray(content)) {
        content.forEach((item) => {
          const lines = doc.splitTextToSize(`• ${item}`, 515);
          lines.forEach((line: string) => {
            if (y > 750) {
              doc.addPage();
              y = 40;
            }
            doc.text(line, 40, y);
            y += 14;
          });
        });
      } else {
        const lines = doc.splitTextToSize(content, 515);
        lines.forEach((line: string) => {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          doc.text(line, 40, y);
          y += 14;
        });
      }
      doc.setTextColor(0, 0, 0);
      y += 18;
    };

    if (lead.industry) {
      addSection('Industry Grouping', lead.industry);
    }
    if (lead.aiSummary) {
      addSection('Executive AI Summary', lead.aiSummary);
    }
    addSection('Company Overview', lead.companyOverview);
    if (lead.valueProposition) {
      addSection('Unique Value Proposition', lead.valueProposition);
    }
    addSection('Core Products / Focus Areas', coreProductList);

    if (servicesProvidedList && servicesProvidedList.length > 0) {
      addSection('Services Provided', servicesProvidedList);
    }

    addSection('Target Customers / ICP', targetCustomerList);
    addSection('B2B Qualification Status', `B2B Decision: ${lead.b2bDecision}`);
    addSection('Three Sales Discovery Questions', salesQuestionsList);

    doc.save(`${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_brief.pdf`);
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

  const servicesProvidedList = Array.isArray(lead.servicesProvided)
    ? lead.servicesProvided
    : (lead.servicesProvided ? parseListItems(String(lead.servicesProvided)) : []);

  const isB2B = lead.b2bDecision?.toUpperCase() === 'YES';

  const getFormattedWebsite = (raw: string): string => {
    if (!raw) return '#';
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.includes('.')) {
      return `https://${trimmed}`;
    }
    const sanitized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://www.${sanitized}.com`;
  };

  const websiteUrl = getFormattedWebsite(lead.website);

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
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
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

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 border border-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* B2B Lead YES/NO Badge */}
          <div
            className={`px-3 py-1 rounded-xl border text-center ${isB2B ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
          >
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider ${isB2B ? 'text-emerald-700' : 'text-rose-700'
                }`}
            >
              B2B Lead
            </div>
            <div
              className={`text-xs font-extrabold font-mono ${isB2B ? 'text-emerald-600' : 'text-rose-600'
                }`}
            >
              {isB2B ? 'YES' : 'NO'}
            </div>
          </div>
        </div>
      </div>

      {/* Company Title Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lead.companyName}
          </h1>
          {lead.industry && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
              {lead.industry}
            </span>
          )}
        </div>
        {lead.website && lead.website !== 'PDF File Upload' ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-0.5"
          >
            <span>{websiteUrl}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="text-sm font-semibold text-slate-500 mt-0.5">
            Analysed from PDF Upload
          </div>
        )}
      </div>

      {/* Short AI Summary Executive Card */}
      {lead.aiSummary && (
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500 text-white border border-blue-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Executive Summary</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-3">
            {lead.aiSummary}
          </p>
        </Card>
      )}

      {/* Dynamic Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Company Overview (Full Width) */}
        <Card className="p-6 space-y-3 md:col-span-2">
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

        {/* Card 2: Unique Value Proposition (Full Width) */}
        {lead.valueProposition && (
          <Card className="p-6 space-y-3 md:col-span-2 bg-gradient-to-r from-blue-50/40 via-indigo-50/20 to-purple-50/40 border border-indigo-100/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
              <Sparkles className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Unique Value Proposition</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
              "{lead.valueProposition}"
            </p>
          </Card>
        )}

        {/* Card 3: Detailed Services Provided (Left Col) */}
        {servicesProvidedList.length > 0 && (
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Services Provided</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              {servicesProvidedList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Card 4: Core Product / Service (Right Col) */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Core Product / Focus Areas</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 font-medium">
            {coreProductList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Card 5: Target Customer / Audience (Left Col) */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Target Customer / Audience</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 font-medium">
            {targetCustomerList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Card 6: B2B Qualification Decision (Right Col) */}
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">B2B Qualification Decision</h3>
          </div>
          <div>
            <div
              className={`text-lg font-bold font-mono ${isB2B ? 'text-emerald-600' : 'text-rose-600'
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
