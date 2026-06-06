import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full bg-teal-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 rounded-full bg-teal-600/5 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.4)]">
            <span className="text-slate-900 font-black text-lg">P</span>
          </div>
          <span className="text-slate-100 font-bold text-xl tracking-wide">ParkingFlow</span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/60 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          ParkingFlow Management System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}