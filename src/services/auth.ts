import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url: string
  points: number
  level: string
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
    // First, create the auth user without metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) throw authError

    // If user was created successfully, create their profile
    if (authData.user) {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=49bbbd&color=fff`
      const now = new Date().toISOString()
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          points: 0,
          level: 'New Member',
          created_at: now,
          updated_at: now
        })

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        // But since we can't delete auth users from client, we'll just throw the error
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
    }

    return authData
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: user.id,
      email: user.email!,
      full_name: profile.full_name || user.email!,
      avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email!)}&background=49bbbd&color=fff`,
      points: profile.points || 0,
      level: profile.level || 'New Member'
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<{
    full_name: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
    birth_date: string
    gender: string
  }>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}