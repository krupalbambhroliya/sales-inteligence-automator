'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Globe, Brain, FileText, Zap } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const features = [
    {
      title: 'Web Research',
      description: 'Automatically visits and extracts data from websites',
      icon: Globe,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'AI Analysis',
      description: 'Uses AI to understand business and generate insights',
      icon: Brain,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      title: 'Structured Brief',
      description: 'Creates structured sales brief for your team',
      icon: FileText,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Save Time',
      description: 'Reduces research time and improves sales productivity',
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f, idx) => {
        const Icon = f.icon;
        return (
          <Card
            key={idx}
            className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col items-center text-center space-y-3"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">{f.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
          </Card>
        );
      })}
    </div>
  );
};
