import { useState, useEffect, useCallback } from 'react';
import type { CapacityConfig } from '../../types';
import { capacityService } from '../../services/api';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { AlertMessage } from '../molecules/AlertMessage';

export function CapacityManager() {
  const [capacities, setCapacities] = useState<CapacityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para controlar la edición por tipo de vehículo
  const [editingType, setEditingType] = useState<string | null>(null);
  const [newCapacityValue, setNewCapacityValue] = useState<number>(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Función transaccional para leer el estado real de aforo desde el Backend
  const fetchCapacities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await capacityService.getAll();
      setCapacities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el estado del parqueadero');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapacities();
  }, [fetchCapacities]);

  // Iniciar el flujo de actualización en línea
  function handleStartEdit(config: CapacityConfig) {
    setEditingType(config.tipo_vehiculo);
    setNewCapacityValue(config.capacidad_total);
    setError('');
  }

  // Cancelar edición activa
  function handleCancelEdit() {
    setEditingType(null);
    setError('');
  }

  // Procesar el cambio de cupos máximos hacia Spring Boot
  async function handleUpdateCapacity(tipoVehiculo: CapacityConfig['tipo_vehiculo']) {
    if (newCapacityValue <= 0) {
      setError('La capacidad asignada debe ser mayor a 0 celdas');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      await capacityService.update({
        tipo_vehiculo: tipoVehiculo,
        capacidad_total: newCapacityValue,
      });
      
      setEditingType(null);
      // Refresca los indicadores de inmediato para ver la nueva capacidad reflejada
      await fetchCapacities();
    } catch (err) {
      // Captura excepciones de Spring Boot (Ej: Nueva capacidad menor a autos estacionados)
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la capacidad asignada');
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
        <p className="ml-3 text-slate-400 font-medium">Consultando celdas en tiempo real...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <AlertMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {capacities.map((cap) => {
          const isEditing = editingType === cap.tipo_vehiculo;
          // Cálculo dinámico del porcentaje de ocupación real del establecimiento
          const porcentajeOcupacion = cap.capacidad_total > 0 
            ? Math.min(Math.round(((cap.ocupacion_actual ?? 0) / cap.capacidad_total) * 100), 100)
            : 0;

          // Color adaptativo según la congestión de celdas
          const progressColor = porcentajeOcupacion >= 90 
            ? 'bg-rose-500' 
            : porcentajeOcupacion >= 70 
              ? 'bg-amber-500' 
              : 'bg-teal-400';

          return (
            <Card key={cap.tipo_vehiculo} className="p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 tracking-wide">{cap.tipo_vehiculo}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control de celdas operativas</p>
                </div>
                <span className="text-2xl font-black text-slate-100">
                  {cap.ocupacion_actual ?? 0} <span className="text-xs text-slate-500 font-normal">/ {cap.capacidad_total}</span></span>
              </div>

              {/* Barra de progreso de ocupación en tiempo real */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${porcentajeOcupacion}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Ocupación: {porcentajeOcupacion}%</span>
                <span>{cap.capacidad_total - (cap.ocupacion_actual ?? 0)} Libres</span>
              </div>

              <div className="border-t border-slate-800/60 pt-4 mt-2 flex flex-col gap-3">
                {isEditing ? (
                  <div className="flex flex-col gap-3 w-full">
                    <Input
                      type="number"
                      label="Nueva Capacidad Total"
                      value={newCapacityValue.toString()}
                      onChange={(e) => setNewCapacityValue(parseInt(e.target.value, 10) || 0)}
                      min="1"
                    />
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleCancelEdit} 
                        className="w-1/2"
                        disabled={submitLoading}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateCapacity(cap.tipo_vehiculo)} 
                        className="w-1/2"
                        loading={submitLoading}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleStartEdit(cap)}
                    className="w-full text-xs font-semibold"
                  >
                    Configurar Capacidad
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}