import { CapacityManager } from '../components/organisms/CapacityManager';

export function CapacityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Capacidad del Parqueadero
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configura y monitorea la disponibilidad física y el aforo de celdas en tiempo real.
        </p>
      </div>

      {/* Renderiza el organismo conectado directamente a la base de datos mediante Axios/Fetch */}
      <CapacityManager />
    </div>
  );
}