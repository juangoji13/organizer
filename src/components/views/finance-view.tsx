'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

export function FinanceView() {
  const { clients, jobs } = useWorkspace();
  const [range, setRange] = useState<TimeRange>('week');

  // Calculate numbers based on data
  const totalBilled = jobs.reduce((acc, j) => acc + j.totalPrice, 0);
  const totalPaid = jobs.reduce((acc, j) => acc + j.paidAmount, 0);
  const totalPending = totalBilled - totalPaid;

  const clientsWithDebt = clients.filter((c) => c.totalPending > 0);

  const openWhatsApp = (phone: string, clientName: string, debt: number) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Finanzas & Cobros
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Resumen de ingresos, abonos y control de pagos pendientes por cliente.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 border border-zinc-200/60 text-xs overflow-x-auto">
          {[
            { id: 'today', label: 'Hoy' },
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Mes' },
            { id: 'year', label: 'Año' },
            { id: 'all', label: 'Siempre' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id as TimeRange)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                range === item.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Cards (Clean, White, Editorial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Total Cobrado ({range === 'week' ? 'Semana' : 'Seleccionado'})
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            ${totalPaid.toLocaleString()} <span className="text-xs font-normal text-zinc-400">COP</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Fondos recibidos y confirmados
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Saldo Pendiente por Cobrar
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-700">
            ${totalPending.toLocaleString()} <span className="text-xs font-normal text-zinc-400">COP</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">
            Distribuido en {clientsWithDebt.length} clientes activos
          </p>
        </div>
      </div>

      {/* Debtors Section */}
      <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Clientes con Saldo Pendiente
            </h2>
            <p className="text-xs text-zinc-400">
              Escribe directamente al chat para coordinar el pago.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
            {clientsWithDebt.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-zinc-100">
          {clientsWithDebt.map((client) => (
            <div
              key={client.id}
              className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
            >
              <div>
                <h3 className="text-sm font-medium text-zinc-900">
                  {client.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span>Último contacto: {client.lastActive}</span>
                  <span>•</span>
                  <span>{client.totalJobs} trabajos realizados</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-900">
                    ${client.totalPending.toLocaleString()} COP
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Total pagado: ${client.totalPaid.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => openWhatsApp(client.phone, client.name, client.totalPending)}
                  className="p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
                  title="Abrir WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {clientsWithDebt.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-400">
              No tienes cobros pendientes registrados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
