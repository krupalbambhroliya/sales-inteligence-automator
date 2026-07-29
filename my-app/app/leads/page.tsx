'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { Plus } from 'lucide-react';

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads</h1>
            <p className="text-xs text-slate-500 mt-0.5">View all researched companies</p>
          </div>

          <Link
            href="/research"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Research</span>
          </Link>
        </div>

        {/* Researched Leads Table */}
        <LeadsTable />
      </div>
    </DashboardLayout>
  );
}
