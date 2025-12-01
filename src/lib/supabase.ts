import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: any;
  validation?: any;
  order_index: number;
  row: number;
  width: 'full' | 'half' | 'third' | 'quarter';
  created_at: string;
}

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'url'
  | 'tel'
  | 'password'
  | 'header' 
  | 'paragraph' 
  | 'link'
  | 'separator';

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  submitted_at: string;
}

export interface Webhook {
  id: string;
  form_id: string;
  url: string;
  is_active: boolean;
  secret?: string;
  created_at: string;
}

