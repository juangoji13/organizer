'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, ArrowUpRight, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

type TimeRange = 'today' | 'week' | 'month' | 'all';

export function FinanceView() {
  const { clients, jobs } = useWorkspace();
  const [range, setRange] = useState<TimeRange>('week');

  // Calculations
  const totalBilled = jobs.reduce((acc, j) => acc + j.totalPrice, 0);
  const totalPaid = jobs.reduce((acc, j) => acc + j.paidAmount, 0);
  const totalPending = totalBilled - totalPaid;

  const clientsWithDebt = clients.filter((c) => c.totalPending > 0);

  const openWhatsAppCobro = (phone: string, clientName: string, debt: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${clientName}, ¿cómo estás? Te escribo para coordinar el pago pendiente de $${debt.toLocaleString()} COP de tus trabajos.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Control Financiero
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
              Finanzas & Cobros
            </h1>
          </div>

          {/* Timeframe Selector (Thumb Friendly) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60 text-xs overflow-x-auto select-none">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Mes' },
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

      {/* Crisp Balance Overview (Cobrado vs Pendiente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Cobrado Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/85 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Total Cobrado
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              Recibido
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-2">
            ${totalPaid.toLocaleString()} <span className="text-xs font-normal text-zinc-400">COP</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Fondos transferidos y verificados en cuenta
          </p>
        </div>

        {/* Pendiente Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/85 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Saldo Pendiente
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200/50 px-2 py-0.5 rounded">
              {clientsWithDebt.length} clientes
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-900 mt-2">
            ${totalPending.toLocaleString()} <span className="text-xs font-normal text-zinc-400">COP</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Por cobrar en entregas en curso y finalizadas
          </p>
        </div>
      </div>

      {/* Debtors Section */}
      <div className="rounded-xl border border-zinc-200/85 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/40">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 font-mono">
              Clientes con Saldo Pendiente
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Toca el botón para enviar recordatorio directo a WhatsApp.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-50/80 px-2.5 py-0.5 rounded border border-amber-200/50">
            {clientsWithDebt.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-zinc-100">
          {clientsWithDebt.map((client) => (
            <div
              key={client.id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                    {client.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono hidden xs:inline">
                    +{client.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span>Último contacto: {client.lastActive}</span>
                  <span>•</span>
                  <span>{client.totalJobs} trabajos</span>
                </div>
              </div>

              {/* Debt display and 1-tap WhatsApp trigger */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold text-amber-900">
                    ${client.totalPending.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Abonado: ${client.totalPaid.toLocaleString()}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => openWhatsAppCobro(client.phone, client.name, client.totalPending)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 text-xs font-medium transition-colors min-h-[40px]"
                  title={`Recordar cobro a ${client.name}`}
                  aria-label={`Recordar cobro por WhatsApp a ${client.name}`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Cobrar</span>
                </motion.button>
              </div>
            </div>
          ))}

          {clientsWithDebt.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2 opacity-80" />
              ¡Excelente! No tienes pagos pendientes por cobrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
