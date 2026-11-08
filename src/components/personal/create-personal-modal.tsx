'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { X, GraduationCap, Sparkles, PiggyBank, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface CreatePersonalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePersonalModal({ isOpen, onClose }: CreatePersonalModalProps) {
  const { createPersonalItem } = useWorkspace();

  const [category, setCategory] = useState<'study' | 'dev' | 'savings'>('study');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>(1000000);
  const [currentAmount, setCurrentAmount] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    await createPersonalItem({
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      isDone: false,
      currentAmount: category === 'savings' ? Number(currentAmount) || 0 : undefined,
      targetAmount: category === 'savings' ? Number(targetAmount) || 100 : undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200/80 shadow-2xl p-4 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Espacio Personal
            </span>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Nueva Meta Personal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Categoría Selector */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1.5">
              Tipo de Registro
            </label>
            <div className="grid grid-cols-3 gap-1.5 select-none">
              <button
                type="button"
                onClick={() => setCategory('study')}
                className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                  category === 'study'
                    ? 'border-zinc-900 bg-zinc-50 font-semibold text-zinc-950'
                    : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-zinc-700" />
                <span className="text-[11px]">Estudio U</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('dev')}
                className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                  category === 'dev'
                    ? 'border-zinc-900 bg-zinc-50 font-semibold text-zinc-950'
                    : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span className="text-[11px]">Proyecto Dev</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('savings')}
                className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                  category === 'savings'
                    ? 'border-zinc-900 bg-zinc-50 font-semibold text-zinc-950'
                    : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <PiggyBank className="w-4 h-4 text-zinc-700" />
                <span className="text-[11px]">Ahorro</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Título
            </label>
            <input
              type="text"
              placeholder={
                category === 'study'
                  ? 'ej. Preparación Parcial de Algoritmos'
                  : category === 'dev'
                  ? 'ej. API con Next.js y Supabase'
                  : 'ej. Fondo Nueva Laptop M3'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs"
            />
          </div>

          {/* Notas / Descripción */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Notas / Descripción
            </label>
            <textarea
              rows={2}
              placeholder="Detalles, requerimientos o ideas adicionales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs"
            />
          </div>

          {/* Metas Financieras Si es Ahorro */}
          {category === 'savings' && (
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60">
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Monto Actual (COP)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-zinc-900 font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Meta Objetivo (COP)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-zinc-900 font-semibold text-xs"
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
