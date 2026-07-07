-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'feedback', 'system', 'order'
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own shop's notifications
DROP POLICY IF EXISTS "Users can view their shop notifications" ON public.notifications;
CREATE POLICY "Users can view their shop notifications" 
    ON public.notifications FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = notifications.shop_id 
            AND shops.user_id = auth.uid()
        )
    );

-- Allow users to update their own shop's notifications (e.g., mark as read)
DROP POLICY IF EXISTS "Users can update their shop notifications" ON public.notifications;
CREATE POLICY "Users can update their shop notifications" 
    ON public.notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.shops 
            WHERE shops.id = notifications.shop_id 
            AND shops.user_id = auth.uid()
        )
    );

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
