-- =============================================
-- Creatvo Full Production Schema v2
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABLE: profiles
-- =============================================
DROP TABLE IF EXISTS public.content_views CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.community_post_votes CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.reposts CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'creator' NOT NULL CHECK (role IN ('admin', 'creator', 'user')),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  creator_type TEXT,
  website_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  followers_count INTEGER DEFAULT 0 NOT NULL,
  following_count INTEGER DEFAULT 0 NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  posts_count INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  interests TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$')
);

-- =============================================
-- TABLE: categories
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  banner_url TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  items_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, slug)
);

-- =============================================
-- TABLE: content_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  external_link TEXT,
  download_link TEXT,
  content_type TEXT DEFAULT 'link' CHECK (content_type IN ('link', 'image', 'video', 'carousel', 'text', 'resource')),
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0 NOT NULL,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  saves_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  engagement_score FLOAT DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(description, '')), 'B') ||
    setweight(array_to_tsvector(coalesce(tags, '{}')), 'C')
  ) STORED
);

-- =============================================
-- TABLE: posts (social posts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'carousel', 'link', 'resource')),
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  link_image TEXT,
  tags TEXT[] DEFAULT '{}',
  category_tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  saves_count INTEGER DEFAULT 0 NOT NULL,
  reposts_count INTEGER DEFAULT 0 NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  engagement_score FLOAT DEFAULT 0 NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english'::regconfig, coalesce(content, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(link_title, '')), 'B')
  ) STORED
);

-- =============================================
-- TABLE: articles (blog)
-- =============================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  reading_time INTEGER DEFAULT 1,
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  saves_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(excerpt, '')), 'B') ||
    setweight(array_to_tsvector(coalesce(tags, '{}')), 'C')
  ) STORED,
  UNIQUE(user_id, slug)
);

-- =============================================
-- TABLE: comments
-- =============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'content_item', 'community_post')),
  content_id UUID NOT NULL,
  body TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  replies_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABLE: likes (polymorphic)
-- =============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'content_item', 'comment', 'community_post')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, content_type, content_id)
);

-- =============================================
-- TABLE: saves / bookmarks
-- =============================================
CREATE TABLE IF NOT EXISTS public.saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'content_item')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, content_type, content_id)
);

-- =============================================
-- TABLE: reposts
-- =============================================
CREATE TABLE IF NOT EXISTS public.reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- =============================================
-- TABLE: follows
-- =============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- =============================================
-- TABLE: notifications
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'repost', 'save', 'reply')),
  content_type TEXT,
  content_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABLE: community_posts (Reddit-like)
-- =============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'link', 'image', 'question')),
  image_url TEXT,
  link_url TEXT,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  downvotes INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABLE: community_post_votes
-- =============================================
CREATE TABLE IF NOT EXISTS public.community_post_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote INTEGER DEFAULT 1 CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- =============================================
-- TABLE: content_views (analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'content_item',
  viewer_ip TEXT,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABLE: reports (moderation)
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'misinformation', 'harassment', 'hate_speech', 'copyright', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON public.profiles(followers_count DESC);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Content items
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON public.content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_category_id ON public.content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_engagement ON public.content_items(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_views ON public.content_items(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_created ON public.content_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_tags ON public.content_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_content_items_search ON public.content_items USING gin(search_vector);

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_engagement ON public.posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_tags ON public.posts USING gin(category_tags);
CREATE INDEX IF NOT EXISTS idx_posts_search ON public.posts USING gin(search_vector);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles USING gin(search_vector);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content ON public.likes(content_type, content_id);

-- Saves
CREATE INDEX IF NOT EXISTS idx_saves_user ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_content ON public.saves(content_type, content_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Views
CREATE INDEX IF NOT EXISTS idx_content_views_content ON public.content_views(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_views_viewer ON public.content_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_content_views_created ON public.content_views(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_manage_own" ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Content items
CREATE POLICY "content_items_select_all" ON public.content_items FOR SELECT USING (true);
CREATE POLICY "content_items_manage_own" ON public.content_items FOR ALL USING (auth.uid() = user_id);

-- Posts
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_auth" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_manage_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Articles
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "articles_manage_own" ON public.articles FOR ALL USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_manage_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "likes_select_all" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_manage_own" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- Saves
CREATE POLICY "saves_select_own" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves_manage_own" ON public.saves FOR ALL USING (auth.uid() = user_id);

-- Reposts
CREATE POLICY "reposts_select_all" ON public.reposts FOR SELECT USING (true);
CREATE POLICY "reposts_manage_own" ON public.reposts FOR ALL USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_manage_own" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);

-- Community posts
CREATE POLICY "community_posts_select_all" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "community_posts_insert_auth" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_manage_own" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_posts_delete_own" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community post votes
CREATE POLICY "votes_select_all" ON public.community_post_votes FOR SELECT USING (true);
CREATE POLICY "votes_manage_own" ON public.community_post_votes FOR ALL USING (auth.uid() = user_id);

-- Views
CREATE POLICY "views_insert_all" ON public.content_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views_select_all" ON public.content_views FOR SELECT USING (true);

-- Reports
CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Admin helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "admin_manage_profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "admin_manage_posts" ON public.posts FOR ALL USING (public.is_admin());
CREATE POLICY "admin_manage_articles" ON public.articles FOR ALL USING (public.is_admin());
CREATE POLICY "admin_manage_reports" ON public.reports FOR ALL USING (public.is_admin());

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_ts BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_content_items_ts BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_posts_ts BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_articles_ts BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_comments_ts BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)), '[^a-z0-9]', '', 'g'))
  );
  base_username := LEFT(base_username, 20);
  IF LENGTH(base_username) < 3 THEN base_username := 'creator'; END IF;

  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, creator_type)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'creator_type', 'Other')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Engagement score updater
CREATE OR REPLACE FUNCTION update_content_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := (
    COALESCE(NEW.likes_count, 0) * 2 +
    COALESCE(NEW.comments_count, 0) * 3 +
    COALESCE(NEW.saves_count, 0) * 5 +
    COALESCE(NEW.shares_count, 0) * 4 +
    COALESCE(NEW.views_count, 0) * 0.1 +
    GREATEST(0, 100 - EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600 * 2)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_score BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION update_content_engagement_score();
CREATE TRIGGER update_post_score BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_content_engagement_score();

-- Notification creator
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_content_type TEXT DEFAULT NULL,
  p_content_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT ''
)
RETURNS void AS $$
BEGIN
  IF p_user_id = p_actor_id THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, content_type, content_id, message)
  VALUES (p_user_id, p_actor_id, p_type, p_content_type, p_content_id, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_likes(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET likes_count = likes_count + 1 WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(p_table TEXT, p_id UUID)
RETURNS void AS $$
BEGIN
  IF p_table = 'content_items' THEN
    UPDATE public.content_items SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE public.articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_id;
  ELSIF p_table = 'posts' THEN
    UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('content-thumbnails', 'content-thumbnails', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('article-images', 'article-images', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first to be idempotent)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "banners_public_read" ON storage.objects;
DROP POLICY IF EXISTS "banners_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "thumbnails_public_read" ON storage.objects;
DROP POLICY IF EXISTS "thumbnails_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "article_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "article_images_upload_own" ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "banners_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "banners_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'content-thumbnails');
CREATE POLICY "thumbnails_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "article_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');
CREATE POLICY "article_images_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);
