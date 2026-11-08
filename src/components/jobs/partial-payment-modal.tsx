'use client';

import React, { useState, useEffect } from 'react';
import { ClientJob } from '@/types/organizer';
import { useWorkspace } from '@/context/workspace-context';
import { X, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PartialPaymentModalProps {
  job: ClientJob | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PartialPaymentModal({ job, isOpen, onClose }: PartialPaymentModalProps) {
  const { registerPartialPayment } = useWorkspace();
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingDebt = job ? Math.max(0, job.totalPrice - job.paidAmount) : 0;

  useEffect(() => {
    if (isOpen && job) {
      if (pendingDebt > 0 && pendingDebt <= 50000) {
        setAmount(pendingDebt);
      } else if (pendingDebt > 50000) {
        setAmount(50000);
      } else {
        setAmount('');
      }
    }
  }, [isOpen, job, pendingDebt]);

  if (!isOpen || !job) return null;

  const numericAmount = typeof amount === 'number' ? amount : 0;
  const remainingAfterPayment = Math.max(0, pendingDebt - numericAmount);
  const willFullyPay = numericAmount >= pendingDebt && pendingDebt > 0;

  const handleSelectQuickAmount = (val: number) => {
    setAmount(Math.min(pendingDebt, val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await registerPartialPayment(job.id, numericAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/[0.04] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#09090b] leading-tight">
                  Registrar Abono
                </h2>
                <p className="text-[12px] text-[#71717a] mt-0.5">
                  {job.clientName} • {job.subject}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-[#09090b] hover:bg-[#fafafa] transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Status Breakdown Strip */}
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-black/[0.04] grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[11px] font-medium text-[#71717a] block mb-0.5">Tarifa Total</span>
                <span className="text-xs font-semibold text-[#09090b] font-mono tabular-nums">
                  ${job.totalPrice.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#71717a] block mb-0.5">Ya Abonado</span>
                <span className="text-xs font-semibold text-emerald-700 font-mono tabular-nums">
                  ${job.paidAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#71717a] block mb-0.5">Saldo Actual</span>
                <span className="text-xs font-semibold text-amber-700 font-mono tabular-nums">
                  ${pendingDebt.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="text-xs font-medium text-[#52525b] block mb-2">
                Abonos Rápidos Sugeridos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[20000, 50000, 100000].map((val) => {
                  if (pendingDebt < val && val !== 20000) return null;
                  const isSelected = numericAmount === val;
                  return (
                    <motion.button
                      key={val}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleSelectQuickAmount(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                        isSelected
                          ? 'bg-[#09090b] text-white border-[#09090b] font-semibold'
                          : 'bg-white text-[#52525b] border-black/[0.08] hover:bg-[#fafafa]'
                      }`}
                    >
                      <span className="font-mono tabular-nums">+${(val / 1000).toFixed(0)}k</span>
                    </motion.button>
                  );
                })}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSelectQuickAmount(pendingDebt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                    numericAmount === pendingDebt
                      ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                      : 'bg-emerald-50/70 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70 font-medium'
                  }`}
                >
                  Saldar Todo
                </motion.button>
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="text-xs font-medium text-[#52525b] block mb-1.5">
                Valor a Abonar (COP)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#71717a] font-mono font-medium text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  max={pendingDebt > 0 ? pendingDebt : undefined}
                  step="1000"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setAmount(val);
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-black/[0.08] bg-[#fafafa] text-sm font-semibold font-mono tabular-nums text-[#09090b] placeholder:text-[#71717a]/50 focus:bg-white focus:outline-none focus:border-[#09090b] transition-all min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Preview Banner */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              willFullyPay
                ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-900'
                : 'bg-[#fafafa] border border-black/[0.04] text-[#52525b]'
            }`}>
              {willFullyPay ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ArrowRight className="w-4 h-4 text-[#71717a] shrink-0" />
              )}
              <div className="leading-snug">
                {willFullyPay ? (
                  <span>
                    <strong className="font-semibold text-emerald-950">¡Deuda saldada en su totalidad!</strong> Este trabajo pasará automáticamente a estado <strong className="font-semibold text-emerald-950">Pagado</strong>.
                  </span>
                ) : (
                  <span>
                    Nuevo saldo pendiente tras este abono:{' '}
                    <strong className="font-mono tabular-nums text-[#09090b] font-semibold">${remainingAfterPayment.toLocaleString()} COP</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.04]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa] transition-colors min-h-[38px]"
              >
                Cancelar
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !numericAmount || numericAmount <= 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09090b] text-white hover:bg-[#18181b] disabled:opacity-40 text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-h-[38px]"
              >
                <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {isSubmitting
                    ? 'Registrando...'
                    : `Confirmar Abono de $${numericAmount.toLocaleString()} COP`}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
