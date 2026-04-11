import React, { useEffect, useState } from 'react';
import { VehicleType, CapacityConfig } from '../../types';
import { capacityService } from '../../services/api';
import { CapacityCard } from '../molecules/CapacityCard';
import { AlertMessage } from '../molecules/AlertMessage';

export function CapacityManager() {
  const [configs, setConfigs] = useState<CapacityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    capacityService.getAll()
      .then(setConfigs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdate(tipo: VehicleType, newCapacity: number) {
    setUpdating(true);
    try {
      const updated = await capacityService.update({ tipo_vehiculo: tipo, capacidad_total: newCapacity });
      setConfigs((prev) => prev.map((c) => c.tipo_vehiculo === tipo ? updated : c));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <AlertMessage message={error} />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {configs.map((cfg) => (
          <CapacityCard key={cfg.tipo_vehiculo} config={cfg} onUpdate={handleUpdate} loading={updating} />
        ))}
      </div>
    </div>
  );
}