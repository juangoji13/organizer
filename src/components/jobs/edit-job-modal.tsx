'use client';

import React, { useState, useEffect } from 'react';
import { ClientJob } from '@/types/organizer';
import { useWorkspace } from '@/context/workspace-context';
import { X, Pencil, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditJobModalProps {
  job: ClientJob | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditJobModal({ job, isOpen, onClose }: EditJobModalProps) {
  const { updateJob, deleteJob, clients } = useWorkspace();

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [platform, setPlatform] = useState('');
  const [platformUser, setPlatformUser] = useState('');
  const [platformPass, setPlatformPass] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [status, setStatus] = useState<ClientJob['status']>('in_progress');

  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      setSubject(job.subject || '');
      setTitle(job.title || '');
      setClientName(job.clientName || '');
      setClientPhone(job.clientPhone || '');
      setTotalPrice(job.totalPrice ?? '');
      setPaidAmount(job.paidAmount ?? 0);
      setPlatform(job.platform || '');
      setPlatformUser(job.platformUser || '');
      setPlatformPass(job.platformPass || '');
      setDeadlineDate(job.deadlineDate || '');
      setDeadlineTime(job.deadlineTime || '11:59 PM');
      setStatus(job.status || 'in_progress');
      setIsConfirmingDelete(false);
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleClientNameChange = (name: string) => {
    setClientName(name);
    const matched = clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (matched && matched.phone) {
      setClientPhone(matched.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !clientName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateJob(job.id, {
        subject: subject.trim(),
        title: title.trim(),
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        totalPrice: Number(totalPrice) || 0,
        paidAmount: Number(paidAmount) || 0,
        platform: platform.trim(),
        platformUser: platformUser.trim(),
        platformPass: platformPass.trim(),
        deadlineDate,
        deadlineTime,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteJob(job.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
                  Editar Trabajo
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Modifica los datos del encargo, tarifas o credenciales
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Delete confirmation banner */}
            {isConfirmingDelete && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>¿Confirmas la eliminación permanente de este trabajo y sus entregables?</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 text-xs rounded-lg text-zinc-600 hover:bg-rose-100/60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* Materia y Título */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Materia / Asignatura *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Inglés Connect, Cálculo Integral..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Título del Trabajo *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Taller 3: Integración por Partes..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Cliente y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  placeholder="Nombre del estudiante"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 573001234567"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Tarifa y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Tarifa Total (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Abonado (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientJob['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 bg-white"
                >
                  <option value="in_progress">En Curso</option>
                  <option value="delivered">Entregado</option>
                  <option value="paid">Pagado</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Fechas y Horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Hora Límite
                </label>
                <input
                  type="text"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  placeholder="Ej: 11:59 PM o 6:00 PM"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>
            </div>

            {/* Plataforma & Credenciales */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Plataforma & Credenciales Universitarias
              </span>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Plataforma
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="McGraw-Hill Connect, Teams, Moodle, Blackboard..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Usuario / Correo
                  </label>
                  <input
                    type="text"
                    value={platformUser}
                    onChange={(e) => setPlatformUser(e.target.value)}
                    placeholder="usuario@universidad.edu.co"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200/90 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={platformPass}
                      onChange={(e) => setPlatformPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 pr-10 py-2 rounded-xl border border-zinc-200/90 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-400 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-700"
                      aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Trabajo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-semibold transition-all shadow-xs"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
