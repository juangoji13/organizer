'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import {
  MessageCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CreditCard,
  Pencil,
  Clock,
  CheckCircle2,
  Phone,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CreateClientModal } from '@/components/clients/create-client-modal';
import { PartialPaymentModal } from '@/components/jobs/partial-payment-modal';
import { EditJobModal } from '@/components/jobs/edit-job-modal';
import { ClientJob } from '@/types/organizer';

export function ClientsView() {
  const { clients, jobs } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Modals state
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<ClientJob | null>(null);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<ClientJob | null>(null);

  const openWhatsApp = (phone: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${name}, ¿cómo estás?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Pre-calculate client job mappings and totals
  const clientsWithData = useMemo(() => {
    return clients.map((client) => {
      const clientJobs = jobs.filter((j) =>
        j.clientName.toLowerCase() === client.name.toLowerCase() ||
        (client.phone && j.clientPhone && j.clientPhone.replace(/\D/g, '') === client.phone.replace(/\D/g, ''))
      );

      const totalGenerado = clientJobs.length > 0
        ? clientJobs.reduce((acc, j) => acc + j.totalPrice, 0)
        : (client.totalPaid + client.totalPending);

      const totalCobrado = clientJobs.length > 0
        ? clientJobs.reduce((acc, j) => acc + j.paidAmount, 0)
        : client.totalPaid;

      const totalDeuda = Math.max(0, totalGenerado - totalCobrado);
      const firstJobWithDebt = clientJobs.find((j) => j.totalPrice > j.paidAmount) || null;

      return {
        ...client,
        clientJobs,
        totalGenerado,
        totalCobrado,
        totalDeuda,
        firstJobWithDebt,
      };
    });
  }, [clients, jobs]);

  // Filter clients by search & debt
  const filteredClients = useMemo(() => {
    return clientsWithData.filter((client) => {
      if (filterDebtOnly && client.totalDeuda <= 0) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesPhone = client.phone.includes(query);
        return matchesName || matchesPhone;
      }

      return true;
    });
  }, [clientsWithData, searchQuery, filterDebtOnly]);

  const totalClientsWithDebt = clientsWithData.filter((c) => c.totalDeuda > 0).length;

  return (
    <div className="max-w-4xl mx-auto py-3.5 sm:py-6 px-3 sm:px-6">
      {/* Ultralight Clean Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
            Clientes
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {clients.length} contactos registrados • {totalClientsWithDebt} con saldo pendiente
          </p>
        </div>

        {/* Direct Action: + Nuevo Cliente */}
        <button
          type="button"
          onClick={() => setIsCreateClientOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Ultralight Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 shrink-0 text-xs">
          <button
            onClick={() => setFilterDebtOnly(false)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              !filterDebtOnly
                ? 'bg-zinc-900 text-white font-semibold'
                : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterDebtOnly(true)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              filterDebtOnly
                ? 'bg-amber-900 text-white font-semibold'
                : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70'
            }`}
          >
            <span>Con Saldo</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                filterDebtOnly ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'
              }`}
            >
              {totalClientsWithDebt}
            </span>
          </button>
        </div>
      </div>

      {/* Clean Client Rows with Subtle Divider (No Russian Dolls!) */}
      <div className="bg-white rounded-2xl border border-zinc-200/75 shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-zinc-100 overflow-hidden">
        {filteredClients.map((client) => {
          const isExpanded = selectedClientId === client.id;

          return (
            <div key={client.id} className="transition-colors">
              {/* Client Row */}
              <div
                onClick={() => setSelectedClientId(isExpanded ? null : client.id)}
                className="px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors cursor-pointer select-none"
              >
                {/* Left: Name, Phone & Work Summary */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                      {client.name}
                    </h3>
                    {client.phone && (
                      <span className="text-[11px] text-zinc-500 font-mono">
                        +{client.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                    <span>
                      {client.clientJobs.length} {client.clientJobs.length === 1 ? 'encargo' : 'encargos'}
                    </span>
                    <span>•</span>
                    <span>
                      Generado:{' '}
                      <strong className="text-zinc-800 font-mono font-semibold">
                        ${client.totalGenerado.toLocaleString()} COP
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right: Debt badge, Direct Payment Button, WhatsApp & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status / Debt Badge */}
                  {client.totalDeuda > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-mono tabular-nums">
                        Debe ${client.totalDeuda.toLocaleString()}
                      </span>

                      {/* Direct Partial Payment Button */}
                      {client.firstJobWithDebt && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobForPayment(client.firstJobWithDebt);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                          title="Registrar abono directo"
                        >
                          <CreditCard className="w-3 h-3 text-emerald-700" />
                          <span className="hidden sm:inline">Abonar</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/40">
                      Al día
                    </span>
                  )}

                  {/* WhatsApp Quick Action */}
                  {client.phone && (
                    <button
                      type="button"
                      onClick={(e) => openWhatsApp(client.phone, client.name, e)}
                      className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-medium"
                      title={`Escribir por WhatsApp a ${client.name}`}
                      aria-label={`WhatsApp con ${client.name}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}

                  {/* Chevron Toggle */}
                  <div className="text-zinc-400 p-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Clean Timeline Job History (No Russian Dolls / No Nested Card Boxes) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.16 }}
                    className="border-t border-zinc-100 bg-zinc-50/50 px-4 sm:px-6 py-3.5"
                  >
                    {/* Timeline Header */}
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3 px-0.5">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Historial de Encargos ({client.clientJobs.length})</span>
                      </div>
                      <span className="font-mono tabular-nums text-zinc-600">
                        Cobrado: ${client.totalCobrado.toLocaleString()} COP
                      </span>
                    </div>

                    {client.clientJobs.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-2 px-1">
                        No hay trabajos detallados registrados aún para este cliente.
                      </p>
                    ) : (
                      /* Clean Vertical Timeline */
                      <div className="relative pl-5 ml-1 space-y-3.5 my-1 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
                        {client.clientJobs.map((job) => {
                          const jobDebt = Math.max(0, job.totalPrice - job.paidAmount);
                          const isDelivered = job.status === 'delivered';

                          return (
                            <div key={job.id} className="relative group/timeline">
                              {/* Node Dot on Timeline */}
                              <div
                                className={`absolute -left-5 top-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                                  jobDebt > 0
                                    ? 'bg-amber-500'
                                    : isDelivered
                                    ? 'bg-emerald-600'
                                    : 'bg-zinc-400'
                                }`}
                              />

                              {/* Timeline Item Content (Sleek row without heavy container borders) */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 py-0.5">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-zinc-900 truncate">
                                      {job.title}
                                    </span>
                                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded font-mono shrink-0">
                                      {job.platform || 'General'}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                    <span>{job.subject}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-zinc-400" />
                                      <span>
                                        Entrega:{' '}
                                        <strong className="font-mono text-zinc-700">
                                          {job.deadlineDate || 'Sin fecha'}
                                        </strong>{' '}
                                        ({job.deadlineTime})
                                      </span>
                                    </span>
                                    {job.deliverables.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono">
                                          {job.deliverables.filter((d) => d.isCompleted).length}/
                                          {job.deliverables.length} entregables
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Price, Status & Direct Action Buttons */}
                                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 shrink-0">
                                  <div className="text-left sm:text-right">
                                    <div className="font-mono font-bold text-xs text-zinc-900 tabular-nums">
                                      ${job.totalPrice.toLocaleString()} COP
                                    </div>
                                    <div className="text-[10px] mt-0.2">
                                      {isDelivered ? (
                                        <span className="text-emerald-700 font-semibold">Entregado</span>
                                      ) : jobDebt <= 0 ? (
                                        <span className="text-emerald-700 font-semibold">Pagado</span>
                                      ) : (
                                        <span className="text-amber-800 font-bold font-mono tabular-nums">
                                          Debe ${jobDebt.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Direct Actions: Abonar & Editar */}
                                  <div className="flex items-center gap-1">
                                    {jobDebt > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedJobForPayment(job)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                                        title="Registrar abono a este trabajo"
                                      >
                                        <CreditCard className="w-3 h-3 text-emerald-700" />
                                        <span>Abonar</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setSelectedJobForEdit(job)}
                                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                                      title="Editar este encargo"
                                      aria-label="Editar encargo"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-500">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Direct Client Creation Modal */}
      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
      />

      {/* Partial Payment Modal */}
      <PartialPaymentModal
        job={selectedJobForPayment}
        isOpen={Boolean(selectedJobForPayment)}
        onClose={() => setSelectedJobForPayment(null)}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        job={selectedJobForEdit}
        isOpen={Boolean(selectedJobForEdit)}
        onClose={() => setSelectedJobForEdit(null)}
      />
    </div>
  );
}
