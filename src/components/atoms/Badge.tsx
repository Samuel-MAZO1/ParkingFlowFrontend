import React from 'react';

type BadgeVariant = 'active' | 'inactive' | 'moto' | 'carro' | 'camioneta' | 'admin' | 'operador' | 'abonado';

const variantMap: Record<BadgeVariant, string> = {
  active: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  inactive: 'bg-slate-700/50 text-slate-400 border-slate-600/40',
  moto: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  carro: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  camioneta: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  admin: 'bg-red-500/15 text-red-400 border-red-500/30',
  operador: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  abonado: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'active', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}