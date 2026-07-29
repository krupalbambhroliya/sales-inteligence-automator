'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FeatureCards } from '@/components/about/FeatureCards';

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pt-2">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            About This Tool
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Sales Intelligence Automator helps sales teams save time by automatically researching companies,
            extracting key information from their websites, and generating AI-powered sales briefs with relevant insights and questions.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="pt-2">
          <FeatureCards />
        </div>
      </div>
    </DashboardLayout>
  );
}
