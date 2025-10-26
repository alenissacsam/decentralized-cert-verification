import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript types for Supabase tables
export interface Certificate {
  id: string;
  certificate_id: string;
  recipient_address: string;
  recipient_name: string;
  certificate_type: string;
  issuer_name: string;
  issue_date: string;
  ipfs_hash: string;
  metadata_uri: string;
  tx_hash: string;
  created_at: string;
}
