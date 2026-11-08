'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { DeliverableItem } from '@/types/organizer';
import { X, Sparkles, Plus, Trash2, Clock, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const { clients, createJob } = useWorkspace();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('McGraw-Hill Connect');
  const [platformUser, setPlatformUser] = useState('');
  const [platformPass, setPlatformPass] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>(50000);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [deadlineDate, setDeadlineDate] = useState('2026-11-08');
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');
  const [deliverables, setDeliverables] = useState<Array<{ id: string; title: string; isCompleted: boolean; type?: 'assignment' | 'test' }>>([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      setDeadlineDate(new Date().toISOString().split('T')[0]);
    } catch {
      // fallback
    }
  }, []);

  // University Presets
  const applyPresetConnect = () => {
    const items: Array<{ id: string; title: string; isCompleted: boolean; type?: 'assignment' | 'test' }> = [];
    for (let i = 1; i <= 8; i++) {
      items.push({ id: `d-gen-a-${i}`, title: `Assignment ${i}`, isCompleted: false, type: 'assignment' });
    }
    for (let i = 1; i <= 8; i++) {
      items.push({ id: `d-gen-t-${i}`, title: `Test Unit ${i}`, isCompleted: false, type: 'test' });
    }
    items.push({ id: 'd-gen-pt', title: 'Progress Check Test', isCompleted: false, type: 'test' });
    setDeliverables(items);
    if (!platform) setPlatform('McGraw-Hill Connect');
    if (!subject) setSubject('Inglés Connect');
  };

  const applyPresetCorte = () => {
    setDeliverables([
      { id: 'd-gen-1', title: 'Taller Preparatorio', isCompleted: false, type: 'assignment' },
      { id: 'd-gen-2', title: 'Examen Parcial de Corte', isCompleted: false, type: 'test' },
      { id: 'd-gen-3', title: 'Proyecto / Entrega Final', isCompleted: false, type: 'assignment' },
    ]);
  };

  const applyPresetTaller = () => {
    setDeliverables([
      { id: 'd-gen-1', title: title || 'Taller Completo', isCompleted: false, type: 'assignment' },
    ]);
  };

  const addManualDeliverable = () => {
    if (!newDeliverableTitle.trim()) return;
    setDeliverables((prev) => [
      ...prev,
      { id: `d-man-${Date.now()}`, title: newDeliverableTitle.trim(), isCompleted: false, type: 'assignment' },
    ]);
    setNewDeliverableTitle('');
  };

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !subject.trim()) return;

    setIsSubmitting(true);

    const deliverablesToSave: DeliverableItem[] = deliverables.length > 0
      ? deliverables
      : [{ id: `d-${Date.now()}`, title: title || subject, isCompleted: false, type: 'assignment' }];

    await createJob({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '573000000000',
      subject: subject.trim(),
      title: title.trim() || subject.trim(),
      deadlineTime: deadlineTime || '11:59 PM',
      deadlineDate: deadlineDate || '2026-11-08',
      isUrgentToday: true,
      totalPrice: Number(totalPrice) || 0,
      paidAmount: Number(paidAmount) || 0,
      currency: 'COP',
      platform: platform.trim() || 'Aula Virtual',
      platformUser: platformUser.trim() || 'estudiante',
      platformPass: platformPass.trim() || '123456',
      status: 'in_progress',
      deliverables: deliverablesToSave,
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200/80 shadow-2xl p-4 sm:p-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Nuevo Registro
            </span>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950">
              Crear Trabajo Universitario
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Cliente */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Cliente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del estudiante"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
              <input
                type="tel"
                placeholder="WhatsApp (ej. 57300...)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-36 px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>
            {/* Clientes existentes rápidos */}
            {clients.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-zinc-400 shrink-0">Recientes:</span>
                {clients.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClientName(c.name);
                      setClientPhone(c.phone);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors shrink-0"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Materia & Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Materia
              </label>
              <input
                type="text"
                placeholder="ej. Inglés Connect, Cálculo"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Título del Trabajo
              </label>
              <input
                type="text"
                placeholder="ej. Corte 2 - Actividades"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Plataforma & Credenciales */}
          <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-2.5">
            <div>
              <label className="block font-semibold text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                Plataforma Universitaria
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
                {['McGraw-Hill Connect', 'Moodle', 'Teams / Aula', 'Blackboard', 'Canvas', 'Google Classroom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                      platform === p
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-white border border-zinc-200/80 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Usuario / Correo
                </label>
                <input
                  type="text"
                  placeholder="ej. carlos.m@u.edu.co"
                  value={platformUser}
                  onChange={(e) => setPlatformUser(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200/80 bg-white font-mono text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Contraseña
                </label>
                <input
                  type="text"
                  placeholder="ej. Clave2024!"
                  value={platformPass}
                  onChange={(e) => setPlatformPass(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200/80 bg-white font-mono text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tarifa & Fecha Límite */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Tarifa Total (COP)
              </label>
              <input
                type="number"
                step="5000"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Abono Inicial (COP)
              </label>
              <input
                type="number"
                step="5000"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Hora Límite
              </label>
              <input
                type="text"
                placeholder="11:59 PM"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 text-xs"
              />
            </div>
          </div>

          {/* Generador Masivo de Entregables (Presets Universitarios) */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-zinc-800 text-xs">
                Entregables Universitarios ({deliverables.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={applyPresetConnect}
                  className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-semibold transition-colors flex items-center gap-1"
                  title="Autogenera 8 Assignments + 8 Tests + 1 Progress Test"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Preset Connect (17)</span>
                </button>

                <button
                  type="button"
                  onClick={applyPresetCorte}
                  className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-medium transition-colors"
                >
                  Corte (3)
                </button>

                <button
                  type="button"
                  onClick={applyPresetTaller}
                  className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-medium transition-colors"
                >
                  Taller (1)
                </button>
              </div>
            </div>

            {/* Lista de Entregables */}
            {deliverables.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1 mb-2">
                {deliverables.map((d, index) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-zinc-50 border border-zinc-200/60 text-[11px]"
                  >
                    <span className="truncate text-zinc-800">
                      {index + 1}. {d.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(d.id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input para agregar tarea manual */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Agregar entrega manual (ej. Tarea 1)..."
                value={newDeliverableTitle}
                onChange={(e) => setNewDeliverableTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addManualDeliverable();
                  }
                }}
                className="flex-1 px-2.5 py-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 text-xs focus:bg-white focus:outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                onClick={addManualDeliverable}
                className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear y Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
