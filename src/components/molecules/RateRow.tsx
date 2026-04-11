import React from 'react';
import { Rate, VehicleType } from '../../types';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

const VEHICLE_BADGE_MAP: Record<VehicleType, 'moto' | 'carro' | 'camioneta'> = {
  MOTO: 'moto',
  CARRO: 'carro',
  CAMIONETA: 'camioneta',
};

interface RateRowProps {
  rate: Rate;
  onEdit: (rate: Rate) => void;
  onDeactivate: (id: number) => void;
  deactivating?: boolean;
}

export function RateRow({ rate, onEdit, onDeactivate, deactivating }: RateRowProps) {
  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
      <td className="px-4 py-3">
        <Badge variant={VEHICLE_BADGE_MAP[rate.tipo_vehiculo]}>
          {rate.tipo_vehiculo}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-300 font-mono">
        ${rate.tarifa_hora.toLocaleString()}/hr
      </td>
      <td className="px-4 py-3 text-sm text-slate-300 font-mono">
        ${rate.tarifa_dia_completo.toLocaleString()}/day
      </td>
      <td className="px-4 py-3 text-sm text-slate-400">
        {rate.aplica_desde} – {rate.aplica_hasta}
      </td>
      <td className="px-4 py-3">
        {rate.es_festivo ? (
          <Badge variant="admin">Holiday</Badge>
        ) : (
          <span className="text-xs text-slate-600">Standard</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={rate.activa ? 'active' : 'inactive'}>
          {rate.activa ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" onClick={() => onEdit(rate)}>
            Edit
          </Button>
          {rate.activa && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDeactivate(rate.id)}
              loading={deactivating}
            >
              Deactivate
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}