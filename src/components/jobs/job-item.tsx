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
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { EditJobModal } from '@/components/jobs/edit-job-modal';

interface JobItemProps {
  job: ClientJob;
}

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
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 transition-colors">
        {/* Background Swipe Actions Indicator */}
        <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none select-none bg-zinc-50">
          <motion.div 
            style={{ opacity: leftActionOpacity }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Marcar Entregado</span>
          </motion.div>
          <motion.div 
            style={{ opacity: rightActionOpacity }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-900"
          >
            <span>Marcar Pagado</span>
            <DollarSign className="w-4 h-4 text-amber-700" />
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
          className="relative bg-white z-10 p-3.5 sm:p-4"
        >
          {/* Header: Materia + Precio, Deuda y Acciones */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 truncate">
                {job.subject}
              </span>
              {isDelivered && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40 shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                  Entregado
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-zinc-900 font-mono tabular-nums">
                ${job.totalPrice.toLocaleString()} {job.currency}
              </span>

              {!isFullyPaid ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums text-amber-900 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/40 transition-colors cursor-pointer"
                  title="Registrar abono parcial"
                >
                  <span>Debe ${pendingDebt.toLocaleString()}</span>
                  <span className="font-sans text-[9px] underline text-amber-950 font-medium">abonar</span>
                </button>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-800 bg-emerald-50/50 border border-emerald-200/30">
                  Pagado
                </span>
              )}

              {/* Edit Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-0.5"
                title="Editar datos del trabajo"
                aria-label="Editar trabajo"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Título de la tarea */}
          <h3 className="text-sm font-semibold text-zinc-900 tracking-tight leading-snug mb-1.5">
            {job.title}
          </h3>

          {/* Cliente con WhatsApp integrado orgánicamente + Hora Límite */}
          <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
            <button
              type="button"
              onClick={openWhatsApp}
              className="group inline-flex items-center gap-1.5 text-zinc-700 hover:text-emerald-700 transition-colors min-w-0 -ml-1 px-1 py-0.5 rounded-md hover:bg-emerald-50/60 text-left"
              title={`Contactar a ${job.clientName} por WhatsApp`}
            >
              <span className="text-[13px] font-medium truncate">{job.clientName}</span>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
            </button>

            <div className="flex items-center gap-1 text-zinc-500 text-[11px] shrink-0">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Límite: <strong className="text-zinc-700 font-medium font-mono tabular-nums">{job.deadlineTime}</strong></span>
            </div>
          </div>

          {/* Micro-pastilla de credenciales horizontal y esbelta */}
          <div className="mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100/70 hover:bg-zinc-100/90 border border-zinc-200/50 text-[11px] text-zinc-600 transition-colors">
              <KeyRound className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-700 shrink-0">
                {job.platform}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="font-mono text-zinc-600 truncate max-w-[120px] sm:max-w-[180px]">
                {job.platformUser}
              </span>

              {/* Botón directo de copiar usuario en 1 toque */}
              <button
                type="button"
                onClick={(e) => copyField(job.platformUser, 'user', e)}
                className="p-1 -mr-0.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/60 active:scale-95 transition-all"
                title="Copiar usuario"
                aria-label="Copiar usuario"
              >
                {copiedField === 'user' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>

              <span className="text-zinc-300">|</span>

              {/* Botón desplegable para contraseña */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCredsOpen(!isCredsOpen);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
                title={isCredsOpen ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <span>Clave</span>
                {isCredsOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </button>
            </div>

            {/* Despliegue compacto de contraseña (animación suave, sin formulario gris) */}
            <AnimatePresence>
              {isCredsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200/50 text-[11px] text-zinc-600">
                    <span className="text-[10px] text-zinc-400 font-medium">Clave:</span>
                    <span className="font-mono text-zinc-700 text-xs">
                      {showPassword ? job.platformPass : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/50 transition-colors"
                      title={showPassword ? 'Ocultar' : 'Ver'}
                      aria-label={showPassword ? 'Ocultar clave' : 'Ver clave'}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => copyField(job.platformPass, 'pass', e)}
                      className="p-1 -mr-0.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/50 transition-colors"
                      title="Copiar contraseña"
                      aria-label="Copiar contraseña"
                    >
                      {copiedField === 'pass' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progreso esbelto y Entregables (Linear / Things 3 style) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono tabular-nums">
                {/* Indicador circular sutil tipo Things 3 */}
                <div className="relative w-3.5 h-3.5 shrink-0">
                  <svg className="w-3.5 h-3.5 -rotate-90 text-zinc-200" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      className="text-zinc-800 transition-all duration-300"
                      strokeWidth="2"
                      strokeDasharray={37.7}
                      strokeDashoffset={37.7 - (37.7 * progressPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span>
                  {completedList.length}/{totalCount} listos
                </span>
                <span className="text-zinc-300">•</span>
                <span>{progressPercent}%</span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 py-0.5 px-1.5 rounded hover:bg-zinc-100 transition-colors"
              >
                <span>{isExpanded ? 'Ocultar' : 'Entregables'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Línea continua fina (h-1) con micro-segmentos */}
            <div className="flex items-center gap-0.5 w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
              {job.deliverables.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`h-full flex-1 transition-colors duration-200 ${
                    item.isCompleted ? 'bg-zinc-800' : 'bg-transparent'
                  }`}
                />
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
              className="border-t border-zinc-100 bg-zinc-50/50 p-3 max-h-60 overflow-y-auto"
            >
              {pendingList.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Por entregar ({pendingList.length})
                  </span>
                  <div className="space-y-1">
                    {pendingList.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-zinc-200/60 hover:border-zinc-300 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => toggleDeliverable(job.id, item.id)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-0 accent-zinc-900 cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-medium text-zinc-800 leading-snug">
                          {item.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {completedList.length > 0 && (
                <div className={pendingList.length > 0 ? 'pt-2 border-t border-zinc-200/40' : ''}>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Completadas ({completedList.length})
                  </span>
                  <div className="space-y-0.5 opacity-70">
                    {completedList.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-zinc-100/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => toggleDeliverable(job.id, item.id)}
                          className="w-3 h-3 rounded border-zinc-300 text-zinc-400 accent-zinc-900 cursor-pointer shrink-0"
                        />
                        <span className="text-xs text-zinc-400 line-through truncate">
                          {item.title}
                        </span>
                      </label>
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
