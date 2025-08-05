-- Create search_logs table for tracking daily searches per user
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    search_date DATE NOT NULL,
    searches_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, search_date)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_search_logs_user_date ON public.search_logs(user_id, search_date);
CREATE INDEX IF NOT EXISTS idx_search_logs_date ON public.search_logs(search_date);

-- Enable RLS
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own search logs" ON public.search_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search logs" ON public.search_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search logs" ON public.search_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_search_logs_updated_at 
    BEFORE UPDATE ON public.search_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 