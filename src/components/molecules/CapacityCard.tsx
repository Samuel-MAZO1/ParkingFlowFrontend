import React, { useState } from 'react';
import { VehicleType, CapacityConfig } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

const VEHICLE_ICONS: Record<VehicleType, string> = {
  MOTO: '🏍️',
  CARRO: '🚗',
  CAMIONETA: '🚙',
};

const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTO: 'Motorcycle',
  CARRO: 'Car',
  CAMIONETA: 'SUV / Truck',
};

interface CapacityCardProps {
  config: CapacityConfig;
  onUpdate: (tipo: VehicleType, newCapacity: number) => Promise<void>;
  loading?: boolean;
}

export function CapacityCard({ config, onUpdate, loading }: CapacityCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(config.capacidad_total));
  const [saving, setSaving] = useState(false);

  const ocupacion = config.ocupacion_actual ?? 0;
  const pct = config.capacidad_total > 0 ? (ocupacion / config.capacidad_total) * 100 : 0;

  const barColor =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-teal-500';

  async function handleSave() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return;
    setSaving(true);
    await onUpdate(config.tipo_vehiculo, num);
    setSaving(false);
    setEditing(false);
  }

  return (
    <Card className="p-6 flex flex-col gap-4" glow>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{VEHICLE_ICONS[config.tipo_vehiculo]}</span>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Type</p>
            <h3 className="text-lg font-semibold text-slate-100">
              {VEHICLE_LABELS[config.tipo_vehiculo]}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Occupancy</p>
          <p className="text-2xl font-bold text-slate-100">
            {ocupacion}
            <span className="text-slate-500 text-base font-normal">/{config.capacidad_total}</span>
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{pct.toFixed(0)}% occupied</p>

      {editing ? (
        <div className="flex gap-2 items-end">
          <Input
            label="New Capacity"
            type="number"
            min={ocupacion}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSave} loading={saving} disabled={loading}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)} disabled={loading}>
          Edit Capacity
        </Button>
      )}
    </Card>
  );
}