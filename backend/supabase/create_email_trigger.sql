-- Create a function that calls the Edge Function to send email
CREATE OR REPLACE FUNCTION public.send_contact_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send email
  PERFORM net.http_post(
    url := 'https://hztkspqunxeauawqcikw.supabase.co/functions/v1/send_contact_email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_contact_message_insert ON public.contact_messages;

-- Create trigger that fires after INSERT on contact_messages
CREATE TRIGGER on_contact_message_insert
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_contact_email_trigger();
