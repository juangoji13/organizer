'use client';

import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace-context';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TodayView } from '@/components/views/today-view';
import { JobsView } from '@/components/views/jobs-view';
import { FinanceView } from '@/components/views/finance-view';
import { ClientsView } from '@/components/views/clients-view';
import { PersonalView } from '@/components/views/personal-view';
import { SettingsView } from '@/components/views/settings-view';
import { UniversalCreateModal } from '@/components/common/universal-create-modal';
import { ToastContainer } from '@/components/common/toast-container';

function MainContent() {
  const { activeTab } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView />;
      case 'jobs':
        return <JobsView />;
      case 'finance':
        return <FinanceView />;
      case 'clients':
        return <ClientsView />;
      case 'personal':
      case 'personal_subjects':
      case 'personal_goals':
      case 'personal_ideas':
      case 'personal_savings':
        return <PersonalView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa] dark:bg-[#09090b] max-sm:dark:bg-black min-h-screen">
      <TopHeader onOpenCreateModal={handleOpenCreateModal} />
      <main className="flex-1 overflow-y-auto pb-32 md:pb-8">
        {renderActiveView()}
      </main>
      <BottomNav onOpenCreateModal={handleOpenCreateModal} />

      {/* Universal Creator Modal */}
      <UniversalCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Undo & Feedback Notifications */}
      <ToastContainer />
    </div>
  );
}

export function AppShell() {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-white dark:bg-[#09090b] max-sm:dark:bg-black">
        <Sidebar />
        <MainContent />
      </div>
    </WorkspaceProvider>
  );
}
