import { useState } from 'react';
import { useAuth } from './store/authStore';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CapacityPage } from './pages/CapacityPage';
import { RatesPage } from './pages/RatesPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { DashboardLayout } from './components/templates/DashboardLayout';

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  dashboard:     { title: 'Dashboard',        subtitle: 'Overview and quick stats' },
  capacity:      { title: 'Capacity',         subtitle: 'Configure spaces per vehicle type — US-004' },
  rates:         { title: 'Rates',            subtitle: 'Manage parking tariffs — US-005' },
  plans:         { title: 'Subscriber Plans', subtitle: 'Manage monthly plans — US-006' },
  vehicles:      { title: 'My Vehicles',      subtitle: 'Register and manage vehicles — US-007 / US-008' },
  subscriptions: { title: 'Subscriptions',    subtitle: 'Manage your subscription — US-009 / US-010 / US-011' },
  parking:       { title: 'Parking Entry',    subtitle: 'Register entries and exits — US-013 / US-014 / US-015' },
  active:        { title: 'Active Vehicles',  subtitle: 'Currently parked — US-017' },
  history:       { title: 'My History',       subtitle: 'Parking history — US-018' },
  reports:       { title: 'Reports',          subtitle: 'Revenue and occupancy reports — US-019 / US-020' },
};

function AppInner() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => setActivePage('dashboard')} />;
  }

  const meta = PAGE_META[activePage] ?? { title: activePage };

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'capacity':
        return user?.rol === 'ADMIN'
          ? <CapacityPage />
          : <PlaceholderPage title="Unauthorized" icon="⊗" />;
      case 'rates':
        return user?.rol === 'ADMIN'
          ? <RatesPage />
          : <PlaceholderPage title="Unauthorized" icon="⊗" />;
      case 'plans':
        return <PlaceholderPage title="Subscriber Plans" icon="◇" storyId="US-006" />;
      case 'vehicles':
        return <PlaceholderPage title="My Vehicles" icon="◉" storyId="US-007 / US-008" />;
      case 'subscriptions':
        return <PlaceholderPage title="Subscriptions" icon="◈" storyId="US-009 / US-010 / US-011" />;
      case 'parking':
        return <PlaceholderPage title="Parking Entry / Exit" icon="▷" storyId="US-013 / US-014 / US-015" />;
      case 'active':
        return <PlaceholderPage title="Active Vehicles" icon="⊡" storyId="US-017" />;
      case 'history':
        return <PlaceholderPage title="My Parking History" icon="≡" storyId="US-018" />;
      case 'reports':
        return <PlaceholderPage title="Reports" icon="◫" storyId="US-019 / US-020" />;
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