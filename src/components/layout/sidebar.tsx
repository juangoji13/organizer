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
  Target, 
  Sparkles, 
  PiggyBank, 
  X,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@animate-ui/react/utils/motion';

export function Sidebar() {
  const { mode, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useWorkspace();

  interface NavItem {
    id: ActiveNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const clientNavItems: NavItem[] = [
    { id: 'today', label: 'Hoy (Prioritarios)', icon: Sun, badge: '2' },
    { id: 'jobs', label: 'Todos los Trabajos', icon: Layers },
    { id: 'finance', label: 'Finanzas & Cobros', icon: CreditCard, badge: 'Deudas' },
    { id: 'clients', label: 'Directorio Clientes', icon: Users },
  ];

  const personalNavItems: NavItem[] = [
    { id: 'today', label: 'Hoy (Mi Día)', icon: Sun },
    { id: 'personal_subjects', label: 'Mis Materias U', icon: GraduationCap },
    { id: 'personal_goals', label: 'Metas de Estudio', icon: Target },
    { id: 'personal_ideas', label: 'Ideas & Proyectos Dev', icon: Sparkles },
    { id: 'personal_savings', label: 'Planes de Ahorro', icon: PiggyBank },
  ];

  const navItems = mode === 'clients' ? clientNavItems : personalNavItems;

  const handleSelectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm tracking-tight shadow-sm">
            O
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">Organizer</h1>
            <p className="text-xs text-zinc-400 font-medium">Gestión Profesional</p>
          </div>
        </div>

        {/* Mobile close button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={spring.press}
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Active Space Indicator Badge */}
      <div className="px-5 pt-5 pb-2">
        <div className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {mode === 'clients' ? (
              <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-zinc-600" />
            )}
            <span className="font-medium text-zinc-700">
              {mode === 'clients' ? 'Espacio Clientes' : 'Espacio Personal'}
            </span>
          </div>
          <button 
            onClick={() => handleSelectTab('settings')}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 underline underline-offset-2"
          >
            Cambiar
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Navegación
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative ${
                isActive
                  ? 'text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  transition={spring.highlight}
                  className="absolute inset-0 bg-zinc-100 rounded-lg -z-0"
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  item.badge === 'Deudas'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                    : 'bg-zinc-200/60 text-zinc-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings Link */}
      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={() => handleSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-zinc-900 bg-zinc-100 font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Configuración & Espacios</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 bg-white min-h-screen shrink-0">
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
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={spring.slide}
              className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-xl md:hidden border-r border-zinc-200"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
