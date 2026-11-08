'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { ToastNotification } from '@/types/organizer';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ToastItem({ toast, onDismiss }: { toast: ToastNotification; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs ?? 5500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  const handleUndo = async () => {
    if (toast.onUndo) {
      await toast.onUndo();
    }
    onDismiss(toast.id);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-white text-[#09090b] border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.08)] min-h-[52px]"
      role="alert"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {getIcon()}
        <span className="text-xs font-medium text-[#09090b] leading-snug line-clamp-2">
          {toast.message}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {toast.onUndo && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090b] text-white hover:bg-[#18181b] text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08)] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>{toast.undoLabel || 'Deshacer'}</span>
          </motion.button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-md text-[#71717a] hover:text-[#09090b] hover:bg-[#fafafa] transition-colors cursor-pointer"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useWorkspace();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 pointer-events-none flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
