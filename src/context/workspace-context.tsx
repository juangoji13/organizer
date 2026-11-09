'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { WorkspaceMode, ActiveNavTab, ClientJob, ClientContact, PersonalGoal, ToastNotification } from '@/types/organizer';
import { createClient } from '@/lib/supabase/client';
import { PersonalItemType } from '@/types/database.types';

export type AppTheme = 'light' | 'dark';

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  jobs: ClientJob[];
  toggleDeliverable: (jobId: string, deliverableId: string) => void;
  markJobDelivered: (jobId: string) => void;
  markJobPaid: (jobId: string) => void;
  updateJob: (jobId: string, partialData: Partial<ClientJob>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  registerPartialPayment: (jobId: string, amount: number) => Promise<void>;
  createJob: (newJob: Omit<ClientJob, 'id'>) => Promise<void>;
  createPersonalItem: (newItem: Omit<PersonalGoal, 'id'>) => Promise<void>;
  updatePersonalItem: (goalId: string, updates: Partial<PersonalGoal>) => Promise<void>;
  adjustSavings: (goalId: string, amountDelta: number) => Promise<void>;
  deletePersonalItem: (goalId: string) => Promise<void>;
  createClientDirect: (client: { name: string; phone: string }) => Promise<void>;
  clients: ClientContact[];
  personalGoals: PersonalGoal[];
  toggleGoal: (goalId: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  refetchData: () => Promise<void>;
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => string;
  dismissToast: (id: string) => void;
  isSplashActive: boolean;
  triggerSplash: () => void;
  onSplashFinish: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Clean Production Datasets (Ready for Real User Operation)
const INITIAL_JOBS: ClientJob[] = [];
const INITIAL_RAW_CLIENTS: Array<{ id: string; name: string; phone: string }> = [];
const INITIAL_PERSONAL: PersonalGoal[] = [];

function formatTimeString(isoString: string): string {
  try {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return '11:59 PM';
  }
}

/**
 * Computes client metrics dynamically by mapping actual jobs.
 * Eliminates all hardcoded values (totalJobs, totalPaid, totalPending).
 */
export function computeClientMetrics(
  rawClient: { id: string; name: string; phone: string },
  jobsList: ClientJob[],
  todayStr: string = '2026-11-08'
): ClientContact {
  const clientPhoneClean = (rawClient.phone || '').replace(/\D/g, '');
  const clientJobs = jobsList.filter((j) => {
    const jPhoneClean = (j.clientPhone || '').replace(/\D/g, '');
    const samePhone = clientPhoneClean && jPhoneClean && clientPhoneClean === jPhoneClean;
    const sameName = j.clientName?.toLowerCase().trim() === rawClient.name?.toLowerCase().trim();
    return Boolean(samePhone || sameName);
  });

  const totalJobs = clientJobs.length;
  const totalBilled = clientJobs.reduce((sum, j) => sum + (j.totalPrice || 0), 0);
  const totalPaid = clientJobs.reduce((sum, j) => sum + (j.paidAmount || 0), 0);
  const totalPending = Math.max(0, totalBilled - totalPaid);

  let lastActive = 'Sin encargos';
  if (clientJobs.length > 0) {
    const sortedDates = clientJobs
      .map((j) => j.deadlineDate)
      .filter(Boolean)
      .sort()
      .reverse();
    if (sortedDates.length > 0) {
      const latest = sortedDates[0];
      if (latest === todayStr) {
        lastActive = 'Hoy';
      } else {
        const diff = Math.floor(
          (new Date(todayStr).getTime() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) lastActive = 'Ayer';
        else if (diff > 1) lastActive = `Hace ${diff} días`;
        else if (diff === 0) lastActive = 'Hoy';
        else lastActive = 'Próximo';
      }
    }
  }

  return {
    id: rawClient.id,
    name: rawClient.name,
    phone: rawClient.phone,
    totalJobs,
    totalPaid,
    totalPending,
    lastActive,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorkspaceMode>('clients');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('today');
  const [jobs, setJobs] = useState<ClientJob[]>(INITIAL_JOBS);
  const [rawClients, setRawClients] = useState<Array<{ id: string; name: string; phone: string }>>(INITIAL_RAW_CLIENTS);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>(INITIAL_PERSONAL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [todayDateStr, setTodayDateStr] = useState<string>('2026-11-08');
  const [isSplashActive, setIsSplashActive] = useState(false);

  const triggerSplash = useCallback(() => {
    setIsSplashActive(true);
  }, []);

  const onSplashFinish = useCallback(() => {
    setIsSplashActive(false);
  }, []);

  // Load saved theme on mount or check system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('organizer_theme') as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          setThemeState('dark');
          document.documentElement.classList.add('dark');
        }
      }
    } catch {
      // LocalStorage access restricted in private browsing
    }
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('organizer_theme', newTheme);
    } catch {
      // LocalStorage access fallback
    }
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    try {
      setTodayDateStr(new Date().toISOString().split('T')[0]);
    } catch {
      // fallback
    }
  }, []);

  // Toast Management
  const showToast = useCallback((toastData: Omit<ToastNotification, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const newToast: ToastNotification = {
      id,
      durationMs: toastData.durationMs ?? 5500,
      ...toastData,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute clients dynamically from raw records + actual jobs
  const clients: ClientContact[] = useMemo(() => {
    const map = new Map<string, { id: string; name: string; phone: string }>();
    for (const c of rawClients) {
      const key = c.name.toLowerCase().trim();
      if (!map.has(key)) map.set(key, c);
    }
    for (const j of jobs) {
      const key = (j.clientName || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, {
          id: 'c-job-' + key.replace(/\s+/g, '-'),
          name: j.clientName,
          phone: j.clientPhone || '',
        });
      }
    }
    return Array.from(map.values()).map((c) => computeClientMetrics(c, jobs, todayDateStr));
  }, [rawClients, jobs, todayDateStr]);

  // Fetch from Live Supabase Database
  const refetchData = useCallback(async () => {
    try {
      const supabase = createClient();

      // 1. Fetch Jobs with Clients and Deliverables
      const { data: dbJobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          subject,
          platform,
          username,
          password,
          rate,
          amount_paid,
          due_date,
          status,
          notes,
          clients (
            id,
            name,
            phone,
            university
          ),
          deliverables (
            id,
            title,
            category,
            is_completed,
            sort_order
          )
        `)
        .order('due_date', { ascending: true });

      if (!jobsError && dbJobs) {
        const mappedJobs: ClientJob[] = dbJobs.map((item: any) => {
          const client = item.clients || {};
          const dueDateStr = item.due_date || '';
          const dateOnly = dueDateStr.split('T')[0] || '';
          const todayStr = new Date().toISOString().split('T')[0];
          const isUrgent = dateOnly === todayStr || dueDateStr.includes('2026-11-08');

          const deliverablesList = (item.deliverables || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((d: any) => ({
              id: d.id,
              title: d.title,
              isCompleted: Boolean(d.is_completed),
              type: (d.category?.toLowerCase() || 'assignment') as any,
            }));

          return {
            id: item.id,
            clientName: client.name || 'Cliente',
            clientPhone: client.phone || '',
            subject: item.subject,
            title: item.title || item.subject,
            deadlineTime: formatTimeString(item.due_date),
            deadlineDate: dateOnly,
            isUrgentToday: isUrgent,
            totalPrice: Number(item.rate) || 0,
            paidAmount: Number(item.amount_paid) || 0,
            currency: 'COP',
            platform: item.platform,
            platformUser: item.username,
            platformPass: item.password,
            status: item.status as any,
            deliverables: deliverablesList,
          };
        });

        setJobs(mappedJobs);
      }

      // 2. Fetch Clients (Metrics computed dynamically)
      const { data: dbClients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, phone');

      if (!clientsError && dbClients) {
        setRawClients(
          dbClients.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || '',
          }))
        );
      }

      // 3. Fetch Personal Items
      const { data: dbPersonal, error: personalError } = await supabase
        .from('personal_items')
        .select('*');

      if (!personalError && dbPersonal) {
        const mappedPersonal: PersonalGoal[] = dbPersonal.map((p: any) => {
          let category: 'study' | 'dev' | 'savings' | 'note' = 'study';
          if (p.type === 'savings') category = 'savings';
          else if (p.type === 'programming' || p.type === 'dev') category = 'dev';
          else if (p.type === 'note') category = 'note';

          return {
            id: p.id,
            category,
            title: p.title,
            description: p.description || undefined,
            isDone: p.status === 'completed' || (p.target > 0 && p.progress >= p.target),
            currentAmount: p.type === 'savings' ? p.progress : undefined,
            targetAmount: p.type === 'savings' ? p.target : undefined,
          };
        });
        setPersonalGoals(mappedPersonal);
      }
    } catch (err) {
      console.warn('Using offline cache for workspace:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Create Job with Supabase Sync
  const createJob = async (newJobData: Omit<ClientJob, 'id'>) => {
    const tempId = 'temp-' + Date.now();
    const optimisticJob: ClientJob = {
      ...newJobData,
      id: tempId,
    };
    setJobs((prev) => [optimisticJob, ...prev]);

    showToast({
      message: `Trabajo "${newJobData.title}" creado con éxito`,
      type: 'success',
      durationMs: 3500,
    });

    try {
      const supabase = createClient();
      let clientId: string | null = null;
      const { data: existingClients } = await supabase
        .from('clients')
        .select('id')
        .ilike('name', newJobData.clientName)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            name: newJobData.clientName,
            phone: newJobData.clientPhone,
          })
          .select('id')
          .single();
        if (newClient) clientId = newClient.id;
      }

      const validClientId = clientId || 'c0000000-0000-0000-0000-000000000001';

      const dueDate = newJobData.deadlineDate 
        ? `${newJobData.deadlineDate}T23:59:00+00:00` 
        : new Date().toISOString();

      const { data: insertedJob } = await supabase
        .from('jobs')
        .insert({
          client_id: validClientId,
          title: newJobData.title,
          subject: newJobData.subject,
          platform: newJobData.platform,
          username: newJobData.platformUser,
          password: newJobData.platformPass,
          rate: newJobData.totalPrice,
          amount_paid: newJobData.paidAmount,
          due_date: dueDate,
          status: newJobData.status || 'in_progress',
        })
        .select('id')
        .single();

      if (insertedJob) {
        if (newJobData.deliverables.length > 0) {
          const deliverablesToInsert = newJobData.deliverables.map((d, index) => ({
            job_id: insertedJob.id,
            title: d.title,
            category: d.type === 'test' ? 'Test' : 'Assignment',
            is_completed: d.isCompleted,
            sort_order: index + 1,
          }));

          await supabase.from('deliverables').insert(deliverablesToInsert);
        }

        await refetchData();
      }
    } catch (e) {
      console.warn('Create job sync failed:', e);
    }
  };

  // Update Existing Job with Supabase Sync
  const updateJob = async (jobId: string, partialData: Partial<ClientJob>) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;
        const updated = { ...job, ...partialData };
        if (partialData.deadlineDate && partialData.deadlineDate !== job.deadlineDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          updated.isUrgentToday = partialData.deadlineDate === todayStr;
        }
        return updated;
      })
    );

    try {
      const supabase = createClient();
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };
      if (partialData.title !== undefined) updatePayload.title = partialData.title;
      if (partialData.subject !== undefined) updatePayload.subject = partialData.subject;
      if (partialData.platform !== undefined) updatePayload.platform = partialData.platform;
      if (partialData.platformUser !== undefined) updatePayload.username = partialData.platformUser;
      if (partialData.platformPass !== undefined) updatePayload.password = partialData.platformPass;
      if (partialData.totalPrice !== undefined) updatePayload.rate = partialData.totalPrice;
      if (partialData.paidAmount !== undefined) updatePayload.amount_paid = partialData.paidAmount;
      if (partialData.status !== undefined) updatePayload.status = partialData.status;
      if (partialData.deadlineDate !== undefined) {
        updatePayload.due_date = `${partialData.deadlineDate}T23:59:00+00:00`;
      }

      // If client name or phone was edited
      if (partialData.clientName) {
        const { data: foundClients } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', partialData.clientName)
          .limit(1);

        if (foundClients && foundClients.length > 0) {
          updatePayload.client_id = foundClients[0].id;
          if (partialData.clientPhone) {
            await supabase
              .from('clients')
              .update({ phone: partialData.clientPhone })
              .eq('id', foundClients[0].id);
          }
        } else {
          const { data: newC } = await supabase
            .from('clients')
            .insert({
              name: partialData.clientName,
              phone: partialData.clientPhone || '',
            })
            .select('id')
            .single();
          if (newC) updatePayload.client_id = newC.id;
        }
      }

      await supabase.from('jobs').update(updatePayload).eq('id', jobId);
    } catch (e) {
      console.warn('Update job sync failed:', e);
    }
  };

  // Delete Job and Deliverables
  const deleteJob = async (jobId: string) => {
    let deletedTitle = '';
    setJobs((prevJobs) => {
      const target = prevJobs.find((j) => j.id === jobId);
      if (target) deletedTitle = target.title;
      return prevJobs.filter((job) => job.id !== jobId);
    });

    showToast({
      message: `Trabajo eliminado${deletedTitle ? `: "${deletedTitle}"` : ''}`,
      type: 'info',
      durationMs: 3500,
    });

    try {
      const supabase = createClient();
      await supabase.from('deliverables').delete().eq('job_id', jobId);
      await supabase.from('jobs').delete().eq('id', jobId);
    } catch (e) {
      console.warn('Delete job sync failed:', e);
    }
  };

  // Register Partial Payment
  const registerPartialPayment = async (jobId: string, amount: number) => {
    const currentJob = jobs.find((j) => j.id === jobId);
    if (!currentJob) return;

    const prevPaid = currentJob.paidAmount;
    const prevStatus = currentJob.status;
    const finalPaid = Math.min(currentJob.totalPrice, (currentJob.paidAmount || 0) + amount);
    const isComplete = finalPaid >= currentJob.totalPrice;
    const nextStatus = isComplete ? 'paid' : currentJob.status;

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              paidAmount: finalPaid,
              status: nextStatus,
            }
          : job
      )
    );

    // Toast with Undo Action
    showToast({
      message: `Abono de $${amount.toLocaleString()} COP registrado para "${currentJob.title}"`,
      type: 'success',
      undoLabel: 'Deshacer',
      onUndo: async () => {
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === jobId ? { ...j, paidAmount: prevPaid, status: prevStatus } : j
          )
        );
        try {
          const supabase = createClient();
          await supabase
            .from('jobs')
            .update({
              amount_paid: prevPaid,
              status: prevStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId);
        } catch (e) {
          console.warn('Undo payment sync failed:', e);
        }
        showToast({
          message: 'Abono deshecho correctamente',
          type: 'info',
          durationMs: 3000,
        });
      },
    });

    try {
      const supabase = createClient();
      const updatePayload: any = {
        amount_paid: finalPaid,
        updated_at: new Date().toISOString(),
      };
      if (isComplete) {
        updatePayload.status = 'paid';
      }
      await supabase.from('jobs').update(updatePayload).eq('id', jobId);
    } catch (e) {
      console.warn('Register partial payment sync failed:', e);
    }
  };

  // Direct Client Creation
  const createClientDirect = async (client: { name: string; phone: string }) => {
    const tempId = 'temp-c-' + Date.now();
    setRawClients((prev) => [
      { id: tempId, name: client.name.trim(), phone: client.phone.trim() },
      ...prev,
    ]);

    showToast({
      message: `Cliente "${client.name}" registrado correctamente`,
      type: 'success',
      durationMs: 3500,
    });

    try {
      const supabase = createClient();
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          name: client.name.trim(),
          phone: client.phone.trim(),
        })
        .select('id, name, phone')
        .single();

      if (newClient) {
        setRawClients((prev) =>
          prev.map((c) =>
            c.id === tempId ? { id: newClient.id, name: newClient.name, phone: newClient.phone || '' } : c
          )
        );
      }
    } catch (e) {
      console.warn('Create direct client sync failed:', e);
    }
  };

  // Create Personal Item with Supabase Sync
  const createPersonalItem = async (newItem: Omit<PersonalGoal, 'id'>) => {
    const tempId = 'temp-p-' + Date.now();
    const optimisticItem: PersonalGoal = {
      ...newItem,
      id: tempId,
    };
    setPersonalGoals((prev) => [optimisticItem, ...prev]);

    showToast({
      message: `Elemento "${newItem.title}" guardado`,
      type: 'success',
      durationMs: 3500,
    });

    try {
      const supabase = createClient();
      let dbType: PersonalItemType = 'study_goal';
      if (newItem.category === 'savings') dbType = 'savings';
      else if (newItem.category === 'dev') dbType = 'programming';
      else if (newItem.category === 'note') dbType = 'note';

      await supabase.from('personal_items').insert({
        type: dbType,
        title: newItem.title,
        description: newItem.description || null,
        progress: newItem.currentAmount || 0,
        target: newItem.targetAmount || 100,
        status: newItem.isDone ? 'completed' : 'active',
      });

      await refetchData();
    } catch (e) {
      console.warn('Create personal item sync failed:', e);
    }
  };

  // Adjust Savings (+ or - amountDelta)
  const adjustSavings = async (goalId: string, amountDelta: number) => {
    let newProgress = 0;
    let targetGoalTitle = '';

    setPersonalGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        targetGoalTitle = g.title;
        const current = g.currentAmount || 0;
        newProgress = Math.max(0, current + amountDelta);
        const isDone = g.targetAmount ? newProgress >= g.targetAmount : g.isDone;
        return {
          ...g,
          currentAmount: newProgress,
          isDone,
        };
      })
    );

    const isDeposit = amountDelta >= 0;
    showToast({
      message: isDeposit 
        ? `Abono de +$${amountDelta.toLocaleString()} COP a "${targetGoalTitle}"`
        : `Retiro de -$${Math.abs(amountDelta).toLocaleString()} COP de "${targetGoalTitle}"`,
      type: 'success',
      durationMs: 3500,
    });

    try {
      const supabase = createClient();
      const targetItem = personalGoals.find((g) => g.id === goalId);
      const isDone = targetItem?.targetAmount ? newProgress >= targetItem.targetAmount : false;
      await supabase
        .from('personal_items')
        .update({
          progress: newProgress,
          status: isDone ? 'completed' : 'active',
        })
        .eq('id', goalId);
    } catch (e) {
      console.warn('Adjust savings sync failed:', e);
    }
  };

  // Delete Personal Item
  const deletePersonalItem = async (goalId: string) => {
    let deletedTitle = '';
    setPersonalGoals((prev) => {
      const item = prev.find((g) => g.id === goalId);
      if (item) deletedTitle = item.title;
      return prev.filter((g) => g.id !== goalId);
    });

    showToast({
      message: `Elemento eliminado${deletedTitle ? `: "${deletedTitle}"` : ''}`,
      type: 'info',
      durationMs: 3000,
    });

    try {
      const supabase = createClient();
      await supabase.from('personal_items').delete().eq('id', goalId);
    } catch (e) {
      console.warn('Delete personal item sync failed:', e);
    }
  };

  // Update Personal Item (e.g. Note edit or Goal edit)
  const updatePersonalItem = async (goalId: string, updates: Partial<PersonalGoal>) => {
    setPersonalGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );

    showToast({
      message: 'Cambios guardados',
      type: 'success',
      durationMs: 2500,
    });

    try {
      const supabase = createClient();
      const dbPayload: any = {};
      if (updates.title !== undefined) dbPayload.title = updates.title;
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.currentAmount !== undefined) dbPayload.progress = updates.currentAmount;
      if (updates.targetAmount !== undefined) dbPayload.target = updates.targetAmount;
      if (updates.isDone !== undefined) dbPayload.status = updates.isDone ? 'completed' : 'active';
      await supabase.from('personal_items').update(dbPayload).eq('id', goalId);
    } catch (e) {
      console.warn('Update personal item sync failed:', e);
    }
  };

  // Deliverables Toggle
  const toggleDeliverable = async (jobId: string, deliverableId: string) => {
    let newCompletedState = false;

    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          deliverables: job.deliverables.map((item) => {
            if (item.id === deliverableId) {
              newCompletedState = !item.isCompleted;
              return { ...item, isCompleted: newCompletedState };
            }
            return item;
          }),
        };
      })
    );

    try {
      const supabase = createClient();
      await supabase
        .from('deliverables')
        .update({ is_completed: newCompletedState })
        .eq('id', deliverableId);
    } catch (e) {
      console.warn('Sync deliverable failed:', e);
    }
  };

  // Mark Job Delivered with Undo Toast
  const markJobDelivered = async (jobId: string) => {
    const currentJob = jobs.find((j) => j.id === jobId);
    if (!currentJob) return;

    const previousStatus = currentJob.status;

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: 'delivered' } : job
      )
    );

    showToast({
      message: `"${currentJob.title}" marcado como entregado`,
      type: 'success',
      undoLabel: 'Deshacer',
      onUndo: async () => {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, status: previousStatus } : job
          )
        );
        try {
          const supabase = createClient();
          await supabase
            .from('jobs')
            .update({ status: previousStatus, updated_at: new Date().toISOString() })
            .eq('id', jobId);
        } catch (err) {
          console.warn('Undo deliver failed:', err);
        }
        showToast({
          message: `Entrega de "${currentJob.title}" deshecha`,
          type: 'info',
          durationMs: 3000,
        });
      },
    });

    try {
      const supabase = createClient();
      await supabase
        .from('jobs')
        .update({ status: 'delivered', updated_at: new Date().toISOString() })
        .eq('id', jobId);
    } catch (e) {
      console.warn('Sync status delivered failed:', e);
    }
  };

  // Mark Job Paid with Undo Toast
  const markJobPaid = async (jobId: string) => {
    const currentJob = jobs.find((j) => j.id === jobId);
    if (!currentJob) return;

    const previousPaidAmount = currentJob.paidAmount;
    const previousStatus = currentJob.status;

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, paidAmount: job.totalPrice, status: 'paid' }
          : job
      )
    );

    showToast({
      message: `"${currentJob.title}" marcado como pagado ($${currentJob.totalPrice.toLocaleString()} COP)`,
      type: 'success',
      undoLabel: 'Deshacer',
      onUndo: async () => {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId
              ? { ...job, paidAmount: previousPaidAmount, status: previousStatus }
              : job
          )
        );
        try {
          const supabase = createClient();
          await supabase
            .from('jobs')
            .update({
              amount_paid: previousPaidAmount,
              status: previousStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId);
        } catch (err) {
          console.warn('Undo paid failed:', err);
        }
        showToast({
          message: `Pago de "${currentJob.title}" deshecho`,
          type: 'info',
          durationMs: 3000,
        });
      },
    });

    try {
      const supabase = createClient();
      await supabase
        .from('jobs')
        .update({
          amount_paid: currentJob.totalPrice,
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (e) {
      console.warn('Sync paid failed:', e);
    }
  };

  // Toggle Goal (Personal)
  const toggleGoal = async (goalId: string) => {
    let newStatus = 'active';
    setPersonalGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const next = !g.isDone;
          newStatus = next ? 'completed' : 'active';
          return { ...g, isDone: next };
        }
        return g;
      })
    );

    try {
      const supabase = createClient();
      await supabase
        .from('personal_items')
        .update({ status: newStatus })
        .eq('id', goalId);
    } catch (e) {
      console.warn('Sync goal failed:', e);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        theme,
        setTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        jobs,
        toggleDeliverable,
        markJobDelivered,
        markJobPaid,
        updateJob,
        deleteJob,
        registerPartialPayment,
        createJob,
        createPersonalItem,
        updatePersonalItem,
        adjustSavings,
        deletePersonalItem,
        createClientDirect,
        clients,
        personalGoals,
        toggleGoal,
        isSidebarOpen,
        setIsSidebarOpen,
        isLoading,
        refetchData,
        toasts,
        showToast,
        dismissToast,
        isSplashActive,
        triggerSplash,
        onSplashFinish,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
