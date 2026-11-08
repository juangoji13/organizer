'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function TodayView() {
  const { jobs, mode } = useWorkspace();

  const urgentJobs = jobs.filter((j) => j.isUrgentToday);
  const remainingToday = urgentJobs.filter((j) => j.status !== 'delivered');

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Editorial Welcome Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {mode === 'clients' ? 'Entregas del Día' : 'Mi Plan de Hoy'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {remainingToday.length > 0 ? (
              <span>
                Tienes <strong className="text-zinc-900 font-semibold">{remainingToday.length} trabajos</strong> prioritarios con fecha límite hoy.
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                Estás al día con las entregas de hoy.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200/60 font-medium">
            <span>{urgentJobs.length - remainingToday.length} de {urgentJobs.length} completados</span>
          </div>
        </div>
      </div>

      {/* Swipe Hint (Subtle, professional) */}
      <div className="mb-4 text-[11px] text-zinc-400 flex items-center justify-between px-1">
        <span>Desliza a la derecha para marcar como entregado</span>
        <span className="hidden sm:inline">Desliza a la izquierda para marcar como pagado</span>
      </div>

      {/* List of Urgent Jobs */}
      <div className="space-y-3.5">
        {urgentJobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <JobItem job={job} />
          </motion.div>
        ))}
      </div>

      {urgentJobs.length === 0 && (
        <div className="text-center py-16 px-4 border border-dashed border-zinc-200 rounded-xl bg-white">
          <p className="text-sm font-medium text-zinc-700">No hay entregas pendientes para hoy</p>
          <p className="text-xs text-zinc-400 mt-1">Revisa la pestaña "Todos los Trabajos" para planificar la semana.</p>
        </div>
      )}
    </div>
  );
}
