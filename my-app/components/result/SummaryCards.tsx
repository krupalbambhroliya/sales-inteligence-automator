'use client';

import React from 'react';
import { IntelligenceMetric } from '@/types';
import { Card } from '@/components/ui/Card';
import { Target, DollarSign, Cpu, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface SummaryCardsProps {
  metrics: IntelligenceMetric[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Target':
        return <Target className="w-5 h-5 text-indigo-400" />;
      case 'DollarSign':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-amber-400" />;
      default:
        return <Zap className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <Card key={idx} hoverEffect className="p-5 bg-slate-900/70 border-slate-800">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              {getIcon(m.iconName)}
            </div>
            {m.change && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {m.change}
              </span>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {m.title}
            </h4>
            <div className="text-2xl font-bold text-white mt-1 tracking-tight">{m.value}</div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
