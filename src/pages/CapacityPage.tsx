import React from 'react';
import { CapacityManager } from '../components/organisms/CapacityManager';

export function CapacityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl px-4 py-3 text-sm text-teal-600">
        ⚠ Capacity cannot be set below the number of currently parked vehicles for each type.
      </div>
      <CapacityManager />
    </div>
  );
}