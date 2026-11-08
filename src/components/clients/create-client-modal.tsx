'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { X, UserPlus, Phone, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
  const { createClientDirect } = useWorkspace();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await createClientDirect({
        name: name.trim(),
        phone: phone.trim(),
      });
      setName('');
      setPhone('');
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
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
                  Nuevo Cliente
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Agrega un nuevo estudiante a tu directorio
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
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Laura Gómez"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200/90 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all min-h-[44px]"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 573001234567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200/90 text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all min-h-[44px]"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Incluye el indicativo si deseas abrir WhatsApp directamente (ej: 57 para Colombia).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors min-h-[38px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !phone.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-semibold transition-all shadow-xs min-h-[38px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Guardando...' : 'Crear Cliente'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
