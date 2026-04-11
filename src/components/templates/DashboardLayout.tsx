import React, { ReactNode } from 'react';
import { Sidebar } from '../organisms/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  activePage,
  onNavigate,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/60 px-8 py-5">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-8 py-7 relative">
          {/* Subtle background */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/3 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </div>
  );
}