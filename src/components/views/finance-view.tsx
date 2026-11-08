'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, CheckCircle2, Target, TrendingUp } from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export function FinanceView() {
  const { clients, jobs } = useWorkspace();
  const [range, setRange] = useState<TimeRange>('week');
  const [weeklyGoal] = useState<number>(400000); // 400.000 COP meta semanal
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-11-08');

  useEffect(() => {
    try {
      setCurrentDateStr(new Date().toISOString().split('T')[0]);
    } catch {
      // fallback
    }
  }, []);

  // Helper to check if a date string is in the current week
  const isInThisWeek = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      const now = new Date(currentDateStr);
      const target = new Date(dateStr);
      const diffTime = Math.abs(target.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } catch {
      return true;
    }
  };

  // Helper to check if in this month
  const isInThisMonth = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      const now = new Date(currentDateStr);
      const target = new Date(dateStr);
      return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
    } catch {
      return true;
    }
  };

  // Dynamic filtered jobs based on selected time range
  const filteredJobs = jobs.filter((j) => {
    if (range === 'today') return j.deadlineDate === currentDateStr || j.isUrgentToday;
    if (range === 'week') return isInThisWeek(j.deadlineDate);
    if (range === 'month') return isInThisMonth(j.deadlineDate);
    return true; // 'all'
  });

  const totalBilled = filteredJobs.reduce((acc, j) => acc + j.totalPrice, 0);
  const totalPaid = filteredJobs.reduce((acc, j) => acc + j.paidAmount, 0);
  const totalPending = totalBilled - totalPaid;
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

  // Weekly Goal Calculation
  const weekJobs = jobs.filter((j) => isInThisWeek(j.deadlineDate));
  const weekPaid = weekJobs.reduce((acc, j) => acc + j.paidAmount, 0);
  const goalPercent = Math.min(100, Math.round((weekPaid / weeklyGoal) * 100));

  // Clients with pending debt
  const clientsWithDebt = clients.filter((c) => c.totalPending > 0);

  const openWhatsAppCobro = (phone: string, clientName: string, debt: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${clientName}, ¿cómo estás? Te escribo para recordarte el saldo pendiente de $${debt.toLocaleString()} COP de tus trabajos.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Flujo de Caja
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-0.5">
              Finanzas & Cobros
            </h1>
          </div>

          {/* Timeframe Selector (Real dynamic filtering) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60 text-xs overflow-x-auto select-none self-start sm:self-auto">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'all', label: 'Histórico' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setRange(item.id as TimeRange)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-[11px] ${
                  range === item.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 4: Meta Semanal Tracker */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-700" />
            <span className="text-xs font-semibold text-zinc-800">
              Meta Semanal de Ingresos
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-900 font-mono">
            {goalPercent}% alcanzado
          </span>
        </div>

        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-300"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            Cobrado esta semana: <strong className="text-zinc-800 font-mono">${weekPaid.toLocaleString()} COP</strong>
          </span>
          <span className="text-zinc-400 font-mono">
            Meta: ${weeklyGoal.toLocaleString()} COP
          </span>
        </div>
      </div>

      {/* Tarjetas de Resumen Dinámico (Cobrado vs Pendiente) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Recaudado */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Total Cobrado
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40 px-1.5 py-0.2 rounded">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
              Recibido
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 font-mono">
            ${totalPaid.toLocaleString()} <span className="text-xs font-normal text-zinc-400 font-sans">COP</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {filteredJobs.length} trabajos en este período
          </p>
        </div>

        {/* Saldo Pendiente */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Por Cobrar
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200/50 px-1.5 py-0.2 rounded">
              Pendiente
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-900 mt-2 font-mono">
            ${totalPending.toLocaleString()} <span className="text-xs font-normal text-zinc-400 font-sans">COP</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Saldo por liquidar con clientes
          </p>
        </div>

        {/* Ratio de Cobranza */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Efectividad de Cobro
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-2 font-mono">
            {collectionRate}%
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Porcentaje recaudado del total facturado
          </p>
        </div>
      </div>

      {/* Directorio de Cobros Pendientes (WhatsApp con 1 Toque) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
            Cobros Pendientes por WhatsApp ({clientsWithDebt.length})
          </h2>
          <span className="text-[11px] font-medium text-zinc-400">
            Mensajes directos con 1 toque
          </span>
        </div>

        {clientsWithDebt.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-zinc-200/80 text-center">
            <p className="text-xs text-zinc-500">
              No tienes cuentas pendientes por cobrar en este momento. ¡Todo al día!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {clientsWithDebt.map((c) => (
              <div
                key={c.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {c.totalJobs} trabajos registrados • Activo {c.lastActive}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-amber-900 font-mono">
                    ${c.totalPending.toLocaleString()} COP
                  </span>

                  <button
                    onClick={() => openWhatsAppCobro(c.phone, c.name, c.totalPending)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-medium transition-colors"
                    title={`Recordar cobro por WhatsApp a ${c.name}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cobrar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
