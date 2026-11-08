'use client';

import React from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryText: string;
  onCopyAgain: () => void;
  hasCopied: boolean;
  onOpenWhatsApp: () => void;
}

export function WhatsAppSummaryModal({
  isOpen,
  onClose,
  summaryText,
  onCopyAgain,
  hasCopied,
  onOpenWhatsApp,
}: WhatsAppSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-zinc-200/80 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-zinc-950 leading-tight">
                    Resumen para WhatsApp
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                    ✓ Copiado
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Listo para enviar a tu chat o contacto
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              El balance ejecutivo ha sido copiado a tu portapapeles. Puedes pegarlo directamente con <code className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-800 font-mono text-[11px]">Ctrl + V</code> o abrir WhatsApp con el mensaje listo:
            </p>

            {/* Formatted Text Box */}
            <div className="relative rounded-xl bg-zinc-50 border border-zinc-200/80 p-4 font-mono text-xs text-zinc-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all">
              {summaryText}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer min-h-[40px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir en WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onCopyAgain}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-500" />
                    <span>Copiar de nuevo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 text-xs font-medium transition-colors cursor-pointer min-h-[40px]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
