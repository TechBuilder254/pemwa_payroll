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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      employees: {
        Row: {
          allowances: Json
          basic_salary: number
          created_at: string
          employee_id: string
          helb_amount: number
          id: string
          kra_pin: string
          name: string
          position: string
          updated_at: string
          voluntary_deductions: Json
        }
        Insert: {
          allowances?: Json
          basic_salary?: number
          created_at?: string
          employee_id: string
          helb_amount?: number
          id?: string
          kra_pin: string
          name: string
          position: string
          updated_at?: string
          voluntary_deductions?: Json
        }
        Update: {
          allowances?: Json
          basic_salary?: number
          created_at?: string
          employee_id?: string
          helb_amount?: number
          id?: string
          kra_pin?: string
          name?: string
          position?: string
          updated_at?: string
          voluntary_deductions?: Json
        }
        Relationships: []
      }
      p9_records: {
        Row: {
          ahl_employee_total: number
          ahl_employer_total: number
          allowances_total: number
          basic_salary_total: number
          created_at: string
          employee_id: string
          gross_salary_total: number
          helb_total: number
          id: string
          net_salary_total: number
          nssf_employee_total: number
          nssf_employer_total: number
          paye_total: number
          shif_employee_total: number
          shif_employer_total: number
          total_employer_cost: number
          voluntary_deductions_total: number
          year: number
        }
        Insert: {
          ahl_employee_total: number
          ahl_employer_total: number
          allowances_total: number
          basic_salary_total: number
          created_at?: string
          employee_id: string
          gross_salary_total: number
          helb_total: number
          id?: string
          net_salary_total: number
          nssf_employee_total: number
          nssf_employer_total: number
          paye_total: number
          shif_employee_total: number
          shif_employer_total: number
          total_employer_cost: number
          voluntary_deductions_total: number
          year: number
        }
        Update: {
          ahl_employee_total?: number
          ahl_employer_total?: number
          allowances_total?: number
          basic_salary_total?: number
          created_at?: string
          employee_id?: string
          gross_salary_total?: number
          helb_total?: number
          id?: string
          net_salary_total?: number
          nssf_employee_total?: number
          nssf_employer_total?: number
          paye_total?: number
          shif_employee_total?: number
          shif_employer_total?: number
          total_employer_cost?: number
          voluntary_deductions_total?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "p9_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          ahl_employee: number
          ahl_employer: number
          allowances_total: number
          basic_salary: number
          bonuses: number
          created_at: string
          employee_id: string
          gross_salary: number
          helb: number
          id: string
          month: string
          net_salary: number
          nssf_employee: number
          nssf_employer: number
          overtime: number
          paye_after_relief: number
          paye_before_relief: number
          personal_relief: number
          shif_employee: number
          shif_employer: number
          total_deductions: number
          total_employer_cost: number
          voluntary_deductions_total: number
        }
        Insert: {
          ahl_employee: number
          ahl_employer: number
          allowances_total: number
          basic_salary: number
          bonuses: number
          created_at?: string
          employee_id: string
          gross_salary: number
          helb: number
          id?: string
          month: string
          net_salary: number
          nssf_employee: number
          nssf_employer: number
          overtime: number
          paye_after_relief: number
          paye_before_relief: number
          personal_relief: number
          shif_employee: number
          shif_employer: number
          total_deductions: number
          total_employer_cost: number
          voluntary_deductions_total: number
        }
        Update: {
          ahl_employee?: number
          ahl_employer?: number
          allowances_total?: number
          basic_salary?: number
          bonuses?: number
          created_at?: string
          employee_id?: string
          gross_salary?: number
          helb?: number
          id?: string
          month?: string
          net_salary?: number
          nssf_employee?: number
          nssf_employer?: number
          overtime?: number
          paye_after_relief?: number
          paye_before_relief?: number
          personal_relief?: number
          shif_employee?: number
          shif_employer?: number
          total_deductions?: number
          total_employer_cost?: number
          voluntary_deductions_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          period_month: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period_month: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period_month?: string
        }
        Relationships: []
      }
      payroll_settings: {
        Row: {
          ahl_employee_rate: number
          ahl_employer_rate: number
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          nssf_employee_rate: number
          nssf_employer_rate: number
          nssf_max_contribution: number
          paye_brackets: Json
          personal_relief: number
          shif_employee_rate: number
          shif_employer_rate: number
        }
        Insert: {
          ahl_employee_rate: number
          ahl_employer_rate: number
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          nssf_employee_rate: number
          nssf_employer_rate: number
          nssf_max_contribution: number
          paye_brackets: Json
          personal_relief: number
          shif_employee_rate: number
          shif_employer_rate: number
        }
        Update: {
          ahl_employee_rate?: number
          ahl_employer_rate?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          nssf_employee_rate?: number
          nssf_employer_rate?: number
          nssf_max_contribution?: number
          paye_brackets?: Json
          personal_relief?: number
          shif_employee_rate?: number
          shif_employer_rate?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          name: string
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          name: string
          password_hash: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_payslips: {
        Row: {
          ahl_employee: number | null
          ahl_employer: number | null
          allowances_total: number | null
          basic_salary: number | null
          bonuses: number | null
          created_at: string | null
          employee_id: string | null
          employee_name: string | null
          employee_uuid: string | null
          gross_salary: number | null
          helb: number | null
          id: string | null
          month: string | null
          net_salary: number | null
          nssf_employee: number | null
          nssf_employer: number | null
          overtime: number | null
          paye_after_relief: number | null
          paye_before_relief: number | null
          personal_relief: number | null
          shif_employee: number | null
          shif_employer: number | null
          total_deductions: number | null
          total_employer_cost: number | null
          voluntary_deductions_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_payroll_settings: {
        Args: { target_id: string }
        Returns: undefined
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