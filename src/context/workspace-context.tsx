'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WorkspaceMode, ActiveNavTab, ClientJob, ClientContact, PersonalGoal } from '@/types/organizer';
import { createClient } from '@/lib/supabase/client';
import { PersonalItemType } from '@/types/database.types';

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  jobs: ClientJob[];
  toggleDeliverable: (jobId: string, deliverableId: string) => void;
  markJobDelivered: (jobId: string) => void;
  markJobPaid: (jobId: string) => void;
  createJob: (newJob: Omit<ClientJob, 'id'>) => Promise<void>;
  createPersonalItem: (newItem: Omit<PersonalGoal, 'id'>) => Promise<void>;
  clients: ClientContact[];
  personalGoals: PersonalGoal[];
  toggleGoal: (goalId: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  refetchData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const INITIAL_JOBS: ClientJob[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    clientName: 'Carlos Mendoza',
    clientPhone: '573001234567',
    subject: 'Inglés Connect',
    title: 'Corte 2 - Actividades y Tests',
    deadlineTime: '11:59 PM',
    deadlineDate: '2026-11-08',
    isUrgentToday: true,
    totalPrice: 60000,
    paidAmount: 30000,
    currency: 'COP',
    platform: 'McGraw-Hill Connect',
    platformUser: 'carlos.m@uninorte.edu.co',
    platformPass: 'Connect2024!',
    status: 'in_progress',
    deliverables: [
      { id: '19a3b302-aa09-4dc3-b6e6-1ce865a0e912', title: 'Assignment 1 (Vocabulary Unit 4)', isCompleted: true },
      { id: 'd1c63225-c6f8-4f5a-8888-7250dca3d4ff', title: 'Assignment 2 (Grammar Practice)', isCompleted: true },
      { id: '4ff1968f-5587-46a7-876e-9fe68e23b611', title: 'Assignment 3 (Reading Comprehension)', isCompleted: true },
      { id: '0a694af5-8306-40b7-981e-261edddda304', title: 'Assignment 4 (Listening Section)', isCompleted: true },
      { id: '51664843-5360-4f90-9fcf-ec1d4d2c8275', title: 'Assignment 5 (Speaking Prompt)', isCompleted: false },
      { id: '0e9f72d1-0426-42b7-bdc4-f37ed1b0f82b', title: 'Test Unit 4', isCompleted: false },
      { id: '38e888b1-c956-45e7-8528-b73eeaa52fa7', title: 'Progress Check Test', isCompleted: false },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    clientName: 'Andrés Felipe',
    clientPhone: '573109876543',
    subject: 'Cálculo Integral',
    title: 'Taller 3: Integración por Partes',
    deadlineTime: '6:00 PM',
    deadlineDate: '2026-11-08',
    isUrgentToday: true,
    totalPrice: 45000,
    paidAmount: 45000,
    currency: 'COP',
    platform: 'Teams / Aula Virtual',
    platformUser: 'afelipe_9',
    platformPass: 'UdeA2024*',
    status: 'in_progress',
    deliverables: [
      { id: 'd-21', title: 'Ejercicios 1 a 5 (Método tabular)', isCompleted: true },
      { id: 'd-22', title: 'Ejercicios 6 a 10 (Funciones trigonométricas)', isCompleted: true },
      { id: 'd-23', title: 'Problema de aplicación física', isCompleted: false },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    clientName: 'Mariana Silva',
    clientPhone: '573155554433',
    subject: 'Microeconomía',
    title: 'Taller 2: Equilibrio de Mercado',
    deadlineTime: '4:00 PM',
    deadlineDate: '2026-11-12',
    isUrgentToday: false,
    totalPrice: 50000,
    paidAmount: 25000,
    currency: 'COP',
    platform: 'Moodle',
    platformUser: 'msilva',
    platformPass: 'Eco2024#',
    status: 'in_progress',
    deliverables: [
      { id: 'd-31', title: 'Curvas de oferta y demanda', isCompleted: true },
      { id: 'd-32', title: 'Elasticidad precio de la demanda', isCompleted: false },
      { id: 'd-33', title: 'Monopolio natural y fijación de precios', isCompleted: false },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    clientName: 'Camilo Torres',
    clientPhone: '573009988776',
    subject: 'Física Mecánica',
    title: 'Informe de Laboratorio 4',
    deadlineTime: '10:00 PM',
    deadlineDate: '2026-11-13',
    isUrgentToday: false,
    totalPrice: 40000,
    paidAmount: 40000,
    currency: 'COP',
    platform: 'Google Classroom',
    platformUser: 'c_torres',
    platformPass: 'Mecanica99',
    status: 'in_progress',
    deliverables: [
      { id: 'd-41', title: 'Tablas de datos experimentales', isCompleted: true },
      { id: 'd-42', title: 'Gráficas en Excel y cálculo de errores', isCompleted: true },
      { id: 'd-43', title: 'Análisis de resultados', isCompleted: true },
      { id: 'd-44', title: 'Conclusiones y bibliografía IEEE', isCompleted: false },
    ],
  },
];

const INITIAL_CLIENTS: ClientContact[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Carlos Mendoza',
    phone: '573001234567',
    totalJobs: 4,
    totalPaid: 180000,
    totalPending: 30000,
    lastActive: 'Hoy',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Mariana Silva',
    phone: '573155554433',
    totalJobs: 3,
    totalPaid: 95000,
    totalPending: 25000,
    lastActive: 'Ayer',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'David R.',
    phone: '573017778899',
    totalJobs: 2,
    totalPaid: 60000,
    totalPending: 15000,
    lastActive: 'Hace 4 días',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Andrés Felipe',
    phone: '573109876543',
    totalJobs: 5,
    totalPaid: 210000,
    totalPending: 0,
    lastActive: 'Hoy',
  },
];

const INITIAL_PERSONAL: PersonalGoal[] = [
  {
    id: 'fd873e60-1d9c-436a-a3a9-9e7a22df1452',
    category: 'study',
    title: 'Preparación Examen Final de Algoritmos',
    description: 'Repasar árboles binarios y programación dinámica',
    isDone: false,
  },
  {
    id: 'pg-2',
    category: 'study',
    title: 'Entrega Proyecto de Bases de Datos',
    description: 'Normalización 3FN y diagramas relacionales en Supabase',
    isDone: true,
  },
  {
    id: 'pg-3',
    category: 'dev',
    title: 'Refactorizar API de facturación personal',
    description: 'Migrar endpoints a Next.js Server Actions y Turbopack',
    isDone: false,
  },
  {
    id: 'pg-4',
    category: 'savings',
    title: 'Fondo de Ahorro: Nueva Laptop M3',
    currentAmount: 1800000,
    targetAmount: 4500000,
  },
  {
    id: 'pg-5',
    category: 'savings',
    title: 'Colchón de Emergencias Semestral',
    currentAmount: 850000,
    targetAmount: 1500000,
  },
];

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

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorkspaceMode>('clients');
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('today');
  const [jobs, setJobs] = useState<ClientJob[]>(INITIAL_JOBS);
  const [clients, setClients] = useState<ClientContact[]>(INITIAL_CLIENTS);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>(INITIAL_PERSONAL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      if (!jobsError && dbJobs && dbJobs.length > 0) {
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

      // 2. Fetch Clients
      const { data: dbClients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (!clientsError && dbClients && dbClients.length > 0) {
        const mappedClients: ClientContact[] = dbClients.map((c: any) => {
          return {
            id: c.id,
            name: c.name,
            phone: c.phone || '',
            totalJobs: 3,
            totalPaid: 95000,
            totalPending: 25000,
            lastActive: 'Hoy',
          };
        });
        setClients(mappedClients);
      }

      // 3. Fetch Personal Items
      const { data: dbPersonal, error: personalError } = await supabase
        .from('personal_items')
        .select('*');

      if (!personalError && dbPersonal && dbPersonal.length > 0) {
        const mappedPersonal: PersonalGoal[] = dbPersonal.map((p: any) => {
          let category: 'study' | 'dev' | 'savings' = 'study';
          if (p.type === 'savings') category = 'savings';
          else if (p.type === 'programming' || p.type === 'dev') category = 'dev';

          return {
            id: p.id,
            category,
            title: p.title,
            description: p.description || undefined,
            isDone: p.status === 'completed' || p.progress >= p.target,
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

  // Create Personal Item with Supabase Sync
  const createPersonalItem = async (newItem: Omit<PersonalGoal, 'id'>) => {
    const tempId = 'temp-p-' + Date.now();
    const optimisticItem: PersonalGoal = {
      ...newItem,
      id: tempId,
    };
    setPersonalGoals((prev) => [optimisticItem, ...prev]);

    try {
      const supabase = createClient();
      let dbType: PersonalItemType = 'study_goal';
      if (newItem.category === 'savings') dbType = 'savings';
      else if (newItem.category === 'dev') dbType = 'programming';

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

  // Mutations with optimistic UI and live sync to Supabase
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

  const markJobDelivered = async (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: 'delivered' } : job
      )
    );

    try {
      const supabase = createClient();
      await supabase
        .from('jobs')
        .update({ status: 'delivered' })
        .eq('id', jobId);
    } catch (e) {
      console.warn('Sync status failed:', e);
    }
  };

  const markJobPaid = async (jobId: string) => {
    let price = 0;
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          price = job.totalPrice;
          return { ...job, paidAmount: job.totalPrice, status: 'paid' };
        }
        return job;
      })
    );

    try {
      const supabase = createClient();
      await supabase
        .from('jobs')
        .update({ amount_paid: price, status: 'paid' })
        .eq('id', jobId);
    } catch (e) {
      console.warn('Sync paid failed:', e);
    }
  };

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
        activeTab,
        setActiveTab,
        jobs,
        toggleDeliverable,
        markJobDelivered,
        markJobPaid,
        createJob,
        createPersonalItem,
        clients,
        personalGoals,
        toggleGoal,
        isSidebarOpen,
        setIsSidebarOpen,
        isLoading,
        refetchData,
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
