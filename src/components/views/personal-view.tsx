'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { GraduationCap, Sparkles, PiggyBank, Plus, CheckCircle2, Circle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CreatePersonalModal } from '@/components/personal/create-personal-modal';

type PersonalFilter = 'all' | 'study' | 'dev' | 'savings';

export function PersonalView() {
  const { personalGoals, toggleGoal } = useWorkspace();
  const [filter, setFilter] = useState<PersonalFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const studyGoals = personalGoals.filter((g) => g.category === 'study');
  const devGoals = personalGoals.filter((g) => g.category === 'dev');
  const savingsGoals = personalGoals.filter((g) => g.category === 'savings');

  const filteredGoals = personalGoals.filter((g) => {
    if (filter === 'all') return true;
    return g.category === filter;
  });

  const totalCompleted = personalGoals.filter((g) => g.isDone).length;
  const totalSavingsAcumulado = savingsGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalSavingsMeta = savingsGoals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Top Banner / Hero */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Mi Espacio
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-0.5">
              Universidad, Proyectos & Ahorro
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Meta Personal</span>
          </button>
        </div>

        {/* Metric Strip (Clean, restrained) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">
              Materias U
            </span>
            <div className="text-lg font-bold text-zinc-900 mt-1">
              {studyGoals.filter((g) => !g.isDone).length} <span className="text-xs font-normal text-zinc-400">pendientes</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">
              Proyectos Dev
            </span>
            <div className="text-lg font-bold text-zinc-900 mt-1">
              {devGoals.length} <span className="text-xs font-normal text-zinc-400">en marcha</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">
              Ahorro Total
            </span>
            <div className="text-lg font-bold text-zinc-900 mt-1 truncate">
              ${(totalSavingsAcumulado / 1000).toFixed(0)}k <span className="text-xs font-normal text-zinc-400">COP</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-4 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60 w-fit text-xs select-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'study', label: 'Universidad', icon: GraduationCap },
            { id: 'dev', label: 'Proyectos Dev', icon: Sparkles },
            { id: 'savings', label: 'Planes de Ahorro', icon: PiggyBank },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as PersonalFilter)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filter === tab.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-6">
        {/* Section: Planes de Ahorro */}
        {(filter === 'all' || filter === 'savings') && savingsGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <PiggyBank className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 font-mono">
                Planes de Ahorro Financiero
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savingsGoals.map((goal) => {
                const current = goal.currentAmount || 0;
                const target = goal.targetAmount || 1;
                const percent = Math.min(100, Math.round((current / target) * 100));

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm">
                        {goal.title}
                      </h3>
                      <span className="text-[11px] font-bold text-zinc-900 font-mono">
                        {percent}%
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {goal.description}
                      </p>
                    )}

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-zinc-500 font-mono">
                          ${current.toLocaleString()} COP
                        </span>
                        <span className="text-zinc-400 font-mono">
                          Meta: ${target.toLocaleString()} COP
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Universidad / Estudio Personal */}
        {(filter === 'all' || filter === 'study') && studyGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <GraduationCap className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 font-mono">
                Mis Materias & Entregas Propias
              </h2>
            </div>

            <div className="divide-y divide-zinc-100 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              {studyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-zinc-50/70 transition-colors cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className="mt-0.5 text-zinc-400 hover:text-zinc-700"
                  >
                    {goal.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm font-medium ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-850'}`}>
                      {goal.title}
                    </span>
                    {goal.description && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Proyectos Dev & Programación */}
        {(filter === 'all' || filter === 'dev') && devGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 font-mono">
                Proyectos & Notas de Desarrollo
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {devGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded">
                        Dev Project
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                          goal.isDone
                            ? 'text-emerald-800 bg-emerald-50/70'
                            : 'text-zinc-600 bg-zinc-50'
                        }`}
                      >
                        {goal.isDone ? 'Completado' : 'En progreso'}
                      </button>
                    </div>

                    <h3 className={`font-semibold text-xs sm:text-sm mt-2 ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreatePersonalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
