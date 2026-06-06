// Enums
export type VehicleType = 'MOTO' | 'CARRO' | 'CAMIONETA';
export type UserRole = 'ADMIN' | 'OPERADOR' | 'ABONADO';
export type SubscriptionStatus = 'ACTIVA' | 'VENCIDA' | 'CANCELADA';
export type ParkingStatus = 'ACTIVO' | 'FINALIZADO';

// Auth
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  rol: UserRole;
}

export interface User {
  id: number;
  email: string;
  rol: UserRole;
  activo: boolean;
}

// Register
export interface RegisterRequest {
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Parking Config (US-004)
export interface CapacityConfig {
  id: number;
  tipo_vehiculo: VehicleType;
  capacidad_total: number;
  ocupacion_actual?: number;
}

export interface UpdateCapacityRequest {
  tipo_vehiculo: VehicleType;
  capacidad_total: number;
}

// Rates (US-005)
export interface Rate {
  id: number;
  tipo_vehiculo: VehicleType;
  tarifa_hora: number;
  tarifa_dia_completo: number;
  aplica_desde: string; // HH:mm
  aplica_hasta: string; // HH:mm
  es_festivo?: boolean;
  activa: boolean;
}

export interface CreateRateRequest {
  tipo_vehiculo: VehicleType;
  tarifa_hora: number;
  tarifa_dia_completo: number;
  aplica_desde: string;
  aplica_hasta: string;
  es_festivo?: boolean;
}


export interface PlanAbonado {
  id: number;
  nombre: string;
  tipo_vehiculo: 'MOTO' | 'CARRO' | 'CAMIONETA';
  precio_mensual: number;
  entradas_ilimitadas: boolean;
  max_entradas?: number;
  horario_inicio: string;
  horario_fin: string;    
  activo: boolean;
}

export interface Vehiculo {
  id: number;
  placa: string;
  tipo_vehiculo: 'MOTO' | 'CARRO' | 'CAMIONETA';
  marca: string;
  modelo: string;
  color: string;
}

export interface Suscripcion {
  id: number;
  vehiculo: Vehiculo;
  plan: PlanAbonado;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'ACTIVA' | 'VENCIDA' | 'CANCELADA';
  entradas_usadas: number;
  referencia_pago: string;
}