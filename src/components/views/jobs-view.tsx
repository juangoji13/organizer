'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { JobItem } from '@/components/jobs/job-item';
import { motion } from 'motion/react';

export function JobsView() {
  const { jobs } = useWorkspace();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Todos los Trabajos & Asignaciones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Listado completo de encargos universitarios activos y entregados.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100/90 border border-zinc-200/60 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Todos ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'in_progress'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            En Curso ({jobs.filter((j) => j.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'delivered'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Entregados ({jobs.filter((j) => j.status === 'delivered').length})
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {filteredJobs.map((job) => (
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
    </div>
  );
}
