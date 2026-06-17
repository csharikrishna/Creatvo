export type Profile = {
  id: string
  role?: 'admin' | 'creator' | 'user'
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  creator_type: string | null
  website_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  followers_count: number
  following_count: number
  views_count: number
  posts_count: number
  is_verified: boolean
  interests: string[]
  onboarding_completed?: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  user_id: string
  title: string
  slug: string
  icon: string | null
  banner_url: string | null
  description: string | null
  order_index: number
  items_count: number
  created_at: string
}

export type ContentItem = {
  id: string
  category_id: string
  user_id: string
  title: string
  thumbnail_url: string | null
  description: string | null
  external_link: string | null
  download_link: string | null
  content_type: 'link' | 'image' | 'video' | 'carousel' | 'text' | 'resource'
  tags: string[]
  views_count: number
  clicks_count: number
  likes_count: number
  saves_count: number
  shares_count: number
  engagement_score: number
  created_at: string
  updated_at: string
  profiles?: Profile
  categories?: Category
  is_liked?: boolean
  is_saved?: boolean
}

export type Post = {
  id: string
  user_id: string
  content: string
  images: string[]
  post_type: 'text' | 'image' | 'carousel' | 'link' | 'resource'
  link_url: string | null
  link_title: string | null
  link_description: string | null
  link_image: string | null
  tags: string[]
  category_tags: string[]
  likes_count: number
  comments_count: number
  saves_count: number
  reposts_count: number
  views_count: number
  engagement_score: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  is_liked?: boolean
  is_saved?: boolean
  is_reposted?: boolean
}

export type Article = {
  id: string
  user_id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  tags: string[]
  category: string | null
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  reading_time: number
  views_count: number
  likes_count: number
  saves_count: number
  comments_count: number
  seo_title: string | null
  seo_description: string | null
  canonical_url?: string | null
  scheduled_at?: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  is_liked?: boolean
  is_saved?: boolean
}

export type Comment = {
  id: string
  user_id: string
  parent_id: string | null
  content_type: 'post' | 'article' | 'content_item' | 'community_post'
  content_id: string
  body: string
  likes_count: number
  replies_count: number
  created_at: string
  profiles?: Profile
  replies?: Comment[]
  is_liked?: boolean
}

export type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'save' | 'reply'
  content_type: string | null
  content_id: string | null
  message: string
  is_read: boolean
  created_at: string
  actor?: Profile
}

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type CommunityPost = {
  id: string
  user_id: string
  title: string
  content: string | null
  post_type: 'text' | 'link' | 'image' | 'question'
  image_url: string | null
  link_url: string | null
  upvotes: number
  downvotes: number
  comments_count: number
  tags: string[]
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type CommunityPostVote = {
  id: string
  post_id: string
  user_id: string
  vote: 1 | -1
  created_at: string
}

export type ContentView = {
  id: string
  content_id: string
  content_type: string
  viewer_ip: string | null
  viewer_id: string | null
  referrer: string | null
  created_at: string
}

export type Report = {
  id: string
  reporter_id: string
  content_type: string
  content_id: string
  reason: 'spam' | 'misinformation' | 'harassment' | 'hate_speech' | 'copyright' | 'other'
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
}

export type FeedItem = {
  type: 'post' | 'article' | 'content_item'
  data: Post | Article | ContentItem
  score: number
}

export type SearchResult = {
  type: 'user' | 'post' | 'article' | 'content_item' | 'tag'
  data: Profile | Post | Article | ContentItem
}

export type PlatformCategory = {
  slug: string
  label: string
  icon: string
  description: string
  color: string
}

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  { slug: 'ai', label: 'AI Tools', icon: '🤖', description: 'Artificial intelligence tools and resources', color: '#7C3AED' },
  { slug: 'business', label: 'Business', icon: '💼', description: 'Business ideas, strategies, and resources', color: '#2563EB' },
  { slug: 'coding', label: 'Coding', icon: '💻', description: 'Programming tutorials and dev resources', color: '#059669' },
  { slug: 'design', label: 'Design', icon: '🎨', description: 'UI/UX, graphic design, and creative tools', color: '#DC2626' },
  { slug: 'productivity', label: 'Productivity', icon: '⚡', description: 'Tools and hacks for getting more done', color: '#D97706' },
  { slug: 'finance', label: 'Finance', icon: '💰', description: 'Money, investing, and financial literacy', color: '#16A34A' },
  { slug: 'marketing', label: 'Marketing', icon: '📢', description: 'Growth hacks and marketing strategies', color: '#EA580C' },
  { slug: 'startup', label: 'Startup', icon: '🚀', description: 'Startup ideas, tools, and founder stories', color: '#7C3AED' },
  { slug: 'movies', label: 'Movies', icon: '🎬', description: 'Movie recommendations and reviews', color: '#BE185D' },
  { slug: 'music', label: 'Music', icon: '🎵', description: 'Music apps, playlists, and artists', color: '#0891B2' },
  { slug: 'games', label: 'Games', icon: '🎮', description: 'Gaming apps, tools, and resources', color: '#4F46E5' },
  { slug: 'education', label: 'Education', icon: '📚', description: 'Learning resources and courses', color: '#B45309' },
  { slug: 'travel', label: 'Travel', icon: '✈️', description: 'Travel tips, guides, and destinations', color: '#0284C7' },
  { slug: 'fitness', label: 'Fitness', icon: '💪', description: 'Health, fitness, and wellness content', color: '#DC2626' },
  { slug: 'editing', label: 'Editing', icon: '✂️', description: 'Video and photo editing tools', color: '#7C3AED' },
]

