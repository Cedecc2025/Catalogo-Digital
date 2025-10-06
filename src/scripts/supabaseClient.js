import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tfrgpxnnqoktehzoounk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmdweG5ucW9rdGVoem9vdW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzQ5ODEsImV4cCI6MjA3NTAxMDk4MX0.5A-m5yD93_iRrPjtfcv4MkxBHLaAy-RMCs5O5IK14Zw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
