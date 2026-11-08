'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  User,
  Phone,
  Layers,
  Sparkle,
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

export interface UniversalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'job' | 'personal' | 'note' | 'savings' | null;
}

type ModalTab = 'job' | 'personal' | 'savings' | 'note';
type PersonalCategory = 'study' | 'dev';
type JobStep = 1 | 2;

// Date helpers
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => formatLocalDate(new Date());

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
};

const getPlusDaysStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
};

export function UniversalCreateModal({ isOpen, onClose, initialType }: UniversalCreateModalProps) {
  const { clients, createJob, createPersonalItem, activeTab: workspaceTab, mode } = useWorkspace();
  const dragControls = useDragControls();

  // Contextual Detection for Initial Tab
  const getContextualTab = (): ModalTab => {
    if (initialType === 'job') return 'job';
    if (initialType === 'note') return 'note';
    if (initialType === 'savings') return 'savings';
    if (initialType === 'personal') {
      if (workspaceTab === 'personal_savings') return 'savings';
      return 'personal';
    }
    // Contextual fallback based on workspace view and mode
    if (workspaceTab === 'personal_savings') return 'savings';
    if (['personal_subjects', 'personal_goals', 'personal_ideas'].includes(workspaceTab)) return 'personal';
    if (mode === 'personal') return 'personal';
    return 'job';
  };

  const [activeTab, setActiveTab] = useState<ModalTab>('job');
  const [jobStep, setJobStep] = useState<JobStep>(1);

  // Job Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('McGraw-Hill Connect');
  const [customPlatform, setCustomPlatform] = useState('');
  const [platformUser, setPlatformUser] = useState('');
  const [platformPass, setPlatformPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | ''>(50000);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [deadlineDate, setDeadlineDate] = useState('2026-11-08');
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');
  const [deliverables, setDeliverables] = useState<
    Array<{ id: string; title: string; isCompleted: boolean; type?: 'assignment' | 'test' }>
  >([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ clientName?: string; subject?: string }>({});

  // Personal Form State (Study / Dev)
  const [personalCategory, setPersonalCategory] = useState<PersonalCategory>('study');
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalDesc, setPersonalDesc] = useState('');

  // Savings Form State
  const [savingsTitle, setSavingsTitle] = useState('');
  const [savingsDesc, setSavingsDesc] = useState('');
  const [savingsTarget, setSavingsTarget] = useState<number | ''>(1000000);
  const [savingsCurrent, setSavingsCurrent] = useState<number | ''>(0);

  // Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab and default date on modal open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(getContextualTab());
      setJobStep(1);
      setDeadlineDate(getTodayStr());
      setValidationErrors({});
    }
  }, [isOpen, initialType, workspaceTab, mode]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Client Suggestions for Job Form
  const clientSuggestions = useMemo(() => {
    if (!clientName.trim()) return [];
    const query = clientName.toLowerCase().trim();
    return clients
      .filter((c) => c.name.toLowerCase().includes(query) && c.name.toLowerCase() !== query)
      .slice(0, 3);
  }, [clients, clientName]);

  const handleSelectClient = (c: { name: string; phone: string }) => {
    setClientName(c.name);
    if (c.phone) setClientPhone(c.phone);
    if (validationErrors.clientName) {
      setValidationErrors((prev) => ({ ...prev, clientName: undefined }));
    }
  };

  // Deliverables Presets
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
    setPlatform('McGraw-Hill Connect');
    if (!subject.trim()) setSubject('Inglés Connect');
  };

  const applyPresetCorte = () => {
    setDeliverables([
      { id: `d-corte-1-${Date.now()}`, title: 'Taller Preparatorio', isCompleted: false, type: 'assignment' },
      { id: `d-corte-2-${Date.now()}`, title: 'Examen Parcial de Corte', isCompleted: false, type: 'test' },
      { id: `d-corte-3-${Date.now()}`, title: 'Proyecto / Entrega Final', isCompleted: false, type: 'assignment' },
    ]);
  };

  const applyPresetTaller = () => {
    setDeliverables([
      { id: `d-taller-1-${Date.now()}`, title: 'Guía / Taller de Ejercicios', isCompleted: false, type: 'assignment' },
      { id: `d-taller-2-${Date.now()}`, title: 'Solución Escrita en PDF', isCompleted: false, type: 'assignment' },
      { id: `d-taller-3-${Date.now()}`, title: 'Sustentación / Diapositivas', isCompleted: false, type: 'test' },
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

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  // Reset and Close
  const handleCloseAndReset = () => {
    onClose();
    setClientName('');
    setClientPhone('');
    setSubject('');
    setTitle('');
    setPlatform('McGraw-Hill Connect');
    setCustomPlatform('');
    setPlatformUser('');
    setPlatformPass('');
    setShowPassword(false);
    setTotalPrice(50000);
    setPaidAmount(0);
    setDeadlineDate(getTodayStr());
    setDeadlineTime('11:59 PM');
    setDeliverables([]);
    setValidationErrors({});
    setJobStep(1);
    setPersonalTitle('');
    setPersonalDesc('');
    setSavingsTitle('');
    setSavingsDesc('');
    setSavingsTarget(1000000);
    setSavingsCurrent(0);
    setNoteTitle('');
    setNoteContent('');
  };

  // Submissions
  const handleJobSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: { clientName?: string; subject?: string } = {};
    if (!clientName.trim()) {
      errors.clientName = 'Ingresa el nombre del cliente';
    }
    if (!subject.trim()) {
      errors.subject = 'Ingresa la materia';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setJobStep(1);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    try {
      const deliverablesToSave =
        deliverables.length > 0
          ? deliverables
          : [{ id: `d-single-${Date.now()}`, title: title.trim() || `${subject.trim()} Completo`, isCompleted: false }];

      const finalPlatform = platform === 'Otro' ? customPlatform.trim() || 'Otro' : platform.trim();

      await createJob({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || '573000000000',
        subject: subject.trim(),
        title: title.trim() || `${subject.trim()} Entrega`,
        deadlineTime: deadlineTime || '11:59 PM',
        deadlineDate: deadlineDate || getTodayStr(),
        isUrgentToday: deadlineDate === getTodayStr(),
        totalPrice: Number(totalPrice) || 0,
        paidAmount: Number(paidAmount) || 0,
        currency: 'COP',
        platform: finalPlatform || 'Aula Virtual',
        platformUser: platformUser.trim() || 'estudiante',
        platformPass: platformPass.trim() || '123456',
        status: 'in_progress',
        deliverables: deliverablesToSave,
      });

      handleCloseAndReset();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!personalTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createPersonalItem({
        category: personalCategory,
        title: personalTitle.trim(),
        description: personalDesc.trim() || undefined,
        isDone: false,
      });
      handleCloseAndReset();
    } catch (err) {
      console.error('Failed to create personal item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavingsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!savingsTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createPersonalItem({
        category: 'savings',
        title: savingsTitle.trim(),
        description: savingsDesc.trim() || undefined,
        currentAmount: Number(savingsCurrent) || 0,
        targetAmount: Number(savingsTarget) || 100000,
        isDone: false,
      });
      handleCloseAndReset();
    } catch (err) {
      console.error('Failed to create savings goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoteSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createPersonalItem({
        category: 'note',
        title: noteTitle.trim(),
        description: noteContent.trim() || undefined,
        isDone: false,
      });
      handleCloseAndReset();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActiveFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'job') {
      handleJobSubmit();
    } else if (activeTab === 'personal') {
      handlePersonalSubmit();
    } else if (activeTab === 'savings') {
      handleSavingsSubmit();
    } else if (activeTab === 'note') {
      handleNoteSubmit();
    }
  };

  if (!isOpen) return null;

  // Tabs Definition
  const TABS: Array<{ id: ModalTab; label: string; icon: React.ElementType }> = [
    { id: 'job', label: 'Trabajo Cliente', icon: Briefcase },
    { id: 'personal', label: 'Materia / Dev', icon: GraduationCap },
    { id: 'savings', label: 'Ahorro', icon: PiggyBank },
    { id: 'note', label: 'Nota', icon: FileText },
  ];

  return (
    <div
      onClick={handleCloseAndReset}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs select-none p-0 sm:p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 450) {
            handleCloseAndReset();
          }
        }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-zinc-200/80 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* NON-SCROLLING HEADER */}
        <div className="shrink-0 px-4 pt-3 pb-3 sm:px-6 sm:pt-4 border-b border-zinc-100 bg-white">
          {/* Mobile Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full py-1.5 cursor-grab active:cursor-grabbing flex justify-center touch-none sm:hidden mb-1"
            title="Arrastra para cerrar"
          >
            <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
          </div>

          {/* Title & Close */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
                {activeTab === 'job'
                  ? 'Gestor de Trabajos'
                  : activeTab === 'personal'
                  ? 'Espacio Personal'
                  : activeTab === 'savings'
                  ? 'Finanzas Personales'
                  : 'Anotaciones Rápidas'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 leading-tight">
                {activeTab === 'job'
                  ? 'Nuevo Trabajo de Cliente'
                  : activeTab === 'personal'
                  ? personalCategory === 'study'
                    ? 'Nueva Materia o Parcial'
                    : 'Nuevo Proyecto Dev'
                  : activeTab === 'savings'
                  ? 'Nueva Meta de Ahorro'
                  : 'Nueva Nota Rápida'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseAndReset}
              className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 flex items-center justify-center transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1-Tap Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100/90 rounded-xl overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setValidationErrors({});
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold shrink-0 sm:flex-1 transition-all min-h-[38px] ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Progressive Step Selector for Job */}
          {activeTab === 'job' && (
            <div className="flex items-center gap-1.5 p-1 mt-2.5 bg-zinc-50 border border-zinc-200/70 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setJobStep(1)}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  jobStep === 1
                    ? 'bg-white text-zinc-900 font-bold shadow-xs border border-zinc-200/60'
                    : 'text-zinc-500 hover:text-zinc-800 font-medium'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                    jobStep === 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  1
                </span>
                <span>Parte 1: Lo esencial</span>
                <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline">(10 seg)</span>
              </button>

              <button
                type="button"
                onClick={() => setJobStep(2)}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  jobStep === 2
                    ? 'bg-white text-zinc-900 font-bold shadow-xs border border-zinc-200/60'
                    : 'text-zinc-500 hover:text-zinc-800 font-medium'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                    jobStep === 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  2
                </span>
                <span>Parte 2: Detalles</span>
                {deliverables.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white text-[10px] font-mono font-bold">
                    {deliverables.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ACTIVE FORM WRAPPER (Includes Scrollable Body & Sticky Footer) */}
        <form onSubmit={handleActiveFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4 overscroll-contain text-xs">
            {/* ===================== TAB 1: JOB (TRABAJO CLIENTE) ===================== */}
            {activeTab === 'job' && (
              <>
                {/* STEP 1: LO ESENCIAL (10 SEGUNDOS) */}
                {jobStep === 1 && (
                  <div className="space-y-3.5">
                    {/* Cliente & WhatsApp */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-zinc-800">
                          Cliente & WhatsApp <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Nombre del estudiante"
                            value={clientName}
                            onChange={(e) => {
                              setClientName(e.target.value);
                              if (validationErrors.clientName) {
                                setValidationErrors((prev) => ({ ...prev, clientName: undefined }));
                              }
                            }}
                            className={`w-full px-3 py-2.5 rounded-xl border bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors ${
                              validationErrors.clientName
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-zinc-200 focus:border-zinc-900'
                            }`}
                          />
                        </div>
                        <div className="w-full sm:w-44 relative">
                          <input
                            type="tel"
                            placeholder="WhatsApp (ej. 3001234567)"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-mono min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* Error or Client Suggestions */}
                      {validationErrors.clientName && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">{validationErrors.clientName}</p>
                      )}
                      {clientSuggestions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                          <span className="text-[10px] text-zinc-400 font-medium">Sugerencias:</span>
                          {clientSuggestions.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectClient(c)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 text-[11px] font-medium transition-colors"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Materia y Título */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Materia <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Inglés Connect, Cálculo"
                          value={subject}
                          onChange={(e) => {
                            setSubject(e.target.value);
                            if (validationErrors.subject) {
                              setValidationErrors((prev) => ({ ...prev, subject: undefined }));
                            }
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl border bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors ${
                            validationErrors.subject
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-zinc-200 focus:border-zinc-900'
                          }`}
                        />
                        {validationErrors.subject && (
                          <p className="text-[11px] text-red-500 mt-1 font-medium">{validationErrors.subject}</p>
                        )}
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-1.5 no-scrollbar">
                          {['Inglés Connect', 'Cálculo', 'Física', 'Programación'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setSubject(s);
                                if (validationErrors.subject) {
                                  setValidationErrors((prev) => ({ ...prev, subject: undefined }));
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium shrink-0 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">Título de la entrega</label>
                        <input
                          type="text"
                          placeholder="ej. Corte 2, Taller 3, Parcial"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                        />
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-1.5 no-scrollbar">
                          {['Corte 1', 'Corte 2', 'Taller Final', 'Semana 1-8'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTitle(t)}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium shrink-0 transition-colors"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Precio Pactado y Abono Inicial */}
                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-zinc-800">Tarifa pactada ($)</label>
                        </div>
                        <input
                          type="number"
                          step="5000"
                          value={totalPrice}
                          onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 text-sm min-h-[42px]"
                        />
                        <div className="flex items-center gap-1 pt-1.5 flex-wrap">
                          {[40000, 50000, 60000, 80000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setTotalPrice(amt)}
                              className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono font-medium hover:bg-zinc-100 transition-colors"
                            >
                              ${amt / 1000}k
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-zinc-800">Abono inicial ($)</label>
                        </div>
                        <input
                          type="number"
                          step="5000"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 text-sm min-h-[42px]"
                        />
                        <div className="flex items-center gap-1 pt-1.5">
                          <button
                            type="button"
                            onClick={() => setPaidAmount(0)}
                            className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-medium hover:bg-zinc-100 transition-colors"
                          >
                            $0
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaidAmount(Math.round((Number(totalPrice) || 0) / 2))}
                            className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-medium hover:bg-zinc-100 transition-colors"
                          >
                            50%
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaidAmount(Number(totalPrice) || 0)}
                            className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-medium hover:bg-zinc-100 transition-colors"
                          >
                            100%
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fecha y Hora de Entrega */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">Fecha de entrega</label>
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium text-xs sm:text-sm min-h-[42px]"
                        />
                        <div className="flex items-center gap-1 pt-1.5">
                          <button
                            type="button"
                            onClick={() => setDeadlineDate(getTodayStr())}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              deadlineDate === getTodayStr()
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                            }`}
                          >
                            Hoy
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeadlineDate(getTomorrowStr())}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              deadlineDate === getTomorrowStr()
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                            }`}
                          >
                            Mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeadlineDate(getPlusDaysStr(3))}
                            className="px-2 py-0.5 rounded text-[10px] font-medium border bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 transition-colors"
                          >
                            En 3 días
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">Hora límite</label>
                        <input
                          type="text"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          placeholder="ej. 11:59 PM"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-mono text-xs sm:text-sm min-h-[42px]"
                        />
                        <div className="flex items-center gap-1 pt-1.5">
                          {['11:59 PM', '6:00 PM', '12:00 PM'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDeadlineTime(t)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                                deadlineTime === t
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DETALLES OPCIONALES (PLATAFORMA, CREDENCIALES, PRESETS) */}
                {jobStep === 2 && (
                  <div className="space-y-4">
                    {/* Selector de Plataforma */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                      <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500">
                        Plataforma del Trabajo
                      </label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
                        {['McGraw-Hill Connect', 'Moodle', 'Teams / Aula', 'Canvas', 'Classroom', 'Otro'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPlatform(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 min-h-[36px] transition-colors ${
                              platform === p
                                ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                                : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      {platform === 'Otro' && (
                        <input
                          type="text"
                          placeholder="Nombre de la plataforma personalizada..."
                          value={customPlatform}
                          onChange={(e) => setCustomPlatform(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs min-h-[40px] focus:outline-none focus:border-zinc-900"
                        />
                      )}

                      {/* Credenciales */}
                      <div className="pt-2 border-t border-zinc-200/60">
                        <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                          Credenciales de Ingreso (Opcional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Usuario / Correo institucional"
                            value={platformUser}
                            onChange={(e) => setPlatformUser(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-white border border-zinc-200 font-mono text-zinc-900 text-xs min-h-[42px] focus:outline-none focus:border-zinc-900"
                          />
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Contraseña del portal"
                              value={platformPass}
                              onChange={(e) => setPlatformPass(e.target.value)}
                              className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-zinc-200 font-mono text-zinc-900 text-xs min-h-[42px] focus:outline-none focus:border-zinc-900"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Presets de Entregables */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-zinc-900 text-xs">Presets de Entregables</span>
                          <p className="text-[10px] text-zinc-500">Carga automática de actividades en 1 toque</p>
                        </div>
                        {deliverables.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDeliverables([])}
                            className="text-[11px] text-red-600 hover:text-red-700 font-semibold transition-colors"
                          >
                            Limpiar ({deliverables.length})
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={applyPresetConnect}
                          className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-900 active:bg-zinc-100 text-left transition-all group"
                        >
                          <div className="font-bold text-zinc-900 text-xs flex items-center justify-between">
                            <span>Connect</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                              17
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight line-clamp-2">
                            8 Assignments + 8 Tests
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={applyPresetCorte}
                          className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-900 active:bg-zinc-100 text-left transition-all group"
                        >
                          <div className="font-bold text-zinc-900 text-xs flex items-center justify-between">
                            <span>Corte</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                              3
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight line-clamp-2">
                            Taller + Parcial + Final
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={applyPresetTaller}
                          className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-900 active:bg-zinc-100 text-left transition-all group"
                        >
                          <div className="font-bold text-zinc-900 text-xs flex items-center justify-between">
                            <span>Taller</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                              3
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight line-clamp-2">
                            Guía + Solución + Sustenta
                          </p>
                        </button>
                      </div>

                      {/* Deliverables List */}
                      {deliverables.length > 0 && (
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border-t border-zinc-200/60 pt-2.5">
                          {deliverables.map((d, i) => (
                            <div
                              key={d.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/80 text-xs"
                            >
                              <span className="truncate font-medium text-zinc-800">
                                {i + 1}. {d.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeDeliverable(d.id)}
                                className="p-1 rounded-md text-zinc-400 hover:text-red-600 transition-colors ml-2"
                                aria-label={`Eliminar entregable ${d.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Manual Deliverable Input */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Añadir entregable individual..."
                          value={newDeliverableTitle}
                          onChange={(e) => setNewDeliverableTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addManualDeliverable();
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 min-h-[40px]"
                        />
                        <button
                          type="button"
                          onClick={addManualDeliverable}
                          className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 font-semibold text-xs flex items-center gap-1 transition-colors min-h-[40px]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===================== TAB 2: MATERIA / DEV ===================== */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                {/* Category Pill Switcher */}
                <div className="flex p-1 bg-zinc-100 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setPersonalCategory('study')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                      personalCategory === 'study'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Materia U (Propia)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalCategory('dev')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                      personalCategory === 'dev'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Proyecto Dev</span>
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">
                    {personalCategory === 'study' ? 'Título de la Materia / Tarea' : 'Título del Proyecto'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      personalCategory === 'study'
                        ? 'ej. Álgebra Lineal - Taller 2 o Parcial Final'
                        : 'ej. API Scraper de Precios con Supabase'
                    }
                    value={personalTitle}
                    onChange={(e) => setPersonalTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Descripción o Notas</label>
                  <textarea
                    rows={4}
                    placeholder="Detalles, enlaces de GitHub, requerimientos o temas a estudiar..."
                    value={personalDesc}
                    onChange={(e) => setPersonalDesc(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ===================== TAB 3: AHORRO FINANCIERO ===================== */}
            {activeTab === 'savings' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Título de la Meta de Ahorro</label>
                  <input
                    type="text"
                    placeholder="ej. Fondo Laptop M3, Fondo de Emergencia, Viaje..."
                    value={savingsTitle}
                    onChange={(e) => setSavingsTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div>
                    <label className="block text-[11px] text-zinc-600 font-semibold mb-1">Ahorro Actual (COP)</label>
                    <input
                      type="number"
                      step="50000"
                      value={savingsCurrent}
                      onChange={(e) => setSavingsCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 font-semibold mb-1">Meta Objetivo (COP)</label>
                    <input
                      type="number"
                      step="50000"
                      value={savingsTarget}
                      onChange={(e) => setSavingsTarget(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Progress preview */}
                {Number(savingsTarget) > 0 && (
                  <div className="p-3 rounded-xl bg-zinc-100/70 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-700">
                      <span>Progreso proyectado</span>
                      <span className="font-mono">
                        {Math.min(100, Math.round(((Number(savingsCurrent) || 0) / (Number(savingsTarget) || 1)) * 100))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((Number(savingsCurrent) || 0) / (Number(savingsTarget) || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Nota o Plan (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="ej. Aportar 100.000 COP de cada trabajo completado..."
                    value={savingsDesc}
                    onChange={(e) => setSavingsDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ===================== TAB 4: NOTA RÁPIDA ===================== */}
            {activeTab === 'note' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Título de la Nota</label>
                  <input
                    type="text"
                    placeholder="ej. Credenciales Moodle temporales, Ideas de negocio, Dudas..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Contenido de la Nota</label>
                  <textarea
                    rows={5}
                    placeholder="Escribe lo que quieras recordar rápidamente..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STICKY FOOTER (ALWAYS FIXED AT BOTTOM, NEVER HIDDEN BY KEYBOARD) */}
          <div className="shrink-0 px-4 py-3 sm:px-6 bg-white/95 backdrop-blur-sm border-t border-zinc-100 flex items-center justify-between gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
            {activeTab === 'job' ? (
              jobStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 rounded-xl text-xs font-semibold min-h-[44px] transition-colors"
                  >
                    Cancelar
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setJobStep(2)}
                      className="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 active:bg-zinc-100 text-xs font-semibold min-h-[44px] flex items-center gap-1.5 transition-colors"
                    >
                      <span>Detalles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJobSubmit()}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs font-semibold min-h-[44px] shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        'Guardando...'
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Crear Trabajo</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setJobStep(1)}
                    className="px-3.5 py-2.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-200 rounded-xl text-xs font-semibold min-h-[44px] flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Esencial</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCloseAndReset}
                      className="px-3 py-2.5 text-zinc-500 hover:text-zinc-800 rounded-xl text-xs font-medium min-h-[44px] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJobSubmit()}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs font-semibold min-h-[44px] shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        'Guardando...'
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Crear Trabajo</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 rounded-xl text-xs font-semibold min-h-[44px] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs font-semibold min-h-[44px] shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {activeTab === 'personal'
                          ? personalCategory === 'study'
                            ? 'Crear Materia'
                            : 'Crear Proyecto'
                          : activeTab === 'savings'
                          ? 'Crear Meta de Ahorro'
                          : 'Guardar Nota'}
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
