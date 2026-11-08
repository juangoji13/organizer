'use client';

import React, { useState, useEffect } from 'react';
import { ClientJob } from '@/types/organizer';
import { useWorkspace } from '@/context/workspace-context';
import { X, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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
      // Default to quick amount or remaining debt
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
                  Registrar Abono
                </h2>
                <p className="text-[11px] text-zinc-500">
                  {job.clientName} • {job.subject}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Status Breakdown Strip */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Tarifa Total</span>
                <span className="text-xs font-bold text-zinc-800 font-mono tabular-nums">
                  ${job.totalPrice.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Ya Abonado</span>
                <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums">
                  ${job.paidAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Saldo Actual</span>
                <span className="text-xs font-bold text-amber-900 font-mono tabular-nums">
                  ${pendingDebt.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-2">
                Abonos Rápidos Sugeridos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[20000, 50000, 100000].map((val) => {
                  if (pendingDebt < val && val !== 20000) return null;
                  const isSelected = numericAmount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectQuickAmount(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      +${(val / 1000).toFixed(0)}k
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleSelectQuickAmount(pendingDebt)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    numericAmount === pendingDebt
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                      : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Saldar Todo
                </button>
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Valor a Abonar (COP)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-400 font-mono font-bold text-sm">$</span>
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
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200/90 text-sm font-semibold font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Preview Banner */}
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              willFullyPay
                ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
                : 'bg-zinc-50 border-zinc-200/80 text-zinc-700'
            }`}>
              {willFullyPay ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
              )}
              <div className="leading-snug">
                {willFullyPay ? (
                  <span>
                    <strong>¡Deuda saldada en su totalidad!</strong> Este trabajo pasará automáticamente a estado <strong>Pagado</strong>.
                  </span>
                ) : (
                  <span>
                    Nuevo saldo pendiente tras este abono:{' '}
                    <strong className="font-mono">${remainingAfterPayment.toLocaleString()} COP</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors min-h-[38px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !numericAmount || numericAmount <= 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-semibold transition-all shadow-xs min-h-[38px]"
              >
                <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {isSubmitting
                    ? 'Registrando...'
                    : `Confirmar Abono de $${numericAmount.toLocaleString()} COP`}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
