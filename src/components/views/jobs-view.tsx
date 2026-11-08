'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

export function JobsView() {
  const { jobs } = useWorkspace();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (filter !== 'all' && job.status !== filter) return false;

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

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-4 sm:mb-6">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
          Asignaciones Académicas
        </div>
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
          Todos los Trabajos
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Supervisión de entregas, credenciales de plataformas universitarias y estado de pago.
        </p>
      </div>

      {/* Touch-Friendly Search & Filter Bar */}
      <div className="space-y-2.5 mb-4">
        {/* Search Input Box (16px base font size prevents iOS Safari zoom) */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por materia, cliente, plataforma..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-base sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills (Smooth Horizontal Touch Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 select-none">
          {[
            { id: 'all', label: 'Todos', count: jobs.length },
            { id: 'in_progress', label: 'En Curso', count: jobs.filter((j) => j.status === 'in_progress').length },
            { id: 'delivered', label: 'Entregados', count: jobs.filter((j) => j.status === 'delivered').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 min-h-[38px] flex items-center gap-1.5 ${
                filter === item.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                filter === item.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <JobItem job={job} />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-white shadow-xs">
          <p className="text-sm font-semibold text-zinc-800">No se encontraron trabajos</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otro término.`
              : 'No hay trabajos en este estado actualmente.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition-colors min-h-[38px]"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
