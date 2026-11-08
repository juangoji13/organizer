export type WorkspaceMode = 'clients' | 'personal';

export type ActiveNavTab = 
  | 'today' 
  | 'jobs' 
  | 'finance' 
  | 'clients' 
  | 'personal_subjects' 
  | 'personal_goals' 
  | 'personal_ideas' 
  | 'personal_savings' 
  | 'settings';

export interface DeliverableItem {
  id: string;
  title: string;
  isCompleted: boolean;
  type?: 'assignment' | 'test' | 'quiz' | 'paper';
}

export interface ClientJob {
  id: string;
  clientName: string;
  clientPhone: string;
  subject: string;
  title: string;
  deadlineTime: string;
  deadlineDate: string; // YYYY-MM-DD
  isUrgentToday: boolean;
  totalPrice: number;
  paidAmount: number;
  currency: string;
  platform: string;
  platformUser: string;
  platformPass: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'paid' | 'cancelled';
  deliverables: DeliverableItem[];
}

export interface ClientContact {
  id: string;
  name: string;
  phone: string;
  totalJobs: number;
  totalPaid: number;
  totalPending: number;
  lastActive: string;
}

export interface PersonalGoal {
  id: string;
  category: 'study' | 'dev' | 'savings' | 'note';
  title: string;
  description?: string;
  currentAmount?: number;
  targetAmount?: number;
  isDone?: boolean;
}
