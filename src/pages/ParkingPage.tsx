import React, { useState } from 'react';
import { parkingService } from '../services/api';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Button } from '../components/atoms/Button';
import { AlertMessage } from '../components/molecules/AlertMessage';

type TabType = 'ocasional' | 'abonado' | 'salida';

export function ParkingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ocasional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para Ingresos (Ocasional / Abonado)
  const [placa, setPlaca] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('CARRO');

  // Estados para Salidas y Facturación
  const [placaOTicket, setPlacaOTicket] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  // Estados para imprimir resultados en pantalla
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [recaudoResult, setRecaudoResult] = useState<any>(null);

  function limpiarResultados() {
    setError('');
    setSuccessMessage('');
    setTicketResult(null);
    setRecaudoResult(null);
  }

  // US-013: Registrar Entrada de Vehículo Ocasional
  async function handleEntradaOcasional(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) { setError('La placa es obligatoria'); return; }
    
    setLoading(true);
    limpiarResultados();

    try {
      const res = await parkingService.registrarEntradaOcasional(placa, tipoVehiculo);
      setTicketResult(res);
      setSuccessMessage(`¡Ingreso Ocasional Exitoso! Ticket generado.`);
      setPlaca('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar entrada ocasional');
    } finally {
      setLoading(false);
    }
  }

  // US-014: Registrar Entrada de Vehículo Abonado (Suscrito)
  async function handleEntradaAbonado(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) { setError('La placa del abonado es obligatoria'); return; }
    
    setLoading(true);
    limpiarResultados();

    try {
      const res = await parkingService.registrarEntradaAbonado(placa);
      setTicketResult(res);
      setSuccessMessage(`¡Ingreso de Abonado Autorizado! Verificación horaria correcta.`);
      setPlaca('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acceso Denegado: Suscripción inválida o fuera de horario');
    } finally {
      setLoading(false);
    }
  }

  // US-015: Registrar Salida, Calcular Permanencia y Cobrar Tarifa
  async function handleSalidaYCobrar(e: React.FormEvent) {
    e.preventDefault();
    if (!placaOTicket.trim()) { setError('Debe ingresar la placa o el número de tiquete'); return; }

    setLoading(true);
    limpiarResultados();

    try {
      const res = await parkingService.registrarSalidaYCobrar(placaOTicket, metodoPago);
      setRecaudoResult(res);
      setSuccessMessage('Salida procesada correctamente. Cupo liberado en el inventario.');
      setPlacaOTicket('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al liquidar salida del vehículo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Operativas */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('ocasional'); limpiarResultados(); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'ocasional' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ▷ Entrada Ocasional (US-013)
        </button>
        <button
          onClick={() => { setActiveTab('abonado'); limpiarResultados(); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'abonado' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ★ Entrada Abonado (US-014)
        </button>
        <button
          onClick={() => { setActiveTab('salida'); limpiarResultados(); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'salida' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚿ Registrar Salida y Cobro (US-015)
        </button>
      </div>

      {error && <AlertMessage message={error} />}
      {successMessage && <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-sm font-medium">{successMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMNA FORMULARIOS */}
        <Card className="p-6 lg:col-span-2">
          {activeTab === 'ocasional' && (
            <form onSubmit={handleEntradaOcasional} className="space-y-4">
              <h3 className="text-base font-bold text-slate-200">Registro de Entrada Ocasional</h3>
              <p className="text-xs text-slate-500">Asigna un tiquete base cobrado según las tarifas vigentes por hora.</p>
              
              <Input
                label="Placa del Vehículo"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej: AAA123"
              />
              <Select
                label="Tipo de Vehículo"
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value)}
                options={[
                  { value: 'CARRO', label: 'Carro' },
                  { value: 'MOTO', label: 'Moto' },
                  { value: 'CAMIONETA', label: 'Camioneta' },
                ]}
              />
              <Button type="submit" loading={loading} className="w-full">Registrar Entrada</Button>
            </form>
          )}

          {activeTab === 'abonado' && (
            <form onSubmit={handleEntradaAbonado} className="space-y-4">
              <h3 className="text-base font-bold text-slate-200">Validación de Ingreso para Abonados</h3>
              <p className="text-xs text-slate-500">El sistema comprobará la vigencia de la suscripción, días y franjas horarias permitidas.</p>
              
              <Input
                label="Placa Registrada"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej: FGH987"
              />
              <Button type="submit" loading={loading} className="w-full">Verificar y Registrar</Button>
            </form>
          )}

          {activeTab === 'salida' && (
            <form onSubmit={handleSalidaYCobrar} className="space-y-4">
              <h3 className="text-base font-bold text-slate-200">Cierre de Servicio y Recaudo</h3>
              <p className="text-xs text-slate-500">Calcula de forma exacta el tiempo transcurrido redondeando la fracción de hora hacia arriba.</p>
              
              <Input
                label="Buscar por Placa o Código de Ticket"
                value={placaOTicket}
                onChange={(e) => setPlacaOTicket(e.target.value)}
                placeholder="Ej: TKT-000001 o AAA123"
              />
              <Select
                label="Método de Recaudo"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                options={[
                  { value: 'EFECTIVO', label: 'Efectivo' },
                  { value: 'NEQUI', label: 'Nequi / QR Bancolombia' },
                  { value: 'TARJETA', label: 'Tarjeta de Crédito / Débito' },
                ]}
              />
              <Button type="submit" loading={loading} className="w-full">Liquidar y Liberar Celda</Button>
            </form>
          )}
        </Card>

        {/* COLUMNA COMPROBANTES VIRTUALES */}
        <div className="space-y-4">
          {ticketResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden font-mono text-xs text-slate-300 space-y-3">
              <div className="text-center border-b border-dashed border-slate-800 pb-3">
                <p className="font-black text-sm text-teal-400">PARKINGFLOW ITM</p>
                <p className="text-[10px] text-slate-600">TIQUETE DIGITAL DE INGRESO</p>
              </div>
              <div className="flex justify-between"><span>NRO TICKET:</span><span className="font-bold text-slate-100">{ticketResult.numeroTicket}</span></div>
              <div className="flex justify-between"><span>PLACA:</span><span className="font-bold text-slate-100">{ticketResult.placa}</span></div>
              <div className="flex justify-between"><span>CLASE:</span><span>{ticketResult.tipoVehiculo}</span></div>
              <div className="flex justify-between"><span>INGRESO:</span><span>{new Date(ticketResult.horaEntrada).toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-dashed border-slate-800 pt-3">
                <span>RÉGIMEN:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${ticketResult.esAbonado ? 'bg-teal-500/20 text-teal-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {ticketResult.esAbonado ? 'ABONADO' : 'OCASIONAL'}
                </span>
              </div>
            </div>
          )}

          {recaudoResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden font-mono text-xs text-slate-300 space-y-3">
              <div className="text-center border-b border-dashed border-slate-800 pb-3">
                <p className="font-black text-sm text-emerald-400">RECIBO DE RECAUDO</p>
                <p className="text-[10px] text-slate-600">FACTURA SIMPLIFICADA DE SALIDA</p>
              </div>
              <div className="flex justify-between"><span>TICKET REF:</span><span>{recaudoResult.numeroTicket}</span></div>
              <div className="flex justify-between"><span>PLACA:</span><span className="font-bold text-slate-100">{recaudoResult.placa}</span></div>
              <div className="flex justify-between"><span>PERMANENCIA:</span><span className="text-slate-100">{recaudoResult.minutosPermanencia} Minutos</span></div>
              <div className="flex justify-between"><span>MEDIO PAGO:</span><span>{recaudoResult.metodoPago}</span></div>
              <div className="flex justify-between border-t border-dashed border-slate-800 pt-3 text-sm font-bold text-slate-100">
                <span>TOTAL COBRADO:</span>
                <span className="text-emerald-400">${recaudoResult.montoCobrado.toLocaleString('es-CO')} COP</span>
              </div>
              <p className="text-center text-[9px] text-slate-600 border-t border-dashed border-slate-800 pt-2">Estado del Servicio: {recaudoResult.estado}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}