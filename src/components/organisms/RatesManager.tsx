import React, { useEffect, useState } from 'react';
import { Rate, CreateRateRequest, VehicleType } from '../../types';
import { rateService } from '../../services/api';
import { RateRow } from '../molecules/RateRow';
import { AlertMessage } from '../molecules/AlertMessage';
import { Button } from '../atoms/Button';
import { RateModal } from './RateModal';

export function RatesManager() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);

  async function fetchRates() {
    try {
      const data = await rateService.getAll();
      setRates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRates(); }, []);

  async function handleDeactivate(id: number) {
    setDeactivatingId(id);
    try {
      await rateService.deactivate(id);
      setRates((prev) => prev.map((r) => r.id === id ? { ...r, activa: false } : r));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to deactivate');
    } finally {
      setDeactivatingId(null);
    }
  }

  function handleEdit(rate: Rate) {
    setEditingRate(rate);
    setModalOpen(true);
  }

  function handleNew() {
    setEditingRate(null);
    setModalOpen(true);
  }

  async function handleSave(data: CreateRateRequest) {
    if (editingRate) {
      const updated = await rateService.update(editingRate.id, data);
      setRates((prev) => prev.map((r) => r.id === editingRate.id ? updated : r));
    } else {
      const created = await rateService.create(data);
      setRates((prev) => [...prev, created]);
    }
    setModalOpen(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <AlertMessage message={error} />}

      <div className="flex justify-end">
        <Button onClick={handleNew} leftIcon={<span>＋</span>}>
          New Rate
        </Button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/80">
              {['Vehicle', 'Hourly', 'Full Day', 'Schedule', 'Type', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-600 text-sm">
                  No rates configured yet
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <RateRow
                  key={rate.id}
                  rate={rate}
                  onEdit={handleEdit}
                  onDeactivate={handleDeactivate}
                  deactivating={deactivatingId === rate.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <RateModal
          rate={editingRate}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}