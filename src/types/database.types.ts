export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JobStatus = 'pending' | 'in_progress' | 'delivered' | 'paid' | 'completed' | 'cancelled';
export type PersonalItemType = 'university' | 'programming' | 'study_goal' | 'savings' | 'study' | 'dev' | 'note';

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          university: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          university?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          university?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          client_id: string;
          title: string | null;
          subject: string;
          platform: string;
          username: string;
          password: string;
          rate: number;
          amount_paid: number;
          due_date: string;
          status: JobStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title?: string | null;
          subject: string;
          platform: string;
          username: string;
          password: string;
          rate?: number;
          amount_paid?: number;
          due_date: string;
          status?: JobStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string | null;
          subject?: string;
          platform?: string;
          username?: string;
          password?: string;
          rate?: number;
          amount_paid?: number;
          due_date?: string;
          status?: JobStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      deliverables: {
        Row: {
          id: string;
          job_id: string;
          title: string;
          category: string;
          is_completed: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          title: string;
          category?: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          title?: string;
          category?: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deliverables_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      personal_items: {
        Row: {
          id: string;
          type: PersonalItemType;
          title: string;
          description: string | null;
          progress: number;
          target: number;
          unit: string | null;
          deadline: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: PersonalItemType;
          title: string;
          description?: string | null;
          progress?: number;
          target?: number;
          unit?: string | null;
          deadline?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: PersonalItemType;
          title?: string;
          description?: string | null;
          progress?: number;
          target?: number;
          unit?: string | null;
          deadline?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
