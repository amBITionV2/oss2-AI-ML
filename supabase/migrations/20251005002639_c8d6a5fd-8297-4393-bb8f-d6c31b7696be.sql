-- Fix function search paths for security

-- Drop trigger first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Drop and recreate add_user_points with proper search_path
DROP FUNCTION IF EXISTS public.add_user_points(uuid, integer);

CREATE OR REPLACE FUNCTION public.add_user_points(user_id_param UUID, points_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + points_to_add
  WHERE user_id = user_id_param;
END;
$$;

-- Drop and recreate update_updated_at_column with proper search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();