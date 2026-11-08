'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function TodayView() {
  const { jobs } = useWorkspace();
  const [filterToday, setFilterToday] = useState<'all' | 'pending'>('all');
  const [todayDateFormatted, setTodayDateFormatted] = useState<string>('Hoy');

  useEffect(() => {
    try {
      const now = new Date();
      const weekday = now.toLocaleDateString('es-ES', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('es-ES', { month: 'long' });
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      setTodayDateFormatted(`Hoy, ${cap(weekday)} ${day} de ${cap(month)}`);
    } catch {
      setTodayDateFormatted('Hoy');
    }
  }, []);

  const urgentJobs = jobs.filter((j) => j.isUrgentToday);
  const pendingUrgent = urgentJobs.filter((j) => j.status !== 'delivered');
  
  // Total money to collect from today's urgent jobs
  const todayPendingDebt = urgentJobs.reduce(
    (acc, j) => acc + Math.max(0, j.totalPrice - j.paidAmount),
    0
  );

  const displayedJobs = filterToday === 'pending' ? pendingUrgent : urgentJobs;

  return (
    <div className="max-w-3xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6">
      {/* Clean Editorial Header */}
      <div className="mb-5 sm:mb-7">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              {todayDateFormatted}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal mt-1 flex items-center gap-1.5">
              <span>
                {urgentJobs.length} {urgentJobs.length === 1 ? 'entrega' : 'entregas'} para hoy
              </span>
              <span className="text-zinc-300">•</span>
              <span className="font-mono tabular-nums text-zinc-700 font-medium">
                ${todayPendingDebt.toLocaleString('es-CO')} COP por liquidar
              </span>
            </p>
          </div>

          {/* Minimalist Quick Filter */}
          <div className="inline-flex items-center p-0.5 bg-zinc-100/90 rounded-lg border border-zinc-200/60 text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterToday('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterToday === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs font-medium'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Todos {urgentJobs.length > 0 && <span className="ml-1 text-[11px] text-zinc-400 font-mono">({urgentJobs.length})</span>}
            </button>
            <button
              type="button"
              onClick={() => setFilterToday('pending')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterToday === 'pending'
                  ? 'bg-white text-zinc-900 shadow-xs font-medium'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Pendientes {pendingUrgent.length > 0 && <span className="ml-1 text-[11px] text-zinc-400 font-mono">({pendingUrgent.length})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Discreet Mobile Swipe Tip */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-3 px-0.5">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span>Deslizar:</span>
          <span className="text-emerald-700 font-medium">derecha ➔ entregar</span>
          <span className="text-zinc-300">•</span>
          <span className="text-amber-800 font-medium">izquierda ➔ cobrar</span>
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
