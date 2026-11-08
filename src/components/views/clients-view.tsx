'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, Phone, Search, X, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ClientsView() {
  const { clients } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${name}, ¿cómo estás?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (filterDebtOnly && client.totalPending <= 0) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesPhone = client.phone.includes(query);
        return matchesName || matchesPhone;
      }

      return true;
    });
  }, [clients, searchQuery, filterDebtOnly]);

  const totalClientsWithDebt = clients.filter((c) => c.totalPending > 0).length;

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-4 sm:mb-6">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
          Directorio Profesional
        </div>
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
          Clientes & Contactos
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Historial consolidado de proyectos, balance de cobros y acceso rápido a WhatsApp.
        </p>
      </div>

      {/* Touch-Friendly Search & Filter */}
      <div className="space-y-2.5 mb-4">
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[42px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-700 min-h-[28px] min-w-[28px] flex items-center justify-center"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 select-none text-xs">
          <button
            onClick={() => setFilterDebtOnly(false)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] ${
              !filterDebtOnly
                ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterDebtOnly(true)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] flex items-center gap-1.5 ${
              filterDebtOnly
                ? 'bg-amber-900 text-white font-semibold shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <span>Con Saldo Pendiente</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterDebtOnly ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {totalClientsWithDebt}
            </span>
          </button>
        </div>
      </div>

      {/* Clients Card List */}
      <div className="rounded-xl border border-zinc-200/85 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-zinc-100">
        {filteredClients.map((client) => {
          const hasDebt = client.totalPending > 0;
          return (
            <div
              key={client.id}
              className="p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                    {client.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    +{client.phone}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span>{client.totalJobs} trabajos</span>
                  <span>•</span>
                  <span>Último contacto: {client.lastActive}</span>
                </div>
              </div>

              {/* Status and Action Row */}
              <div className="flex items-center justify-between xs:justify-end gap-3 pt-2 xs:pt-0 border-t xs:border-t-0 border-zinc-100">
                <div className="text-left xs:text-right">
                  <div className="text-xs font-semibold text-zinc-900">
                    ${(client.totalPaid + client.totalPending).toLocaleString()} COP
                  </div>
                  {hasDebt ? (
                    <div className="text-[10px] font-medium text-amber-800">
                      Debe ${client.totalPending.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-700">
                      Al día
                    </div>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => openWhatsApp(client.phone, client.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 text-xs font-medium transition-colors min-h-[38px]"
                  title={`Abrir WhatsApp con ${client.name}`}
                  aria-label={`Abrir WhatsApp con ${client.name}`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </motion.button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-400">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
