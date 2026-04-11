import React from 'react';
import { RatesManager } from '../components/organisms/RatesManager';

export function RatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-slate-500">
        Rates can vary by vehicle type and schedule (day/night). A full-day rate applies when stay exceeds 8 hours.
        Holiday rates are optional and override standard rates when active.
      </div>
      <RatesManager />
    </div>
  );
}