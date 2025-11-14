-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert messages
CREATE POLICY "Allow anyone to insert contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow only authenticated users to read their own messages
CREATE POLICY "Allow authenticated users to read messages"
  ON public.contact_messages
  FOR SELECT
  USING (true);
