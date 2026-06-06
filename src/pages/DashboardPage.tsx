import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../store/authStore';
import { capacityService } from '../services/api';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { AlertMessage } from '../components/molecules/AlertMessage';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <Card className="p-6" glow>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para albergar la información real devuelta por CapacidadService.java
  const [liveData, setLiveData] = useState<any>(null);

  const roleMap: Record<string, 'admin' | 'operador' | 'abonado'> = {
    ADMIN: 'admin',
    OPERADOR: 'operador',
    ABONADO: 'abonado',
  };

  const fetchDashboardData = useCallback(async () => {
    // El endpoint /admin/estado en tu backend requiere estrictamente privilegios de ADMIN
    if (user?.rol !== 'ADMIN') return;

    try {
      setLoading(true);
      setError('');
      const data = await capacityService.getResumenGlobal();
      setLiveData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sincronizar métricas del servidor');
    } finally {
      setLoading(false);
    }
  }, [user?.rol]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 1. MÁSTERS DE ESTADÍSTICAS REALES PARA ADMINISTRADOR
  const tasaOcupacion = liveData?.capacidadFisicaTotal > 0
    ? Math.round((liveData.ocupacionGlobal / liveData.capacidadFisicaTotal) * 100)
    : 0;

  const adminStats = [
    { 
      label: 'Celdas Totales', 
      value: liveData ? String(liveData.capacidadFisicaTotal) : '...', 
      icon: '⊞', 
      sub: `Sede: ${liveData?.nombreParqueadero ?? 'Principal'}` 
    },
    { 
      label: 'Vehículos Adentro', 
      value: liveData ? String(liveData.ocupacionGlobal) : '...', 
      icon: '◉', 
      sub: `${tasaOcupacion}% de ocupación global` 
    },
    { 
      label: 'Celdas por Asignar', 
      value: liveData ? String(liveData.capacidadPorAsignar) : '...', 
      icon: '◎', 
      sub: 'Cupos base sin configurar' 
    },
    { 
      label: 'Cupos Libres', 
      value: liveData ? String(liveData.cuposFisicosLibres) : '...', 
      icon: '◈', 
      sub: 'Espacios físicos disponibles' 
    },
  ];

  // 2. MÁSTERS DE ESTADÍSTICAS PARA OPERADOR (Caída segura a placeholders optimizados)
  const operatorStats = [
    { label: 'Vehículos Activos', value: '0', icon: '◉', sub: 'Actualmente en celdas' },
    { label: 'Ingresos Hoy', value: '0', icon: '▷', sub: 'Desde la medianoche' },
    { label: 'Motos Disponibles', value: 'Disponibles', icon: '🏍️', sub: 'Monitoreo operativo' },
    { label: 'Carros Disponibles', value: 'Disponibles', icon: '🚗', sub: 'Monitoreo operativo' },
  ];

  // 3. MÁSTERS DE ESTADÍSTICAS PARA ABONADO
  const subscriberStats = [
    { label: 'Mis Vehículos', value: '0', icon: '◉', sub: 'Registrados en el sistema' },
    { label: 'Planes Activos', value: '0', icon: '◈', sub: 'Sin suscripción contratada' },
    { label: 'Ingresos del Mes', value: '0', icon: '▷', sub: 'Historial de visitas' },
    { label: 'Estado Plan', value: 'N/A', icon: '◎', sub: 'Ver módulo suscripciones' },
  ];

  const stats = user?.rol === 'ADMIN'
    ? adminStats
    : user?.rol === 'OPERADOR'
      ? operatorStats
      : subscriberStats;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-400 border-t-transparent"></div>
        <p className="ml-3 text-sm text-slate-400">Construyendo tablero de control...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {error && <AlertMessage message={error} />}

      {/* Mensaje de Bienvenida */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-5">
        <div>
          <h2 className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
            ¡Bienvenido a ParkingFlow! — {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
          </h2>
          <p className="text-slate-100 text-xl font-black mt-1 tracking-tight">{user?.email}</p>
        </div>
        <Badge variant={roleMap[user?.rol ?? 'ABONADO']}>{user?.rol}</Badge>
      </div>

      {/* Cuadrícula de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Panel Informativo de Navegación Rápida */}
      <div className="bg-slate-900/40 border border-slate-800/40 rounded-2xl p-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Navegación del Sistema</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          {user?.rol === 'ADMIN' &&
            'Como Administrador central, utiliza el menú lateral para ajustar la capacidad del establecimiento, controlar las tarifas comerciales por franja, auditar planes de suscripción mensuales y revisar el aforo de las celdas.'}
          {user?.rol === 'OPERADOR' &&
            'Como Operador de turno, utiliza el menú de estacionamientos en el panel lateral para dar de alta ingresos de vehículos ocasionales, registrar entradas automáticas de abonados y liquidar los cobros al momento de la salida.'}
          {user?.rol === 'ABONADO' &&
            'Como Cliente abonado del parqueadero, utiliza el menú lateral para matricular tus placas de vehículos autorizados, adquirir o renovar coberturas de planes mensuales y revisar tu historial de parqueos.'}
        </p>
      </div>
    </div>
  );
}