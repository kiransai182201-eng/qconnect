-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text,
  table_number varchar(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy 1: ANYONE can insert feedback (customers aren't logged in)
CREATE POLICY "Anyone can insert feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (true);

-- Policy 2: ONLY the shop owner can view the feedback
CREATE POLICY "Shop owners can view their feedback" 
  ON public.feedback FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.shops WHERE id = feedback.shop_id
    )
  );
