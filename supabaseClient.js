import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Remplacez ces valeurs par les vôtres, disponibles dans les paramètres de votre projet Supabase.
// Allez dans Project Settings > API
const SUPABASE_URL = 'https://jkuxmhuzoznzmbzcjexf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXhtaHV6b3puem1iemNqZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYzMTEsImV4cCI6MjA4MDE2MjMxMX0.kvFnJkF_nFVNYNUEIhi3GP5A0HGLosHK6t0bpEwnj90'

// Crée et exporte une instance unique du client Supabase.
// Ce client sera importé dans tous les autres modules qui interagissent avec Supabase.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
