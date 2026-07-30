'use client';

import React from 'react';
import { DetectedTech } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Cpu, Globe, Activity, Eye, Zap, Layers } from 'lucide-react';

interface WebsiteStatsProps {
  techStack: DetectedTech[];
}

export const WebsiteStats: React.FC<WebsiteStatsProps> = ({ techStack }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tech Stack Breakdown */}
      <Card className="lg:col-span-2 border-slate-800 bg-slate-900/80">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-base">Detected Technology Fingerprint</CardTitle>
          </div>
          <Badge variant="primary" size="sm">
            {techStack.length} Signatures Detected
          </Badge>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-300 border border-slate-700">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{tech.name}</div>
                    <div className="text-[10px] text-slate-400">{tech.category}</div>
                  </div>
                </div>
                <Badge variant="default" size="sm" className="text-[10px]">
                  Verified
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Website Traffic & Domain Health */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-base">Traffic & Performance</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Est. Monthly Visitors</div>
            <div className="text-xl font-bold text-white mt-0.5">14.2M / mo</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Top 0.1% Global Traffic Rank
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">SEO & Core Web Vitals</div>
            <div className="text-xl font-bold text-white mt-0.5">98 / 100</div>
            <div className="text-[11px] text-indigo-400 mt-1">
              Sub-100ms LCP & Instant Edge Cache
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Primary Competitors</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" size="sm">Adyen</Badge>
              <Badge variant="outline" size="sm">PayPal</Badge>
              <Badge variant="outline" size="sm">Checkout.com</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
