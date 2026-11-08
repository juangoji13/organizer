'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { ActiveNavTab } from '@/types/organizer';
import { 
  Sun, 
  Layers, 
  CreditCard, 
  Users, 
  Settings, 
  GraduationCap, 
  Sparkles, 
  PiggyBank, 
  X,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@animate-ui/react/utils/motion';

export function Sidebar() {
  const { 
    mode, 
    setMode, 
    activeTab, 
    setActiveTab, 
    isSidebarOpen, 
    setIsSidebarOpen,
    jobs,
    clients,
    personalGoals
  } = useWorkspace();

  interface NavItem {
    id: ActiveNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: 'urgent' | 'debt' | 'neutral';
  }

  const pendingUrgentCount = jobs.filter((j) => j.isUrgentToday && j.status !== 'delivered').length;
  const hasPendingDebt = clients.some((c) => c.totalPending > 0);
  const pendingGoalsCount = personalGoals.filter((g) => !g.isDone).length;

  const clientNavItems: NavItem[] = [
    { 
      id: 'today', 
      label: 'Hoy (Prioritarios)', 
      icon: Sun, 
      badge: pendingUrgentCount > 0 ? String(pendingUrgentCount) : undefined,
      badgeVariant: 'urgent'
    },
    { id: 'jobs', label: 'Todos los Trabajos', icon: Layers },
    { id: 'clients', label: 'Directorio Clientes', icon: Users },
    { 
      id: 'finance', 
      label: 'Finanzas & Cobros', 
      icon: CreditCard, 
      badge: hasPendingDebt ? 'Cobros' : undefined,
      badgeVariant: 'debt'
    },
  ];

  const personalNavItems: NavItem[] = [
    { 
      id: 'personal', 
      label: 'Mi Espacio (General)', 
      icon: Sparkles,
      badge: pendingGoalsCount > 0 ? String(pendingGoalsCount) : undefined,
      badgeVariant: 'neutral'
    },
    { id: 'personal_subjects', label: 'Mis Materias & Notas', icon: GraduationCap },
    { id: 'personal_savings', label: 'Metas Dev & Ahorro', icon: PiggyBank },
  ];

  const handleSelectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    if (tab === 'personal' || tab.startsWith('personal_')) {
      setMode('personal');
    } else if (tab === 'today' || tab === 'jobs' || tab === 'clients' || tab === 'finance') {
      setMode('clients');
    }
    setIsSidebarOpen(false);
  };

  const isTabActive = (item: NavItem) => {
    if (activeTab === item.id) return true;
    if (item.id === 'personal' && activeTab === 'personal') return true;
    return false;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-semibold text-sm tracking-tight shadow-sm">
            O
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Organizer</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Gestión Profesional & Personal</p>
          </div>
        </div>

        {/* Mobile close button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={spring.press}
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Section 1: Clientes & Encargos */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Clientes & Encargos</span>
            </span>
          </div>
          <div className="space-y-1">
            {clientNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isTabActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative ${
                    isActive
                      ? 'text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      transition={spring.highlight}
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg -z-0"
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      item.badgeVariant === 'debt'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
                        : item.badgeVariant === 'urgent'
                        ? 'bg-zinc-900 text-white font-bold tabular-nums dark:bg-white dark:text-zinc-950'
                        : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Mi Espacio Personal */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Mi Espacio Personal</span>
            </span>
          </div>
          <div className="space-y-1">
            {personalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isTabActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative ${
                    isActive
                      ? 'text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      transition={spring.highlight}
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg -z-0"
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="relative z-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / Settings Link */}
      <div className="p-4 border-t border-zinc-100 dark:border-white/10">
        <button
          onClick={() => handleSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900/80 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
          <span>Configuración</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#09090b] min-h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Animate UI Spring Slide) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={spring.slide}
              className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#09090b] z-50 shadow-xl md:hidden border-r border-zinc-200 dark:border-white/10 pt-safe pb-safe"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
