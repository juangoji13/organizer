'use client';

import React from 'react';
import { WorkspaceProvider, useWorkspace } from '@/context/workspace-context';
import { Sidebar } from '@/components/layout/sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { TodayView } from '@/components/views/today-view';
import { JobsView } from '@/components/views/jobs-view';
import { FinanceView } from '@/components/views/finance-view';
import { ClientsView } from '@/components/views/clients-view';
import { PersonalView } from '@/components/views/personal-view';
import { SettingsView } from '@/components/views/settings-view';

function MainContent() {
  const { activeTab, mode } = useWorkspace();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return mode === 'clients' ? <TodayView /> : <PersonalView />;
      case 'jobs':
        return <JobsView />;
      case 'finance':
        return <FinanceView />;
      case 'clients':
        return <ClientsView />;
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">
      <TopHeader />
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <MainContent />
      </div>
    </WorkspaceProvider>
  );
}
