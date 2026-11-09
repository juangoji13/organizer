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
import { spring } from '@animate-ui/react/utils/motion';
import { AppTooltip } from '@/components/ui/rac-tooltip';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';

type TodaySection = 'clients' | 'personal';

const tabSpring = { type: 'spring' as const, stiffness: 350, damping: 30 };

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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {todayDateFormatted}
            </h1>
            <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal mt-1 flex items-center gap-1.5 flex-wrap">
              <span>
                {urgentJobs.length} {urgentJobs.length === 1 ? 'encargo' : 'encargos'} para hoy
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              {/* Quick Link to Finance & Cobros with RAC Tooltip */}
              <AppTooltip content="Ir a Finanzas & Cobros para gestionar cobros y abonos">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('finance')}
                  className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300 font-medium hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 group transition-colors cursor-pointer"
                  aria-label="Ir a Finanzas & Cobros"
                >
                  <span className="underline underline-offset-2 flex items-center gap-0.5">
                    $<SlidingNumber number={todayPendingDebt} thousandSeparator="." /> COP por liquidar
                  </span>
                  {todayPendingDebt > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    />
                  )}
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
                </motion.button>
              </AppTooltip>
            </div>
          </div>
        </div>

        {/* Unified Control Bar: Liquid Sliding Tabs for Sections and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Control with Liquid layoutId */}
          <div className="p-1 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-white/10 rounded-xl grid grid-cols-2 w-full sm:w-auto sm:min-w-[340px] select-none">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setTodaySection('clients')}
              className={`relative py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                todaySection === 'clients'
                  ? 'text-zinc-950 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {todaySection === 'clients' && (
                <motion.div
                  layoutId="todayViewSectionPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                  transition={tabSpring}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Encargos Clientes</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    todaySection === 'clients'
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {clientCount}
                </span>
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setTodaySection('personal')}
              className={`relative py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                todaySection === 'personal'
                  ? 'text-zinc-950 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {todaySection === 'personal' && (
                <motion.div
                  layoutId="todayViewSectionPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                  transition={tabSpring}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Tareas Propias</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    todaySection === 'personal'
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {personalCount}
                </span>
              </span>
            </motion.button>
          </div>

          {/* Liquid Sliding Filter: [Todos] vs [Pendientes] */}
          <div className="p-1 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-white/10 rounded-xl flex items-center select-none self-start sm:self-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterToday('all')}
              className={`relative py-1 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterToday === 'all'
                  ? 'text-zinc-950 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Mostrar todos los ítems de hoy"
            >
              {filterToday === 'all' && (
                <motion.div
                  layoutId="todayFilterPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                  transition={tabSpring}
                />
              )}
              <span className="relative z-10">Todos</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterToday('pending')}
              className={`relative py-1 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterToday === 'pending'
                  ? 'text-zinc-950 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Filtrar solo pendientes"
            >
              {filterToday === 'pending' && (
                <motion.div
                  layoutId="todayFilterPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                  transition={tabSpring}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    filterToday === 'pending' ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                />
                <span>Pendientes</span>
              </span>
            </motion.button>
          </div>
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
            <div className="text-center py-12 px-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/30 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200/50 dark:border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {filterToday === 'pending'
                  ? '¡Todo listo! No tienes entregas pendientes para hoy.'
                  : 'No hay entregas programadas para hoy.'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Puedes consultar &quot;Trabajos&quot; en la barra inferior para ver los siguientes días.
              </p>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: PRIORIDADES PROPIAS */}
      {todaySection === 'personal' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            <span>Metas académicas y desarrollo personal para hoy</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('personal')}
              className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-semibold text-[11px] hover:underline"
            >
              <span>Abrir Mi Espacio</span>
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>

          {displayedPersonal.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.99 }}
              className={`p-3.5 rounded-xl border transition-all bg-white dark:bg-[#121215] shadow-xs flex items-center justify-between gap-3 ${
                goal.isDone
                  ? 'border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-75'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => toggleGoal(goal.id)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  aria-label={goal.isDone ? 'Marcar pendiente' : 'Marcar completado'}
                >
                  {goal.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/40" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400" />
                  )}
                </motion.button>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold tracking-tight truncate ${
                    goal.isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  {goal.category === 'study' ? 'Universidad' : 'Dev'}
                </span>
              </div>
            </motion.div>
          ))}

          {displayedPersonal.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/30 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {filterToday === 'pending'
                  ? '¡Sin tareas pendientes! Todo el estudio al día.'
                  : 'No tienes metas registradas para hoy.'}
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('personal')}
                className="mt-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
              >
                Administrar en Mi Espacio
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
