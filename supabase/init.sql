-- Alertino: initial database schema
-- Run manually in Supabase SQL Editor on a fresh project.
-- Consolidates the base schema missing from supabase/migrations/ (those files are incremental ALTERs only).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  status TEXT DEFAULT 'active',
  interval TEXT CHECK (interval IN ('month', 'year')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE public.filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale')),
  property_type TEXT NOT NULL DEFAULT 'apartment'
    CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'loft', 'commercial')),
  min_price INTEGER NOT NULL DEFAULT 1 CHECK (min_price >= 1),
  max_price INTEGER NOT NULL CHECK (max_price > 0),
  min_rooms INTEGER NOT NULL DEFAULT 1 CHECK (min_rooms >= 1),
  max_rooms INTEGER NOT NULL DEFAULT 10 CHECK (max_rooms >= 1),
  min_area INTEGER NOT NULL DEFAULT 1 CHECK (min_area >= 1),
  max_area INTEGER NOT NULL DEFAULT 200 CHECK (max_area > 0),
  floor INTEGER CHECK (floor IS NULL OR (floor >= 0 AND floor <= 50)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (user_id, name),
  CHECK (min_price <= max_price),
  CHECK (min_rooms <= max_rooms),
  CHECK (min_area <= max_area)
);

CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filter_id UUID REFERENCES public.filters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  city TEXT NOT NULL,
  price INTEGER NOT NULL,
  rooms INTEGER NOT NULL,
  area INTEGER NOT NULL DEFAULT 50 CHECK (area > 0),
  listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale')),
  property_type TEXT NOT NULL DEFAULT 'apartment'
    CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'loft', 'commercial')),
  floor INTEGER CHECK (floor IS NULL OR floor >= 0),
  status TEXT NOT NULL DEFAULT 'active',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE public.search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  search_date DATE NOT NULL,
  searches_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (user_id, search_date)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_filters_user_id ON public.filters(user_id);
CREATE INDEX idx_filters_listing_type ON public.filters(listing_type);
CREATE INDEX idx_filters_property_type ON public.filters(property_type);
CREATE INDEX idx_filters_price_range ON public.filters(min_price, max_price);
CREATE INDEX idx_filters_rooms_range ON public.filters(min_rooms, max_rooms);
CREATE INDEX idx_filters_area_range ON public.filters(min_area, max_area);
CREATE INDEX idx_filters_floor ON public.filters(floor);

CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_filter_id ON public.alerts(filter_id);
CREATE INDEX idx_alerts_is_favorite ON public.alerts(is_favorite);
CREATE INDEX idx_alerts_user_favorite ON public.alerts(user_id, is_favorite);

CREATE INDEX idx_search_logs_user_date ON public.search_logs(user_id, search_date);
CREATE INDEX idx_search_logs_date ON public.search_logs(search_date);

CREATE INDEX idx_subscriptions_trial_end ON public.subscriptions(trial_end);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own filters"
  ON public.filters FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own alerts"
  ON public.alerts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own search logs"
  ON public.search_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own search logs"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own search logs"
  ON public.search_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auth trigger: create public.users + free subscription on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_search_logs_updated_at
  BEFORE UPDATE ON public.search_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
