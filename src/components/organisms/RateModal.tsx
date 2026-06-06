import React, { useState } from 'react';
import type { Rate, CreateRateRequest } from '../../types';
import { rateService } from '../../services/api';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Toggle } from '../atoms/Toggle';
import { Button } from '../atoms/Button';
import { AlertMessage } from '../molecules/AlertMessage';

interface RateModalProps {
  rate?: Rate | null; // ◄--- BLINDAJE TOTAL: Acepta Rate, null o undefined sin protestar
  onClose: () => void;
  onSuccess: () => void;
}

export function RateModal({ rate, onClose, onSuccess }: RateModalProps) {
  const isEdit = !!rate;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // El encadenamiento opcional (?.) funciona perfectamente tanto con null como con undefined
  const [tipoVehiculo, setTipoVehiculo] = useState<string>(rate?.tipo_vehiculo ?? 'CARRO');
  const [tarifaHora, setTarifaHora] = useState<number>(rate?.tarifa_hora ?? 0);
  const [tarifaDiaCompleto, setTarifaDiaCompleto] = useState<number>(rate?.tarifa_dia_completo ?? 0);
  const [aplicaDesde, setAplicaDesde] = useState<string>(rate?.aplica_desde ?? '06:00');
  const [aplicaHasta, setAplicaHasta] = useState<string>(rate?.aplica_hasta ?? '22:00');
  const [esFestivo, setEsFestivo] = useState<boolean>(rate?.es_festivo ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (tarifaHora <= 0) {
      setError('El valor de la tarifa por hora debe ser mayor a $0');
      return;
    }

    setLoading(true);
    setError('');

    const payload: CreateRateRequest = {
      tipo_vehiculo: tipoVehiculo as any,
      tarifa_hora: tarifaHora,
      tarifa_dia_completo: tarifaDiaCompleto > 0 ? tarifaDiaCompleto : undefined as any,
      aplica_desde: aplicaDesde,
      aplica_hasta: aplicaHasta,
      es_festivo: esFestivo,
    };

    try {
      if (isEdit && rate) {
        await rateService.update(rate.id, payload);
      } else {
        await rateService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la tarifa');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? 'Modificar Tarifa Existente' : 'Configurar Nueva Tarifa'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
            ✕
          </button>
        </div>

        {error && <div className="mb-4"><AlertMessage message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo de Vehículo"
            value={tipoVehiculo}
            onChange={(e) => setTipoVehiculo(e.target.value)}
            options={[
              { value: 'CARRO', label: 'Carro' },
              { value: 'MOTO', label: 'Moto' },
              { value: 'CAMIONETA', label: 'Camioneta' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Valor Hora ($)"
              value={tarifaHora.toString()}
              onChange={(e) => setTarifaHora(parseInt(e.target.value, 10) || 0)}
              min="0"
            />
            <Input
              type="number"
              label="Valor Día Completo ($)"
              value={tarifaDiaCompleto.toString()}
              onChange={(e) => setTarifaDiaCompleto(parseInt(e.target.value, 10) || 0)}
              min="0"
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label="Vigente Desde (HH:MM)"
              value={aplicaDesde}
              onChange={(e) => setAplicaDesde(e.target.value)}
              placeholder="06:00"
            />
            <Input
              type="text"
              label="Vigente Hasta (HH:MM)"
              value={aplicaHasta}
              onChange={(e) => setAplicaHasta(e.target.value)}
              placeholder="22:00"
            />
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-300 block">Tarifa Festiva</span>
              <span className="text-xs text-slate-500">Aplica exclusivamente para días feriados</span>
            </div>
            <Toggle checked={esFestivo} onChange={setEsFestivo} />
          </div>

          <div className="flex gap-3 pt-2 w-full">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="w-1/2" loading={loading}>
              {isEdit ? 'Actualizar' : 'Guardar Tarifa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}