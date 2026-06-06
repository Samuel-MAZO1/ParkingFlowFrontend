import React, { useState, useEffect, useCallback } from 'react';
import { vehicleService } from '../services/api';
import type { Vehiculo } from '../types';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { AlertMessage } from '../components/molecules/AlertMessage';

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Control de la Ventana Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehiculo | null>(null);

  // Consulta transaccional de mis vehículos asociados
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al recuperar tu listado de vehículos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // US-008: Eliminar Vehículo Matriculado
  async function handleDelete(id: number) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este vehículo? Si tienes una suscripción activa vinculada a esta placa, podrías perder el acceso automatizado.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await vehicleService.delete(id);
      setSuccess('Vehículo removido con éxito del sistema.');
      await fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el vehículo seleccionado');
    }
  }

  function handleOpenCreate() {
    setEditingVehicle(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(vehicle: Vehiculo) {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }

  function handleFormSuccess() {
    setIsModalOpen(false);
    fetchVehicles();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
        <p className="ml-3 text-sm text-slate-400">Cargando tus vehículos matriculados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Mis Vehículos</h1>
          <p className="text-sm text-slate-400 mt-1">Registra y administra las placas autorizadas para asociar a tus planes de suscripción mensual.</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<span>＋</span>}>Matricular Vehículo</Button>
      </div>

      {error && <AlertMessage message={error} />}
      {success && <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-sm font-medium">{success}</div>}

      {/* Grid de Tarjetas de Vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full bg-slate-900/20 border border-slate-800/60 p-12 rounded-2xl text-center text-sm text-slate-500">
            No tienes vehículos matriculados bajo tu cuenta actualmente. Presiona "Matricular Vehículo".
          </div>
        ) : (
          vehicles.map((v) => (
            <Card key={v.id} className="p-6 flex flex-col justify-between relative">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-teal-400 noble-badge uppercase bg-teal-400/10 px-2 py-0.5 rounded">
                      {v.tipo_vehiculo || (v as any).tipoVehiculo}
                    </span>
                    <h3 className="text-2xl font-black text-slate-100 tracking-tight mt-2 font-mono">
                      {v.placa}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-300">{v.marca}</p>
                    <p className="text-xs text-slate-500">{v.modelo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                  <span className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: translateColor(v.color) }}></span>
                  <span>Color: <strong className="text-slate-300 capitalize">{v.color}</strong></span>
                </div>
              </div>

              <div className="flex gap-2 pt-5 mt-4 border-t border-slate-800/50">
                <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(v)} className="w-1/2 text-xs">
                  Editar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleDelete(v.id)} className="w-1/2 text-xs text-rose-400 hover:text-rose-300">
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal del Formulario */}
      {isModalOpen && (
        <VehicleFormModal
          vehicle={editingVehicle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

// Helper simple para pintar el circulito del color en la UI
function translateColor(color: string): string {
  const map: Record<string, string> = {
    negro: '#000000', blanco: '#ffffff', gris: '#6b7280', rojo: '#ef4444', 
    azul: '#3b82f6', verde: '#10b981', amarillo: '#f59e0b', plata: '#e5e7eb'
  };
  return map[color.toLowerCase().trim()] || '#475569';
}

// =============================================================================
// COMPONENTE INTERNO: MODAL DEL FORMULARIO DE REGISTRO / EDICIÓN
// =============================================================================
interface VehicleFormModalProps {
  vehicle: Vehiculo | null;
  onClose: () => void;
  onSuccess: () => void;
}

function VehicleFormModal({ vehicle, onClose, onSuccess }: VehicleFormModalProps) {
  const isEdit = !!vehicle;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [placa, setPlaca] = useState(vehicle?.placa ?? '');
  const [tipoVehiculo, setTipoVehiculo] = useState(vehicle?.tipo_vehiculo || (vehicle as any).tipoVehiculo || 'CARRO');
  const [marca, setMarca] = useState(vehicle?.marca ?? '');
  const [modelo, setModelo] = useState(vehicle?.modelo ?? '');
  const [color, setColor] = useState(vehicle?.color ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) { setError('La placa es un campo obligatorio'); return; }
    if (!marca.trim() || !modelo.trim()) { setError('Por favor completa la marca y modelo'); return; }

    setLoading(true);
    setError('');

    // Payload adaptado de forma segura mapeando los nombres correctos en snake_case
    const payload: any = {
      placa: placa.trim().toUpperCase(),
      tipo_vehiculo: tipoVehiculo,
      tipoVehiculo: tipoVehiculo, // Doble mapeo defensivo contra api.ts
      marca: marca.trim(),
      modelo: modelo.trim(),
      color: color.trim().toLowerCase()
    };

    try {
      if (isEdit && vehicle) {
        await vehicleService.update(vehicle.id, payload);
      } else {
        await vehicleService.register(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos del vehículo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? 'Modificar Información del Vehículo' : 'Matricular Nuevo Vehículo'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 text-sm">✕</button>
        </div>

        {error && <div className="mb-4"><AlertMessage message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Placa del Vehículo" 
              value={placa} 
              onChange={(e) => setPlaca(e.target.value)} 
              placeholder="Ej: AAA123" 
              disabled={isEdit} // Las placas son llaves primarias de negocio inmutables
            />
            <Select
              label="Tipo Vehículo"
              value={tipoVehiculo}
              onChange={(e) => setTipoVehiculo(e.target.value as any)}
              options={[
                { value: 'CARRO', label: 'Carro' },
                { value: 'MOTO', label: 'Moto' },
                { value: 'CAMIONETA', label: 'Camioneta' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: Mazda" />
            <Input label="Modelo / Año" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ej: 2024 o CX-30" />
          </div>

          <Input label="Color Dominante" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ej: Blanco, Negro, Rojo" />

          <div className="flex gap-3 pt-2 w-full">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="w-1/2" loading={loading}>
              {isEdit ? 'Actualizar' : 'Matricular'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}