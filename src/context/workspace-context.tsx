'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WorkspaceMode, ActiveNavTab, ClientJob, ClientContact, PersonalGoal } from '@/types/organizer';

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  jobs: ClientJob[];
  toggleDeliverable: (jobId: string, deliverableId: string) => void;
  markJobDelivered: (jobId: string) => void;
  markJobPaid: (jobId: string) => void;
  clients: ClientContact[];
  personalGoals: PersonalGoal[];
  toggleGoal: (goalId: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const INITIAL_JOBS: ClientJob[] = [
  {
    id: 'job-1',
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
      { id: 'd-1', title: 'Assignment 1 (Vocabulary Unit 4)', isCompleted: true },
      { id: 'd-2', title: 'Assignment 2 (Grammar Practice)', isCompleted: true },
      { id: 'd-3', title: 'Assignment 3 (Reading Comprehension)', isCompleted: true },
      { id: 'd-4', title: 'Assignment 4 (Listening Section)', isCompleted: true },
      { id: 'd-5', title: 'Assignment 5 (Speaking Prompt)', isCompleted: false },
      { id: 'd-6', title: 'Test Unit 4', isCompleted: false },
      { id: 'd-7', title: 'Progress Check Test', isCompleted: false },
    ],
  },
  {
    id: 'job-2',
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
    id: 'job-3',
    clientName: 'Mariana Silva',
    clientPhone: '573155554433',
    subject: 'Microeconomía',
    title: 'Taller de Equilibrio de Mercado y Monopolio',
    deadlineTime: '4:00 PM',
    deadlineDate: '2026-11-11',
    isUrgentToday: false,
    totalPrice: 50000,
    paidAmount: 25000,
    currency: 'COP',
    platform: 'Moodle Institucional',
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
    id: 'job-4',
    clientName: 'Camilo Torres',
    clientPhone: '573204443322',
    subject: 'Física Mecánica',
    title: 'Informe de Laboratorio: Conservación de Energía',
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
    id: 'cli-1',
    name: 'Carlos Mendoza',
    phone: '573001234567',
    totalJobs: 4,
    totalPaid: 180000,
    totalPending: 30000,
    lastActive: 'Hoy',
  },
  {
    id: 'cli-2',
    name: 'Mariana Silva',
    phone: '573155554433',
    totalJobs: 3,
    totalPaid: 95000,
    totalPending: 25000,
    lastActive: 'Ayer',
  },
  {
    id: 'cli-3',
    name: 'David R.',
    phone: '573017778899',
    totalJobs: 2,
    totalPaid: 60000,
    totalPending: 15000,
    lastActive: 'Hace 4 días',
  },
  {
    id: 'cli-4',
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
    id: 'pg-1',
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

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorkspaceMode>('clients');
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('today');
  const [jobs, setJobs] = useState<ClientJob[]>(INITIAL_JOBS);
  const [clients] = useState<ClientContact[]>(INITIAL_CLIENTS);
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>(INITIAL_PERSONAL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDeliverable = (jobId: string, deliverableId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          deliverables: job.deliverables.map((item) =>
            item.id === deliverableId ? { ...item, isCompleted: !item.isCompleted } : item
          ),
        };
      })
    );
  };

  const markJobDelivered = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: 'delivered' } : job
      )
    );
  };

  const markJobPaid = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, paidAmount: job.totalPrice } : job
      )
    );
  };

  const toggleGoal = (goalId: string) => {
    setPersonalGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, isDone: !g.isDone } : g))
    );
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
        clients,
        personalGoals,
        toggleGoal,
        isSidebarOpen,
        setIsSidebarOpen,
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
