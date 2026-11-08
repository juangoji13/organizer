'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, Phone, History, Plus } from 'lucide-react';

export function ClientsView() {
  const { clients } = useWorkspace();

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Directorio de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Historial de contactos, volumen de trabajos realizados y estado de cuenta.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">{client.name}</h3>
                <span className="text-xs text-zinc-400 font-mono">+{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                <span>{client.totalJobs} trabajos completados</span>
                <span>•</span>
                <span>Último contacto: {client.lastActive}</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
              <div className="text-left sm:text-right">
                <div className="text-xs text-zinc-400">Total Facturado</div>
                <div className="text-xs font-semibold text-zinc-900">
                  ${(client.totalPaid + client.totalPending).toLocaleString()} COP
                </div>
              </div>

              <button
                onClick={() => openWhatsApp(client.phone)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
