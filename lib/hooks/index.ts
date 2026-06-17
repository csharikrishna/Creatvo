'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ContentItem, Notification } from '@/types'

// ─── useProfile ───────────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [userId])

  return { profile, loading }
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────

export function useCurrentUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ─── useIsFollowing ───────────────────────────────────────────────────────────

export function useIsFollowing(targetUserId: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()
        .then(({ data }) => {
          setIsFollowing(!!data)
          setLoading(false)
        })
    })
  }, [targetUserId])

  return { isFollowing, setIsFollowing, loading }
}

// ─── useIsLiked ───────────────────────────────────────────────────────────────

export function useIsLiked(contentType: string, contentId: string) {
  const [isLiked, setIsLiked] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single()
        .then(({ data }) => setIsLiked(!!data))
    })
  }, [contentType, contentId])

  return { isLiked, setIsLiked }
}

// ─── useIsSaved ───────────────────────────────────────────────────────────────

export function useIsSaved(contentType: string, contentId: string) {
  const [isSaved, setIsSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single()
        .then(({ data }) => setIsSaved(!!data))
    })
  }, [contentType, contentId])

  return { isSaved, setIsSaved }
}

// ─── useNotifications ─────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Initial fetch
      const { data } = await supabase
        .from('notifications')
        .select('*, profiles!actor_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter(n => !n.is_read).length)
      }

      // Realtime subscription
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
          setUnreadCount(prev => prev + 1)
        })
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return { notifications, unreadCount }
}


// ─── useSearch ────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  const [results, setResults] = useState<{
    content: ContentItem[]
    profiles: Profile[]
  }>({ content: [], profiles: [] })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ content: [], profiles: [] })
      return
    }

    const debounce = setTimeout(async () => {
      setLoading(true)

      const [profilesRes, contentRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('content_items')
          .select('*, profiles(*)')
          .textSearch('search_vector', query, { type: 'websearch' })
          .limit(10),
      ])

      setResults({
        profiles: profilesRes.data || [],
        content: contentRes.data || [],
      })
      setLoading(false)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  return { results, loading }
}

// ─── useInfiniteScroll ────────────────────────────────────────────────────────

export function useInfiniteScroll(callback: () => void) {
  const observer = useCallback((node: HTMLDivElement | null) => {
    if (!node) return

    const intersectionObserver = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) callback() },
      { threshold: 0.1 }
    )
    intersectionObserver.observe(node)
    return () => intersectionObserver.disconnect()
  }, [callback])

  return observer
}
