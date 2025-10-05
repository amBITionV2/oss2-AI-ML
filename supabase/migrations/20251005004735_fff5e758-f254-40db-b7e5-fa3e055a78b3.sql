-- Force types regeneration with a trivial schema change
ALTER TABLE public.profiles 
  ALTER COLUMN language_preference 
  SET DEFAULT 'en';