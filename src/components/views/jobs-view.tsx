'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { ClientJob } from '@/types/organizer';
import { EditJobModal } from '@/components/jobs/edit-job-modal';
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { Search, X, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FilterType = 'all' | 'in_progress' | 'delivered' | 'debt';

interface ChronoGroup {
  id: 'today' | 'week' | 'upcoming' | 'delivered';
  title: string;
  jobs: ClientJob[];
}

function getJobCategory(job: ClientJob): 'today' | 'week' | 'upcoming' | 'delivered' {
  if (job.status === 'delivered' || job.status === 'completed') {
    return 'delivered';
  }

  if (job.isUrgentToday) {
    return 'today';
  }

  if (!job.deadlineDate) {
    return 'upcoming';
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (job.deadlineDate === todayStr) {
    return 'today';
  }

  const [jYear, jMonth, jDay] = job.deadlineDate.split('-').map(Number);
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);

  const jobUtc = Date.UTC(jYear, jMonth - 1, jDay);
  const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);
  const diffDays = Math.round((jobUtc - todayUtc) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // Overdue or today
    return 'today';
  } else if (diffDays <= 7) {
    return 'week';
  } else {
    return 'upcoming';
  }
}

function formatDeadlineBadge(deadlineDate: string, deadlineTime: string): { label: string; isUrgent: boolean } {
  if (!deadlineDate) return { label: deadlineTime || 'Sin hora', isUrgent: false };

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [jYear, jMonth, jDay] = deadlineDate.split('-').map(Number);
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);

  const diffDays = Math.round((Date.UTC(jYear, jMonth - 1, jDay) - Date.UTC(tYear, tMonth - 1, tDay)) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: `Hoy ${deadlineTime}`, isUrgent: true };
  } else if (diffDays < 0) {
    return { label: `Venció hace ${Math.abs(diffDays)}d`, isUrgent: true };
  } else if (diffDays === 1) {
    return { label: `Mañana ${deadlineTime}`, isUrgent: false };
  } else {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = months[jMonth - 1] || '';
    return { label: `${jDay} ${monthName} · ${deadlineTime}`, isUrgent: false };
  }
}

