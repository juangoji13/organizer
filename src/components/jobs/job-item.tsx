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
  User, 
  Eye, 
  EyeOff,
  KeyRound,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobItemProps {
  job: ClientJob;
}

export function JobItem({ job }: JobItemProps) {
  const { toggleDeliverable, markJobDelivered, markJobPaid } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
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

  const copyField = (text: string, field: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const openWhatsApp = () => {
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${job.clientName}, te escribo respecto al trabajo "${job.title}".`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/85 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 transition-colors select-none">
      {/* Background Swipe Feedback Indicators */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none"
      >
        <div 
          className={`flex items-center gap-1.5 text-xs font-semibold text-emerald-800 transition-all ${
            swipeOffset > 40 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Marcar Entregado</span>
        </div>

        <div 
          className={`flex items-center gap-1.5 text-xs font-semibold text-amber-800 transition-all ${
            swipeOffset < -40 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
          }`}
        >
          <span>Marcar Pagado</span>
          <CreditCard className="w-4 h-4 text-amber-700" />
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
        className="relative bg-white z-10 p-4 sm:p-5"
      >
        {/* Tier 1: Subject (Architectural Tag) & Financial Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 font-mono">
              {job.subject}
            </span>
            {isDelivered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50/70 border border-emerald-200/40">
                <Check className="w-3 h-3 text-emerald-700" />
                Entregado
              </span>
            )}
          </div>

          {/* Pricing & Subtle Debt Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-zinc-900">
              ${job.totalPrice.toLocaleString()} {job.currency}
            </span>
            {!isFullyPaid ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200/50">
                Debe ${pendingDebt.toLocaleString()}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/40">
                Pagado
              </span>
            )}
          </div>
        </div>

        {/* Tier 2: Job Title (Crisp Editorial Hierarchy) */}
        <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-900 tracking-tight leading-snug mb-3">
          {job.title}
        </h3>

        {/* Tier 3: Client & WhatsApp Action + Deadline */}
        <div className="flex items-center justify-between gap-3 pt-2 pb-3 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-zinc-800 truncate">
              {job.clientName}
            </span>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={openWhatsApp}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 text-[11px] font-medium transition-colors min-h-[36px]"
              title={`Chatear con ${job.clientName}`}
              aria-label={`Abrir chat de WhatsApp con ${job.clientName}`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden xs:inline">WhatsApp</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium shrink-0">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Límite: <strong className="text-zinc-800 font-semibold">{job.deadlineTime}</strong></span>
          </div>
        </div>

        {/* Tier 4: Credentials Widget (1-Tap Discrete Copy) */}
        <div className="mt-1 p-2.5 sm:p-3 rounded-lg bg-zinc-50/80 border border-zinc-200/70">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-zinc-400" />
              <span>{job.platform}</span>
            </div>
            <span className="text-zinc-400 font-normal lowercase">1 toque para copiar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* User Copy Tile */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => copyField(job.platformUser, 'user')}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-zinc-200/80 hover:border-zinc-300 text-left transition-colors min-h-[42px]"
              title="Copiar usuario"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="font-mono text-zinc-800 text-[11px] truncate">
                  {job.platformUser}
                </span>
              </div>
              {copiedField === 'user' ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado</span>
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
            </motion.button>

            {/* Password Tile with Isolated Eye Toggle */}
            <div className="flex items-center gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => copyField(job.platformPass, 'pass')}
                className="flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-zinc-200/80 hover:border-zinc-300 text-left transition-colors min-h-[42px]"
                title="Copiar contraseña"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-zinc-800 text-[11px]">
                    {showPassword ? job.platformPass : '••••••••'}
                  </span>
                </div>
                {copiedField === 'pass' ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiada</span>
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2.5 rounded-lg bg-white border border-zinc-200/80 text-zinc-500 hover:text-zinc-900 min-h-[42px] min-w-[42px] flex items-center justify-center transition-colors"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tier 5: Segmented Deliverables Tracker */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-600">
              {completedList.length} de {totalCount} listos ({progressPercent}%)
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 font-semibold text-zinc-800 hover:text-zinc-950 py-1 px-2 rounded-md hover:bg-zinc-100 transition-colors min-h-[34px]"
            >
              <span className="text-[11px]">{isExpanded ? 'Ocultar detalle' : 'Ver entregables'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Clean Segmented Bar (One dash per deliverable) */}
          <div className="flex items-center gap-1 w-full h-1.5">
            {job.deliverables.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`flex-1 h-full rounded-full transition-colors ${
                  item.isCompleted ? 'bg-zinc-900' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tier 6: Discrete Mobile One-Tap Quick Actions */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-end gap-2 text-xs">
          {!isDelivered && (
            <button
              type="button"
              onClick={() => markJobDelivered(job.id)}
              className="px-2.5 py-1.5 rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 text-[11px] font-medium transition-colors"
            >
              Marcar Entregado
            </button>
          )}
          {!isFullyPaid && (
            <button
              type="button"
              onClick={() => markJobPaid(job.id)}
              className="px-2.5 py-1.5 rounded-lg text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/50 text-[11px] font-medium transition-colors"
            >
              Marcar Pagado
            </button>
          )}
        </div>
      </motion.div>

      {/* Accordion: Categorized Checklist */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-100 bg-zinc-50/60 p-4 max-h-72 overflow-y-auto"
          >
            {/* Pending Deliverables */}
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Por Entregar ({pendingList.length})
              </span>
              <div className="space-y-1.5">
                {pendingList.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-zinc-200/60 hover:border-zinc-300 cursor-pointer min-h-[44px] transition-colors"
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

            {/* Completed Deliverables */}
            {completedList.length > 0 && (
              <div className="pt-2 border-t border-zinc-200/50">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Completadas ({completedList.length})
                </span>
                <div className="space-y-1">
                  {completedList.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-zinc-100/50 cursor-pointer min-h-[36px]"
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => toggleDeliverable(job.id, item.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-400 accent-zinc-900 cursor-pointer shrink-0"
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
