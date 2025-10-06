import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tfrgpxnnqoktehzoounk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmdweG5ucW9rdGVoem9vdW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAyODI3ODksImV4cCI6MjAwNTg1ODc4OX0.zGs5HGr61kTu6DuJGL__TyL_tQkgMSUl7O-MWSiy_80';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
