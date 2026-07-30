'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans flex antialiased">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area (offset by 260px on desktop) */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0 min-h-screen">
        {/* Minimal Clean Top Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
