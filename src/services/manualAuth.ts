import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

export interface ManualUser {
  id: string
  email: string
  full_name: string
  avatar_url: string
  points: number
  level: string
  password_hash: string
  created_at: string
}

export const manualAuthService = {
  // Đăng ký user thủ công
  async signUp(email: string, password: string, fullName: string) {
    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from('manual_users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('Email đã được sử dụng')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Tạo user mới
    const { data, error } = await supabase
      .from('manual_users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=49bbbd&color=fff`,
        points: 0,
        level: 'New Member'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Đăng nhập thủ công
  async signIn(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('manual_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Lưu session vào localStorage
    const session = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        points: user.points,
        level: user.level
      },
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 ngày
    }

    localStorage.setItem('manual_auth_session', JSON.stringify(session))
    return session
  },

  // Đăng xuất
  async signOut() {
    localStorage.removeItem('manual_auth_session')
  },

  // Lấy user hiện tại
  getCurrentUser() {
    const sessionData = localStorage.getItem('manual_auth_session')
    if (!sessionData) return null

    const session = JSON.parse(sessionData)
    
    // Kiểm tra session còn hạn không
    if (Date.now() > session.expires_at) {
      localStorage.removeItem('manual_auth_session')
      return null
    }

    return session.user
  },

  // Cập nhật profile
  async updateProfile(userId: string, updates: Partial<{
    full_name: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
    birth_date: string
    gender: string
  }>) {
    const { data, error } = await supabase
      .from('manual_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    // Cập nhật session
    const sessionData = localStorage.getItem('manual_auth_session')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      session.user = { ...session.user, ...updates }
      localStorage.setItem('manual_auth_session', JSON.stringify(session))
    }

    return data
  }
}