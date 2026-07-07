-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_new_feedback()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (shop_id, title, message, type)
    VALUES (
        NEW.shop_id,
        'New Feedback Received',
        CASE 
            WHEN NEW.rating IS NOT NULL THEN 'A customer left a ' || NEW.rating || '-star rating.'
            ELSE 'A customer left new feedback.'
        END,
        'feedback'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_new_feedback ON public.feedback;

-- Create the trigger
CREATE TRIGGER on_new_feedback
AFTER INSERT ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION notify_new_feedback();
