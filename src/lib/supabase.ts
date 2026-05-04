import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obtjhfoffpskzvkbsgnv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idGpoZm9mZnBza3p2a2JzZ252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODY5OTIsImV4cCI6MjA5MzA2Mjk5Mn0.zcVbN1VIKvvH6OOiHWG_QzzUwZaxTKZPFucX_E2ZPDs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
