-- Trigger types regeneration
-- Add a comment to ensure the types file is updated with current schema
COMMENT ON TABLE public.profiles IS 'User profiles with conditions, points, and learning progress';
COMMENT ON FUNCTION public.add_user_points(uuid, integer) IS 'Adds points to a user profile';
