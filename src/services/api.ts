import type {
  AuthTokens,
  RegisterRequest,
  LoginRequest,
  CapacityConfig,
  UpdateCapacityRequest,
  Rate,
  CreateRateRequest,
  PlanAbonado,
  Vehiculo,
  Suscripcion
} from '../types';

const MOCK = false;
const BASE_URL = 'http://localhost:8082/api/v1';

// =============================================================================
// HELPERS & SEGURIDAD (JWT)
// =============================================================================

function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem('pf_tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const tokens = getTokens();
    if (tokens) headers['Authorization'] = 'Bearer ' + tokens.access_token;
  }
  const res = await fetch(BASE_URL + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Error en la petición');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Mapeador de Tarifa del Backend a Rate del Frontend
function mapTarifaToRate(t: any): Rate {
  return {
    id: t.id, 
    tipo_vehiculo: t.tipoVehiculo, 
    tarifa_hora: t.valorHora,
    tarifa_dia_completo: t.valorDiaCompleto, 
    aplica_desde: t.horaInicio,
    aplica_hasta: t.horaFin, 
    es_festivo: t.esFestivo ?? false, 
    activa: t.activa ?? true,
  };
}

// =============================================================================
// 1. AUTENTICACIÓN (US-001, US-002, US-003)
// =============================================================================
export const authService = {
  register: (data: RegisterRequest) =>
    request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.nombre,
        apellido: (data as any).apellido ?? '',
        documento: data.documento,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
        rol: 'ABONADO'
      }),
    }, false),

  login: (data: LoginRequest) =>
    request<AuthTokens>('/auth/login', {
      method: 'POST', 
      body: JSON.stringify(data),
    }, false),

  refresh: (refresh_token: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST', 
      body: JSON.stringify({ refreshToken: refresh_token }),
    }, false),
};

// =============================================================================
// 2. CAPACIDADES (US-004)
// =============================================================================
export const capacityService = {
  getAll: (): Promise<CapacityConfig[]> =>
    request<any>('/admin/estado').then((estado: any) =>
      (estado.detallePorTipo as any[]).map((d) => ({
        id: d.id ?? Math.random(), 
        tipo_vehiculo: d.tipoVehiculo,
        capacidad_total: d.capacidadAsignada, 
        ocupacion_actual: d.ocupacionActual,
      }))
    ),

  update: (data: UpdateCapacityRequest): Promise<void> => {
    const tipo = (data as any).tipo_vehiculo || (data as any).tipo_veh_culo;
    return request<void>('/admin/actualizar', {
      method: 'PUT',
      body: JSON.stringify({ 
        tipo: tipo, 
        nuevaCapacidad: data.capacidad_total 
      }),
    });
  },

  getResumenGlobal: (): Promise<any> =>
    request<any>('/admin/estado'),
};

// =============================================================================
// 3. TARIFAS (US-005)
// =============================================================================
export const rateService = {
  getAll: (): Promise<Rate[]> =>
    request<any[]>('/tarifas/todas').then(list => list.map(mapTarifaToRate)),

  create: (data: CreateRateRequest): Promise<Rate> =>
    request<any>('/tarifas/crear', {
      method: 'POST', 
      body: JSON.stringify({
        tipoVehiculo: data.tipo_vehiculo || data.tipo_vehiculo,
        valorHora: data.tarifa_hora,
        valorDiaCompleto: data.tarifa_dia_completo, 
        horaInicio: data.aplica_desde,
        horaFin: data.aplica_hasta, 
        esFestivo: data.es_festivo ?? false,
      }),
    }).then(mapTarifaToRate),

  update: (id: number, data: Partial<CreateRateRequest>): Promise<Rate> =>
    request<any>(`/tarifas/actualizar/${id}`, {
      method: 'PUT', 
      body: JSON.stringify({
        tipoVehiculo: data.tipo_vehiculo, // Corregido el typo 'tipo_veh_culo'
        valorHora: data.tarifa_hora,
        valorDiaCompleto: data.tarifa_dia_completo,
        horaInicio: data.aplica_desde,
        horaFin: data.aplica_hasta,
        esFestivo: data.es_festivo,
      }),
    }).then(mapTarifaToRate),

  deactivate: (id: number): Promise<void> =>
    request<void>(`/tarifas/eliminar/${id}`, { method: 'DELETE' }),
};

