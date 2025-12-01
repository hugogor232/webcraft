```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Remplacez ces valeurs par les vôtres, disponibles dans les paramètres de votre projet Supabase.
// Allez dans Project Settings > API
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

// Crée et exporte une instance unique du client Supabase.
// Ce client sera importé dans tous les autres modules qui interagissent avec Supabase.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```