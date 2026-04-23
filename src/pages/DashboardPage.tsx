import { useAuth } from '../store/authStore';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';

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

  const roleMap: Record<string, 'admin' | 'operador' | 'abonado'> = {
    ADMIN: 'admin',
    OPERADOR: 'operador',
    ABONADO: 'abonado',
  };

  const adminStats = [
    { label: 'Total Spaces', value: '80', icon: '⊞', sub: 'Across all vehicle types' },
    { label: 'Occupied', value: '47', icon: '◉', sub: '58% occupancy rate' },
    { label: 'Revenue Today', value: '$124,500', icon: '◎', sub: 'vs $98,200 yesterday' },
    { label: 'Active Subs', value: '23', icon: '◈', sub: '3 expiring this week' },
  ];

  const operatorStats = [
    { label: 'Active Vehicles', value: '47', icon: '◉', sub: 'Currently parked' },
    { label: 'Entries Today', value: '83', icon: '▷', sub: 'Since midnight' },
    { label: 'Available Motos', value: '8', icon: '🏍️', sub: 'of 20 total' },
    { label: 'Available Cars', value: '15', icon: '🚗', sub: 'of 40 total' },
  ];

  const subscriberStats = [
    { label: 'My Vehicles', value: '2', icon: '◉', sub: 'Registered' },
    { label: 'Active Plans', value: '1', icon: '◈', sub: 'Expires in 12 days' },
    { label: 'Visits This Month', value: '18', icon: '▷', sub: 'Out of unlimited' },
    { label: 'Next Renewal', value: 'Apr 23', icon: '◎', sub: 'Auto-renew available' },
  ];

  const stats =
    user?.rol === 'ADMIN'
      ? adminStats
      : user?.rol === 'OPERADOR'
      ? operatorStats
      : subscriberStats;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-slate-400 text-sm">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} —
          </h2>
          <p className="text-slate-200 text-lg font-semibold">{user?.email}</p>
        </div>
        <Badge variant={roleMap[user?.rol ?? 'ABONADO']}>{user?.rol}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions hint */}
      <div className="bg-slate-900/40 border border-slate-800/40 rounded-2xl p-6">
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-3">Quick Navigation</p>
        <p className="text-slate-500 text-sm">
          {user?.rol === 'ADMIN' &&
            'Use the sidebar to manage capacity, rates, plans, and view reports.'}
          {user?.rol === 'OPERADOR' &&
            'Use the sidebar to register vehicle entries, exits, and view active parked vehicles.'}
          {user?.rol === 'ABONADO' &&
            'Use the sidebar to manage your vehicles, subscriptions, and view your parking history.'}
        </p>
      </div>
    </div>
  );
}