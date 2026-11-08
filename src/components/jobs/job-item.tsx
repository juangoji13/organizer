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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@animate-ui/react/utils/motion';

interface JobItemProps {
  job: ClientJob;
}

export function JobItem({ job }: JobItemProps) {
  const { toggleDeliverable, markJobDelivered, markJobPaid } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const completedCount = job.deliverables.filter((d) => d.isCompleted).length;
  const totalCount = job.deliverables.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const openWhatsApp = () => {
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const isDelivered = job.status === 'delivered';
  const isFullyPaid = job.paidAmount >= job.totalPrice;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/90 bg-white transition-all shadow-xs hover:border-zinc-300">
      {/* Background action hints when swiping */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none select-none">
        <div className={`flex items-center gap-2 text-xs font-medium text-emerald-700 transition-opacity ${dragOffset > 30 ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Marcar Entregado</span>
        </div>
        <div className={`flex items-center gap-2 text-xs font-medium text-blue-700 transition-opacity ${dragOffset < -30 ? 'opacity-100' : 'opacity-0'}`}>
          <span>Marcar Pagado</span>
          <Check className="w-4 h-4" />
        </div>
      </div>

      {/* Swipeable Main Card Container */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDrag={(_, info) => setDragOffset(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) {
            markJobDelivered(job.id);
          } else if (info.offset.x < -90) {
            markJobPaid(job.id);
          }
          setDragOffset(0);
        }}
        className="relative bg-white z-10 p-4 sm:p-5"
      >
        {/* Top Meta Line: Client, Subject, Deadline & WhatsApp */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {job.subject}
              </span>
              <span className="text-zinc-300">•</span>
              <h3 className="text-sm font-semibold text-zinc-900">
                {job.clientName}
              </h3>
            </div>
            <h4 className="text-sm text-zinc-700 font-medium mt-0.5">
              {job.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct WhatsApp Button with Press Animation */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={spring.press}
              onClick={openWhatsApp}
              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-emerald-200/60"
              title={`Abrir WhatsApp con ${job.clientName}`}
              aria-label="Abrir WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.button>

            {/* Price Pill */}
            <div className="text-right">
              <div className="text-xs font-medium text-zinc-900">
                ${job.totalPrice.toLocaleString()} {job.currency}
              </div>
              <div className="text-[11px] text-zinc-400">
                {isFullyPaid ? (
                  <span className="text-emerald-600 font-medium">Pagado</span>
                ) : (
                  <span>Debe ${(job.totalPrice - job.paidAmount).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Badge */}
        <div className="flex items-center gap-2 mb-3.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/50">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Límite: {job.deadlineTime}</span>
          </div>

          {isDelivered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Check className="w-3 h-3" />
              Entregado
            </span>
          )}
        </div>

        {/* Credentials Bar (100% visible on one clean horizontal row) */}
        <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] text-zinc-700">
            <span className="text-zinc-400 font-sans font-medium text-[10px] uppercase tracking-wider">
              {job.platform}
            </span>
            <span className="text-zinc-300">|</span>
            <span>
              <span className="text-zinc-400 select-none">usr:</span> {job.platformUser}
            </span>
            <span className="text-zinc-300">|</span>
            <span>
              <span className="text-zinc-400 select-none">pwd:</span> {job.platformPass}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={spring.press}
              onClick={() => copyToClipboard(`${job.platformUser} | ${job.platformPass}`, `creds-${job.id}`)}
              className="px-2 py-1 rounded text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors inline-flex items-center gap-1"
              title="Copiar credenciales"
            >
              {copiedKey === `creds-${job.id}` ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copiar</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Progress Summary and Collapsible Toggle */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span className="font-medium">
              {completedCount} de {totalCount} entregables completados ({progressPercent}%)
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={spring.press}
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-0.5"
            >
              <span>{isExpanded ? 'Ocultar lista' : 'Ver entregables'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </motion.button>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-800 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={spring.progress}
            />
          </div>
        </div>
      </motion.div>

      {/* Expandable Deliverables Checklist with Animate UI spring.height */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring.height}
            className="border-t border-zinc-100 bg-zinc-50/70 px-4 sm:px-5 py-3 overflow-hidden"
          >
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Lista de Asignaciones y Tests
            </div>
            <div className="space-y-1.5">
              {job.deliverables.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 py-1 px-2 rounded-md hover:bg-white transition-colors cursor-pointer text-xs text-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleDeliverable(job.id, item.id)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-zinc-900"
                  />
                  <span className={item.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
