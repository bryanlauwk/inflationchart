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
      food_prices: {
        Row: {
          created_at: string | null
          date: string
          fetched_at: string | null
          id: string
          item: string
          mapping_version: string | null
          observation_count: number | null
          price_rm: number
          source_file_month: string | null
          source_type: string
          source_url: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          fetched_at?: string | null
          id?: string
          item: string
          mapping_version?: string | null
          observation_count?: number | null
          price_rm: number
          source_file_month?: string | null
          source_type?: string
          source_url?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          fetched_at?: string | null
          id?: string
          item?: string
          mapping_version?: string | null
          observation_count?: number | null
          price_rm?: number
          source_file_month?: string | null
          source_type?: string
          source_url?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      indicators: {
        Row: {
          date: string
          id: string
          type: string
          value: number
        }
        Insert: {
          date: string
          id?: string
          type: string
          value: number
        }
        Update: {
          date?: string
          id?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          action: string
          checkpoint: Json
          created_at: string
          duration_ms: number | null
          error: string | null
          function_name: string
          id: string
          newest_source_date: string | null
          rows_quarantined: number
          rows_upserted: number
          source_month: string | null
          source_type: string | null
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action: string
          checkpoint?: Json
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          function_name: string
          id?: string
          newest_source_date?: string | null
          rows_quarantined?: number
          rows_upserted?: number
          source_month?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action?: string
          checkpoint?: Json
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          function_name?: string
          id?: string
          newest_source_date?: string | null
          rows_quarantined?: number
          rows_upserted?: number
          source_month?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quarantined_prices: {
        Row: {
          created_at: string | null
          date: string
          id: string
          item: string
          price_rm: number
          reason: string
          resolved: boolean | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          item: string
          price_rm: number
          reason: string
          resolved?: boolean | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          item?: string
          price_rm?: number
          reason?: string
          resolved?: boolean | null
        }
        Relationships: []
      }
      sanity_check_results: {
        Row: {
          ai_audit: string | null
          citations: Json | null
          cpi_date: string | null
          cpi_value: number | null
          created_at: string | null
          data_date: string
          id: string
          internal_error_count: number | null
          internal_flags: Json | null
          internal_warn_count: number | null
          item_count: number
          passed: boolean | null
          quarantined_items: Json | null
        }
        Insert: {
          ai_audit?: string | null
          citations?: Json | null
          cpi_date?: string | null
          cpi_value?: number | null
          created_at?: string | null
          data_date: string
          id?: string
          internal_error_count?: number | null
          internal_flags?: Json | null
          internal_warn_count?: number | null
          item_count?: number
          passed?: boolean | null
          quarantined_items?: Json | null
        }
        Update: {
          ai_audit?: string | null
          citations?: Json | null
          cpi_date?: string | null
          cpi_value?: number | null
          created_at?: string | null
          data_date?: string
          id?: string
          internal_error_count?: number | null
          internal_flags?: Json | null
          internal_warn_count?: number | null
          item_count?: number
          passed?: boolean | null
          quarantined_items?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      monthly_indicators: {
        Row: {
          last_observed: string | null
          month: string | null
          observations: number | null
          type: string | null
          value: number | null
        }
        Relationships: []
      }
      monthly_item_prices: {
        Row: {
          avg_price_rm: number | null
          first_observed: string | null
          item: string | null
          last_observed: string | null
          max_price_rm: number | null
          min_price_rm: number | null
          month: string | null
          observed_days: number | null
          sourced_rows: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      verify_pipeline_cron_secret: {
        Args: { candidate: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
