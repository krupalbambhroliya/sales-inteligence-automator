'use client';

import React from 'react';
import { Globe, ExternalLink, Download, Share2, ShieldCheck, Star, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ResultHeaderProps {
  companyName?: string;
  domain?: string;
  icpScore?: number;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({
  companyName = 'Stripe, Inc.',
  domain = 'stripe.com',
  icpScore = 96,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        {/* Company Avatar / Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-bold text-white">
            💳
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">{companyName}</h2>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
            </Badge>
            <Badge variant="glow" size="sm">
              Tier-1 ICP Match
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition"
            >
              <Globe className="w-3.5 h-3.5" /> {domain} <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>Fintech & Financial Infrastructure</span>
            <span>•</span>
            <span>HQ: San Francisco, CA</span>
          </div>
        </div>
      </div>

      {/* ICP Gauge & Action Controls */}
      <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
        {/* Score Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/40">
            {icpScore}%
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              ICP Fit Score
            </div>
            <div className="text-xs text-emerald-400 font-medium">Optimal Prospect Target</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" leftIcon={<Bookmark className="w-4 h-4" />}>
            Save Lead
          </Button>
          <Button variant="glow" size="md" leftIcon={<Download className="w-4 h-4" />}>
            Export PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
};
