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
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobItemProps {
  job: ClientJob;
}

export function JobItem({ job }: JobItemProps) {
  const { toggleDeliverable, markJobDelivered, markJobPaid } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCredsOpen, setIsCredsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const completedList = job.deliverables.filter((d) => d.isCompleted);
  const pendingList = job.deliverables.filter((d) => !d.isCompleted);
  const totalCount = job.deliverables.length;
  const progressPercent = totalCount > 0 ? Math.round((completedList.length / totalCount) * 100) : 0;
  
  const isDelivered = job.status === 'delivered';
  const isFullyPaid = job.paidAmount >= job.totalPrice;
  const pendingDebt = job.totalPrice - job.paidAmount;

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
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 transition-colors">
      {/* Background Swipe Actions Indicator */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none select-none bg-zinc-50">
        <div className={`flex items-center gap-1.5 text-xs font-semibold text-emerald-800 transition-opacity ${swipeOffset > 40 ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Marcar Entregado</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold text-amber-900 transition-opacity ${swipeOffset < -40 ? 'opacity-100' : 'opacity-0'}`}>
          <span>Marcar Pagado</span>
          <DollarSign className="w-4 h-4 text-amber-700" />
        </div>
      </div>

      {/* Swipeable Main Card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => setSwipeOffset(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x > 85) {
            markJobDelivered(job.id);
          } else if (info.offset.x < -85) {
            markJobPaid(job.id);
          }
          setSwipeOffset(0);
        }}
        className="relative bg-white z-10 p-3.5 sm:p-4"
      >
        {/* Header: Materia + Precio y Deuda */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono truncate">
              {job.subject}
            </span>
            {isDelivered && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40 shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-700" />
                Entregado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-zinc-900 font-mono">
              ${job.totalPrice.toLocaleString()} {job.currency}
            </span>
            {!isFullyPaid ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200/50">
                Debe ${pendingDebt.toLocaleString()}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40">
                Pagado
              </span>
            )}
          </div>
        </div>

        {/* Título de la tarea */}
        <h3 className="text-sm font-semibold text-zinc-900 tracking-tight leading-snug mb-2">
          {job.title}
        </h3>

        {/* Cliente con WhatsApp directo + Hora Límite */}
        <div className="flex items-center justify-between gap-2 pb-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-medium text-zinc-700 truncate text-[12px]">
              {job.clientName}
            </span>
            <button
              type="button"
              onClick={openWhatsApp}
              className="p-1 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0"
              title={`WhatsApp con ${job.clientName}`}
              aria-label="Abrir WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-zinc-500 text-[11px] shrink-0">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Límite: <strong className="text-zinc-700 font-medium">{job.deadlineTime}</strong></span>
          </div>
        </div>

        {/* Credenciales DESPLEGABLES (No ocupan espacio por defecto) */}
        <div className="border border-zinc-200/70 rounded-lg bg-zinc-50/60 overflow-hidden mb-2.5">
          <button
            type="button"
            onClick={() => setIsCredsOpen(!isCredsOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <KeyRound className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="font-medium uppercase tracking-wider text-[10px] text-zinc-500 truncate">
                {job.platform}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium shrink-0">
              <span>{isCredsOpen ? 'Ocultar credenciales' : 'Ver credenciales'}</span>
              {isCredsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </button>

          <AnimatePresence>
            {isCredsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.16 }}
                className="px-2.5 pb-2 pt-1 border-t border-zinc-200/60"
              >
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* Usuario */}
                  <button
                    type="button"
                    onClick={(e) => copyField(job.platformUser, 'user', e)}
                    className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-md bg-white border border-zinc-200/70 hover:border-zinc-300 text-left transition-colors min-h-[34px]"
                    title="Copiar usuario"
                  >
                    <span className="font-mono text-zinc-700 text-[11px] truncate">
                      {job.platformUser}
                    </span>
                    {copiedField === 'user' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400 shrink-0" />
                    )}
                  </button>

                  {/* Clave */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => copyField(job.platformPass, 'pass', e)}
                      className="flex-1 flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-md bg-white border border-zinc-200/70 hover:border-zinc-300 text-left transition-colors min-h-[34px]"
                      title="Copiar contraseña"
                    >
                      <span className="font-mono text-zinc-700 text-[11px] truncate">
                        {showPassword ? job.platformPass : '••••••••'}
                      </span>
                      {copiedField === 'pass' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      className="p-1 rounded-md bg-white border border-zinc-200/70 text-zinc-400 hover:text-zinc-700 min-h-[34px] min-w-[34px] flex items-center justify-center transition-colors shrink-0"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progreso de Entregables */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-medium text-zinc-500">
              {completedList.length} de {totalCount} listos ({progressPercent}%)
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 hover:text-zinc-950 py-0.5 px-1.5 rounded hover:bg-zinc-100 transition-colors"
            >
              <span>{isExpanded ? 'Ocultar tareas' : 'Ver entregables'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Segmentos de progreso */}
          <div className="flex items-center gap-1 w-full h-1">
            {job.deliverables.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex-1 h-full rounded-full transition-colors ${
                  item.isCompleted ? 'bg-zinc-800' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Acordeón de Tareas Individuales */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="border-t border-zinc-100 bg-zinc-50/70 p-3 max-h-60 overflow-y-auto"
          >
            {pendingList.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Por entregar ({pendingList.length})
                </span>
                <div className="space-y-1">
                  {pendingList.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-zinc-200/60 hover:border-zinc-300 cursor-pointer min-h-[36px] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => toggleDeliverable(job.id, item.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 accent-zinc-900 cursor-pointer shrink-0"
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
              <div className={pendingList.length > 0 ? 'pt-2 border-t border-zinc-200/50' : ''}>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Completadas ({completedList.length})
                </span>
                <div className="space-y-1 opacity-75">
                  {completedList.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-zinc-100/50 cursor-pointer min-h-[30px]"
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => toggleDeliverable(job.id, item.id)}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-zinc-400 accent-zinc-900 cursor-pointer shrink-0"
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
  );
}
