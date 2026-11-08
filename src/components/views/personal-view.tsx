'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { GraduationCap, Target, Sparkles, PiggyBank, Check } from 'lucide-react';

export function PersonalView() {
  const { personalGoals, toggleGoal } = useWorkspace();

  const studyGoals = personalGoals.filter((g) => g.category === 'study');
  const devGoals = personalGoals.filter((g) => g.category === 'dev');
  const savingsGoals = personalGoals.filter((g) => g.category === 'savings');

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
          Espacio Personal
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Tus materias de la universidad, metas de aprendizaje, ideas de desarrollo y planes de ahorro.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Mis Materias & Metas de Estudio */}
        <section className="border border-zinc-200/90 rounded-xl bg-white overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                Mis Materias & Estudio
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              {studyGoals.filter((g) => g.isDone).length} de {studyGoals.length} completados
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {studyGoals.map((goal) => (
              <label
                key={goal.id}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-zinc-50/60 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={goal.isDone}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-zinc-900"
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {goal.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 2: Ideas & Proyectos Dev */}
        <section className="border border-zinc-200/90 rounded-xl bg-white overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-zinc-50/70 border-b border-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
              Ideas & Proyectos de Programación
            </h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {devGoals.map((goal) => (
              <label
                key={goal.id}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-zinc-50/60 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={goal.isDone}
                  onChange={() => toggleGoal(goal.id)}
                  className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-zinc-900"
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {goal.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: Planes de Ahorro */}
        <section className="border border-zinc-200/90 rounded-xl bg-white overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-zinc-50/70 border-b border-zinc-100 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-zinc-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
              Planes de Ahorro
            </h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {savingsGoals.map((plan) => {
              const current = plan.currentAmount || 0;
              const target = plan.targetAmount || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));

              return (
                <div key={plan.id} className="p-5 hover:bg-zinc-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-800">{plan.title}</h3>
                    <span className="text-xs font-semibold text-zinc-900">
                      ${current.toLocaleString()} / ${target.toLocaleString()} COP
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] text-zinc-400">
                    {pct}% completado
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