// =============================================================================
// 4. PLANES DE ABONADO (US-006)
// =============================================================================
export const planService = {
  getAll: (soloActivos = false) => 
    request<PlanAbonado[]>(`/admin/planes-abonado?soloActivos=${soloActivos}`),

  create: (data: Omit<PlanAbonado, 'id' | 'activo'>) => {
    return request<PlanAbonado>('/admin/planes-abonado', { 
      method: 'POST', 
      body: JSON.stringify({
        nombre: data.nombre,
        tipoVehiculo: (data as any).tipo_vehiculo || (data as any).tipoVehiculo,
        precioMensual: (data as any).precio_mensual || (data as any).precioMensual,
        entradasIlimitadas: (data as any).entradas_ilimitadas ?? (data as any).entradasIlimitadas,
        maxEntradas: (data as any).max_entradas ?? (data as any).maxEntradas,
        horarioInicio: (data as any).horario_permitido_inicio || (data as any).horarioInicio,
        horarioFin: (data as any).horario_permitido_fin || (data as any).horarioFin
      }) 
    });
  },

  update: (id: number, data: Partial<PlanAbonado>) =>
    request<PlanAbonado>(`/admin/planes-abonado/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({
        nombre: data.nombre,
        tipoVehiculo: (data as any).tipo_vehiculo || (data as any).tipoVehiculo,
        precioMensual: (data as any).precio_mensual || (data as any).precioMensual,
        entradasIlimitadas: (data as any).entradas_ilimitadas ?? (data as any).entradasIlimitadas,
        maxEntradas: (data as any).max_entradas ?? (data as any).maxEntradas,
        horarioInicio: (data as any).horario_permitido_inicio || (data as any).horarioInicio,
        horarioFin: (data as any).horario_permitido_fin || (data as any).horarioFin
      }) 
    }),

  deactivate: (id: number) =>
    request<void>(`/admin/planes-abonado/${id}/desactivar`, { method: 'PATCH' }),
};

// =============================================================================
// 5. VEHÍCULOS (US-007, US-008)
// =============================================================================
export const vehicleService = {
  getMyVehicles: () => 
    request<Vehiculo[]>('/vehiculos'),

  register: (data: Omit<Vehiculo, 'id'>) =>
    request<Vehiculo>('/vehiculos', { 
      method: 'POST', 
      body: JSON.stringify({
        placa: data.placa,
        tipoVehiculo: (data as any).tipo_vehiculo || (data as any).tipoVehiculo,
        marca: data.marca,
        modelo: data.modelo,
        color: data.color
      }) 
    }),

  update: (id: number, data: Partial<Omit<Vehiculo, 'id' | 'placa'>>) =>
    request<Vehiculo>(`/vehiculos/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({
        tipoVehiculo: (data as any).tipo_vehiculo || (data as any).tipoVehiculo,
        marca: data.marca,
        modelo: data.modelo,
        color: data.color
      }) 
    }),

  delete: (id: number) =>
    request<void>(`/vehiculos/${id}`, { method: 'DELETE' }),
};

// =============================================================================
// 6. SUSCRIPCIONES (US-009, US-010, US-011, US-012)
// =============================================================================
export const subscriptionService = {
  getMySubscriptions: () => 
    request<Suscripcion[]>('/suscripciones/mis-suscripciones'),

  purchase: (data: { plan_id: number; vehiculo_id: number; fecha_inicio?: string; referencia_pago: string }) =>
    request<Suscripcion>('/suscripciones', { 
      method: 'POST', 
      body: JSON.stringify({
        planId: data.plan_id,
        vehiculoId: data.vehiculo_id,
        fechaInicio: data.fecha_inicio,
        referenciaPago: data.referencia_pago
      }) 
    }),

  renew: (id: number, data: { plan_id: number; referencia_pago: string }) =>
    request<Suscripcion>(`/suscripciones/${id}/renovar`, { 
      method: 'POST', 
      body: JSON.stringify({
        planId: data.plan_id,
        referenciaPago: data.referencia_pago
      }) 
    }),

  cancelByAdmin: (id: number, motivo: string) =>
    request<Suscripcion>(`/suscripciones/admin/${id}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ motivo })
    }),
};

// =============================================================================
// 7. OPERADOR - REGISTRO DE ESTACIONAMIENTOS (US-013, US-014, US-015)
// =============================================================================
export const parkingService = {
  registrarEntradaOcasional: (placa: string, tipoVehiculo: string) =>
    request<any>('/estacionamientos/entrada-ocasional', {
      method: 'POST',
      body: JSON.stringify({ placa, tipoVehiculo })
    }),

  registrarEntradaAbonado: (placa: string) =>
    request<any>('/estacionamientos/entrada-abonado', {
      method: 'POST',
      body: JSON.stringify({ placa })
    }),

  registrarSalidaYCobrar: (placaOTicket: string, metodoPago: string) =>
    request<any>('/estacionamientos/salida', {
      method: 'PUT',
      body: JSON.stringify({ placaOTicket, metodoPago })
    }),
};