-- WebCraft AI - Supabase Schema
-- This script defines the complete database structure, including tables,
-- relationships, row-level security policies, and helper functions.

-- 1. HELPER FUNCTIONS & EXTENSIONS
------------------------------------------------------------

-- Ensure required extensions are enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- gen_random_uuid() is now in core

-- Function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. TABLE DEFINITIONS
------------------------------------------------------------

-- Stores public user data, linked to auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

-- Stores user-generated website projects
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'generating', 'completed', 'failed'
  wizard_data JSONB,
  preview_url TEXT,
  live_url TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  is_showcase BOOLEAN DEFAULT FALSE NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.projects IS 'Stores information about user-generated websites.';

-- Stores the code files for each project
CREATE TABLE public.project_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, path)
);
COMMENT ON TABLE public.project_files IS 'Contains the code files (HTML, CSS, JS) for each project.';

-- Stores pre-defined templates for users
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.templates IS 'Pre-defined website templates for starting new projects.';

-- Stores user subscription data, synced from Stripe
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  status TEXT, -- e.g., 'trialing', 'active', 'canceled', 'past_due'
  plan_id TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription data from Stripe.';

-- Stores support tickets created by users
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.support_tickets IS 'Support tickets submitted by users.';

-- Stores messages within a support ticket
CREATE TABLE public.ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.ticket_messages IS 'Messages within a support ticket conversation.';

-- Stores logs for the AI generation process
CREATE TABLE public.project_logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.project_logs IS 'Real-time logs for the AI project generation process.';


-- 3. TRIGGERS
------------------------------------------------------------

-- Trigger to update 'updated_at' timestamp on modification
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_project_files_updated BEFORE UPDATE ON public.project_files FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_support_tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create a profile for a new user upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. ROW LEVEL SECURITY (RLS)
------------------------------------------------------------

-- Enable RLS on all user-data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Profiles
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- Projects
CREATE POLICY "Users can manage their own projects." ON public.projects FOR ALL USING ( auth.uid() = user_id );
CREATE POLICY "Anyone can view public or showcase projects." ON public.projects FOR SELECT USING ( is_public = TRUE OR is_showcase = TRUE );

-- Project Files
CREATE POLICY "Users can manage files for their own projects." ON public.project_files FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
);

-- Templates
CREATE POLICY "Templates are publicly viewable." ON public.templates FOR SELECT USING ( TRUE );

-- Subscriptions
CREATE POLICY "Users can view their own subscription." ON public.subscriptions FOR SELECT USING ( auth.uid() = user_id );
-- Note: Inserts/Updates for subscriptions should be handled by a trusted service (e.g., Stripe webhook via Edge Function).

-- Support Tickets
CREATE POLICY "Users can manage their own support tickets." ON public.support_tickets FOR ALL USING ( auth.uid() = user_id );
-- TODO: Add a policy for support staff to view/update tickets based on role.

-- Ticket Messages
CREATE POLICY "Users can manage messages in their own tickets." ON public.ticket_messages FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.support_tickets WHERE id = ticket_id)
);
-- TODO: Add a policy for support staff.

-- Project Logs
CREATE POLICY "Users can view logs for their own projects." ON public.project_logs FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
);
-- Note: Inserts for logs should be handled by a trusted service (e.g., n8n webhook using the service_role key).


-- 5. DATABASE FUNCTIONS (RPC)
------------------------------------------------------------

-- Function to get total user count (for admin)
CREATE OR REPLACE FUNCTION public.get_total_users()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total project count (for admin)
CREATE OR REPLACE FUNCTION public.get_total_projects()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.projects);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get MRR (for admin)
CREATE OR REPLACE FUNCTION public.get_mrr()
RETURNS NUMERIC AS $$
BEGIN
  -- This is a placeholder. A real implementation would join with a plans table to get prices.
  RETURN (SELECT COALESCE(SUM(CASE WHEN plan_id = 'plan_pro' THEN 19.00 ELSE 0 END), 0)
          FROM public.subscriptions
          WHERE status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. INDEXES FOR PERFORMANCE
------------------------------------------------------------
CREATE INDEX ON public.projects (user_id);
CREATE INDEX ON public.project_files (project_id);
CREATE INDEX ON public.support_tickets (user_id);
CREATE INDEX ON public.ticket_messages (ticket_id);
CREATE INDEX ON public.project_logs (project_id);

-- Grant usage on schema and tables to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Allow anon role to read public projects and templates
ALTER POLICY "Anyone can view public or showcase projects." ON public.projects TO anon, authenticated;
ALTER POLICY "Templates are publicly viewable." ON public.templates TO anon, authenticated;

-- Ensure realtime is enabled for key tables
-- This is typically done in the Supabase UI, but we document it here.
-- alter publication supabase_realtime add table projects, project_logs, ticket_messages;

-- End of schema script
```