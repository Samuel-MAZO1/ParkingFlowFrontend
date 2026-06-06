import React, { useState, useEffect, useCallback } from 'react';
import { planService } from '../services/api';
import type { PlanAbonado } from '../types';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Toggle } from '../components/atoms/Toggle';
import { AlertMessage } from '../components/molecules/AlertMessage';

export function PlansPage() {
  const [plans, setPlans] = useState<PlanAbonado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanAbonado | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await planService.getAll(false);
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el maestro de planes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleDeactivate(id: number) {
    if (!window.confirm('¿Estás seguro de que deseas desactivar este plan mensual?')) {
      return;
    }

    try {
      setError('');
      await planService.deactivate(id);
      await fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo suspender el plan seleccionado');
    }
  }

  function handleOpenCreate() {
    setEditingPlan(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(plan: PlanAbonado) {
    setEditingPlan(plan);
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
        <p className="ml-3 text-sm text-slate-400">Sincronizando planes de suscripción...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Planes de Abonados</h1>
          <p className="text-sm text-slate-400 mt-1">Administra las ofertas de suscripciones mensuales, tarifas planas y restricciones de horario.</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<span>＋</span>}>Nuevo Plan</Button>
      </div>

      {error && <AlertMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-slate-900/20 border border-slate-800/60 p-12 rounded-2xl text-center text-sm text-slate-500">
            No hay planes mensuales estructurados en la base de datos.
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className={`p-6 flex flex-col justify-between relative ${!plan.activo ? 'opacity-50 grayscale border-dashed border-slate-800' : ''}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase bg-teal-400/10 px-2 py-0.5 rounded">
                      {plan.tipo_vehiculo}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1.5">{plan.nombre}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 font-bold rounded ${plan.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-2 border-y border-slate-800/50 py-3 my-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Precio Mensual:</span>
                    <span className="text-slate-200 font-bold">${plan.precio_mensual.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Límite Entradas:</span>
                    <span className="text-slate-200">{plan.entradas_ilimitadas ? 'Ilimitadas ∞' : `${plan.max_entradas} al mes`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horario Permitido:</span>
                    <span className="text-slate-300 font-semibold">
                      {/* CORREGIDO: Se cambiaron las propiedades a horario_inicio y horario_fin */}
                      {plan.horario_inicio?.substring(0, 5) ?? '00:00'} - {plan.horario_fin?.substring(0, 5) ?? '23:59'}
                    </span>
                  </div>
                </div>
              </div>

              {plan.activo && (
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(plan)} className="w-1/2 text-xs">
                    Editar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDeactivate(plan.id)} className="w-1/2 text-xs text-rose-400 hover:text-rose-300">
                    Desactivar
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchPlans(); }}
        />
      )}
    </div>
  );
}

// =============================================================================
// COMPONENTE INTERNO: MODAL DEL FORMULARIO
// =============================================================================
interface PlanFormModalProps {
  plan: PlanAbonado | null;
  onClose: () => void;
  onSuccess: () => void;
}

function PlanFormModal({ plan, onClose, onSuccess }: PlanFormModalProps) {
  const isEdit = !!plan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nombre, setNombre] = useState(plan?.nombre ?? '');
  const [tipoVehiculo, setTipoVehiculo] = useState(plan?.tipo_vehiculo || plan?.tipo_vehiculo || 'CARRO');
  const [precioMensual, setPrecioMensual] = useState<number>(plan?.precio_mensual ?? 0);
  const [entradasIlimitadas, setEntradasIlimitadas] = useState<boolean>(plan?.entradas_ilimitadas ?? true);
  const [maxEntradas, setMaxEntradas] = useState<number>(plan?.max_entradas ?? 0);
  
  // CORREGIDO: Se mapearon a los campos horario_inicio y horario_fin correctos
  const [horarioInicio, setHorarioInicio] = useState(plan?.horario_inicio ?? '00:00:00');
  const [horarioFin, setHorarioFin] = useState(plan?.horario_fin ?? '23:59:59');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre del plan es requerido'); return; }
    if (precioMensual <= 0) { setError('El precio mensual debe ser mayor a $0'); return; }

    setLoading(true);
    setError('');

    const formattedInicio = horarioInicio.length === 5 ? `${horarioInicio}:00` : horarioInicio;
    const formattedFin = horarioFin.length === 5 ? `${horarioFin}:00` : horarioFin;

    // Se construyen ambas variantes para asegurar acople con las claims de api.ts sin importar la versión
    const payload: any = {
      nombre,
      tipo_vehiculo: tipoVehiculo,
      precio_mensual: precioMensual,
      entradas_ilimitadas: entradasIlimitadas,
      max_entradas: entradasIlimitadas ? 0 : maxEntradas,
      horario_inicio: formattedInicio,
      horario_fin: formattedFin,
      horario_permitido_inicio: formattedInicio,
      horario_permitido_fin: formattedFin
    };

    try {
      if (isEdit && plan) {
        await planService.update(plan.id, payload);
      } else {
        await planService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios del plan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100">{isEdit ? 'Modificar Plan Mensual' : 'Crear Nuevo Plan Mensual'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 text-sm">✕</button>
        </div>

        {error && <div className="mb-4"><AlertMessage message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre del Plan" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Mensual Completo Carros" />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo Vehículo"
              value={tipoVehiculo}
              // CORREGIDO: Se añadió la aserción 'as any' para admitir la mutación de la unión string literal
              onChange={(e) => setTipoVehiculo(e.target.value as any)}
              options={[
                { value: 'CARRO', label: 'Carro' },
                { value: 'MOTO', label: 'Moto' },
                { value: 'CAMIONETA', label: 'Camioneta' },
              ]}
            />
            <Input type="number" label="Precio Mensual ($)" value={precioMensual.toString()} onChange={(e) => setPrecioMensual(parseInt(e.target.value, 10) || 0)} />
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-300 block">¿Entradas Ilimitadas?</span>
              <span className="text-xs text-slate-500">Permite ingresos infinitos en el mes</span>
            </div>
            <Toggle checked={entradasIlimitadas} onChange={setEntradasIlimitadas} />
          </div>

          {!entradasIlimitadas && (
            <Input type="number" label="Máximo de Ingresos Permitidos al Mes" value={maxEntradas.toString()} onChange={(e) => setMaxEntradas(parseInt(e.target.value, 10) || 0)} min="1" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio (HH:MM:SS)" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} placeholder="06:00:00" />
            <Input label="Hora Fin (HH:MM:SS)" value={horarioFin} onChange={(e) => setHorarioFin(e.target.value)} placeholder="22:00:00" />
          </div>

          <div className="flex gap-3 pt-2 w-full">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2" disabled={loading}>Cancelar</Button>
            <Button type="submit" className="w-1/2" loading={loading}>{isEdit ? 'Actualizar' : 'Guardar Plan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}