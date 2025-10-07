import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_PROJECT_URL = 'https://kpjskssqfsirdnynflpw.supabase.co';
export const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwanNrc3NxZnNpcmRueW5mbHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzIzMzksImV4cCI6MjA3NTQwODMzOX0.ERVxzFNCgZUf8woTi7bUaKPe3Dfrs0hOmhvuO24Kg6k';

export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
