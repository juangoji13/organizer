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
  Pencil,
  Plus
} from 'lucide-react';
import { UniversalCreateModal } from '@/components/common/universal-create-modal';
import { AppTooltip } from '@/components/ui/rac-tooltip';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#121215] rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-white/10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Movimiento de Ahorro
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                  {goal.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Toggle Deposit vs Withdraw */}
            <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setActionType('deposit')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  actionType === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Abonar (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('withdraw')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  actionType === 'withdraw'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Retirar (-)</span>
              </button>
            </div>

            {/* Quick chips */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                Valores sugeridos
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[20000, 50000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      amount === val
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    ${(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Monto en COP
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50000"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                  required
                />
              </div>
            </div>

            {/* Projected Balance */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-white/10 text-xs flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Nuevo saldo proyectado:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                ${projectedBalance.toLocaleString()} COP
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !numAmount || numAmount <= 0}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-white/10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Editar Nota Rápida
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Modifica el contenido o título de tu apunte
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Título del apunte
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título o asunto..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Contenido / Notas
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Escribe aquí notas, recordatorios o enlaces..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 text-white dark:text-zinc-950 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
      {/* Segmented Control de 2 pestañas principales con Liquid Sliding Indicator */}
      <div className="mb-5 sm:mb-6">
        <div className="p-1 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-white/10 rounded-xl grid grid-cols-2 max-w-md select-none">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveMainTab('study_notes')}
            className={`relative py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === 'study_notes'
                ? 'text-zinc-950 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {activeMainTab === 'study_notes' && (
              <motion.div
                layoutId="personalMainTabPill"
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Mis Materias & Notas</span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'study_notes'
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                {studyGoals.length + notesList.length}
              </span>
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveMainTab('dev_savings')}
            className={`relative py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === 'dev_savings'
                ? 'text-zinc-950 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {activeMainTab === 'dev_savings' && (
              <motion.div
                layoutId="personalMainTabPill"
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>Metas Dev & Ahorro</span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'dev_savings'
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                {devGoals.length + savingsGoals.length}
              </span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* PESTAÑA A: "Mis Materias & Notas" */}
      {activeMainTab === 'study_notes' && (
        <div className="space-y-6">
          {/* Subsección 1: Tareas universitarias propias (Checklist limpio) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Tareas Universitarias & Materias ({studyGoals.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva tarea / materia</span>
              </button>
            </div>

            {studyGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/70 dark:border-white/10 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No tienes entregas ni materias universitarias registradas. Añade talleres, parciales o recordatorios de estudio.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-white/10 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
                {studyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors min-h-[48px]"
                  >
                    <div
                      onClick={() => toggleGoal(goal.id)}
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer select-none"
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center cursor-pointer"
                        aria-label={`Marcar como completado ${goal.title}`}
                      >
                        {goal.isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            goal.isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {goal.title}
                        </span>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <AppTooltip content="Eliminar materia / tarea">
                      <button
                        type="button"
                        onClick={() => deletePersonalItem(goal.id)}
                        className="p-1.5 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                        aria-label="Eliminar materia / tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </AppTooltip>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsección 2: Bloc de Notas Rápidas (Editables y con botón de eliminar) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Bloc de Notas Rápidas ({notesList.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('note')}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva nota</span>
              </button>
            </div>

            {notesList.length === 0 ? (
              <div className="py-7 px-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-white/10 text-center flex flex-col items-center justify-center gap-2.5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                  Sin notas rápidas aún <span className="text-zinc-300 dark:text-zinc-600 mx-1">•</span> Toca &quot;+ Nueva nota&quot; para apuntar recordatorios o credenciales
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('note')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white text-xs font-medium shadow-2xs transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>+ Nueva nota</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notesList.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Botón Editar Nota */}
                          <AppTooltip content="Editar nota">
                            <button
                              type="button"
                              onClick={() => setEditingNote(note)}
                              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Editar contenido de la nota"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </AppTooltip>

                          {/* Botón Copiar Contenido */}
                          <AppTooltip content="Copiar texto de la nota">
                            <button
                              type="button"
                              onClick={() =>
                                copyNoteText(note.id, `${note.title}\n${note.description || ''}`)
                              }
                              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Copiar texto de la nota"
                            >
                              {copiedNoteId === note.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </AppTooltip>

                          {/* Botón Eliminar Nota */}
                          <AppTooltip content="Eliminar nota">
                            <button
                              type="button"
                              onClick={() => deletePersonalItem(note.id)}
                              className="p-1.5 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors cursor-pointer"
                              aria-label="Eliminar nota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AppTooltip>
                        </div>
                      </div>

                      {note.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap leading-relaxed">
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
                <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Proyectos & Desarrollo ({devGoals.length})
                </h2>
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo proyecto</span>
              </button>
            </div>

            {devGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/70 dark:border-white/10 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No tienes proyectos de código activos. Agrega ideas de apps, bots o librerías que quieras programar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {devGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          Dev Project
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleGoal(goal.id)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded min-h-[28px] transition-colors cursor-pointer ${
                              goal.isDone
                                ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/40 dark:border-emerald-800/40'
                                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {goal.isDone ? 'Completado' : 'En progreso'}
                          </button>
                          <AppTooltip content="Eliminar proyecto">
                            <button
                              type="button"
                              onClick={() => deletePersonalItem(goal.id)}
                              className="p-1 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              aria-label="Eliminar proyecto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AppTooltip>
                        </div>
                      </div>

                      <h3
                        className={`font-semibold text-xs sm:text-sm mt-2.5 ${
                          goal.isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {goal.title}
                      </h3>

                      {goal.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsección 2: Tarjetas de Ahorro Interactivas con Barras Cinéticas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Planes de Ahorro ({savingsGoals.length})
                </h2>
                {savingsGoals.length > 0 && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    • Total: ${totalSavingsAcumulado.toLocaleString()} COP
                  </span>
                )}
              </div>
              <button
                onClick={() => handleOpenCreate('personal')}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 font-semibold px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo plan</span>
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/70 dark:border-white/10 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                      className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm leading-snug">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                              {percent}%
                            </span>
                            <AppTooltip content="Eliminar meta de ahorro">
                              <button
                                type="button"
                                onClick={() => deletePersonalItem(goal.id)}
                                className="p-1 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                aria-label="Eliminar plan de ahorro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </AppTooltip>
                          </div>
                        </div>

                        {/* Kinetic Progress Bar con Spring Physics */}
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden my-2.5">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${percent}%` }}
                            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                          <span>${current.toLocaleString()}</span>
                          <span className="text-zinc-400 dark:text-zinc-500">Meta: ${target.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Botones de acción rápida con tacto háptico */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => adjustSavings(goal.id, 50000)}
                            className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono font-medium transition-colors cursor-pointer"
                            title="Abonar $50.000 COP rápidamente"
                          >
                            +50k
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => adjustSavings(goal.id, 100000)}
                            className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono font-medium transition-colors cursor-pointer"
                            title="Abonar $100.000 COP rápidamente"
                          >
                            +100k
                          </motion.button>
                          {current >= 50000 && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => adjustSavings(goal.id, -50000)}
                              className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono font-medium transition-colors cursor-pointer"
                              title="Retirar $50.000 COP rápidamente"
                            >
                              -50k
                            </motion.button>
                          )}
                        </div>

                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.94 }}
                          onClick={() => openAdjustModal(goal)}
                          className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Ajustar
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal universal para crear materia, proyecto o nota */}
      <UniversalCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalInitialType}
      />

      {/* Modal interactivo de ajuste de ahorro */}
      <AdjustSavingsModal
        goal={selectedSavingsGoal}
        isOpen={isSavingsModalOpen}
        onClose={() => {
          setIsSavingsModalOpen(false);
          setSelectedSavingsGoal(null);
        }}
      />

      {/* Modal de edición de nota rápida */}
      <EditNoteModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
      />
    </div>
  );
}
