'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Home, LayoutGrid, Info, Sparkles, Menu, X } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Research', href: '/research', icon: Home },
    { name: 'Leads', href: '/leads', icon: LayoutGrid },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-[#08152E] text-white shadow-lg border border-slate-800"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        className={`w-[260px] bg-[#08152E] text-white flex flex-col justify-between shrink-0 h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-white shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                Sales Intelligence
              </h1>
              <p className="font-bold text-base text-white tracking-tight leading-tight">
                Automator
              </p>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Treat '/' or '/research' as research active
              const isActive =
                item.href === '/research'
                  ? pathname === '/' || pathname === '/research' || pathname === '/loading' || pathname === '/result'
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Powered Card */}
        <div className="p-5">
          <div className="relative p-4 rounded-2xl bg-[#050D1D] border border-slate-800/80 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">AI Powered</h4>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Research smarter,<br />sell better.
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
