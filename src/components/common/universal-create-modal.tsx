'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { 
  X, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  PiggyBank, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UniversalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'job' | 'personal' | 'note' | null;
}

type CreateStep = 'select' | 'job' | 'personal' | 'note';

export function UniversalCreateModal({ isOpen, onClose, initialType }: UniversalCreateModalProps) {
  const { clients, createJob, createPersonalItem } = useWorkspace();
  const [step, setStep] = useState<CreateStep>(initialType || 'select');

  // Job Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('McGraw-Hill Connect');
  const [platformUser, setPlatformUser] = useState('');
  const [platformPass, setPlatformPass] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>(50000);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [deadlineDate, setDeadlineDate] = useState('2026-11-08');
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');
  const [deliverables, setDeliverables] = useState<Array<{ id: string; title: string; isCompleted: boolean; type?: 'assignment' | 'test' }>>([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');

  // Personal Form State
  const [personalCategory, setPersonalCategory] = useState<'study' | 'dev' | 'savings'>('study');
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalDesc, setPersonalDesc] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>(1000000);
  const [currentAmount, setCurrentAmount] = useState<number | ''>(0);

  // Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset step when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialType || 'select');
    }
  }, [isOpen, initialType]);

  // University Presets for Jobs
  const applyPresetConnect = () => {
    const items: Array<{ id: string; title: string; isCompleted: boolean; type?: 'assignment' | 'test' }> = [];
    for (let i = 1; i <= 8; i++) {
      items.push({ id: `d-gen-a-${i}`, title: `Assignment ${i}`, isCompleted: false, type: 'assignment' });
    }
    for (let i = 1; i <= 8; i++) {
      items.push({ id: `d-gen-t-${i}`, title: `Test Unit ${i}`, isCompleted: false, type: 'test' });
    }
    items.push({ id: 'd-gen-pt', title: 'Progress Check Test', isCompleted: false, type: 'test' });
    setDeliverables(items);
    if (!platform) setPlatform('McGraw-Hill Connect');
    if (!subject) setSubject('Inglés Connect');
  };

  const applyPresetCorte = () => {
    setDeliverables([
      { id: 'd-gen-1', title: 'Taller Preparatorio', isCompleted: false, type: 'assignment' },
      { id: 'd-gen-2', title: 'Examen Parcial de Corte', isCompleted: false, type: 'test' },
      { id: 'd-gen-3', title: 'Proyecto / Entrega Final', isCompleted: false, type: 'assignment' },
    ]);
  };

  const addManualDeliverable = () => {
    if (!newDeliverableTitle.trim()) return;
    setDeliverables((prev) => [
      ...prev,
      { id: `d-man-${Date.now()}`, title: newDeliverableTitle.trim(), isCompleted: false, type: 'assignment' },
    ]);
    setNewDeliverableTitle('');
  };

  // Submit Job
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !subject.trim()) return;
    setIsSubmitting(true);

    const deliverablesToSave = deliverables.length > 0 ? deliverables : [
      { id: `d-single-${Date.now()}`, title: title.trim() || 'Trabajo Completo', isCompleted: false },
    ];

    await createJob({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '573000000000',
      subject: subject.trim(),
      title: title.trim() || `${subject} Entrega`,
      deadlineTime: deadlineTime || '11:59 PM',
      deadlineDate: deadlineDate || '2026-11-08',
      isUrgentToday: true,
      totalPrice: Number(totalPrice) || 0,
      paidAmount: Number(paidAmount) || 0,
      currency: 'COP',
      platform: platform.trim() || 'Aula Virtual',
      platformUser: platformUser.trim() || 'estudiante',
      platformPass: platformPass.trim() || '123456',
      status: 'in_progress',
      deliverables: deliverablesToSave,
    });

    setIsSubmitting(false);
    onClose();
  };

  // Submit Personal Goal
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalTitle.trim()) return;
    setIsSubmitting(true);

    await createPersonalItem({
      category: personalCategory,
      title: personalTitle.trim(),
      description: personalDesc.trim() || undefined,
      isDone: false,
      currentAmount: personalCategory === 'savings' ? Number(currentAmount) || 0 : undefined,
      targetAmount: personalCategory === 'savings' ? Number(targetAmount) || 100 : undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  // Submit Note
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setIsSubmitting(true);

    await createPersonalItem({
      category: 'note',
      title: noteTitle.trim(),
      description: noteContent.trim() || undefined,
      isDone: false,
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs select-none"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
          }
        }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200/80 shadow-2xl p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6"
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="w-10 h-1.5 rounded-full bg-zinc-300 mx-auto mb-2.5 sm:hidden cursor-grab active:cursor-grabbing" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <button
                type="button"
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 flex items-center justify-center transition-colors"
                title="Volver"
                aria-label="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
                {step === 'select' ? '¿Qué deseas crear?' : step === 'job' ? 'Nuevo Trabajo de Cliente' : step === 'note' ? 'Nueva Nota Rápida' : 'Nueva Meta Personal'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                {step === 'select' ? 'Crear Registro' : step === 'job' ? 'Detalles del Trabajo' : step === 'note' ? 'Bloc de Notas' : 'Meta Personal'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Choice Screen */}
        {step === 'select' && (
          <div className="py-4 space-y-2.5">
            <button
              onClick={() => setStep('job')}
              className="w-full p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 flex items-center gap-3 transition-colors text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">
                  Trabajo Universitario para Cliente
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Connect, Moodle, Teams, tarifa, credenciales y presets
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPersonalCategory('study');
                setStep('personal');
              }}
              className="w-full p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 flex items-center gap-3 transition-colors text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">
                  Materia o Tarea Propia (U)
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Parciales, entregas semestrales o metas académicas personales
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPersonalCategory('dev');
                setStep('personal');
              }}
              className="w-full p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 flex items-center gap-3 transition-colors text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">
                  Proyecto de Programación / Idea Dev
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Software, herramientas, notas de desarrollo e ideas de negocio
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPersonalCategory('savings');
                setStep('personal');
              }}
              className="w-full p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 flex items-center gap-3 transition-colors text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">
                  Plan de Ahorro Financiero
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Metas de dinero acumulado (Laptop M3, fondo de emergencia)
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('note')}
              className="w-full p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 active:bg-zinc-100 flex items-center gap-3 transition-colors text-left min-h-[56px]"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 text-sm">
                  Nota Rápida
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Apuntes, recordatorios, requerimientos o ideas rápidas
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 2: Job Form */}
        {step === 'job' && (
          <form onSubmit={handleJobSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Cliente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del estudiante"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="flex-1 px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-32 px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Materia</label>
                <input
                  type="text"
                  placeholder="ej. Inglés Connect"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Título</label>
                <input
                  type="text"
                  placeholder="ej. Corte 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Plataforma & Credenciales */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500">
                Plataforma & Credenciales
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
                {['McGraw-Hill Connect', 'Moodle', 'Teams / Aula', 'Canvas', 'Classroom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium shrink-0 min-h-[32px] transition-colors ${
                      platform === p ? 'bg-zinc-900 text-white font-semibold' : 'bg-white border border-zinc-200/80 text-zinc-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Usuario"
                  value={platformUser}
                  onChange={(e) => setPlatformUser(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-zinc-200/80 font-mono text-zinc-900 text-xs min-h-[40px]"
                />
                <input
                  type="text"
                  placeholder="Contraseña"
                  value={platformPass}
                  onChange={(e) => setPlatformPass(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-zinc-200/80 font-mono text-zinc-900 text-xs min-h-[40px]"
                />
              </div>
            </div>

            {/* Tarifa & Fecha */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-medium text-zinc-700 mb-0.5">Tarifa ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-zinc-200/80 bg-white font-bold font-mono text-zinc-900 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-0.5">Abono ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-zinc-200/80 bg-white font-bold font-mono text-zinc-900 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-0.5">Fecha</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-zinc-200/80 bg-white text-zinc-900 min-h-[40px]"
                />
              </div>
            </div>

            {/* Presets Universitarios */}
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-800 text-xs">
                  Entregables ({deliverables.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={applyPresetConnect}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold flex items-center gap-1 min-h-[32px] transition-colors"
                  >
                    <span>Connect (17)</span>
                  </button>
                  <button
                    type="button"
                    onClick={applyPresetCorte}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold min-h-[32px] transition-colors"
                  >
                    Corte (3)
                  </button>
                </div>
              </div>

              {deliverables.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 mb-2 pr-1">
                  {deliverables.map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs">
                      <span className="truncate">{i + 1}. {d.title}</span>
                      <button 
                        type="button" 
                        onClick={() => setDeliverables(deliverables.filter(x => x.id !== d.id))}
                        className="p-1 rounded-md text-zinc-400 hover:text-red-600 min-w-[32px] min-h-[32px] flex items-center justify-center transition-colors"
                        aria-label={`Eliminar entregable ${d.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 rounded-lg text-xs font-medium min-h-[44px] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs min-h-[44px] shadow-sm transition-all"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Trabajo'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Personal Goal Form */}
        {step === 'personal' && (
          <form onSubmit={handlePersonalSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Título</label>
              <input
                type="text"
                placeholder={personalCategory === 'study' ? 'ej. Álgebra Lineal - Taller 2' : personalCategory === 'dev' ? 'ej. Scraper con Next.js' : 'ej. Fondo Laptop M3'}
                value={personalTitle}
                onChange={(e) => setPersonalTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descripción o Notas</label>
              <textarea
                rows={3}
                placeholder="Detalles, enlaces o requerimientos..."
                value={personalDesc}
                onChange={(e) => setPersonalDesc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
              />
            </div>

            {personalCategory === 'savings' && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-medium mb-1">Ahorro Actual (COP)</label>
                  <input
                    type="number"
                    step="50000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-zinc-200/80 bg-white font-bold font-mono text-zinc-900 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-medium mb-1">Meta Objetivo (COP)</label>
                  <input
                    type="number"
                    step="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-zinc-200/80 bg-white font-bold font-mono text-zinc-900 min-h-[40px]"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 rounded-lg text-xs font-medium min-h-[44px] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs min-h-[44px] shadow-sm transition-all"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Registro'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Note Form (Bloc de Notas Rápidas) */}
        {step === 'note' && (
          <form onSubmit={handleNoteSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Título de la Nota</label>
              <input
                type="text"
                placeholder="ej. Requerimientos Connect, Login temporal, Idea..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[42px]"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Contenido de la Nota</label>
              <textarea
                rows={4}
                placeholder="Escribe lo que quieras recordar aquí..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 rounded-lg text-xs font-medium min-h-[44px] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs min-h-[44px] shadow-sm transition-all"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Nota'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
