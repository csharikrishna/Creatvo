-- =============================================
-- Creatvo Production Schema Patch v1
-- Run this in Supabase SQL Editor
-- Safe to re-run (all idempotent)
-- =============================================

-- =============================================
-- 1. Add missing post-images storage bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Increase article-images limit to 5MB for cover images
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id IN ('article-images', 'banners', 'content-thumbnails');

-- =============================================
-- 2. Fix storage policies — add UPDATE/DELETE for all buckets
-- =============================================

-- Banners: add UPDATE and DELETE (were missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'banners_update_own'
  ) THEN
    CREATE POLICY "banners_update_own" ON storage.objects FOR UPDATE
      USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'banners_delete_own'
  ) THEN
    CREATE POLICY "banners_delete_own" ON storage.objects FOR DELETE
      USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Content-thumbnails: add UPDATE and DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'thumbnails_update_own'
  ) THEN
    CREATE POLICY "thumbnails_update_own" ON storage.objects FOR UPDATE
      USING (bucket_id = 'content-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'thumbnails_delete_own'
  ) THEN
    CREATE POLICY "thumbnails_delete_own" ON storage.objects FOR DELETE
      USING (bucket_id = 'content-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Article-images: add UPDATE and DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'article_images_update_own'
  ) THEN
    CREATE POLICY "article_images_update_own" ON storage.objects FOR UPDATE
      USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'article_images_delete_own'
  ) THEN
    CREATE POLICY "article_images_delete_own" ON storage.objects FOR DELETE
      USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Post-images: full set of policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'post_images_public_read'
  ) THEN
    CREATE POLICY "post_images_public_read" ON storage.objects FOR SELECT
      USING (bucket_id = 'post-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'post_images_upload_own'
  ) THEN
    CREATE POLICY "post_images_upload_own" ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'post_images_update_own'
  ) THEN
    CREATE POLICY "post_images_update_own" ON storage.objects FOR UPDATE
      USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'post_images_delete_own'
  ) THEN
    CREATE POLICY "post_images_delete_own" ON storage.objects FOR DELETE
      USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- =============================================
-- 3. Improve handle_new_user trigger
--    - Accepts interests from metadata
--    - More robust username generation
--    - Sets onboarding_completed = false explicitly
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  meta_interests TEXT[];
BEGIN
  -- Build base username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      '[^a-z0-9]', '', 'g'
    ))
  );

  -- Ensure minimum length and truncate to 20 chars
  base_username := LEFT(COALESCE(NULLIF(base_username, ''), 'creator'), 20);
  IF LENGTH(base_username) < 3 THEN
    base_username := 'creator';
  END IF;

  -- Find a unique username
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := LEFT(base_username, 17) || counter::TEXT;
  END LOOP;

  -- Parse interests from metadata if provided (JSON array of strings)
  BEGIN
    IF NEW.raw_user_meta_data->>'interests' IS NOT NULL THEN
      meta_interests := ARRAY(
        SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests')
      );
    ELSE
      meta_interests := '{}';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    meta_interests := '{}';
  END;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    creator_type,
    interests,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'creator_type', 'Other'),
    meta_interests,
    FALSE  -- Always require onboarding
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 4. Add profile upsert RLS policy
--    Allows onboarding to upsert even if trigger missed
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_upsert_own'
  ) THEN
    CREATE POLICY "profiles_upsert_own" ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- =============================================
-- 5. Ensure updated_at triggers use OR REPLACE
--    (idempotent, already handled in schema but double-checking)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. Fix community_post content_type in comments check
--    The comments table content_type check includes 'community_post' 
--    but was it actually applied? Verify:
-- =============================================
-- (Already correct in schema v2 — no action needed)

-- =============================================
-- Done. Verify with:
-- SELECT id, name, public FROM storage.buckets ORDER BY name;
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' ORDER BY policyname;
-- =============================================
