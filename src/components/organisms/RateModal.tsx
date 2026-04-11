import React, { useState, useEffect } from 'react';
import { Rate, CreateRateRequest, VehicleType } from '../../types';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { Toggle } from '../atoms/Toggle';
import { AlertMessage } from '../molecules/AlertMessage';

const VEHICLE_OPTIONS = [
  { value: 'MOTO', label: '🏍️ Motorcycle' },
  { value: 'CARRO', label: '🚗 Car' },
  { value: 'CAMIONETA', label: '🚙 SUV / Truck' },
];

interface RateModalProps {
  rate: Rate | null;
  onSave: (data: CreateRateRequest) => Promise<void>;
  onClose: () => void;
}

export function RateModal({ rate, onSave, onClose }: RateModalProps) {
  const [form, setForm] = useState<CreateRateRequest>({
    tipo_vehiculo: 'CARRO',
    tarifa_hora: 0,
    tarifa_dia_completo: 0,
    aplica_desde: '00:00',
    aplica_hasta: '23:59',
    es_festivo: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rate) {
      setForm({
        tipo_vehiculo: rate.tipo_vehiculo,
        tarifa_hora: rate.tarifa_hora,
        tarifa_dia_completo: rate.tarifa_dia_completo,
        aplica_desde: rate.aplica_desde,
        aplica_hasta: rate.aplica_hasta,
        es_festivo: rate.es_festivo ?? false,
      });
    }
  }, [rate]);

  function set<K extends keyof CreateRateRequest>(key: K, val: CreateRateRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.tarifa_hora <= 0 || form.tarifa_dia_completo <= 0) {
      setError('Rates must be greater than zero');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-base font-semibold text-slate-100">
            {rate ? 'Edit Rate' : 'New Rate'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && <AlertMessage message={error} />}

          <Select
            label="Vehicle Type"
            value={form.tipo_vehiculo}
            onChange={(e) => set('tipo_vehiculo', e.target.value as VehicleType)}
            options={VEHICLE_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hourly Rate ($)"
              type="number"
              min={0}
              step={100}
              value={String(form.tarifa_hora)}
              onChange={(e) => set('tarifa_hora', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Full Day Rate ($)"
              type="number"
              min={0}
              step={1000}
              value={String(form.tarifa_dia_completo)}
              onChange={(e) => set('tarifa_dia_completo', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Applies From"
              type="time"
              value={form.aplica_desde}
              onChange={(e) => set('aplica_desde', e.target.value)}
            />
            <Input
              label="Applies Until"
              type="time"
              value={form.aplica_hasta}
              onChange={(e) => set('aplica_hasta', e.target.value)}
            />
          </div>

          <Toggle
            label="Holiday rate"
            checked={form.es_festivo ?? false}
            onChange={(v) => set('es_festivo', v)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              {rate ? 'Update Rate' : 'Create Rate'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}