type DBTable<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: DBTable<Profile, Omit<Profile, 'followers_count' | 'following_count' | 'views_count' | 'posts_count' | 'is_verified' | 'created_at' | 'updated_at'> & Partial<Pick<Profile, 'followers_count' | 'following_count' | 'views_count' | 'posts_count' | 'is_verified' | 'created_at' | 'updated_at'>>, Partial<Profile>>
      categories: DBTable<Category, Omit<Category, 'id' | 'created_at' | 'items_count'> & Partial<Pick<Category, 'id' | 'created_at' | 'items_count'>>, Partial<Category>>
      content_items: DBTable<ContentItem, Omit<ContentItem, 'id' | 'views_count' | 'clicks_count' | 'likes_count' | 'saves_count' | 'shares_count' | 'engagement_score' | 'created_at' | 'updated_at' | 'profiles' | 'categories' | 'is_liked' | 'is_saved'> & Partial<Pick<ContentItem, 'id' | 'views_count' | 'clicks_count' | 'likes_count' | 'saves_count' | 'shares_count' | 'engagement_score' | 'created_at' | 'updated_at'>>, Partial<ContentItem>>
      posts: DBTable<Post, Omit<Post, 'id' | 'likes_count' | 'comments_count' | 'saves_count' | 'reposts_count' | 'views_count' | 'engagement_score' | 'is_pinned' | 'created_at' | 'updated_at' | 'profiles' | 'is_liked' | 'is_saved' | 'is_reposted'> & Partial<Pick<Post, 'id' | 'likes_count' | 'comments_count' | 'saves_count' | 'reposts_count' | 'views_count' | 'engagement_score' | 'is_pinned' | 'created_at' | 'updated_at'>>, Partial<Post>>
      articles: DBTable<Article, Omit<Article, 'id' | 'views_count' | 'likes_count' | 'saves_count' | 'comments_count' | 'created_at' | 'updated_at' | 'profiles' | 'is_liked' | 'is_saved'> & Partial<Pick<Article, 'id' | 'views_count' | 'likes_count' | 'saves_count' | 'comments_count' | 'created_at' | 'updated_at'>>, Partial<Article>>
      comments: DBTable<Comment, Omit<Comment, 'id' | 'likes_count' | 'replies_count' | 'created_at' | 'profiles' | 'replies' | 'is_liked'> & Partial<Pick<Comment, 'id' | 'likes_count' | 'replies_count' | 'created_at'>>, Partial<Comment>>
      likes: DBTable<{ id: string; user_id: string; content_type: string; content_id: string; created_at: string }, { id?: string; user_id: string; content_type: string; content_id: string; created_at?: string }, Partial<{ id: string; user_id: string; content_type: string; content_id: string; created_at: string }>>
      saves: DBTable<{ id: string; user_id: string; content_type: string; content_id: string; created_at: string }, { id?: string; user_id: string; content_type: string; content_id: string; created_at?: string }, Partial<{ id: string; user_id: string; content_type: string; content_id: string; created_at: string }>>
      reposts: DBTable<{ id: string; user_id: string; post_id: string; created_at: string }, { id?: string; user_id: string; post_id: string; created_at?: string }, Partial<{ id: string; user_id: string; post_id: string; created_at: string }>>
      follows: DBTable<Follow, Omit<Follow, 'id' | 'created_at'> & Partial<Pick<Follow, 'id' | 'created_at'>>, Partial<Follow>>
      notifications: DBTable<Notification, Omit<Notification, 'id' | 'created_at' | 'actor'> & Partial<Pick<Notification, 'id' | 'created_at'>>, Partial<Notification>>
      community_posts: DBTable<CommunityPost, Omit<CommunityPost, 'id' | 'upvotes' | 'downvotes' | 'comments_count' | 'created_at' | 'updated_at' | 'profiles'> & Partial<Pick<CommunityPost, 'id' | 'upvotes' | 'downvotes' | 'comments_count' | 'created_at' | 'updated_at'>>, Partial<CommunityPost>>
      community_post_votes: DBTable<CommunityPostVote, Omit<CommunityPostVote, 'id' | 'created_at'> & Partial<Pick<CommunityPostVote, 'id' | 'created_at'>>, Partial<CommunityPostVote>>
      content_views: DBTable<ContentView, Omit<ContentView, 'id' | 'created_at'> & Partial<Pick<ContentView, 'id' | 'created_at'>>, Partial<ContentView>>
      reports: DBTable<Report, Omit<Report, 'id' | 'status' | 'created_at'> & Partial<Pick<Report, 'id' | 'status' | 'created_at'>>, Partial<Report>>
    }
    Views: Record<string, never>
    Functions: {
      increment_likes: { Args: { p_table: string; p_id: string }; Returns: undefined }
      decrement_likes: { Args: { p_table: string; p_id: string }; Returns: undefined }
      increment_saves: { Args: { p_table: string; p_id: string }; Returns: undefined }
      decrement_saves: { Args: { p_table: string; p_id: string }; Returns: undefined }
      increment_comments: { Args: { p_table: string; p_id: string }; Returns: undefined }
      decrement_comments: { Args: { p_table: string; p_id: string }; Returns: undefined }
      increment_views: { Args: { p_table: string; p_id: string }; Returns: undefined }
      create_notification: {
        Args: { p_user_id: string; p_actor_id: string; p_type: string; p_content_type?: string | null; p_content_id?: string | null; p_message?: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
