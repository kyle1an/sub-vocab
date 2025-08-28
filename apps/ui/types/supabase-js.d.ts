declare global {
  declare module '@supabase/supabase-js' {
    interface UserMetadata {
      email: string
      email_verified: boolean
      phone_verified: boolean
      sub: string
      username?: string
    }
  }
}
