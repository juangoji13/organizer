'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { 
  CheckCircle2, 
  Circle, 
  CreditCard, 
  Briefcase, 
  GraduationCap, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

type TodaySection = 'clients' | 'personal';

export function TodayView() {
  const { jobs, personalGoals, toggleGoal, setActiveTab } = useWorkspace();
  const [todaySection, setTodaySection] = useState<TodaySection>('clients');
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

  // Client Jobs calculations
  const urgentJobs = jobs.filter((j) => j.isUrgentToday);
  const pendingUrgent = urgentJobs.filter((j) => j.status !== 'delivered');
  const todayPendingDebt = urgentJobs.reduce(
    (acc, j) => acc + Math.max(0, j.totalPrice - j.paidAmount),
    0
  );
  const displayedJobs = filterToday === 'pending' ? pendingUrgent : urgentJobs;

  // Personal Priorities calculations
  const personalPriorities = personalGoals.filter((g) => g.category === 'study' || g.category === 'dev');
  const pendingPersonal = personalPriorities.filter((g) => !g.isDone);
  const displayedPersonal = filterToday === 'pending' ? pendingPersonal : personalPriorities;

  const clientCount = filterToday === 'pending' ? pendingUrgent.length : urgentJobs.length;
  const personalCount = filterToday === 'pending' ? pendingPersonal.length : personalPriorities.length;

  return (
    <div className="max-w-3xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              {todayDateFormatted}
            </h1>
            <div className="text-xs sm:text-sm text-zinc-500 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
              <span>
                {urgentJobs.length} {urgentJobs.length === 1 ? 'encargo' : 'encargos'} para hoy
              </span>
              <span className="text-zinc-300">•</span>
              {/* Quick Link to Finance & Cobros */}
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className="font-mono tabular-nums text-zinc-700 font-medium hover:text-zinc-950 flex items-center gap-1 group transition-colors"
                title="Ir a Finanzas & Cobros"
              >
                <span className="underline underline-offset-2">
                  ${todayPendingDebt.toLocaleString('es-CO')} COP por liquidar
                </span>
                <CreditCard className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Unified Control Bar: Single Segmented Control + Subtle Inline Toggle */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Segmented Control */}
          <div className="p-1 bg-zinc-100/90 border border-zinc-200/70 rounded-xl grid grid-cols-2 w-full sm:w-auto sm:min-w-[340px] select-none">
            <button
              type="button"
              onClick={() => setTodaySection('clients')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                todaySection === 'clients'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Encargos Clientes</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                todaySection === 'clients' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-200 text-zinc-600'
              }`}>
                {clientCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTodaySection('personal')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                todaySection === 'personal'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Tareas Propias</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                todaySection === 'personal' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-200 text-zinc-600'
              }`}>
                {personalCount}
              </span>
            </button>
          </div>

          {/* Discrete "Solo pendientes" Filter Toggle */}
          <button
            type="button"
            onClick={() => setFilterToday(filterToday === 'pending' ? 'all' : 'pending')}
            className={`inline-flex items-center gap-2 self-start sm:self-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none border ${
              filterToday === 'pending'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
            title={filterToday === 'pending' ? 'Mostrando solo pendientes. Toca para ver todos' : 'Toca para filtrar solo pendientes'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                filterToday === 'pending' ? 'bg-amber-400' : 'bg-zinc-300'
              }`}
            />
            <span>Solo pendientes</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ENCARGOS CLIENTES */}
      {todaySection === 'clients' && (
        <>
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
            <div className="text-center py-12 px-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200/50">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">
                {filterToday === 'pending'
                  ? '¡Todo listo! No tienes entregas pendientes para hoy.'
                  : 'No hay entregas programadas para hoy.'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Puedes consultar &quot;Trabajos&quot; en la barra inferior para ver los siguientes días.
              </p>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: PRIORIDADES PROPIAS */}
      {todaySection === 'personal' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 px-1">
            <span>Metas académicas y desarrollo personal para hoy</span>
            <button
              onClick={() => setActiveTab('personal')}
              className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 font-semibold text-[11px] hover:underline"
            >
              <span>Abrir Mi Espacio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {displayedPersonal.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl border transition-all bg-white shadow-xs flex items-center justify-between gap-3 ${
                goal.isDone ? 'border-zinc-200/60 bg-zinc-50/50 opacity-75' : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-900 transition-colors"
                  aria-label={goal.isDone ? 'Marcar pendiente' : 'Marcar completado'}
                >
                  {goal.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300 hover:text-zinc-500" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold tracking-tight truncate ${
                    goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-900'
                  }`}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                  {goal.category === 'study' ? 'Universidad' : 'Dev'}
                </span>
              </div>
            </motion.div>
          ))}

          {displayedPersonal.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-800">
                {filterToday === 'pending'
                  ? '¡Sin tareas pendientes! Todo el estudio al día.'
                  : 'No tienes metas registradas para hoy.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className="mt-3 text-xs font-semibold text-zinc-900 underline underline-offset-2"
              >
                Administrar en Mi Espacio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
