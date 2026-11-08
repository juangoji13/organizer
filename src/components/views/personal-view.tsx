'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { 
  GraduationCap, 
  Sparkles, 
  PiggyBank, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Copy, 
  Check,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  SlidersHorizontal,
  Pencil
} from 'lucide-react';
import { UniversalCreateModal } from '@/components/common/universal-create-modal';
import { motion, AnimatePresence } from 'motion/react';
import { PersonalGoal } from '@/types/organizer';

type MainSectionTab = 'study_notes' | 'dev_savings';

interface AdjustSavingsModalProps {
  goal: PersonalGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

function AdjustSavingsModal({ goal, isOpen, onClose }: AdjustSavingsModalProps) {
  const { adjustSavings } = useWorkspace();
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number | ''>(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const current = goal.currentAmount || 0;
  const numAmount = typeof amount === 'number' ? amount : 0;
  const finalDelta = actionType === 'deposit' ? numAmount : -numAmount;
  const projectedBalance = Math.max(0, current + finalDelta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await adjustSavings(goal.id, finalDelta);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                  Movimiento de Ahorro
                </h2>
                <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                  {goal.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Toggle Deposit vs Withdraw */}
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setActionType('deposit')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  actionType === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Abonar (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('withdraw')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  actionType === 'withdraw'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Retirar (-)</span>
              </button>
            </div>

            {/* Quick chips */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Valores sugeridos
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[20000, 50000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                      amount === val
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    ${(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Monto en COP
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50000"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-zinc-200 text-sm font-semibold font-mono text-zinc-900 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Projected Balance */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs flex items-center justify-between">
              <span className="text-zinc-500">Nuevo saldo proyectado:</span>
              <span className="font-mono font-bold text-zinc-900">
                ${projectedBalance.toLocaleString()} COP
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !numAmount || numAmount <= 0}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-colors ${
                  actionType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : actionType === 'deposit'
                  ? `Abonar +$${numAmount.toLocaleString()} COP`
                  : `Retirar -$${numAmount.toLocaleString()} COP`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface EditNoteModalProps {
  note: PersonalGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

function EditNoteModal({ note, isOpen, onClose }: EditNoteModalProps) {
  const { updatePersonalItem } = useWorkspace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setDescription(note.description || '');
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await updatePersonalItem(note.id, {
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                  Editar Nota Rápida
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Modifica el contenido o título de tu apunte
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Título del apunte
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título o asunto..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-zinc-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Contenido / Notas
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Escribe aquí notas, recordatorios o enlaces..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function PersonalView() {
  const { personalGoals, toggleGoal, adjustSavings, deletePersonalItem, activeTab } = useWorkspace();
  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>('study_notes');

  useEffect(() => {
    if (activeTab === 'personal_savings' || activeTab === 'personal_ideas') {
      setActiveMainTab('dev_savings');
    } else if (activeTab === 'personal_subjects' || activeTab === 'personal_goals') {
      setActiveMainTab('study_notes');
    }
  }, [activeTab]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'job' | 'personal' | 'note' | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Savings adjust modal state
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState<PersonalGoal | null>(null);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  // Edit Note Modal state
  const [editingNote, setEditingNote] = useState<PersonalGoal | null>(null);

  const studyGoals = personalGoals.filter((g) => g.category === 'study');
  const devGoals = personalGoals.filter((g) => g.category === 'dev');
  const savingsGoals = personalGoals.filter((g) => g.category === 'savings');
  const notesList = personalGoals.filter((g) => g.category === 'note');

  const totalSavingsAcumulado = savingsGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);

  const copyNoteText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 1400);
  };

  const openAdjustModal = (goal: PersonalGoal) => {
    setSelectedSavingsGoal(goal);
    setIsSavingsModalOpen(true);
  };

  const handleOpenCreate = (type?: 'personal' | 'note') => {
    setModalInitialType(type || 'personal');
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Segmented Control de 2 pestañas principales (sin redundancia de cabecera) */}
      <div className="mb-5 sm:mb-6">
        <div className="p-1 bg-zinc-100/90 border border-zinc-200/70 rounded-xl grid grid-cols-2 max-w-md select-none">
          <button
            type="button"
            onClick={() => setActiveMainTab('study_notes')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeMainTab === 'study_notes'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-zinc-700" />
            <span>Mis Materias & Notas</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
              {studyGoals.length + notesList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('dev_savings')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeMainTab === 'dev_savings'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-zinc-700" />
            <span>Metas Dev & Ahorro</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
              {devGoals.length + savingsGoals.length}
            </span>
          </button>
        </div>
      </div>

      {/* PESTAÑA A: "Mis Materias & Notas" */}
      {activeMainTab === 'study_notes' && (
        <div className="space-y-6">
          {/* Subsección 1: Tareas universitarias propias (Checklist limpio) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Tareas Universitarias & Materias ({studyGoals.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
              >
                + Nueva tarea / materia
              </button>
            </div>

            {studyGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 border border-zinc-200/70 text-center">
                <p className="text-xs text-zinc-500">
                  No tienes entregas ni materias universitarias registradas. Añade talleres, parciales o recordatorios de estudio.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
                {studyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-zinc-50/70 transition-colors min-h-[48px]"
                  >
                    <div
                      onClick={() => toggleGoal(goal.id)}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer select-none"
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
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-800'
                          }`}
                        >
                          {goal.title}
                        </span>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePersonalItem(goal.id)}
                      className="p-1.5 rounded-md text-zinc-300 hover:text-rose-600 transition-colors shrink-0"
                      title="Eliminar materia / tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsección 2: Bloc de Notas Rápidas (Editables y con botón de eliminar) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Bloc de Notas Rápidas ({notesList.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('note')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
              >
                + Nueva nota
              </button>
            </div>

            {notesList.length === 0 ? (
              <div className="py-7 px-4 rounded-2xl bg-zinc-50/60 border border-zinc-200/60 text-center flex flex-col items-center justify-center gap-2.5">
                <p className="text-xs text-zinc-500 font-normal">
                  Sin notas rápidas aún <span className="text-zinc-300 mx-1">•</span> Toca &quot;+ Nueva nota&quot; para apuntar recordatorios o credenciales
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('note')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200/90 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 text-xs font-medium shadow-2xs transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>+ Nueva nota</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notesList.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 leading-snug">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Botón Editar Nota */}
                          <button
                            type="button"
                            onClick={() => setEditingNote(note)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors"
                            title="Editar nota"
                            aria-label="Editar contenido de la nota"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Copiar Contenido */}
                          <button
                            type="button"
                            onClick={() =>
                              copyNoteText(note.id, `${note.title}\n${note.description || ''}`)
                            }
                            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors"
                            title="Copiar texto"
                            aria-label="Copiar texto de la nota"
                          >
                            {copiedNoteId === note.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Botón Eliminar Nota */}
                          <button
                            type="button"
                            onClick={() => deletePersonalItem(note.id)}
                            className="p-1.5 rounded-md text-zinc-300 hover:text-rose-600 hover:bg-rose-50 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors"
                            title="Eliminar nota"
                            aria-label="Eliminar nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {note.description && (
                        <p className="text-xs text-zinc-600 mt-2 whitespace-pre-wrap leading-relaxed">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA B: "Metas Dev & Ahorro" */}
      {activeMainTab === 'dev_savings' && (
        <div className="space-y-6">
          {/* Subsección 1: Proyectos de Código con Tags Limpios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Proyectos & Desarrollo ({devGoals.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
              >
                + Nuevo proyecto
              </button>
            </div>

            {devGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 border border-zinc-200/70 text-center">
                <p className="text-xs text-zinc-500">
                  No tienes proyectos de código activos. Agrega ideas de apps, bots o librerías que quieras programar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {devGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 font-mono bg-zinc-100 px-2 py-0.5 rounded">
                          Dev Project
                        </span>
                        <div className="flex items-center gap-1">
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
                          <button
                            type="button"
                            onClick={() => deletePersonalItem(goal.id)}
                            className="p-1 rounded-md text-zinc-300 hover:text-rose-600 transition-colors"
                            title="Eliminar proyecto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3
                        className={`font-semibold text-xs sm:text-sm mt-2.5 ${
                          goal.isDone ? 'line-through text-zinc-400' : 'text-zinc-900'
                        }`}
                      >
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
            )}
          </div>

          {/* Subsección 2: Tarjetas de Ahorro Interactivas con Botones Rápidos (+50k, +100k, -50k, Ajustar) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-zinc-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Planes de Ahorro ({savingsGoals.length})
                </h2>
                {savingsGoals.length > 0 && (
                  <span className="text-xs text-zinc-400 font-mono">
                    • Total: ${totalSavingsAcumulado.toLocaleString()} COP
                  </span>
                )}
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
              >
                + Nuevo plan
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 border border-zinc-200/70 text-center">
                <p className="text-xs text-zinc-500">
                  No tienes planes de ahorro definidos. Agrega metas de ahorro para equipos, viajes o fondos de emergencia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savingsGoals.map((goal) => {
                  const current = goal.currentAmount || 0;
                  const target = goal.targetAmount || 1;
                  const percent = Math.min(100, Math.round((current / target) * 100));

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm leading-snug">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold text-zinc-900 font-mono tabular-nums">
                              {percent}%
                            </span>
                            <button
                              type="button"
                              onClick={() => deletePersonalItem(goal.id)}
                              className="p-1 rounded-md text-zinc-300 hover:text-rose-600 transition-colors"
                              title="Eliminar plan de ahorro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {goal.description && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {goal.description}
                          </p>
                        )}

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1.5 font-mono tabular-nums">
                            <span className="text-zinc-800 font-semibold">
                              ${current.toLocaleString()} COP
                            </span>
                            <span className="text-zinc-400">
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

                      {/* Botones Operativos Rápidos e Interactivos */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => adjustSavings(goal.id, 50000)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold font-mono bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors min-h-[30px]"
                            title="Abonar $50.000 COP"
                          >
                            +$50k
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustSavings(goal.id, 100000)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold font-mono bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors min-h-[30px]"
                            title="Abonar $100.000 COP"
                          >
                            +$100k
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustSavings(goal.id, -50000)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold font-mono bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60 transition-colors min-h-[30px]"
                            title="Retirar $50.000 COP"
                          >
                            -$50k
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => openAdjustModal(goal)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors min-h-[30px]"
                          title="Ingresar monto personalizado de abono o retiro"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
                          <span>Ajustar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjust Savings Modal */}
      <AdjustSavingsModal
        goal={selectedSavingsGoal}
        isOpen={isSavingsModalOpen}
        onClose={() => {
          setIsSavingsModalOpen(false);
          setSelectedSavingsGoal(null);
        }}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
      />

      {/* Universal Creator Modal */}
      <UniversalCreateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialType(null);
        }}
        initialType={modalInitialType}
      />
    </div>
  );
}
