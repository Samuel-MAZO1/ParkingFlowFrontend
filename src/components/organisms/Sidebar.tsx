import { useAuth } from '../../store/authStore';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈', roles: ['ADMIN', 'OPERADOR', 'ABONADO'] },
  { id: 'capacity', label: 'Capacity', icon: '⊞', roles: ['ADMIN'] },
  { id: 'rates', label: 'Rates', icon: '◎', roles: ['ADMIN'] },
  { id: 'plans', label: 'Plans', icon: '◇', roles: ['ADMIN'] },
  { id: 'vehicles', label: 'My Vehicles', icon: '◉', roles: ['ABONADO'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: '◈', roles: ['ABONADO'] },
  { id: 'parking', label: 'Parking Entry', icon: '▷', roles: ['OPERADOR'] },
  { id: 'active', label: 'Active Vehicles', icon: '⊡', roles: ['OPERADOR', 'ADMIN'] },
  { id: 'history', label: 'My History', icon: '≡', roles: ['ABONADO'] },
  { id: 'reports', label: 'Reports', icon: '◫', roles: ['ADMIN'] },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.rol));

  const roleColors: Record<string, string> = {
    ADMIN: 'text-red-400',
    OPERADOR: 'text-amber-400',
    ABONADO: 'text-teal-400',
  };

  return (
    <aside className="w-60 h-screen bg-slate-950 border-r border-slate-800/60 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-black text-sm">P</span>
          </div>
          <div>
            <p className="text-slate-100 font-bold text-sm tracking-wide">ParkingFlow</p>
            <p className="text-slate-600 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-800/40">
        <div className="bg-slate-900/60 rounded-xl px-3 py-3">
          <p className="text-slate-300 text-xs font-medium truncate">{user.email}</p>
          <p className={`text-xs font-bold mt-0.5 ${roleColors[user.rol]}`}>{user.rol}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
        {visibleItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left
                ${isActive
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'}
              `}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <span className="text-base w-5 text-center">⊗</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}