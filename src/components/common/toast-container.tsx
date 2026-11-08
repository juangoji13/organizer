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
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-2xl backdrop-blur-md min-h-[52px]"
      role="alert"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {getIcon()}
        <span className="text-xs font-medium text-zinc-100 leading-snug line-clamp-2">
          {toast.message}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {toast.onUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>{toast.undoLabel || 'Deshacer'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
