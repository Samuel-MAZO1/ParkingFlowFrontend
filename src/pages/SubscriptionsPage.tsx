import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionService, planService, vehicleService } from '../services/api';
import type { Suscripcion, PlanAbonado, Vehiculo } from '../types';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { AlertMessage } from '../components/molecules/AlertMessage';

export function SubscriptionsPage() {
  const [mySubscriptions, setMySubscriptions] = useState<Suscripcion[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanAbonado[]>([]);
  const [myVehicles, setMyVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados locales para el formulario de compra (US-009)
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [referenciaPago, setReferenciaPago] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Consulta coordinada a Spring Boot usando Promise.all
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [subsData, plansData, vehiclesData] = await Promise.all([
        subscriptionService.getMySubscriptions(),
        planService.getAll(true), // Consulta únicamente los planes activos comerciales
        vehicleService.getMyVehicles()
      ]);

      setMySubscriptions(subsData);
      setAvailablePlans(plansData);
      setMyVehicles(vehiclesData);

      // Preselecciona el primer elemento si existen datos disponibles
      if (plansData.length > 0) setSelectedPlanId(plansData[0].id);
      if (vehiclesData.length > 0) setSelectedVehicleId(vehiclesData[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sincronizar el módulo de suscripciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // US-009: Procesar la Compra del Plan Mensual
  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId || !selectedVehicleId) {
      setError('Debes seleccionar un plan y un vehículo obligatoriamente.');
      return;
    }
    if (!referenciaPago.trim()) {
      setError('Por favor ingresa la referencia de la transferencia de pago.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      await subscriptionService.purchase({
        plan_id: selectedPlanId,
        vehiculo_id: selectedVehicleId,
        referencia_pago: referenciaPago.trim()
      });

      setSuccess('¡Suscripción adquirida con éxito! Cobertura asignada a la placa.');
      setReferenciaPago('');
      await fetchData(); // Refresca las tarjetas de inmediato
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la compra del plan');
    } finally {
      setSubmitLoading(false);
    }
  }

  // US-010: Procesar la Renovación / Reactivación de una Cobertura
  async function handleRenew(subId: number, planId: number) {
    const ref = window.prompt('Para renovar el plan, ingresa la referencia de pago del nuevo movimiento electrónico:');
    if (!ref || !ref.trim()) return;

    try {
      setError('');
      setSuccess('');
      await subscriptionService.renew(subId, {
        plan_id: planId,
        referencia_pago: ref.trim()
      });
      setSuccess('Suscripción renovada correctamente por 30 días adicionales.');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la renovación de la cobertura');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
        <p className="ml-3 text-sm text-slate-400">Sincronizando coberturas mensuales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Suscripciones Mensuales</h1>
        <p className="text-sm text-slate-400 mt-1">Adquiere coberturas premium para ingresar de forma automática al parqueadero sin tiquetes ocasionales.</p>
      </div>

      {error && <AlertMessage message={error} />}
      {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* PANEL DE ADQUISICIÓN */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Adquirir Nuevo Plan</h2>
          <p className="text-xs text-slate-500">Selecciona uno de tus vehículos matriculados y el plan que deseas asignarle.</p>
          
          {myVehicles.length === 0 ? (
            <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              ⚠️ Primero debes vincular al menos una placa en el módulo "Mis Vehículos" para poder comprar un plan.
            </p>
          ) : availablePlans.length === 0 ? (
            <p className="text-xs text-slate-500">No hay planes vigentes ofrecidos por la administración en este momento.</p>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-4">
              <Select
                label="Seleccionar Plan"
                value={selectedPlanId.toString()}
                onChange={(e) => setSelectedPlanId(parseInt(e.target.value, 10))}
                options={availablePlans.map(p => ({ 
                  value: p.id.toString(), 
                  label: `${p.nombre} ($${p.precio_mensual.toLocaleString('es-CO')})` 
                }))}
              />

              <Select
                label="Asignar al Vehículo"
                value={selectedVehicleId.toString()}
                onChange={(e) => setSelectedVehicleId(parseInt(e.target.value, 10))}
                options={myVehicles.map(v => ({ 
                  value: v.id.toString(), 
                  label: `${v.placa} — ${v.marca}` 
                }))}
              />

              <Input
                label="Referencia de Pago (Nequi / Transferencia)"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                placeholder="Ej: TRX-987654321"
              />

              <Button type="submit" loading={submitLoading} className="w-full">
                Comprar Suscripción
              </Button>
            </form>
          )}
        </Card>

        {/* HISTORIAL Y ESTADO DE MIS COBERTURAS */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Mis Coberturas Contratadas (US-011)</h2>
          
          {mySubscriptions.length === 0 ? (
            <div className="bg-slate-900/20 border border-slate-800/60 p-8 rounded-2xl text-center text-sm text-slate-500">
              No registras suscripciones activas vinculadas a tu cuenta de abonado actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySubscriptions.map((sub) => {
                const planInfo = (sub as any).planAbonado || (sub as any).plan;
                const vehiculoInfo = (sub as any).vehiculo;
                const estaActiva = sub.estado === 'ACTIVA';

                return (
                  <Card key={sub.id} className={`p-5 flex flex-col justify-between ${!estaActiva ? 'opacity-60 grayscale' : ''}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{planInfo?.nombre ?? 'Plan Mensual'}</h4>
                          <p className="text-xs font-mono text-teal-400 font-bold mt-1">Placa vinculada: {vehiculoInfo?.placa ?? 'N/A'}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          estaActiva ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {sub.estado}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1 text-xs font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>Fecha de Vencimiento:</span>
                          <span className="text-slate-300">{sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ref. Pago:</span>
                          <span className="text-slate-500 select-all">{sub.referencia_pago}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-semibold"
                        onClick={() => handleRenew(sub.id, planInfo?.id)}
                      >
                        🔄 {estaActiva ? 'Renovar Cobertura' : 'Reactivar Suscripción'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}