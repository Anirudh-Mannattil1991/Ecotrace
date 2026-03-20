import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Server-side admin client (only for API routes)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or service role key');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; company_name: string | null; industry: string | null; created_at: string };
        Insert: { id: string; company_name?: string | null; industry?: string | null; created_at?: string };
        Update: { company_name?: string | null; industry?: string | null };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          description: string | null;
          category: string;
          amount_usd: number;
          co2_kg: number | null;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          description?: string | null;
          category: string;
          amount_usd: number;
          co2_kg?: number | null;
          source?: string;
          created_at?: string;
        };
        Update: {
          date?: string;
          description?: string | null;
          category?: string;
          amount_usd?: number;
          co2_kg?: number | null;
          source?: string;
        };
      };
      ai_insights: {
        Row: { id: string; user_id: string; generated_at: string; top_category: string | null; insight_json: Record<string, unknown> | null };
        Insert: { id?: string; user_id: string; generated_at?: string; top_category?: string | null; insight_json?: Record<string, unknown> | null };
        Update: { top_category?: string | null; insight_json?: Record<string, unknown> | null };
      };
    };
  };
};
