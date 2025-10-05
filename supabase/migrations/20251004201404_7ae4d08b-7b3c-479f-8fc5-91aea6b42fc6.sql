-- Add points and progress tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS braille_progress JSONB DEFAULT '{"completed_letters": [], "quiz_scores": []}',
ADD COLUMN IF NOT EXISTS sign_progress JSONB DEFAULT '{"completed_signs": [], "quiz_scores": []}';

-- Create a function to update points
CREATE OR REPLACE FUNCTION public.add_user_points(
  user_id_param UUID,
  points_to_add INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE public.profiles
  SET points = points + points_to_add
  WHERE user_id = user_id_param
  RETURNING points INTO new_total;
  
  RETURN new_total;
END;
$$;