'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { ActiveNavTab } from '@/types/organizer';
import { 
  CalendarCheck, 
  Layers, 
  CreditCard, 
  Users, 
  Menu,
  GraduationCap,
  Target,
  PiggyBank
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavTabItem {
  id: ActiveNavTab | 'menu';
  label: string;
  icon: React.ElementType;
  badge?: number | boolean;
  badgeColor?: 'zinc' | 'amber' | 'emerald';
}

export function BottomNav() {
  const { mode, activeTab, setActiveTab, jobs, clients, setIsSidebarOpen } = useWorkspace();

  // Metrics for subtle, restrained badges
  const pendingUrgentCount = jobs.filter((j) => j.isUrgentToday && j.status !== 'delivered').length;
  const hasPendingDebt = clients.some((c) => c.totalPending > 0);

  const clientTabs: BottomNavTabItem[] = [
    {
      id: 'today',
      label: 'Hoy',
      icon: CalendarCheck,
      badge: pendingUrgentCount > 0 ? pendingUrgentCount : undefined,
      badgeColor: 'zinc',
    },
    {
      id: 'jobs',
      label: 'Trabajos',
      icon: Layers,
    },
    {
      id: 'finance',
      label: 'Finanzas',
      icon: CreditCard,
      badge: hasPendingDebt,
      badgeColor: 'amber',
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: Menu,
    },
  ];

  const personalTabs: BottomNavTabItem[] = [
    {
      id: 'today',
      label: 'Hoy',
      icon: CalendarCheck,
    },
    {
      id: 'personal_subjects',
      label: 'Materias',
      icon: GraduationCap,
    },
    {
      id: 'personal_goals',
      label: 'Metas',
      icon: Target,
    },
    {
      id: 'personal_savings',
      label: 'Ahorro',
      icon: PiggyBank,
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: Menu,
    },
  ];

  const tabs = mode === 'clients' ? clientTabs : personalTabs;

  const handleTabClick = (tabId: ActiveNavTab | 'menu') => {
    if (tabId === 'menu') {
      setIsSidebarOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <nav 
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-xl border-t border-zinc-200/80 bottom-nav-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id !== 'menu' && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 min-h-[48px] rounded-xl transition-colors select-none focus:outline-none"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Tab Spring Highlight Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-x-1.5 inset-y-1 bg-zinc-100/90 rounded-xl -z-0 border border-zinc-200/50"
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className={`w-[21px] h-[21px] transition-colors ${
                      isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}
                  />

                  {/* Micro Badge */}
                  {tab.badge !== undefined && (
                    typeof tab.badge === 'number' ? (
                      <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-bold flex items-center justify-center bg-zinc-900 text-white shadow-xs">
                        {tab.badge}
                      </span>
                    ) : (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" />
                    )
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight transition-colors ${
                    isActive ? 'font-semibold text-zinc-950' : 'font-medium text-zinc-400'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
