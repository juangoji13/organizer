'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { X, UserPlus, Phone, User } from 'lucide-react';
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
              <div className="w-8 h-8 rounded-lg bg-[#09090b] text-white flex items-center justify-center">
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#09090b] leading-tight">
                  Nuevo Cliente
                </h2>
                <p className="text-[12px] text-[#71717a] mt-0.5">
                  Agrega un nuevo estudiante a tu directorio
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
            <div>
              <label className="text-xs font-medium text-[#52525b] block mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#71717a] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Laura Gómez"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-black/[0.08] bg-[#fafafa] text-sm text-[#09090b] placeholder:text-[#71717a]/50 focus:bg-white focus:outline-none focus:border-[#09090b] transition-all min-h-[44px]"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#52525b] block mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-[#71717a] absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 573001234567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-black/[0.08] bg-[#fafafa] text-sm text-[#09090b] placeholder:text-[#71717a]/50 focus:bg-white focus:outline-none focus:border-[#09090b] transition-all min-h-[44px]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Incluye el indicativo si deseas abrir WhatsApp directamente (ej: 57 para Colombia).
              </p>
            </div>

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
                disabled={isSubmitting || !name.trim() || !phone.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09090b] text-white hover:bg-[#18181b] disabled:opacity-40 text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-h-[38px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Guardando...' : 'Crear Cliente'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
