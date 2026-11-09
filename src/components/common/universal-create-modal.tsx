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
import { motion, AnimatePresence, useDragControls, type Variants } from 'motion/react';
import { ease, useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { triggerDeliveryCelebration, triggerPaymentCelebration, triggerTactilePop } from '@/lib/celebrations';

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

// Micro-haptic tactile impulse helper
const triggerHaptic = (ms: number = 10) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Haptics not permitted or supported
    }
  }
};

// Hub Animation Variants with Staggered Spring Bloom
const hubContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.16,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};

// Radial Pop Bloom: bubbles burst outward from the center
const bubbleItemVariants: Variants = {
  hidden: (offset: { x: number; y: number }) => ({
    opacity: 0,
    scale: 0.45,
    x: offset.x * 1.5,
    y: offset.y * 1.5,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 22,
      mass: 0.85,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: {
      duration: 0.15,
    },
  },
};

// 4 Mode Bubble Definitions with Airy Glassmorphism, Floating Physics, and Accent Glows
interface ModeBubble {
  id: 'job' | 'personal' | 'savings' | 'note';
  label: string;
  desc: string;
  icon: React.ElementType;
  bloomOffset: { x: number; y: number };
  float: {
    duration: number;
    delay: number;
  };
  colors: {
    lightBg: string;
    lightBorder: string;
    lightIcon: string;
    glowRgba: string;
    darkBg: string;
    darkBorder: string;
    darkIcon: string;
    ambientLight: string;
    ambientDark: string;
  };
}

const MODES: ModeBubble[] = [
  {
    id: 'job',
    label: 'Trabajo Cliente',
    desc: 'Talleres & Exámenes',
    icon: Briefcase,
    bloomOffset: { x: -18, y: -18 },
    float: {
      duration: 2.8,
      delay: 0,
    },
    colors: {
      lightBg: 'bg-white/80 border-indigo-200/80 shadow-indigo-500/10 hover:border-indigo-400/60',
      lightBorder: 'border-indigo-200/80',
      lightIcon: 'text-indigo-600',
      glowRgba: 'rgba(99, 102, 241, 0.55)',
      darkBg: 'dark:bg-zinc-900/85 dark:border-indigo-500/30 dark:hover:border-indigo-400/50',
      darkBorder: 'dark:border-indigo-500/30',
      darkIcon: 'dark:text-indigo-400',
      ambientLight: 'from-indigo-500/20 via-blue-500/10 to-transparent',
      ambientDark: 'dark:from-indigo-500/25 dark:via-blue-500/15 dark:to-transparent',
    },
  },
  {
    id: 'personal',
    label: 'Materia / Dev',
    desc: 'Parciales & Propias',
    icon: GraduationCap,
    bloomOffset: { x: 18, y: -18 },
    float: {
      duration: 3.2,
      delay: 0.35,
    },
    colors: {
      lightBg: 'bg-white/80 border-purple-200/80 shadow-purple-500/10 hover:border-purple-400/60',
      lightBorder: 'border-purple-200/80',
      lightIcon: 'text-purple-600',
      glowRgba: 'rgba(168, 85, 247, 0.55)',
      darkBg: 'dark:bg-zinc-900/85 dark:border-purple-500/30 dark:hover:border-purple-400/50',
      darkBorder: 'dark:border-purple-500/30',
      darkIcon: 'dark:text-purple-400',
      ambientLight: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
      ambientDark: 'dark:from-purple-500/25 dark:via-fuchsia-500/15 dark:to-transparent',
    },
  },
  {
    id: 'savings',
    label: 'Plan de Ahorro',
    desc: 'Metas de Dinero',
    icon: PiggyBank,
    bloomOffset: { x: -18, y: 18 },
    float: {
      duration: 2.6,
      delay: 0.7,
    },
    colors: {
      lightBg: 'bg-white/80 border-emerald-200/80 shadow-emerald-500/10 hover:border-emerald-400/60',
      lightBorder: 'border-emerald-200/80',
      lightIcon: 'text-emerald-600',
      glowRgba: 'rgba(16, 185, 129, 0.55)',
      darkBg: 'dark:bg-zinc-900/85 dark:border-emerald-500/30 dark:hover:border-emerald-400/50',
      darkBorder: 'dark:border-emerald-500/30',
      darkIcon: 'dark:text-emerald-400',
      ambientLight: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      ambientDark: 'dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-transparent',
    },
  },
  {
    id: 'note',
    label: 'Nota Rápida',
    desc: 'Apuntes & Accesos',
    icon: FileText,
    bloomOffset: { x: 18, y: 18 },
    float: {
      duration: 3.0,
      delay: 0.2,
    },
    colors: {
      lightBg: 'bg-white/80 border-amber-200/80 shadow-amber-500/10 hover:border-amber-400/60',
      lightBorder: 'border-amber-200/80',
      lightIcon: 'text-amber-600',
      glowRgba: 'rgba(245, 158, 11, 0.55)',
      darkBg: 'dark:bg-zinc-900/85 dark:border-amber-500/30 dark:hover:border-amber-400/50',
      darkBorder: 'dark:border-amber-500/30',
      darkIcon: 'dark:text-amber-400',
      ambientLight: 'from-amber-500/20 via-orange-500/10 to-transparent',
      ambientDark: 'dark:from-amber-500/25 dark:via-orange-500/15 dark:to-transparent',
    },
  },
];

export function UniversalCreateModal({ isOpen, onClose, initialType }: UniversalCreateModalProps) {
  const { clients, createJob, createPersonalItem } = useWorkspace();
  const dragControls = useDragControls();
  const shouldReduceMotion = useShouldReduceMotion();

  // Active Screen Mode: 'hub' (4 floating kinetic bubbles) or dedicated forms
  const [activeMode, setActiveMode] = useState<ModalMode>('hub');
  const [selectedBubble, setSelectedBubble] = useState<ModalMode | null>(null);

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

  // Reset and Close
  const handleCloseAndReset = React.useCallback(() => {
    triggerHaptic(6);
    onClose();
    setActiveMode('hub');
    setSelectedBubble(null);
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
  }, [onClose]);

  // Adjust state when modal opens or initialType changes
  const [prevProps, setPrevProps] = useState({ isOpen, initialType });
  if (prevProps.isOpen !== isOpen || prevProps.initialType !== initialType) {
    setPrevProps({ isOpen, initialType });
    if (isOpen) {
      setActiveMode(initialType || 'hub');
      setSelectedBubble(initialType || null);
      setDeadlineDate(getTodayStr());
      setValidationErrors({});
      setShowPlatformAccordion(false);
    }
  }

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseAndReset();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCloseAndReset]);

  // Client Suggestions for Job Form
  const clientSuggestions = useMemo(() => {
    if (!clientName.trim()) return [];
    const query = clientName.toLowerCase().trim();
    return clients
      .filter((c) => c.name.toLowerCase().includes(query) && c.name.toLowerCase() !== query)
      .slice(0, 3);
  }, [clients, clientName]);

  const handleSelectClient = (c: { name: string; phone: string }) => {
    triggerHaptic(6);
    setClientName(c.name);
    if (c.phone) setClientPhone(c.phone);
    if (validationErrors.clientName) {
      setValidationErrors((prev) => ({ ...prev, clientName: undefined }));
    }
  };

  // Deliverables Presets
  const applyPresetConnect = () => {
    triggerHaptic(8);
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
    triggerHaptic(8);
    setDeliverables([
      { id: `d-corte-1-${Date.now()}`, title: 'Taller Preparatorio', isCompleted: false, type: 'assignment' },
      { id: `d-corte-2-${Date.now()}`, title: 'Examen Parcial de Corte', isCompleted: false, type: 'test' },
      { id: `d-corte-3-${Date.now()}`, title: 'Proyecto / Entrega Final', isCompleted: false, type: 'assignment' },
    ]);
  };

  const applyPresetTaller = () => {
    triggerHaptic(8);
    setDeliverables([
      { id: `d-taller-1-${Date.now()}`, title: 'Guía / Taller de Ejercicios', isCompleted: false, type: 'assignment' },
      { id: `d-taller-2-${Date.now()}`, title: 'Solución Escrita en PDF', isCompleted: false, type: 'assignment' },
      { id: `d-taller-3-${Date.now()}`, title: 'Sustentación / Diapositivas', isCompleted: false, type: 'test' },
    ]);
  };

  const addManualDeliverable = () => {
    if (!newDeliverableTitle.trim()) return;
    triggerHaptic(8);
    setDeliverables((prev) => [
      ...prev,
      { id: `d-man-${Date.now()}`, title: newDeliverableTitle.trim(), isCompleted: false, type: 'assignment' },
    ]);
    setNewDeliverableTitle('');
  };

  const removeDeliverable = (id: string) => {
    triggerHaptic(6);
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  // Select a Mode Bubble with Kinetic Micro-Pulse & Smooth Form Entrance
  const handleBubbleSelect = (modeId: ModalMode) => {
    triggerTactilePop(25);
    setSelectedBubble(modeId);
    // Micro-delay gives user tactile feedback of the active ring pulse before transitioning
    setTimeout(() => {
      setActiveMode(modeId);
      setValidationErrors({});
    }, 120);
  };

  // Back to Hub
  const handleBackToHub = () => {
    triggerHaptic(8);
    setSelectedBubble(null);
    setActiveMode('hub');
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
      triggerHaptic(20);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    triggerHaptic(12);
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

      triggerDeliveryCelebration();
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
    triggerHaptic(12);
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
    triggerHaptic(12);
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
    triggerHaptic(12);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleCloseAndReset}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-xs select-none p-0 sm:p-4"
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
            className="w-full sm:max-w-md md:max-w-lg bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl dark:shadow-black/70 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {/* ===================== CREATION HUB: 4 FLOATING KINETIC BUBBLES ===================== */}
              {activeMode === 'hub' ? (
                <motion.div
                  key="hub"
                  variants={hubContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* Header */}
                  <div className="shrink-0 px-5 pt-3 pb-3 sm:px-6 sm:pt-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
                    {/* Mobile Drag Handle */}
                    <div
                      onPointerDown={(e) => dragControls.start(e)}
                      className="w-full py-1.5 cursor-grab active:cursor-grabbing flex justify-center touch-none sm:hidden mb-1"
                      title="Arrastra para cerrar"
                    >
                      <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                          Centro de Creación
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                          ¿Qué deseas registrar?
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseAndReset}
                        className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 flex items-center justify-center transition-colors"
                        aria-label="Cerrar modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Selecciona un modo para comenzar
                    </p>
                  </div>

                  {/* Hub Body: 2x2 Floating Kinetic Orbs with Radial Pop Bloom */}
                  <div
                    className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-7 flex items-center justify-center relative"
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    {/* Ambient Center Glow */}
                    <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-md mx-auto relative z-10">
                      {MODES.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedBubble === mode.id;

                        return (
                          <motion.div
                            key={mode.id}
                            custom={mode.bloomOffset}
                            variants={bubbleItemVariants}
                            className="flex flex-col items-center justify-center"
                          >
                            {/* Floating Idle Physics Loop */}
                            <motion.div
                              animate={{
                                y: shouldReduceMotion ? 0 : [0, -3.5, 0],
                              }}
                              transition={{
                                duration: mode.float.duration,
                                delay: mode.float.delay,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                              }}
                              className="w-full flex flex-col items-center"
                            >
                              {/* Kinetic Interactive Orb Button */}
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.06, y: -4 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                onClick={() => handleBubbleSelect(mode.id)}
                                className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl w-full cursor-pointer focus:outline-none select-none transition-colors"
                              >
                                {/* Ambient Backdrop Radiance */}
                                <div
                                  className={`absolute -inset-1 rounded-3xl bg-gradient-to-br ${mode.colors.ambientLight} ${mode.colors.ambientDark} opacity-60 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none`}
                                />

                                {/* Active Selection Glowing Ring */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.85 }}
                                      animate={{
                                        opacity: [0.75, 1, 0.75],
                                        scale: [0.98, 1.06, 0.98],
                                      }}
                                      exit={{ opacity: 0, scale: 1.15 }}
                                      transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                      }}
                                      className="absolute w-20 h-20 sm:w-22 sm:h-22 rounded-full pointer-events-none"
                                      style={{
                                        boxShadow: `0 0 20px ${mode.colors.glowRgba}`,
                                        border: `2px solid ${mode.colors.glowRgba}`,
                                      }}
                                    />
                                  )}
                                </AnimatePresence>

                                {/* Volumetric 3D Kinetic Orb */}
                                <div
                                  className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center backdrop-blur-md border shadow-xl shadow-zinc-900/10 dark:shadow-black/60 transition-all duration-200 ${mode.colors.lightBg} ${mode.colors.darkBg}`}
                                  style={
                                    isSelected
                                      ? {
                                          boxShadow: `0 0 28px ${mode.colors.glowRgba}, inset 0 -4px 10px rgba(0,0,0,0.15)`,
                                        }
                                      : {
                                          boxShadow: `0 10px 20px -3px rgba(0,0,0,0.12), inset 0 -3px 8px rgba(0,0,0,0.08)`,
                                        }
                                  }
                                >
                                  {/* Spherical Radial Light Gradient */}
                                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.1)_45%,transparent_75%)] dark:bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.04)_45%,transparent_75%)] pointer-events-none" />
                                  
                                  {/* 3D Specular Highlight Dot */}
                                  <div className="absolute top-2.5 left-3 w-3 h-1.5 rounded-full bg-white/80 dark:bg-white/40 blur-[0.4px] rotate-[-25deg] pointer-events-none" />

                                  {/* Crisp Centered Icon with micro-spring */}
                                  <Icon
                                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-115 group-active:scale-90 ${mode.colors.lightIcon} ${mode.colors.darkIcon} drop-shadow-xs`}
                                  />
                                </div>

                                {/* Clean Legible Typography Below Orb */}
                                <div className="mt-2.5 text-center flex flex-col items-center">
                                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {mode.label}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">
                                    {mode.desc}
                                  </span>
                                </div>
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hub Footer */}
                  <div className="shrink-0 px-5 py-3 sm:px-6 bg-white/90 dark:bg-zinc-950/90 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
                    <button
                      type="button"
                      onClick={handleCloseAndReset}
                      className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 py-2 px-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ===================== DEDICATED FORM VIEW WITH SEAMLESS ENTRANCE ===================== */
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: ease.out }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* Form Header */}
                  <div className="shrink-0 px-4 pt-3 pb-3 sm:px-6 sm:pt-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
                    {/* Mobile Drag Handle */}
                    <div
                      onPointerDown={(e) => dragControls.start(e)}
                      className="w-full py-1.5 cursor-grab active:cursor-grabbing flex justify-center touch-none sm:hidden mb-1"
                      title="Arrastra para cerrar"
                    >
                      <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleBackToHub}
                        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 px-2.5 py-1.5 -ml-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver</span>
                      </button>

                      <div className="text-center">
                        <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center justify-center gap-1.5">
                          {activeMode === 'job' && (
                            <>
                              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Trabajo Cliente</span>
                            </>
                          )}
                          {activeMode === 'personal' && (
                            <>
                              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span>{personalCategory === 'study' ? 'Materia / Tarea U' : 'Proyecto Dev'}</span>
                            </>
                          )}
                          {activeMode === 'savings' && (
                            <>
                              <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Plan de Ahorro</span>
                            </>
                          )}
                          {activeMode === 'note' && (
                            <>
                              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>Nota Rápida</span>
                            </>
                          )}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={handleCloseAndReset}
                        className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 flex items-center justify-center transition-colors"
                        aria-label="Cerrar modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Form with Native Scroll & Sticky Bottom Bar */}
                  <form onSubmit={handleActiveFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div
                      className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4 overscroll-contain touch-pan-y text-xs text-zinc-900 dark:text-zinc-100"
                      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                    >
                      {/* 1. TRABAJO CLIENTE */}
                      {activeMode === 'job' && (
                        <div className="space-y-4">
                          {/* Cliente & WhatsApp */}
                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
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
                                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                                    validationErrors.clientName
                                      ? 'border-red-400 focus:border-red-500'
                                      : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-400'
                                  }`}
                                />
                              </div>
                              <div>
                                <input
                                  type="tel"
                                  placeholder="WhatsApp (ej. 300 123 4567)"
                                  value={clientPhone}
                                  onChange={(e) => setClientPhone(e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm font-mono min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                />
                              </div>
                            </div>

                            {/* Error & Client Suggestions */}
                            {validationErrors.clientName && (
                              <p className="text-[11px] text-red-500 mt-1.5 font-medium">{validationErrors.clientName}</p>
                            )}
                            {clientSuggestions.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Sugerencias:</span>
                                {clientSuggestions.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectClient(c)}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium transition-colors"
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
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
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
                                className={
                                  validationErrors.subject
                                    ? 'w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border-red-400 focus:border-red-500'
                                    : 'w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none text-xs sm:text-sm font-medium min-h-[44px] transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-400'
                                }
                              />
                              {validationErrors.subject && (
                                <p className="text-[11px] text-red-500 mt-1.5 font-medium">{validationErrors.subject}</p>
                              )}
                            </div>

                            <div>
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Título de la entrega
                              </label>
                              <input
                                type="text"
                                placeholder="ej. Corte 1, Taller 2, Parcial..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm font-medium min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                              />
                            </div>
                          </div>

                          {/* Tarifa y Abono Inicial */}
                          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
                            <div>
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Tarifa pactada ($ COP)
                              </label>
                              <input
                                type="number"
                                step="5000"
                                placeholder="50000"
                                value={totalPrice}
                                onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Abono inicial ($ COP)
                              </label>
                              <input
                                type="number"
                                step="5000"
                                placeholder="0"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                              />
                            </div>
                          </div>

                          {/* Fecha y Hora de Entrega */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Fecha de entrega
                              </label>
                              <input
                                type="date"
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium text-xs sm:text-sm min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                                Hora límite
                              </label>
                              <input
                                type="text"
                                value={deadlineTime}
                                onChange={(e) => setDeadlineTime(e.target.value)}
                                placeholder="ej. 11:59 PM"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs sm:text-sm min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                              />
                            </div>
                          </div>

                          {/* Acordeón Limpio: Plataforma, Credenciales y Entregables */}
                          <div className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/40 dark:bg-zinc-900/30">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(6);
                                setShowPlatformAccordion(!showPlatformAccordion);
                              }}
                              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
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
                              <div className="p-3.5 pt-1 space-y-3.5 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
                                {/* Plataforma Selector */}
                                <div>
                                  <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                                    Plataforma del Trabajo
                                  </label>
                                  <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs min-h-[40px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
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
                                      className="w-full px-3 py-2 mt-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs min-h-[40px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                    />
                                  )}
                                </div>

                                {/* Credenciales */}
                                <div>
                                  <label className="block font-semibold text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                                    Credenciales de Acceso
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Usuario / Correo institucional"
                                      value={platformUser}
                                      onChange={(e) => setPlatformUser(e.target.value)}
                                      className="px-3 py-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-xs min-h-[42px] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                    />
                                    <div className="relative">
                                      <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Contraseña del portal"
                                        value={platformPass}
                                        onChange={(e) => setPlatformPass(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-xs min-h-[42px] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 p-1"
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                      >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Presets de Entregables */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
                                      Entregables / Actividades
                                    </span>
                                    {deliverables.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          triggerHaptic(6);
                                          setDeliverables([]);
                                        }}
                                        className="text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                                      >
                                        Limpiar ({deliverables.length})
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <button
                                      type="button"
                                      onClick={applyPresetConnect}
                                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                    >
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px] flex justify-between">
                                        <span>Connect</span>
                                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">17</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">8 Assign + 8 Tests</p>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={applyPresetCorte}
                                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                    >
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px] flex justify-between">
                                        <span>Corte</span>
                                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">3</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Taller + Parcial + Final</p>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={applyPresetTaller}
                                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                    >
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px] flex justify-between">
                                        <span>Taller</span>
                                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">3</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Guía + Solución + PDF</p>
                                    </button>
                                  </div>

                                  {deliverables.length > 0 && (
                                    <div className="max-h-28 overflow-y-auto space-y-1 mt-2.5 pr-1">
                                      {deliverables.map((d, i) => (
                                        <div
                                          key={d.id}
                                          className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px]"
                                        >
                                          <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                                            {i + 1}. {d.title}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => removeDeliverable(d.id)}
                                            className="p-0.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2"
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
                                      className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 min-h-[38px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={addManualDeliverable}
                                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold text-xs flex items-center gap-1 transition-colors min-h-[38px]"
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
                          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(6);
                                setPersonalCategory('study');
                              }}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                                personalCategory === 'study'
                                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              <GraduationCap className="w-4 h-4" />
                              <span>Materia U / Tarea</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(6);
                                setPersonalCategory('dev');
                              }}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                                personalCategory === 'dev'
                                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Proyecto Dev</span>
                            </button>
                          </div>

                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
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
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm font-medium min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Descripción o Notas</label>
                            <textarea
                              rows={4}
                              placeholder="Detalles, temas a estudiar, requerimientos o enlaces de interés..."
                              value={personalDesc}
                              onChange={(e) => setPersonalDesc(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. PLAN DE AHORRO */}
                      {activeMode === 'savings' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                              Título de la Meta de Ahorro
                            </label>
                            <input
                              type="text"
                              placeholder="ej. Fondo Laptop M3, Fondo de Emergencia, Matrícula..."
                              value={savingsTitle}
                              onChange={(e) => setSavingsTitle(e.target.value)}
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm font-medium min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
                            <div>
                              <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                                Ahorro Actual (COP)
                              </label>
                              <input
                                type="number"
                                step="50000"
                                value={savingsCurrent}
                                onChange={(e) => setSavingsCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold font-mono text-zinc-900 dark:text-zinc-100 min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                                Meta Objetivo (COP)
                              </label>
                              <input
                                type="number"
                                step="50000"
                                value={savingsTarget}
                                onChange={(e) => setSavingsTarget(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold font-mono text-zinc-900 dark:text-zinc-100 min-h-[44px] focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                              />
                            </div>
                          </div>

                          {/* Progress Preview */}
                          {Number(savingsTarget) > 0 && (
                            <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 space-y-1.5">
                              <div className="flex justify-between text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                <span>Progreso proyectado</span>
                                <span className="font-mono">
                                  {Math.min(
                                    100,
                                    Math.round(((Number(savingsCurrent) || 0) / (Number(savingsTarget) || 1)) * 100)
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 rounded-full"
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
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                              Nota o Plan (Opcional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="ej. Aportar 100.000 COP de cada trabajo completado..."
                              value={savingsDesc}
                              onChange={(e) => setSavingsDesc(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. NOTA RÁPIDA */}
                      {activeMode === 'note' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Título de la Nota</label>
                            <input
                              type="text"
                              placeholder="ej. Recordatorio de entrega, Ideas de proyecto, Dudas..."
                              value={noteTitle}
                              onChange={(e) => setNoteTitle(e.target.value)}
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm font-medium min-h-[44px] placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Contenido de la Nota</label>
                            <textarea
                              rows={6}
                              placeholder="Escribe lo que quieras recordar rápidamente..."
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 text-xs sm:text-sm leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* STICKY FOOTER (ALWAYS FIXED AT BOTTOM, NEVER HIDDEN BY KEYBOARD) */}
                    <div className="shrink-0 px-4 py-3 sm:px-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
                      <button
                        type="button"
                        onClick={handleCloseAndReset}
                        className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 rounded-xl text-xs sm:text-sm font-semibold min-h-[44px] transition-colors"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-initial sm:px-6 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white disabled:opacity-50 text-xs sm:text-sm font-semibold min-h-[44px] shadow-sm transition-all flex items-center justify-center gap-2"
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
