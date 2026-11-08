'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, CheckCircle2, Target, CreditCard, Pencil, Check, X } from 'lucide-react';
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { ClientJob } from '@/types/organizer';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export function FinanceView() {
  const { clients, jobs } = useWorkspace();
  const [range, setRange] = useState<TimeRange>('week');
  const [weeklyGoal, setWeeklyGoal] = useState<number>(400000); // 400.000 COP meta semanal inicial
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('400000');
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-11-08');
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<ClientJob | null>(null);

  useEffect(() => {
    try {
      setCurrentDateStr(new Date().toISOString().split('T')[0]);
      const savedGoal = localStorage.getItem('organizer_weekly_goal');
      if (savedGoal) {
        const parsed = parseInt(savedGoal, 10);
        if (parsed > 0) setWeeklyGoal(parsed);
      }
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

  // Weekly Goal Calculation
  const weekJobs = jobs.filter((j) => isInThisWeek(j.deadlineDate));
  const weekPaid = weekJobs.reduce((acc, j) => acc + j.paidAmount, 0);
  const goalPercent = Math.min(100, Math.round((weekPaid / (weeklyGoal || 1)) * 100));

  // Clients with pending debt
  const clientsWithDebt = clients.filter((c) => c.totalPending > 0);

  const openWhatsAppCobro = (phone: string, clientName: string, debt: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${clientName}, ¿cómo estás? Te escribo para recordarte el saldo pendiente de $${debt.toLocaleString()} COP de tus trabajos.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(goalInput.replace(/\D/g, ''), 10);
    if (val && val > 0) {
      setWeeklyGoal(val);
      try {
        localStorage.setItem('organizer_weekly_goal', val.toString());
      } catch {
        // ignore
      }
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
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
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs min-h-[34px] ${
                  range === item.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meta Semanal Tracker (Interactivo y editable con 1 toque) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-700" />
            <span className="text-xs font-semibold text-zinc-800">
              Meta Semanal de Ingresos
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-900 font-mono tabular-nums">
            {goalPercent}% alcanzado
          </span>
        </div>

        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden mb-2.5">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-300"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500">
          <span>
            Cobrado esta semana:{' '}
            <strong className="text-zinc-900 font-mono font-bold tabular-nums">
              ${weekPaid.toLocaleString()} COP
            </strong>
          </span>

          {/* Botón táctil para editar meta */}
          {!isEditingGoal ? (
            <button
              type="button"
              onClick={() => {
                setGoalInput(weeklyGoal.toString());
                setIsEditingGoal(true);
              }}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200/70 hover:border-zinc-300 transition-all self-start sm:self-auto"
              title="Toca para cambiar el monto de la meta semanal"
            >
              <span className="text-zinc-400">Meta:</span>
              <span className="font-mono font-bold text-zinc-900 tabular-nums">
                ${weeklyGoal.toLocaleString()} COP
              </span>
              <Pencil className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
            </button>
          ) : (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs text-zinc-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-32 pl-6 pr-2 py-1 text-xs font-mono font-bold border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 bg-white"
                  autoFocus
                  placeholder="400000"
                />
              </div>
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                title="Guardar meta"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                title="Cancelar edición"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Balance Contable Tipográfico Refinado (Ingresos del período vs Saldo pendiente) */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-4 mb-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Balance Contable
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs font-medium text-zinc-600">
              {range === 'today'
                ? 'Vista de Hoy'
                : range === 'week'
                ? 'Esta Semana'
                : range === 'month'
                ? 'Este Mes'
                : 'Histórico Completo'}
            </span>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'encargo registrado' : 'encargos registrados'}
          </div>
        </div>

        {/* Ledger Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Ingresos del Período */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Ingresos del Período
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                Liquidado
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums">
                ${totalPaid.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-sans">
                COP
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Dinero recaudado y abonado a tus cuentas bancarias.
            </p>
          </div>

          {/* Saldo Pendiente por Recaudar */}
          <div className="space-y-1.5 sm:border-l sm:border-zinc-100 sm:pl-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Saldo Pendiente por Recaudar
              </span>
              {totalPending > 0 ? (
                <span className="ml-auto inline-flex items-center text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                  Por cobrar
                </span>
              ) : (
                <span className="ml-auto inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  Al día
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${
                  totalPending > 0 ? 'text-amber-900' : 'text-zinc-400'
                }`}
              >
                ${totalPending.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-sans">
                COP
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Total pendiente que tus clientes deben transferir tras entregas.
            </p>
          </div>
        </div>

        {/* Resumen footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            Facturado total en este período:{' '}
            <strong className="text-zinc-900 font-mono font-bold tabular-nums">
              ${totalBilled.toLocaleString()} COP
            </strong>
          </div>
          {totalPending > 0 && (
            <div className="text-amber-800 font-medium">
              {clientsWithDebt.length}{' '}
              {clientsWithDebt.length === 1 ? 'cliente con saldo pendiente' : 'clientes con saldo pendiente'}
            </div>
          )}
        </div>
      </div>

      {/* Directorio de Cobros Pendientes (WhatsApp con 1 Toque y Registro Inmediato de Abono) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Cobros Pendientes ({clientsWithDebt.length})
          </h2>
          <span className="text-xs font-medium text-zinc-500">
            Mensajes directos y registro de abonos
          </span>
        </div>

        {clientsWithDebt.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 text-center">
            <p className="text-xs text-zinc-500">
              No tienes cuentas pendientes por cobrar en este momento. ¡Todo al día!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {clientsWithDebt.map((c) => {
              const clientJobsWithDebt = jobs.filter((j) => {
                const cPhoneClean = (c.phone || '').replace(/\D/g, '');
                const jPhoneClean = (j.clientPhone || '').replace(/\D/g, '');
                const matchesPhone = cPhoneClean && jPhoneClean && cPhoneClean === jPhoneClean;
                const matchesName = j.clientName?.toLowerCase().trim() === c.name?.toLowerCase().trim();
                const hasDebt = j.totalPrice - j.paidAmount > 0;
                return (matchesPhone || matchesName) && hasDebt;
              });

              const targetJob = clientJobsWithDebt[0] || null;

              return (
                <div
                  key={c.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {c.name}
                      </span>
                      {clientJobsWithDebt.length > 1 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {clientJobsWithDebt.length} encargos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {c.totalJobs} trabajos registrados • Activo {c.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-bold text-amber-900 font-mono tabular-nums">
                      ${c.totalPending.toLocaleString()} COP
                    </span>

                    <div className="flex items-center gap-2">
                      {targetJob && (
                        <button
                          type="button"
                          onClick={() => setSelectedJobForPayment(targetJob)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 min-h-[38px] transition-colors"
                          title={`Registrar abono de ${c.name}`}
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Abonar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openWhatsAppCobro(c.phone, c.name, c.totalPending)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-semibold min-h-[38px] transition-colors"
                        title={`Recordar cobro por WhatsApp a ${c.name}`}
                        aria-label={`Recordar cobro por WhatsApp a ${c.name}`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-700" />
                        <span>Cobrar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Partial Payment Modal */}
      <PartialPaymentModal
        job={selectedJobForPayment}
        isOpen={Boolean(selectedJobForPayment)}
        onClose={() => setSelectedJobForPayment(null)}
      />
    </div>
  );
}
