'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, CheckCircle2, Target, CreditCard, Pencil, Check, X } from 'lucide-react';
import { motion, animate } from 'motion/react';
import { spring } from '@animate-ui/react/utils/motion';
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { WhatsAppSummaryModal } from '@/components/finance/whatsapp-summary-modal';
import { ClientJob } from '@/types/organizer';

type TimeRange = 'today' | 'week' | 'month' | 'all';

function KineticNumber({
  value,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      type: 'spring',
      stiffness: 90,
      damping: 24,
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('es-CO')}
      {suffix}
    </span>
  );
}

export function FinanceView() {
  const { clients, jobs, showToast } = useWorkspace();
  const [range, setRange] = useState<TimeRange>('week');
  const [weeklyGoal, setWeeklyGoal] = useState<number>(400000); // 400.000 COP meta semanal inicial
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('400000');
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-11-08');
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<ClientJob | null>(null);

  // WhatsApp Summary Generator State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [hasCopiedInModal, setHasCopiedInModal] = useState<boolean>(false);

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

  // Generador de Resumen para WhatsApp (Balance del Día / Semana en 1 Toque)
  const buildWhatsAppSummary = () => {
    const rangeLabels: Record<TimeRange, string> = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      all: 'Histórico Completo',
    };

    let formattedDate = currentDateStr;
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
      const year = now.getFullYear();
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      formattedDate = `${day} ${cap(month)} ${year}`;
    } catch {
      formattedDate = currentDateStr;
    }

    const periodLabel = rangeLabels[range];

    // Entregados en este período
    const deliveredInPeriod = filteredJobs.filter(
      (j) => j.status === 'delivered' || j.status === 'completed'
    );
    const deliveredCount = deliveredInPeriod.length;
    const deliveredCountText = `${deliveredCount} ${deliveredCount === 1 ? 'encargo' : 'encargos'}`;

    // Encargos pendientes por entregar
    const pendingInPeriod = filteredJobs.filter(
      (j) => j.status !== 'delivered' && j.status !== 'completed' && j.status !== 'cancelled'
    );
    const pendingCount = pendingInPeriod.length;
    const pendingCountText = `${pendingCount} ${pendingCount === 1 ? 'encargo' : 'encargos'}`;

    // Lista de clientes con deuda pendiente y montos individuales
    const clientsWithPendingDebt = clients.filter((c) => c.totalPending > 0);
    const totalStreetDebt = clientsWithPendingDebt.reduce((acc, c) => acc + c.totalPending, 0);

    let clientDebtsText = '';
    if (clientsWithPendingDebt.length > 0) {
      clientDebtsText = clientsWithPendingDebt
        .map((c) => `• ${c.name}: $${c.totalPending.toLocaleString('es-CO')} COP`)
        .join('\n');
    } else {
      clientDebtsText = '• Ninguno (¡Cuentas al día!)';
    }

    return [
      `📊 Resumen Organizer - ${formattedDate}`,
      `🗓 Período: ${periodLabel}`,
      '',
      `📦 Entregados en este período: ${deliveredCountText}`,
      `💵 Total recaudado: $${totalPaid.toLocaleString('es-CO')} COP`,
      '',
      `⏳ Encargos pendientes por entregar: ${pendingCountText}`,
      '',
      '👥 Clientes con deuda pendiente:',
      clientDebtsText,
      '',
      `🔴 Total saldo por cobrar en la calle: $${totalStreetDebt.toLocaleString('es-CO')} COP`,
    ].join('\n');
  };

  const handleShareWhatsAppSummary = async () => {
    const summary = buildWhatsAppSummary();
    setGeneratedSummary(summary);
    setHasCopiedInModal(false);

    let copied = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(summary);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // ignore
      }
    }

    showToast({
      message: 'Resumen copiado para WhatsApp listo para pegar',
      type: 'success',
    });

    setIsWhatsAppModalOpen(true);
  };

  const handleCopyAgain = async () => {
    const textToCopy = generatedSummary || buildWhatsAppSummary();
    let copied = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // ignore
      }
    }

    setHasCopiedInModal(true);
    showToast({
      message: 'Resumen copiado para WhatsApp listo para pegar',
      type: 'success',
    });
    setTimeout(() => setHasCopiedInModal(false), 2000);
  };

  const handleOpenWhatsAppDirectly = () => {
    const textToOpen = generatedSummary || buildWhatsAppSummary();
    window.open(`https://wa.me/?text=${encodeURIComponent(textToOpen)}`, '_blank');
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
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              Flujo de Caja
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 mt-0.5">
              Finanzas & Cobros
            </h1>
          </div>

          {/* Timeframe Selector with Liquid layoutId sliding indicator */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-white/10 text-xs overflow-x-auto select-none self-start sm:self-auto">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'all', label: 'Histórico' },
            ].map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setRange(item.id as TimeRange)}
                className={`relative px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 text-xs min-h-[34px] ${
                  range === item.id
                    ? 'text-zinc-950 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {range === item.id && (
                  <motion.div
                    layoutId="financeRangePill"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Meta Semanal Tracker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Meta Semanal de Ingresos
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
            <KineticNumber value={goalPercent} suffix="%" /> alcanzado
          </span>
        </div>

        {/* Kinetic Progress Bar with spring physics */}
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden mb-2.5">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${goalPercent}%` }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Cobrado esta semana:{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 font-mono font-bold tabular-nums">
              <KineticNumber value={weekPaid} prefix="$" suffix=" COP" />
            </strong>
          </span>

          {/* Botón táctil para editar meta */}
          {!isEditingGoal ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setGoalInput(weeklyGoal.toString());
                setIsEditingGoal(true);
              }}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-zinc-200/70 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all self-start sm:self-auto cursor-pointer"
              title="Toca para cambiar el monto de la meta semanal"
            >
              <span className="text-zinc-400 dark:text-zinc-500">Meta:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                <KineticNumber value={weeklyGoal} prefix="$" suffix=" COP" />
              </span>
              <Pencil className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
            </motion.button>
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
                  className="w-32 pl-6 pr-2 py-1 text-xs font-mono font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                  autoFocus
                  placeholder="400000"
                />
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.92 }}
                className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                title="Guardar meta"
              >
                <Check className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsEditingGoal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cancelar edición"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          )}
        </div>
      </div>

      {/* Balance Contable Tipográfico Refinado */}
      <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-zinc-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Balance Contable
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {range === 'today'
                  ? 'Vista de Hoy'
                  : range === 'week'
                  ? 'Esta Semana'
                  : range === 'month'
                  ? 'Este Mes'
                  : 'Histórico Completo'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'encargo registrado' : 'encargos registrados'}
            </div>
          </div>

          {/* Botón Destacado: Compartir Resumen para WhatsApp */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleShareWhatsAppSummary}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow transition-all duration-150 cursor-pointer min-h-[38px]"
              title="Copiar balance al portapapeles y compartir por WhatsApp"
            >
              <span className="text-sm">📋</span>
              <span className="tracking-tight">Compartir Resumen para WhatsApp</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleOpenWhatsAppDirectly}
              className="inline-flex items-center justify-center p-2 rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-800/40 text-xs font-semibold min-h-[38px] min-w-[38px] transition-colors cursor-pointer"
              title="Abrir WhatsApp directamente con el resumen prellenado"
              aria-label="Abrir WhatsApp directamente con el resumen prellenado"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </motion.button>
          </div>
        </div>

        {/* Ledger Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Ingresos del Período */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Ingresos del Período
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                Liquidado
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono tabular-nums">
                <KineticNumber value={totalPaid} prefix="$" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 font-sans">
                COP
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Dinero recaudado y abonado a tus cuentas bancarias.
            </p>
          </div>

          {/* Saldo Pendiente por Recaudar */}
          <div className="space-y-1.5 sm:border-l sm:border-zinc-100 dark:sm:border-white/10 sm:pl-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Saldo Pendiente por Recaudar
              </span>
              {totalPending > 0 ? (
                <span className="ml-auto inline-flex items-center text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 px-2 py-0.5 rounded-full">
                  Por cobrar
                </span>
              ) : (
                <span className="ml-auto inline-flex items-center text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Al día
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${
                  totalPending > 0 ? 'text-amber-900 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <KineticNumber value={totalPending} prefix="$" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 font-sans">
                COP
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Total pendiente que tus clientes deben transferir tras entregas.
            </p>
          </div>
        </div>

        {/* Resumen footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Facturado total en este período:{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 font-mono font-bold tabular-nums">
              <KineticNumber value={totalBilled} prefix="$" suffix=" COP" />
            </strong>
          </div>
          {totalPending > 0 && (
            <div className="text-amber-800 dark:text-amber-400 font-medium">
              {clientsWithDebt.length}{' '}
              {clientsWithDebt.length === 1 ? 'cliente con saldo pendiente' : 'clientes con saldo pendiente'}
            </div>
          )}
        </div>
      </div>

      {/* Directorio de Cobros Pendientes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Cobros Pendientes ({clientsWithDebt.length})
          </h2>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Mensajes directos y registro de abonos
          </span>
        </div>

        {clientsWithDebt.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No tienes cuentas pendientes por cobrar en este momento. ¡Todo al día!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-white/5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
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
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {c.name}
                      </span>
                      {clientJobsWithDebt.length > 1 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {clientJobsWithDebt.length} encargos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {c.totalJobs} trabajos registrados • Activo {c.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-400 font-mono tabular-nums">
                      <KineticNumber value={c.totalPending} prefix="$" suffix=" COP" />
                    </span>

                    <div className="flex items-center gap-2">
                      {targetJob && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedJobForPayment(targetJob)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/40 min-h-[38px] transition-colors cursor-pointer"
                          title={`Registrar abono de ${c.name}`}
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>Abonar</span>
                        </motion.button>
                      )}

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openWhatsAppCobro(c.phone, c.name, c.totalPending)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold min-h-[38px] transition-colors cursor-pointer"
                        title={`Recordar cobro por WhatsApp a ${c.name}`}
                        aria-label={`Recordar cobro por WhatsApp a ${c.name}`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>Cobrar</span>
                      </motion.button>
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

      {/* WhatsApp Summary Modal */}
      <WhatsAppSummaryModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        summaryText={generatedSummary}
        onCopyAgain={handleCopyAgain}
        hasCopied={hasCopiedInModal}
        onOpenWhatsApp={handleOpenWhatsAppDirectly}
      />
    </div>
  );
}
