'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export function TodayView() {
  const { jobs, mode } = useWorkspace();
  const [filterToday, setFilterToday] = useState<'all' | 'pending'>('all');

  const urgentJobs = jobs.filter((j) => j.isUrgentToday);
  const pendingUrgent = urgentJobs.filter((j) => j.status !== 'delivered');
  const completedUrgent = urgentJobs.filter((j) => j.status === 'delivered');
  
  // Total money to collect from today's urgent jobs
  const todayPendingDebt = urgentJobs.reduce(
    (acc, j) => acc + (j.totalPrice - j.paidAmount),
    0
  );

  const displayedJobs = filterToday === 'pending' ? pendingUrgent : urgentJobs;

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Tight, Editorial Mobile Summary Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
              Agenda Prioritaria
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
              {mode === 'clients' ? 'Entregas de Hoy' : 'Mi Plan de Hoy'}
            </h1>
          </div>

          {/* Quick Filter Pill for Mobile */}
          <div className="flex items-center p-0.5 bg-zinc-100/90 rounded-lg border border-zinc-200/60 text-[11px] font-medium">
            <button
              onClick={() => setFilterToday('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterToday === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todos ({urgentJobs.length})
            </button>
            <button
              onClick={() => setFilterToday('pending')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterToday === 'pending'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Pendientes ({pendingUrgent.length})
            </button>
          </div>
        </div>

        {/* 3-Column Thumb KPI Strip */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          {/* Card 1: Pending jobs */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>Por Entregar</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5 tracking-tight font-mono tabular-nums">
              {pendingUrgent.length} <span className="text-[10px] font-normal text-zinc-500 font-sans">trabajos</span>
            </div>
          </div>

          {/* Card 2: Completed today */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Entregados</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5 tracking-tight font-mono tabular-nums">
              {completedUrgent.length} / {urgentJobs.length}
            </div>
          </div>

          {/* Card 3: Pending money today */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              <DollarSign className="w-3 h-3 text-amber-600" />
              <span>Por Cobrar</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-900 mt-0.5 tracking-tight font-mono tabular-nums">
              ${(todayPendingDebt / 1000).toFixed(0)}k <span className="text-[9px] font-normal text-zinc-500 font-sans">COP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discreet Mobile Swipe Tip (Visible on mobile too!) */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3 px-1">
        <span className="flex items-center gap-1 flex-wrap">
          <span>Deslizar:</span>
          <span className="text-emerald-800 font-medium">derecha ➔ entregar</span>
          <span>•</span>
          <span className="text-amber-900 font-medium">izquierda ➔ cobrar</span>
        </span>
        <span className="hidden sm:inline text-zinc-400">1 toque para copiar credenciales</span>
      </div>

      {/* Urgent Jobs List */}
      <div className="space-y-3">
        {displayedJobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <JobItem job={job} />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {displayedJobs.length === 0 && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-white shadow-xs">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200/50">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-zinc-800">
            {filterToday === 'pending'
              ? '¡Todo listo! No tienes tareas pendientes para hoy.'
              : 'No hay entregas programadas para hoy.'}
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Puedes consultar "Trabajos" en la barra inferior para ver los siguientes días.
          </p>
        </div>
      )}
    </div>
  );
}
