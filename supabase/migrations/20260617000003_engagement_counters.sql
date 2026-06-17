-- =============================================
-- Creatvo Production Schema Patch v3: Engagement Counters
-- Adds missing RPCs for tracking saves, comments, and views
-- =============================================

-- =============================================
-- 1. SAVES COUNTERS
-- =============================================
CREATE OR REPLACE FUNCTION increment_saves(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET saves_count = saves_count + 1 WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET saves_count = saves_count + 1 WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET saves_count = saves_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_saves(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET saves_count = GREATEST(0, saves_count - 1) WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET saves_count = GREATEST(0, saves_count - 1) WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. COMMENTS COUNTERS
-- =============================================
CREATE OR REPLACE FUNCTION increment_comments(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET comments_count = comments_count + 1 WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET comments_count = comments_count + 1 WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comments(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET comments_count = GREATEST(0, comments_count - 1) WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET comments_count = GREATEST(0, comments_count - 1) WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. VIEWS COUNTERS
-- =============================================
CREATE OR REPLACE FUNCTION increment_views(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET views_count = views_count + 1 WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET views_count = views_count + 1 WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET views_count = views_count + 1 WHERE id = p_id;
  ELSIF p_table = 'profiles' THEN
    UPDATE public.profiles SET views_count = views_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
