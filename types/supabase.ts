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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      "OP Database": {
        Row: {
          apr: string | null
          apr_cases: string | null
          aug: string | null
          aug_cases: string | null
          brand: string | null
          category: string | null
          coa_code: string | null
          dec: string | null
          dec_cases: string | null
          district: string | null
          div_sub: string | null
          division: string | null
          feb: string | null
          feb_cases: string | null
          item_description: string | null
          jan: string | null
          jan_cases: string | null
          jul: string | null
          july_cases: string | null
          jun: string | null
          jun_cases: string | null
          list_price: string | null
          location: string | null
          main_sku: string | null
          mar: string | null
          mar_cases: string | null
          may: string | null
          may_cases: string | null
          measure: string | null
          nov: string | null
          nov_cases: string | null
          oct: string | null
          oct_cases: string | null
          oracle_category: string | null
          product_category: string | null
          q1_cases: string | null
          q2_cases: string | null
          q3_cases: string | null
          q4_cases: string | null
          qtd_sales: string | null
          qtr_1_sales: string | null
          qtr_2_sales: string | null
          qtr_3_sales: string | null
          qtr_4_sales: string | null
          sep: string | null
          sept_cases: string | null
          sku: string | null
          "sub-brand": string | null
          total_cases: string | null
          total_sales: string | null
          year: number | null
          ytd_cases: string | null
          ytd_sales: string | null
        }
        Insert: {
          apr?: string | null
          apr_cases?: string | null
          aug?: string | null
          aug_cases?: string | null
          brand?: string | null
          category?: string | null
          coa_code?: string | null
          dec?: string | null
          dec_cases?: string | null
          district?: string | null
          div_sub?: string | null
          division?: string | null
          feb?: string | null
          feb_cases?: string | null
          item_description?: string | null
          jan?: string | null
          jan_cases?: string | null
          jul?: string | null
          july_cases?: string | null
          jun?: string | null
          jun_cases?: string | null
          list_price?: string | null
          location?: string | null
          main_sku?: string | null
          mar?: string | null
          mar_cases?: string | null
          may?: string | null
          may_cases?: string | null
          measure?: string | null
          nov?: string | null
          nov_cases?: string | null
          oct?: string | null
          oct_cases?: string | null
          oracle_category?: string | null
          product_category?: string | null
          q1_cases?: string | null
          q2_cases?: string | null
          q3_cases?: string | null
          q4_cases?: string | null
          qtd_sales?: string | null
          qtr_1_sales?: string | null
          qtr_2_sales?: string | null
          qtr_3_sales?: string | null
          qtr_4_sales?: string | null
          sep?: string | null
          sept_cases?: string | null
          sku?: string | null
          "sub-brand"?: string | null
          total_cases?: string | null
          total_sales?: string | null
          year?: number | null
          ytd_cases?: string | null
          ytd_sales?: string | null
        }
        Update: {
          apr?: string | null
          apr_cases?: string | null
          aug?: string | null
          aug_cases?: string | null
          brand?: string | null
          category?: string | null
          coa_code?: string | null
          dec?: string | null
          dec_cases?: string | null
          district?: string | null
          div_sub?: string | null
          division?: string | null
          feb?: string | null
          feb_cases?: string | null
          item_description?: string | null
          jan?: string | null
          jan_cases?: string | null
          jul?: string | null
          july_cases?: string | null
          jun?: string | null
          jun_cases?: string | null
          list_price?: string | null
          location?: string | null
          main_sku?: string | null
          mar?: string | null
          mar_cases?: string | null
          may?: string | null
          may_cases?: string | null
          measure?: string | null
          nov?: string | null
          nov_cases?: string | null
          oct?: string | null
          oct_cases?: string | null
          oracle_category?: string | null
          product_category?: string | null
          q1_cases?: string | null
          q2_cases?: string | null
          q3_cases?: string | null
          q4_cases?: string | null
          qtd_sales?: string | null
          qtr_1_sales?: string | null
          qtr_2_sales?: string | null
          qtr_3_sales?: string | null
          qtr_4_sales?: string | null
          sep?: string | null
          sept_cases?: string | null
          sku?: string | null
          "sub-brand"?: string | null
          total_cases?: string | null
          total_sales?: string | null
          year?: number | null
          ytd_cases?: string | null
          ytd_sales?: string | null
        }
        Relationships: []
      }
      product_data: {
        Row: {
          brand: string | null
          category: string | null
          coa_code: string | null
          created_at: string | null
          district: string | null
          div_sub: string | null
          division: string | null
          id: string
          innovation_vs_legacy: string | null
          item_description: string | null
          launch_year: number | null
          location: string | null
          main_sku: string | null
          measure: string | null
          month: string | null
          oracle_category: string | null
          product_category_old: string | null
          sales: number | null
          sku: string | null
          sub_brand: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          coa_code?: string | null
          created_at?: string | null
          district?: string | null
          div_sub?: string | null
          division?: string | null
          id?: string
          innovation_vs_legacy?: string | null
          item_description?: string | null
          launch_year?: number | null
          location?: string | null
          main_sku?: string | null
          measure?: string | null
          month?: string | null
          oracle_category?: string | null
          product_category_old?: string | null
          sales?: number | null
          sku?: string | null
          sub_brand?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          coa_code?: string | null
          created_at?: string | null
          district?: string | null
          div_sub?: string | null
          division?: string | null
          id?: string
          innovation_vs_legacy?: string | null
          item_description?: string | null
          launch_year?: number | null
          location?: string | null
          main_sku?: string | null
          measure?: string | null
          month?: string | null
          oracle_category?: string | null
          product_category_old?: string | null
          sales?: number | null
          sku?: string | null
          sub_brand?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_filter_options: { Args: { column_name: string }; Returns: string[] }
      get_filtered_brands: {
        Args: {
          p_category?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
        }
        Returns: {
          brand: string
        }[]
      }
      get_filtered_categories: {
        Args: {
          p_brand?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
        }
        Returns: {
          category: string
        }[]
      }
      get_filtered_locations: {
        Args: {
          p_brand?: string
          p_category?: string
          p_division?: string
          p_measure?: string
          p_month?: string
        }
        Returns: {
          location: string
        }[]
      }
      get_filtered_subbrands: {
        Args: {
          p_brand?: string
          p_category?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
        }
        Returns: {
          sub_brand: string
        }[]
      }
      get_sales_by_brand:
        | {
            Args: {
              p_category?: string
              p_division?: string
              p_location?: string
              p_month?: string
              p_target_measure: string
              p_time_view?: string
              p_value_measure: string
            }
            Returns: {
              brand: string
              target_measure: number
              value_measure: number
            }[]
          }
        | {
            Args: {
              p_category?: string
              p_division?: string
              p_location?: string
              p_month?: string
              p_target_measure: string
              p_target_measure_year: number
              p_time_view?: string
              p_value_measure: string
              p_value_measure_year: number
            }
            Returns: {
              brand: string
              target_measure: number
              value_measure: number
            }[]
          }
      get_sales_by_filters: {
        Args: {
          p_brand?: string
          p_category?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
          p_time_view?: string
        }
        Returns: number
      }
      get_sales_value_target: {
        Args: {
          p_brand?: string
          p_category?: string
          p_division?: string
          p_location?: string
          p_month?: string
          p_sub_brand?: string
          p_target_measure: string
          p_time_view?: string
          p_value_measure: string
        }
        Returns: {
          target_sales: number
          value_sales: number
        }[]
      }
      get_top_category_sales: {
        Args: {
          p_brand?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
          p_time_view?: string
          p_year?: string
        }
        Returns: {
          category: string
          sales: number
        }[]
      }
      get_top_subbrand_sales: {
        Args: {
          p_brand?: string
          p_category?: string
          p_division?: string
          p_location?: string
          p_measure?: string
          p_month?: string
          p_time_view?: string
          p_year?: string
        }
        Returns: {
          sales: number
          sub_brand: string
        }[]
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
    Enums: {},
  },
} as const
