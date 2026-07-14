export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          created_at: string
          feature: string
          id: number
          input_tokens: number | null
          output_tokens: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: never
          input_tokens?: number | null
          output_tokens?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: never
          input_tokens?: number | null
          output_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          contact: string | null
          created_at: string
          followers: number | null
          handle: string
          id: string
          niche: string | null
          notes: string | null
          platform: Database["public"]["Enums"]["platform"]
          tag: Database["public"]["Enums"]["creator_tag"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          followers?: number | null
          handle: string
          id?: string
          niche?: string | null
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          tag?: Database["public"]["Enums"]["creator_tag"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          followers?: number | null
          handle?: string
          id?: string
          niche?: string | null
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          tag?: Database["public"]["Enums"]["creator_tag"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          entitlement: Database["public"]["Enums"]["entitlement"]
          ghost_threshold_days: number
          id: string
          onboarded_at: string | null
          shop_name: string | null
        }
        Insert: {
          created_at?: string
          entitlement?: Database["public"]["Enums"]["entitlement"]
          ghost_threshold_days?: number
          id: string
          onboarded_at?: string | null
          shop_name?: string | null
        }
        Update: {
          created_at?: string
          entitlement?: Database["public"]["Enums"]["entitlement"]
          ghost_threshold_days?: number
          id?: string
          onboarded_at?: string | null
          shop_name?: string | null
        }
        Relationships: []
      }
      threads: {
        Row: {
          closed_at: string | null
          content_due_date: string | null
          created_at: string
          creator_id: string
          gmv: number | null
          gmv_logged_at: string | null
          id: string
          posted_at: string | null
          posted_url: string | null
          product: string
          sample_cost: number
          ship_date: string | null
          status: Database["public"]["Enums"]["thread_status"]
          status_changed_at: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          content_due_date?: string | null
          created_at?: string
          creator_id: string
          gmv?: number | null
          gmv_logged_at?: string | null
          id?: string
          posted_at?: string | null
          posted_url?: string | null
          product: string
          sample_cost?: number
          ship_date?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          status_changed_at?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          content_due_date?: string | null
          created_at?: string
          creator_id?: string
          gmv?: number | null
          gmv_logged_at?: string | null
          id?: string
          posted_at?: string | null
          posted_url?: string | null
          product?: string
          sample_cost?: number
          ship_date?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          status_changed_at?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_stats"
            referencedColumns: ["creator_id"]
          },
          {
            foreignKeyName: "threads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      creator_stats: {
        Row: {
          creator_id: string | null
          ghosted_count: number | null
          is_ghost: boolean | null
          net_roi: number | null
          posts: number | null
          roi_multiple: number | null
          samples_sent: number | null
          total_cost: number | null
          total_gmv: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_report: {
        Row: {
          ghosted: number | null
          month: string | null
          net_roi: number | null
          posts: number | null
          samples_sent: number | null
          total_cost: number | null
          total_gmv: number | null
          user_id: string | null
        }
        Relationships: []
      }
      thread_flags: {
        Row: {
          days_overdue: number | null
          is_stalled: boolean | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          days_overdue?: never
          is_stalled?: never
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          days_overdue?: never
          is_stalled?: never
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      creator_tag: "reinvest" | "blocklist"
      entitlement: "free" | "pro" | "founder"
      platform: "tiktok_shop" | "shopee" | "other"
      thread_status:
        | "requested"
        | "approved"
        | "shipped"
        | "delivered"
        | "content_due"
        | "posted"
        | "gmv_logged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      creator_tag: ["reinvest", "blocklist"],
      entitlement: ["free", "pro", "founder"],
      platform: ["tiktok_shop", "shopee", "other"],
      thread_status: [
        "requested",
        "approved",
        "shipped",
        "delivered",
        "content_due",
        "posted",
        "gmv_logged",
      ],
    },
  },
} as const
