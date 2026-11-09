'use client';

import React from 'react';
import {
  MenuTrigger,
  Button,
  Menu,
  MenuItem,
  Separator,
} from '@animate-ui/react/primitives/react-aria';
import {
  MoreHorizontal,
  MessageCircle,
  DollarSign,
  Copy,
  Pencil,
  CheckCircle2,
  Undo2,
  Trash2,
} from 'lucide-react';
import { ClientJob } from '@/types/organizer';
import { useWorkspace } from '@/context/workspace-context';

interface JobActionsMenuProps {
  job: ClientJob;
  onEdit: () => void;
  onPayment: () => void;
  onDelete?: () => void;
}

export function JobActionsMenu({
  job,
  onEdit,
  onPayment,
  onDelete,
}: JobActionsMenuProps) {
  const { markJobDelivered, updateJob, deleteJob, showToast } = useWorkspace();
  const isDelivered = job.status === 'delivered';
  const pendingDebt = job.totalPrice - job.paidAmount;

  const handleToggleDelivered = async () => {
    if (isDelivered) {
      await updateJob(job.id, { status: 'in_progress' });
      showToast({ message: 'Marcado como pendiente', type: 'info' });
    } else {
      markJobDelivered(job.id);
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const message = pendingDebt > 0
      ? encodeURIComponent(`Hola ${job.clientName}, ¿cómo estás? Te escribo para coordinar la entrega y el saldo de $${pendingDebt.toLocaleString()} COP de ${job.subject}.`)
      : encodeURIComponent(`Hola ${job.clientName}, ¿cómo estás? Te escribo sobre tu entrega de ${job.subject}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const copyJobSummary = async () => {
    const text = `📌 *${job.subject}* - ${job.title}\n👤 Cliente: ${job.clientName}\n⏰ Límite: ${job.deadlineDate} ${job.deadlineTime}\n💰 Total: $${job.totalPrice.toLocaleString()} ${job.currency}\n💳 Saldo Pendiente: $${pendingDebt.toLocaleString()} ${job.currency}\n🔑 Plataforma: ${job.platform}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      showToast({
        message: 'Resumen copiado al portapapeles',
        type: 'success',
      });
    } catch {
      showToast({
        message: 'No se pudo copiar',
        type: 'info',
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar "${job.title}" de ${job.clientName}?`)) {
      if (onDelete) {
        onDelete();
      } else {
        deleteJob(job.id);
      }
      showToast({
        message: 'Trabajo eliminado',
        type: 'info',
      });
    }
  };

  return (
    <MenuTrigger>
      {/* Accessible RAC Button Trigger */}
      <Button
        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 cursor-pointer"
        aria-label={`Opciones para ${job.title}`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {/* RAC Animated Menu with Viscoelastic Springs */}
      <Menu
        className="z-50 min-w-52 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/15 shadow-xl shadow-zinc-950/10 dark:shadow-black/60 p-1.5 text-xs outline-none backdrop-blur-md"
        onAction={(key) => {
          if (key === 'whatsapp') openWhatsApp();
          if (key === 'payment') onPayment();
          if (key === 'copy') copyJobSummary();
          if (key === 'edit') onEdit();
          if (key === 'toggle-delivered') handleToggleDelivered();
          if (key === 'delete') handleDelete();
        }}
      >
        <MenuItem
          id="whatsapp"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer outline-none transition-colors select-none font-medium text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>WhatsApp con Cliente</span>
        </MenuItem>

        {pendingDebt > 0 && (
          <MenuItem
            id="payment"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer outline-none transition-colors select-none font-medium text-xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Abonar (${pendingDebt.toLocaleString()})</span>
          </MenuItem>
        )}

        <MenuItem
          id="copy"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white cursor-pointer outline-none transition-colors select-none font-medium text-xs"
        >
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span>Copiar Ficha Resumen</span>
        </MenuItem>

        <MenuItem
          id="edit"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white cursor-pointer outline-none transition-colors select-none font-medium text-xs"
        >
          <Pencil className="w-3.5 h-3.5 text-zinc-400" />
          <span>Editar Entrega</span>
        </MenuItem>

        <Separator className="my-1 border-t border-zinc-100 dark:border-white/10" />

        <MenuItem
          id="toggle-delivered"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white cursor-pointer outline-none transition-colors select-none font-medium text-xs"
        >
          {isDelivered ? (
            <>
              <Undo2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Marcar como Pendiente</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Marcar como Entregado</span>
            </>
          )}
        </MenuItem>

        <Separator className="my-1 border-t border-zinc-100 dark:border-white/10" />

        <MenuItem
          id="delete"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer outline-none transition-colors select-none font-medium text-xs"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Eliminar Entrega</span>
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
