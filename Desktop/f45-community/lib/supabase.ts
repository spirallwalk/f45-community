import { createClient } from '@supabase/supabase-js'

export type Profile = {
  id: string
  nickname: string
  branch_name: string
  total_count: number
  last_workout_date: string | null
  created_at: string
  avatar_url: string | null
}

export type WorkoutLog = {
  id: string
  user_id: string
  workout_date: string
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    nickname: string
    branch_name: string
    total_count: number
    avatar_url: string | null
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const USER_ID_KEY = 'f45_user_id'

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_ID_KEY)
}

export function setStoredUserId(id: string) {
  localStorage.setItem(USER_ID_KEY, id)
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_ID_KEY)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function getProfileByNickname(nickname: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('nickname', nickname)
    .single()

  if (error) return null
  return data
}

export async function hasWorkedOutToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_date', today)
    .single()

  return !!data
}

export async function logWorkout(userId: string): Promise<{ success: boolean; error?: string }> {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('workout_logs')
    .insert({ user_id: userId, workout_date: today })

  if (error) {
    if (error.code === '23505') return { success: false, error: '오늘은 이미 완료했습니다!' }
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function updateTotalCount(userId: string, newCount: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ total_count: newCount })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateProfile(
  userId: string,
  updates: { nickname?: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) return { url: null, error: error.message }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: `${data.publicUrl}?t=${Date.now()}` }
}

export async function getDailyWorkoutCounts(): Promise<Record<string, number>> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('workout_logs')
    .select('user_id')
    .eq('workout_date', today)

  if (error || !data) return {}
  return data.reduce((acc: Record<string, number>, row: { user_id: string }) => {
    acc[row.user_id] = (acc[row.user_id] || 0) + 1
    return acc
  }, {})
}

export async function getMonthlyWorkoutCounts(): Promise<Record<string, number>> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const firstDay = `${year}-${month}-01`
  const lastDay = new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('workout_logs')
    .select('user_id')
    .gte('workout_date', firstDay)
    .lte('workout_date', lastDay)

  if (error || !data) return {}
  return data.reduce((acc: Record<string, number>, row: { user_id: string }) => {
    acc[row.user_id] = (acc[row.user_id] || 0) + 1
    return acc
  }, {})
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('total_count', { ascending: false })

  if (error) return []
  return data
}

export async function getPosts(limit = 30): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(nickname, branch_name, total_count, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

export async function createPost(userId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content: content.trim() })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)

  return !error
}

export async function getStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('workout_date')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })

  if (error || !data || data.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const dateSet = new Set(data.map((d: { workout_date: string }) => d.workout_date))

  const startDate = dateSet.has(today) ? today : (dateSet.has(yesterday) ? yesterday : null)
  if (!startDate) return 0

  let streak = 0
  let current = startDate
  while (dateSet.has(current)) {
    streak++
    const d = new Date(current)
    d.setUTCDate(d.getUTCDate() - 1)
    current = d.toISOString().split('T')[0]
  }
  return streak
}
