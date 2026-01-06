export type SupabaseDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          has_completed_onboarding: boolean | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          dark_mode_enabled: boolean | null
          notifications_enabled: boolean | null
          push_notifications_enabled: boolean | null
          email_notifications_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          id: string
          has_completed_onboarding?: boolean | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          dark_mode_enabled?: boolean | null
          notifications_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          has_completed_onboarding?: boolean | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          dark_mode_enabled?: boolean | null
          notifications_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          device_id: string | null
          device_name: string | null
          platform: "ios" | "android" | "web" | null
          is_active: boolean
          last_used_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          device_id?: string | null
          device_name?: string | null
          platform?: "ios" | "android" | "web" | null
          is_active?: boolean
          last_used_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          device_id?: string | null
          device_name?: string | null
          platform?: "ios" | "android" | "web" | null
          is_active?: boolean
          last_used_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/**
 * User preferences that sync to the profiles table
 */
export interface UserPreferences {
  dark_mode_enabled: boolean | null
  notifications_enabled: boolean | null
  push_notifications_enabled: boolean | null
  email_notifications_enabled: boolean | null
}
