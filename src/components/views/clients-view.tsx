'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { MessageCircle, Search, X, Users, CheckCircle2, ChevronDown, ChevronUp, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ClientsView() {
  const { clients, jobs } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const openWhatsApp = (phone: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3.5 sm:px-6">
      {/* Editorial Header */}
      <div className="mb-4 sm:mb-6">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
          Directorio & Facturación
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-0.5">
          Clientes & Trabajos Realizados
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Consulta todo lo que te ha generado cada cliente y el historial completo de sus encargos.
        </p>
      </div>

      {/* Search & Quick Filter */}
      <div className="space-y-2 mb-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente por nombre o teléfono..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[40px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 select-none text-xs">
          <button
            onClick={() => setFilterDebtOnly(false)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-[11px] min-h-[34px] ${
              !filterDebtOnly
                ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterDebtOnly(true)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-[11px] min-h-[34px] flex items-center gap-1.5 ${
              filterDebtOnly
                ? 'bg-amber-900 text-white font-semibold shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:text-zinc-900'
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

      {/* Clients Card List with Collapsible Job History */}
      <div className="rounded-xl border border-zinc-200/85 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-zinc-100">
        {filteredClients.map((client) => {
          const hasDebt = client.totalPending > 0;
          const isExpanded = selectedClientId === client.id;
          
          // Find all jobs matching this client
          const clientJobs = jobs.filter((j) => 
            j.clientName.toLowerCase() === client.name.toLowerCase() ||
            j.clientPhone.replace(/\D/g, '') === client.phone.replace(/\D/g, '')
          );
          
          const totalGeneradoReal = clientJobs.reduce((acc, j) => acc + j.totalPrice, 0) || (client.totalPaid + client.totalPending);
          const totalCobradoReal = clientJobs.reduce((acc, j) => acc + j.paidAmount, 0) || client.totalPaid;
          const totalDeudaReal = totalGeneradoReal - totalCobradoReal;

          return (
            <div key={client.id} className="transition-colors">
              {/* Client Row */}
              <div
                onClick={() => setSelectedClientId(isExpanded ? null : client.id)}
                className="p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors cursor-pointer select-none"
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
                    <span>{clientJobs.length || client.totalJobs} trabajos</span>
                    <span>•</span>
                    <span className="text-zinc-600 font-medium">
                      Generado: <strong className="text-zinc-900 font-mono">${totalGeneradoReal.toLocaleString()} COP</strong>
                    </span>
                  </div>
                </div>

                {/* Status, WhatsApp and Accordion Chevron */}
                <div className="flex items-center justify-between xs:justify-end gap-2.5 pt-2 xs:pt-0 border-t xs:border-t-0 border-zinc-100">
                  <div className="text-left xs:text-right">
                    {totalDeudaReal > 0 ? (
                      <div className="text-[11px] font-semibold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/50">
                        Debe ${totalDeudaReal.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded">
                        Al día
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => openWhatsApp(client.phone, client.name, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/50 text-xs font-medium transition-colors"
                    title={`Abrir WhatsApp con ${client.name}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden xs:inline">WhatsApp</span>
                  </button>

                  <div className="p-1 text-zinc-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible History of Specific Jobs Done for This Student */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="bg-zinc-50/80 border-t border-zinc-100 p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono mb-2">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Trabajos Realizados ({clientJobs.length})</span>
                      </div>
                      <span>Total: ${totalGeneradoReal.toLocaleString()} COP</span>
                    </div>

                    {clientJobs.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-2">
                        No hay trabajos detallados registrados aún para este cliente.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {clientJobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-2.5 rounded-lg bg-white border border-zinc-200/70 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-zinc-900 truncate">
                                {job.title}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                {job.subject} • {job.platform} • Límite: {job.deadlineDate}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-mono font-semibold text-zinc-900">
                                ${job.totalPrice.toLocaleString()} COP
                              </div>
                              <div className="text-[10px]">
                                {job.status === 'delivered' ? (
                                  <span className="text-emerald-700 font-medium">Entregado</span>
                                ) : job.paidAmount >= job.totalPrice ? (
                                  <span className="text-emerald-700 font-medium">Pagado</span>
                                ) : (
                                  <span className="text-amber-800 font-medium">
                                    Debe ${(job.totalPrice - job.paidAmount).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