export function JobsView() {
  const { jobs } = useWorkspace();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<ClientJob | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<ClientJob | null>(null);

  // Filter jobs by search and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (filter === 'in_progress' && job.status === 'delivered') return false;
      if (filter === 'delivered' && job.status !== 'delivered') return false;
      if (filter === 'debt' && job.paidAmount >= job.totalPrice) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesClient = job.clientName.toLowerCase().includes(query);
        const matchesSubject = job.subject.toLowerCase().includes(query);
        const matchesPlatform = job.platform.toLowerCase().includes(query);
        return matchesTitle || matchesClient || matchesSubject || matchesPlatform;
      }

      return true;
    });
  }, [jobs, filter, searchQuery]);

  // Group chronologically: "Vencen Hoy", "Esta Semana", "Próximos Días", "Entregados"
  const groupedJobs = useMemo(() => {
    const groups: Record<'today' | 'week' | 'upcoming' | 'delivered', ClientJob[]> = {
      today: [],
      week: [],
      upcoming: [],
      delivered: [],
    };

    filteredJobs.forEach((job) => {
      const category = getJobCategory(job);
      groups[category].push(job);
    });

    // Sort order within groups
    const sortByDateAsc = (a: ClientJob, b: ClientJob) => {
      const dateA = a.deadlineDate || '9999-99-99';
      const dateB = b.deadlineDate || '9999-99-99';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.deadlineTime || '').localeCompare(b.deadlineTime || '');
    };

    const sortByDateDesc = (a: ClientJob, b: ClientJob) => {
      const dateA = a.deadlineDate || '0000-00-00';
      const dateB = b.deadlineDate || '0000-00-00';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return (b.deadlineTime || '').localeCompare(a.deadlineTime || '');
    };

    groups.today.sort(sortByDateAsc);
    groups.week.sort(sortByDateAsc);
    groups.upcoming.sort(sortByDateAsc);
    groups.delivered.sort(sortByDateDesc);

    const result: ChronoGroup[] = [
      { id: 'today', title: 'Vencen Hoy', jobs: groups.today },
      { id: 'week', title: 'Esta Semana', jobs: groups.week },
      { id: 'upcoming', title: 'Próximos Días', jobs: groups.upcoming },
      { id: 'delivered', title: 'Entregados', jobs: groups.delivered },
    ];

    // Keep only groups that have jobs
    return result.filter((g) => g.jobs.length > 0);
  }, [filteredJobs]);

  const totalDebtCount = useMemo(() => {
    return jobs.filter((j) => j.totalPrice > j.paidAmount).length;
  }, [jobs]);

  return (
    <div className="max-w-4xl mx-auto py-3.5 sm:py-6 px-3 sm:px-6">
      {/* Ultralight Clean Meta Bar (Without redundant H1) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs text-zinc-500">
          {jobs.length} encargos registrados • {totalDebtCount} con saldo pendiente
        </p>
      </div>

      {/* Ultralight Search and Quick Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por materia, cliente, plataforma..."
            className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Minimal Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 select-none shrink-0 text-xs">
          {[
            { id: 'all', label: 'Todos', count: jobs.length },
            { id: 'in_progress', label: 'Pendientes', count: jobs.filter((j) => j.status !== 'delivered').length },
            { id: 'delivered', label: 'Entregados', count: jobs.filter((j) => j.status === 'delivered').length },
            { id: 'debt', label: 'Con Saldo', count: totalDebtCount },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as FilterType)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                filter === item.id
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  filter === item.id ? 'bg-white/20 text-white' : 'bg-white text-zinc-600 border border-zinc-200/50'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chronologically Grouped List */}
      <div className="space-y-4">
        {groupedJobs.map((group) => (
          <div key={group.id} className="space-y-1.5">
            {/* Clean Typographic Separator */}
            <div className="flex items-center gap-2 pt-2 pb-0.5 px-1 select-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {group.title}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
                {group.jobs.length}
              </span>
              <div className="flex-1 h-px bg-zinc-200/60" />
            </div>

            {/* Well-spaced Cards without aggressive truncation */}
            <div className="space-y-2">
              {group.jobs.map((job) => {
                const jobDebt = Math.max(0, job.totalPrice - job.paidAmount);
                const isDelivered = job.status === 'delivered';
                const deadline = formatDeadlineBadge(job.deadlineDate, job.deadlineTime);

                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedJobForEdit(job)}
                    className="group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl bg-white border border-zinc-200/75 hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer active:scale-[0.995]"
                  >
                    {/* Fila superior: [Materia en pastilla sutil] + [Entregado] y a la derecha Límite */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-100/90 px-2 py-0.5 rounded-md tracking-tight">
                          {job.subject}
                        </span>
                        {job.platform && (
                          <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200/50">
                            {job.platform}
                          </span>
                        )}
                        {isDelivered && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Entregado
                          </span>
                        )}
                      </div>

                      {/* Right: Badge de fecha limpio */}
                      <span
                        className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${
                          deadline.isUrgent
                            ? 'bg-amber-50/90 text-amber-900 border-amber-200/70 font-semibold'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200/60'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{deadline.label}</span>
                      </span>
                    </div>

                    {/* Fila central: Título del trabajo (claro, completo, en negrita legible) */}
                    <div className="my-1">
                      <h3 className="text-sm font-semibold text-zinc-900 leading-snug break-words">
                        {job.title}
                      </h3>
                    </div>

                    {/* Fila inferior: Nombre del cliente a la izquierda, y a la derecha $Total + badge de Saldo */}
                    <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-zinc-100">
                      {/* Left: Nombre del cliente */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-medium text-zinc-600 truncate">
                          {job.clientName}
                        </span>
                      </div>

                      {/* Right: Precio + Saldo + Flecha */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-zinc-900 font-mono tabular-nums">
                          ${job.totalPrice.toLocaleString()} {job.currency || 'COP'}
                        </span>

                        {jobDebt > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobForPayment(job);
                            }}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/60 font-mono tabular-nums transition-colors cursor-pointer"
                            title="Registrar abono directo"
                          >
                            <span>Debe ${jobDebt.toLocaleString()}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/40">
                            Al día
                          </span>
                        )}

                        <div className="flex items-center text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {groupedJobs.length === 0 && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-white">
          <p className="text-sm font-semibold text-zinc-800">No se encontraron trabajos</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otro término.`
              : 'No hay trabajos registrados en esta categoría actualmente.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      <EditJobModal
        job={selectedJobForEdit}
        isOpen={Boolean(selectedJobForEdit)}
        onClose={() => setSelectedJobForEdit(null)}
      />

      {/* Direct Partial Payment Modal */}
      <PartialPaymentModal
        job={selectedJobForPayment}
        isOpen={Boolean(selectedJobForPayment)}
        onClose={() => setSelectedJobForPayment(null)}
      />
    </div>
  );
}
