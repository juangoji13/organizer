'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { 
  GraduationCap, 
  Sparkles, 
  PiggyBank, 
  Plus, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Copy, 
  Check
} from 'lucide-react';
import { UniversalCreateModal } from '@/components/common/universal-create-modal';

type PersonalFilter = 'all' | 'study' | 'dev' | 'savings' | 'note';

export function PersonalView() {
  const { personalGoals, toggleGoal } = useWorkspace();
  const [filter, setFilter] = useState<PersonalFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const studyGoals = personalGoals.filter((g) => g.category === 'study');
  const devGoals = personalGoals.filter((g) => g.category === 'dev');
  const savingsGoals = personalGoals.filter((g) => g.category === 'savings');
  const notesList = personalGoals.filter((g) => g.category === 'note');

  const totalSavingsAcumulado = savingsGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);

  const formatCurrencyAbbrev = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
  };

  const copyNoteText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 1400);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Top Banner / Hero */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
              Mi Espacio
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-0.5">
              Universidad, Proyectos & Notas
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors self-start sm:self-auto shadow-xs min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Registro</span>
          </button>
        </div>

        {/* Metric Strip (Non-Collapsing, Responsive Grid) */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Materias U
            </span>
            <div className="text-base sm:text-lg font-bold text-zinc-900 mt-1 whitespace-nowrap font-mono tabular-nums">
              {studyGoals.filter((g) => !g.isDone).length} <span className="text-xs font-normal text-zinc-500 font-sans">pend.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Proyectos Dev
            </span>
            <div className="text-base sm:text-lg font-bold text-zinc-900 mt-1 whitespace-nowrap font-mono tabular-nums">
              {devGoals.length} <span className="text-xs font-normal text-zinc-500 font-sans">ideas</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Ahorro Total
            </span>
            <div className="text-base sm:text-lg font-bold text-zinc-900 mt-1 whitespace-nowrap font-mono tabular-nums">
              {formatCurrencyAbbrev(totalSavingsAcumulado)} <span className="text-xs font-normal text-zinc-500 font-sans">COP</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs (Horizontal scroll on mobile with touch support) */}
        <div className="flex items-center gap-1 mt-4 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60 overflow-x-auto select-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'study', label: 'Universidad', icon: GraduationCap },
            { id: 'dev', label: 'Proyectos Dev', icon: Sparkles },
            { id: 'savings', label: 'Planes Ahorro', icon: PiggyBank },
            { id: 'note', label: 'Notas Rápidas', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as PersonalFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                  filter === tab.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Space */}
      <div className="space-y-6">
        {/* Section: Notas Rápidas */}
        {(filter === 'all' || filter === 'note') && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Bloc de Notas Rápidas ({notesList.length})
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold min-h-[32px] px-2 py-1"
              >
                + Nueva nota
              </button>
            </div>

            {notesList.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-dashed border-zinc-300 text-center text-xs text-zinc-500">
                No tienes notas rápidas guardadas. Toca en &quot;+ Nueva nota&quot; para apuntar ideas, enlaces o recordatorios.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {notesList.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900">
                          {note.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => copyNoteText(note.id, `${note.title}\n${note.description || ''}`)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                          title="Copiar contenido"
                          aria-label="Copiar contenido de la nota"
                        >
                          {copiedNoteId === note.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {note.description && (
                        <p className="text-xs text-zinc-600 mt-1.5 whitespace-pre-wrap leading-relaxed">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Planes de Ahorro */}
        {(filter === 'all' || filter === 'savings') && savingsGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <PiggyBank className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
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
                      <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm leading-snug">
                        {goal.title}
                      </h3>
                      <span className="text-xs font-bold text-zinc-900 font-mono tabular-nums shrink-0">
                        {percent}%
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {goal.description}
                      </p>
                    )}

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-mono tabular-nums">
                        <span className="text-zinc-700 font-semibold">
                          ${current.toLocaleString()} COP
                        </span>
                        <span className="text-zinc-500">
                          Meta: ${target.toLocaleString()} COP
                        </span>
                      </div>

                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
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
            <div className="flex items-center gap-1.5 mb-2.5">
              <GraduationCap className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Mis Materias & Entregas Propias
              </h2>
            </div>

            <div className="divide-y divide-zinc-100 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              {studyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-zinc-50/70 transition-colors cursor-pointer select-none min-h-[48px]"
                >
                  <button
                    type="button"
                    className="mt-0.5 text-zinc-400 hover:text-zinc-700 shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center"
                    aria-label={`Marcar como completado ${goal.title}`}
                  >
                    {goal.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm font-medium ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {goal.title}
                    </span>
                    {goal.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Proyectos Dev */}
        {(filter === 'all' || filter === 'dev') && devGoals.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-zinc-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Proyectos & Desarrollo
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {devGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 font-mono bg-zinc-100 px-2 py-0.5 rounded">
                        Dev Project
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded min-h-[28px] transition-colors ${
                          goal.isDone
                            ? 'text-emerald-800 bg-emerald-50/70 border border-emerald-200/40'
                            : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200'
                        }`}
                      >
                        {goal.isDone ? 'Completado' : 'En progreso'}
                      </button>
                    </div>

                    <h3 className={`font-semibold text-xs sm:text-sm mt-2.5 ${goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
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

      <UniversalCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
