import { useState } from 'react';
import { useAuth } from './store/authStore';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CapacityPage } from './pages/CapacityPage';
import { RatesPage } from './pages/RatesPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { DashboardLayout } from './components/templates/DashboardLayout';
import { ParkingPage } from './pages/ParkingPage';
import { PlansPage } from './pages/PlansPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Panel Principal', subtitle: 'Vista general del estado del parqueadero' },
  capacity: { title: 'Configurar Capacidad', subtitle: 'Gestión de cupos por tipo de vehículo (ADMIN)' },
  rates: { title: 'Tarifas del Sistema', subtitle: 'Administración de costos por hora y día (ADMIN)' },
  plans: { title: 'Planes de Abonados', subtitle: 'CRUD de suscripciones mensuales (ADMIN)' },
  vehicles: { title: 'Mis Vehículos', subtitle: 'Registro y gestión de tus automotores (ABONADO)' },
  subscriptions: { title: 'Suscripciones', subtitle: 'Adquirir y renovar tus mensualidades (ABONADO)' },
  parking: { title: 'Registro de Estacionamiento', subtitle: 'Control de entradas, salidas y cobros' },
  active: { title: 'Vehículos Estacionados', subtitle: 'Ocupación actual en tiempo real' },
  history: { title: 'Mi Historial', subtitle: 'Historial personal de uso del parqueadero' },
  reports: { title: 'Reportes y Estadísticas', subtitle: 'Análisis de ingresos y ocupación (ADMIN)' },
};

function AppInner() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setActivePage('dashboard')} />;
  }

  // 2. USO SEGURO DE PAGE_META CON CORRECCIÓN DE TIPADO
  const meta = PAGE_META[activePage] ?? { title: activePage, subtitle: '' };

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'capacity':
        return user?.rol === 'ADMIN'
          ? <CapacityPage />
          : <PlaceholderPage title="No Autorizado" icon="⊗" />;
      case 'rates':
        return user?.rol === 'ADMIN'
          ? <RatesPage />
          : <PlaceholderPage title="No Autorizado" icon="⊗" />;
          
      // PÁGINAS REALES CONECTADAS A LA API (US-006 a US-010)
      case 'plans':
        return user?.rol === 'ADMIN'
          ? <PlansPage />
          : <PlaceholderPage title="No Autorizado" icon="⊗" />;
      case 'vehicles':
        return user?.rol === 'ABONADO'
          ? <VehiclesPage />
          : <PlaceholderPage title="No Autorizado" icon="⊗" />;
      case 'subscriptions':
        return <SubscriptionsPage />;
          
      // VISTAS CON DATOS ESTÁTICOS PROVISIONALES (Se quedan como placeholders por ahora)
      case 'parking':
        return <ParkingPage />;
      case 'active':
        return <PlaceholderPage title="Vehículos Activos" icon="⊡" storyId="US-017" />;
      case 'history':
        return <PlaceholderPage title="Historial de Estacionamiento" icon="≡" storyId="US-018" />;
      case 'reports':
        return <PlaceholderPage title="Reportes" icon="◫" storyId="US-019 / US-020" />;
      default:
        return <DashboardPage />;
    }
  }

  return (
    <DashboardLayout
      title={meta.title}
      subtitle={meta.subtitle}
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {renderPage()}
    </DashboardLayout>
  );
}

export default function App() {
  return <AppInner />;
}