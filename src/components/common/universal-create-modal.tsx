'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import {
  X,
  Briefcase,
  GraduationCap,
  PiggyBank,
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

export interface UniversalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'job' | 'personal' | 'note' | 'savings' | null;
}

type ModalMode = 'hub' | 'job' | 'personal' | 'savings' | 'note';
type PersonalCategory = 'study' | 'dev';

// Date helpers
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => formatLocalDate(new Date());

export function UniversalCreateModal({ isOpen, onClose, initialType }: UniversalCreateModalProps) {
  const { clients, createJob, createPersonalItem } = useWorkspace();
  const dragControls = useDragControls();

  // Active Screen Mode: 'hub' (4 elegant circles) or dedicated forms
  const [activeMode, setActiveMode] = useState<ModalMode>('hub');

  // Job Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>(50000);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');

  // Platform & Credentials Accordion State
  const [showPlatformAccordion, setShowPlatformAccordion] = useState(false);
  const [platform, setPlatform] = useState('McGraw-Hill Connect');
  const [customPlatform, setCustomPlatform] = useState('');
  const [platformUser, setPlatformUser] = useState('');
  const [platformPass, setPlatformPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Sync mode and default state on open
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setActiveMode(initialType);
      } else {
        setActiveMode('hub');
      }
      setDeadlineDate(getTodayStr());
      setValidationErrors({});
      setShowPlatformAccordion(false);
    }
  }, [isOpen, initialType]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseAndReset();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    setActiveMode('hub');
    setClientName('');
    setClientPhone('');
    setSubject('');
    setTitle('');
    setPlatform('McGraw-Hill Connect');
    setCustomPlatform('');
    setPlatformUser('');
    setPlatformPass('');
    setShowPassword(false);
    setShowPlatformAccordion(false);
    setTotalPrice(50000);
    setPaidAmount(0);
    setDeadlineDate(getTodayStr());
    setDeadlineTime('11:59 PM');
    setDeliverables([]);
    setValidationErrors({});
    setPersonalTitle('');
    setPersonalDesc('');
    setPersonalCategory('study');
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
    if (activeMode === 'job') {
      handleJobSubmit();
    } else if (activeMode === 'personal') {
      handlePersonalSubmit();
    } else if (activeMode === 'savings') {
      handleSavingsSubmit();
    } else if (activeMode === 'note') {
      handleNoteSubmit();
    }
  };

  if (!isOpen) return null;

  // 4 Modes Configuration
  const MODES: Array<{
    id: 'job' | 'personal' | 'savings' | 'note';
    label: string;
    desc: string;
    icon: React.ElementType;
    isDark?: boolean;
  }> = [
    {
      id: 'job',
      label: 'Trabajo Cliente',
      desc: 'Encargo de estudiante',
      icon: Briefcase,
      isDark: true,
    },
    {
      id: 'personal',
      label: 'Materia / Tarea U',
      desc: 'Universidad o estudio',
      icon: GraduationCap,
      isDark: false,
    },
    {
      id: 'savings',
      label: 'Plan de Ahorro',
      desc: 'Meta financiera',
      icon: PiggyBank,
      isDark: false,
    },
    {
      id: 'note',
      label: 'Nota Rápida',
      desc: 'Apunte o recordatorio',
      icon: FileText,
      isDark: false,
    },
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
        className="w-full sm:max-w-md md:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-zinc-200/90 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* ===================== CREATION HUB (4 ELEGANT CIRCLES) ===================== */}
        {activeMode === 'hub' ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="shrink-0 px-5 pt-3 pb-2 sm:px-6 sm:pt-4 border-b border-zinc-100 bg-white">
              {/* Mobile Drag Handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full py-1.5 cursor-grab active:cursor-grabbing flex justify-center touch-none sm:hidden mb-1"
                title="Arrastra para cerrar"
              >
                <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                    Centro de Creación
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tight">
                    ¿Qué deseas crear?
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
              <p className="text-xs text-zinc-500 mt-0.5">
                Selecciona una categoría para comenzar
              </p>
            </div>

            {/* Hub Body: 2x2 Grid with Elegant 64px+ Circles */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-7 flex items-center justify-center"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full max-w-sm sm:max-w-md mx-auto">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setActiveMode(mode.id);
                        setValidationErrors({});
                      }}
                      className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-50/70 hover:bg-zinc-100/80 active:scale-95 border border-zinc-200/60 hover:border-zinc-300 hover:shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                    >
                      <div
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                          mode.isDark
                            ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-950/20'
                            : 'bg-white text-zinc-900 border border-zinc-200/90 shadow-xs group-hover:border-zinc-300'
                        }`}
                      >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span className="mt-3 text-xs sm:text-sm font-bold text-zinc-900 text-center leading-tight">
                        {mode.label}
                      </span>
                      <span className="mt-1 text-[11px] text-zinc-500 text-center font-normal">
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hub Footer: Clean & Light Cancel */}
            <div className="shrink-0 px-5 py-3 sm:px-6 bg-white border-t border-zinc-100 flex items-center justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 py-2 px-4 rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* ===================== DEDICATED FORM VIEW ===================== */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Form Header */}
            <div className="shrink-0 px-4 pt-3 pb-3 sm:px-6 sm:pt-4 border-b border-zinc-100 bg-white">
              {/* Mobile Drag Handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full py-1.5 cursor-grab active:cursor-grabbing flex justify-center touch-none sm:hidden mb-1"
                title="Arrastra para cerrar"
              >
                <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveMode('hub')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 px-2.5 py-1.5 -ml-1 rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>

                <div className="text-center">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center justify-center gap-1.5">
                    {activeMode === 'job' && (
                      <>
                        <Briefcase className="w-4 h-4 text-zinc-800" />
                        <span>Trabajo Cliente</span>
                      </>
                    )}
                    {activeMode === 'personal' && (
                      <>
                        <GraduationCap className="w-4 h-4 text-zinc-800" />
                        <span>{personalCategory === 'study' ? 'Materia / Tarea U' : 'Proyecto Dev'}</span>
                      </>
                    )}
                    {activeMode === 'savings' && (
                      <>
                        <PiggyBank className="w-4 h-4 text-zinc-800" />
                        <span>Plan de Ahorro</span>
                      </>
                    )}
                    {activeMode === 'note' && (
                      <>
                        <FileText className="w-4 h-4 text-zinc-800" />
                        <span>Nota Rápida</span>
                      </>
                    )}
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
            </div>

            {/* Active Form with Native Scroll & Sticky Bottom Bar */}
            <form onSubmit={handleActiveFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div
                className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4 overscroll-contain touch-pan-y text-xs"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              >
                {/* 1. TRABAJO CLIENTE */}
                {activeMode === 'job' && (
                  <div className="space-y-4">
                    {/* Cliente & WhatsApp */}
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1">
                        Cliente & WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
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
                            className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors ${
                              validationErrors.clientName
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-zinc-200 focus:border-zinc-900'
                            }`}
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="WhatsApp (ej. 300 123 4567)"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-mono min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* Error & Client Suggestions */}
                      {validationErrors.clientName && (
                        <p className="text-[11px] text-red-500 mt-1.5 font-medium">{validationErrors.clientName}</p>
                      )}
                      {clientSuggestions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
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

                    {/* Materia y Título de Entrega */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Materia <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Inglés Connect, Cálculo, Física..."
                          value={subject}
                          onChange={(e) => {
                            setSubject(e.target.value);
                            if (validationErrors.subject) {
                              setValidationErrors((prev) => ({ ...prev, subject: undefined }));
                            }
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors ${
                            validationErrors.subject
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-zinc-200 focus:border-zinc-900'
                          }`}
                        />
                        {validationErrors.subject && (
                          <p className="text-[11px] text-red-500 mt-1.5 font-medium">{validationErrors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Título de la entrega
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Corte 1, Taller 2, Parcial..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Tarifa y Abono Inicial */}
                    <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Tarifa pactada ($ COP)
                        </label>
                        <input
                          type="number"
                          step="5000"
                          placeholder="50000"
                          value={totalPrice}
                          onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 text-sm min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Abono inicial ($ COP)
                        </label>
                        <input
                          type="number"
                          step="5000"
                          placeholder="0"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 text-sm min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Fecha y Hora de Entrega */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Fecha de entrega
                        </label>
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium text-xs sm:text-sm min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1">
                          Hora límite
                        </label>
                        <input
                          type="text"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          placeholder="ej. 11:59 PM"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-mono text-xs sm:text-sm min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Acordeón Limpio: Plataforma, Credenciales y Entregables */}
                    <div className="border border-zinc-200/90 rounded-2xl overflow-hidden bg-zinc-50/40">
                      <button
                        type="button"
                        onClick={() => setShowPlatformAccordion(!showPlatformAccordion)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-800 hover:bg-zinc-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-zinc-500" />
                          <span>Plataforma y Credenciales de Ingreso (Opcional)</span>
                          {(platformUser || platformPass || platform !== 'McGraw-Hill Connect' || deliverables.length > 0) && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                            showPlatformAccordion ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showPlatformAccordion && (
                        <div className="p-3.5 pt-1 space-y-3.5 border-t border-zinc-200/60 bg-white">
                          {/* Plataforma Selector */}
                          <div>
                            <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                              Plataforma del Trabajo
                            </label>
                            <select
                              value={platform}
                              onChange={(e) => setPlatform(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-xs min-h-[40px] focus:outline-none focus:border-zinc-900"
                            >
                              <option value="McGraw-Hill Connect">McGraw-Hill Connect</option>
                              <option value="Moodle">Moodle</option>
                              <option value="Teams / Aula Virtual">Teams / Aula Virtual</option>
                              <option value="Canvas">Canvas</option>
                              <option value="Google Classroom">Google Classroom</option>
                              <option value="Otro">Otro (personalizado)</option>
                            </select>
                            {platform === 'Otro' && (
                              <input
                                type="text"
                                placeholder="Escribe el nombre de la plataforma..."
                                value={customPlatform}
                                onChange={(e) => setCustomPlatform(e.target.value)}
                                className="w-full px-3 py-2 mt-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs min-h-[40px] focus:outline-none focus:border-zinc-900"
                              />
                            )}
                          </div>

                          {/* Credenciales */}
                          <div>
                            <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                              Credenciales de Acceso
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Usuario / Correo institucional"
                                value={platformUser}
                                onChange={(e) => setPlatformUser(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-zinc-50/50 border border-zinc-200 font-mono text-zinc-900 text-xs min-h-[42px] focus:bg-white focus:outline-none focus:border-zinc-900"
                              />
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Contraseña del portal"
                                  value={platformPass}
                                  onChange={(e) => setPlatformPass(e.target.value)}
                                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-zinc-50/50 border border-zinc-200 font-mono text-zinc-900 text-xs min-h-[42px] focus:bg-white focus:outline-none focus:border-zinc-900"
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

                          {/* Presets de Entregables */}
                          <div className="pt-2 border-t border-zinc-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-zinc-800 text-[11px]">
                                Entregables / Actividades
                              </span>
                              {deliverables.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setDeliverables([])}
                                  className="text-[10px] text-red-600 hover:text-red-700 font-semibold"
                                >
                                  Limpiar ({deliverables.length})
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={applyPresetConnect}
                                className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors"
                              >
                                <div className="font-bold text-zinc-900 text-[11px] flex justify-between">
                                  <span>Connect</span>
                                  <span className="text-[10px] font-mono text-zinc-500">17</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5">8 Assign + 8 Tests</p>
                              </button>
                              <button
                                type="button"
                                onClick={applyPresetCorte}
                                className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors"
                              >
                                <div className="font-bold text-zinc-900 text-[11px] flex justify-between">
                                  <span>Corte</span>
                                  <span className="text-[10px] font-mono text-zinc-500">3</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Taller + Parcial + Final</p>
                              </button>
                              <button
                                type="button"
                                onClick={applyPresetTaller}
                                className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors"
                              >
                                <div className="font-bold text-zinc-900 text-[11px] flex justify-between">
                                  <span>Taller</span>
                                  <span className="text-[10px] font-mono text-zinc-500">3</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Guía + Solución + PDF</p>
                              </button>
                            </div>

                            {deliverables.length > 0 && (
                              <div className="max-h-28 overflow-y-auto space-y-1 mt-2.5 pr-1">
                                {deliverables.map((d, i) => (
                                  <div
                                    key={d.id}
                                    className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px]"
                                  >
                                    <span className="truncate font-medium text-zinc-800">
                                      {i + 1}. {d.title}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeDeliverable(d.id)}
                                      className="p-0.5 text-zinc-400 hover:text-red-600 transition-colors ml-2"
                                      aria-label={`Eliminar entregable ${d.title}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 mt-2">
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
                                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50/50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-zinc-900 min-h-[38px]"
                              />
                              <button
                                type="button"
                                onClick={addManualDeliverable}
                                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 font-semibold text-xs flex items-center gap-1 transition-colors min-h-[38px]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Añadir</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. MATERIA / TAREA U & DEV */}
                {activeMode === 'personal' && (
                  <div className="space-y-4">
                    {/* Switcher: Materia U vs Proyecto Dev */}
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
                        <span>Materia U / Tarea</span>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1">Descripción o Notas</label>
                      <textarea
                        rows={4}
                        placeholder="Detalles, temas a estudiar, requerimientos o enlaces de interés..."
                        value={personalDesc}
                        onChange={(e) => setPersonalDesc(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 3. PLAN DE AHORRO */}
                {activeMode === 'savings' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1">
                        Título de la Meta de Ahorro
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Fondo Laptop M3, Fondo de Emergencia, Matrícula..."
                        value={savingsTitle}
                        onChange={(e) => setSavingsTitle(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                      <div>
                        <label className="block text-[11px] text-zinc-600 font-semibold mb-1">
                          Ahorro Actual (COP)
                        </label>
                        <input
                          type="number"
                          step="50000"
                          value={savingsCurrent}
                          onChange={(e) => setSavingsCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-600 font-semibold mb-1">
                          Meta Objetivo (COP)
                        </label>
                        <input
                          type="number"
                          step="50000"
                          value={savingsTarget}
                          onChange={(e) => setSavingsTarget(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold font-mono text-zinc-900 min-h-[44px] focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Progress Preview */}
                    {Number(savingsTarget) > 0 && (
                      <div className="p-3.5 rounded-xl bg-zinc-100/70 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-700">
                          <span>Progreso proyectado</span>
                          <span className="font-mono">
                            {Math.min(
                              100,
                              Math.round(((Number(savingsCurrent) || 0) / (Number(savingsTarget) || 1)) * 100)
                            )}
                            %
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
                      <label className="block font-semibold text-zinc-800 mb-1">
                        Nota o Plan (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="ej. Aportar 100.000 COP de cada trabajo completado..."
                        value={savingsDesc}
                        onChange={(e) => setSavingsDesc(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 4. NOTA RÁPIDA */}
                {activeMode === 'note' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1">Título de la Nota</label>
                      <input
                        type="text"
                        placeholder="ej. Recordatorio de entrega, Ideas de proyecto, Dudas..."
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm font-medium min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1">Contenido de la Nota</label>
                      <textarea
                        rows={6}
                        placeholder="Escribe lo que quieras recordar rápidamente..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs sm:text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STICKY FOOTER (ALWAYS FIXED AT BOTTOM, NEVER HIDDEN BY KEYBOARD) */}
              <div className="shrink-0 px-4 py-3 sm:px-6 bg-white/95 backdrop-blur-sm border-t border-zinc-100 flex items-center justify-between gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial sm:px-6 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm font-semibold min-h-[44px] shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {activeMode === 'job'
                          ? 'Crear Trabajo'
                          : activeMode === 'personal'
                          ? personalCategory === 'study'
                            ? 'Crear Materia'
                            : 'Crear Proyecto'
                          : activeMode === 'savings'
                          ? 'Crear Meta de Ahorro'
                          : 'Guardar Nota'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
