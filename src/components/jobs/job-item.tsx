'use client';

import React, { useState } from 'react';
import { ClientJob } from '@/types/organizer';
import { useWorkspace } from '@/context/workspace-context';
import { 
  MessageCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2,
  DollarSign,
  KeyRound,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { spring } from '@animate-ui/react/utils/motion';
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { EditJobModal } from '@/components/jobs/edit-job-modal';

interface JobItemProps {
  job: ClientJob;
}

const progressSpring = { type: 'spring' as const, stiffness: 280, damping: 26 };

export function JobItem({ job }: JobItemProps) {
  const { toggleDeliverable, markJobDelivered, markJobPaid } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCredsOpen, setIsCredsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Motion values for GPU-composited swipe
  const x = useMotionValue(0);
  const leftActionOpacity = useTransform(x, [0, 40, 85], [0, 0.45, 1]);
  const rightActionOpacity = useTransform(x, [-85, -40, 0], [1, 0.45, 0]);

  const completedList = job.deliverables.filter((d) => d.isCompleted);
  const pendingList = job.deliverables.filter((d) => !d.isCompleted);
  const totalCount = job.deliverables.length;
  const progressPercent = totalCount > 0 ? Math.round((completedList.length / totalCount) * 100) : 0;
  
  const isDelivered = job.status === 'delivered';
  const isFullyPaid = job.paidAmount >= job.totalPrice;
  const pendingDebt = Math.max(0, job.totalPrice - job.paidAmount);

  const copyField = (text: string, field: 'user' | 'pass', e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1400);
  };

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const message = pendingDebt > 0
      ? encodeURIComponent(`Hola ${job.clientName}, ¿cómo estás? Te escribo para coordinar la entrega y el saldo de $${pendingDebt.toLocaleString()} COP de ${job.subject}.`)
      : encodeURIComponent(`Hola ${job.clientName}, ¿cómo estás? Te escribo sobre tu entrega de ${job.subject}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#121215] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
        {/* Background Swipe Actions Indicator */}
        <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none select-none bg-zinc-50 dark:bg-zinc-900/50">
          <motion.div 
            style={{ opacity: leftActionOpacity }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Marcar Entregado</span>
          </motion.div>
          <motion.div 
            style={{ opacity: rightActionOpacity }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-400"
          >
            <span>Marcar Pagado</span>
            <DollarSign className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </motion.div>
        </div>

        {/* Swipeable Main Card */}
        <motion.div
          style={{ x, touchAction: 'pan-y' }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x > 85) {
              markJobDelivered(job.id);
            } else if (info.offset.x < -85) {
              markJobPaid(job.id);
            }
          }}
          className="relative bg-white dark:bg-[#121215] z-10 p-3.5 sm:p-4"
        >
          {/* Header: Materia + Entregado + Límite + Editar */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100/90 dark:bg-zinc-800/90 px-2 py-0.5 rounded-md tracking-tight">
                {job.subject}
              </span>
              {isDelivered && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" />
                  Entregado
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono bg-zinc-50 dark:bg-zinc-900/60 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-white/10">
                <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span>Límite: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{job.deadlineTime}</strong></span>
              </div>

              {/* Edit Button with Tactile Feedback */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ml-0.5"
                title="Editar datos del trabajo"
                aria-label="Editar trabajo"
              >
                <Pencil className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Título de la tarea */}
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug my-1.5 break-words">
            {job.title}
          </h3>

          {/* Cliente con WhatsApp integrado a la izquierda + Precio y Saldo a la derecha */}
          <div className="flex items-center justify-between gap-2 text-xs mb-2.5 pt-1.5 border-t border-zinc-100 dark:border-white/10">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={openWhatsApp}
              className="group inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors min-w-0 -ml-1 px-1 py-0.5 rounded-md hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 text-left"
              title={`Contactar a ${job.clientName} por WhatsApp`}
            >
              <span className="text-xs sm:text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{job.clientName}</span>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            </motion.button>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                ${job.totalPrice.toLocaleString()} {job.currency}
              </span>

              {!isFullyPaid ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/40 transition-colors cursor-pointer"
                  title="Registrar abono parcial"
                >
                  <span>Debe ${pendingDebt.toLocaleString()}</span>
                </motion.button>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/40 dark:border-emerald-800/40">
                  Pagado
                </span>
              )}
            </div>
          </div>

          {/* Micro-pastilla de credenciales horizontal y esbelta */}
          <div className="mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-800/60 hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90 border border-zinc-200/50 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-400 transition-colors">
              <KeyRound className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-700 dark:text-zinc-300 shrink-0">
                {job.platform}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] sm:max-w-[180px]">
                {job.platformUser}
              </span>

              {/* Botón directo de copiar usuario en 1 toque */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={(e) => copyField(job.platformUser, 'user', e)}
                className="p-1 -mr-0.5 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-all"
                title="Copiar usuario"
                aria-label="Copiar usuario"
              >
                {copiedField === 'user' ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </motion.button>

              <span className="text-zinc-300 dark:text-zinc-600">|</span>

              {/* Botón desplegable para contraseña */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCredsOpen(!isCredsOpen);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title={isCredsOpen ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <span>Clave</span>
                {isCredsOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </motion.button>
            </div>

            {/* Despliegue compacto de contraseña */}
            <AnimatePresence>
              {isCredsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Clave:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 text-xs">
                      {showPassword ? job.platformPass : '••••••••'}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                      title={showPassword ? 'Ocultar' : 'Ver'}
                      aria-label={showPassword ? 'Ocultar clave' : 'Ver clave'}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => copyField(job.platformPass, 'pass', e)}
                      className="p-1 -mr-0.5 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                      title="Copiar contraseña"
                      aria-label="Copiar contraseña"
                    >
                      {copiedField === 'pass' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progreso esbelto y Entregables (Linear / Things 3 style) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                {/* Indicador circular sutil tipo Things 3 */}
                <div className="relative w-3.5 h-3.5 shrink-0">
                  <svg className="w-3.5 h-3.5 -rotate-90 text-zinc-200 dark:text-zinc-700" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                    <motion.circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      className="text-zinc-800 dark:text-zinc-200"
                      strokeWidth="2"
                      strokeDasharray={37.7}
                      initial={{ strokeDashoffset: 37.7 }}
                      animate={{ strokeDashoffset: 37.7 - (37.7 * progressPercent) / 100 }}
                      transition={progressSpring}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span>
                  {completedList.length}/{totalCount} listos
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>{progressPercent}%</span>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-0.5 px-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span>{isExpanded ? 'Ocultar' : 'Entregables'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </motion.button>
            </div>

            {/* Kinetic Progress Bar: Línea continua con micro-segmentos que crecen con spring physics */}
            <div className="flex items-center gap-0.5 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
              {job.deliverables.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="h-full flex-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: item.isCompleted ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={progressSpring}
                    className="h-full w-full bg-zinc-800 dark:bg-zinc-200 rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Acordeón de Entregables */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="border-t border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/40 p-3 max-h-60 overflow-y-auto"
            >
              {pendingList.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Por entregar ({pendingList.length})
                  </span>
                  <div className="space-y-1">
                    {pendingList.map((item) => (
                      <motion.label
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 cursor-pointer transition-colors group select-none"
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => toggleDeliverable(job.id, item.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              item.isCompleted
                                ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                                : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-500'
                            }`}
                          >
                            {item.isCompleted && (
                              <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                                <motion.path
                                  d="M2.5 6L5 8.5L9.5 3.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.24, ease: 'easeOut' }}
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          {item.title}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              )}

              {completedList.length > 0 && (
                <div className={pendingList.length > 0 ? 'pt-2 border-t border-zinc-200/40 dark:border-white/10' : ''}>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Completadas ({completedList.length})
                  </span>
                  <div className="space-y-0.5 opacity-70">
                    {completedList.map((item) => (
                      <motion.label
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group select-none"
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => toggleDeliverable(job.id, item.id)}
                            className="sr-only"
                          />
                          <div className="w-3.5 h-3.5 rounded border border-zinc-700 dark:border-zinc-300 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center transition-all">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                              <motion.path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.24, ease: 'easeOut' }}
                              />
                            </svg>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through truncate">
                          {item.title}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Partial Payment Modal */}
      <PartialPaymentModal
        job={job}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        job={job}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
