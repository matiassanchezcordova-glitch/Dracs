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
      centers: {
        Row: {
          address: string | null
          city: string
          created_at: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      child_assignments: {
        Row: {
          assigned_by: string
          categories: string[]
          child_id: string
          created_at: string | null
          difficulty_max: number
          difficulty_min: number
          exercises_per_session: number
          id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by: string
          categories?: string[]
          child_id: string
          created_at?: string | null
          difficulty_max?: number
          difficulty_min?: number
          exercises_per_session?: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string
          categories?: string[]
          child_id?: string
          created_at?: string | null
          difficulty_max?: number
          difficulty_min?: number
          exercises_per_session?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_assignments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_assignments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_family_view"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          clinical_notes: string | null
          created_at: string | null
          family_id: string | null
          family_notes: string | null
          full_name: string
          id: string
          therapist_id: string
        }
        Insert: {
          birth_date: string
          clinical_notes?: string | null
          created_at?: string | null
          family_id?: string | null
          family_notes?: string | null
          full_name: string
          id?: string
          therapist_id: string
        }
        Update: {
          birth_date?: string
          clinical_notes?: string | null
          created_at?: string | null
          family_id?: string | null
          family_notes?: string | null
          full_name?: string
          id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          audio_url: string | null
          category: string
          content: Json
          created_at: string | null
          difficulty: number
          id: string
          prompt: string
          title: string
          type: string
        }
        Insert: {
          audio_url?: string | null
          category: string
          content: Json
          created_at?: string | null
          difficulty: number
          id?: string
          prompt: string
          title: string
          type: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          content?: Json
          created_at?: string | null
          difficulty?: number
          id?: string
          prompt?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      link_requests: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          status: string | null
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          status?: string | null
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          status?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_requests_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          center_name: string | null
          child_age: number
          child_name: string
          created_at: string | null
          current_level: number | null
          diagnosis: string | null
          id: string
          notes: string | null
          profile_id: string | null
          streak_days: number | null
          therapist_id: string | null
        }
        Insert: {
          center_name?: string | null
          child_age: number
          child_name: string
          created_at?: string | null
          current_level?: number | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          streak_days?: number | null
          therapist_id?: string | null
        }
        Update: {
          center_name?: string | null
          child_age?: number
          child_name?: string
          created_at?: string | null
          current_level?: number | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          streak_days?: number | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      session_exercises: {
        Row: {
          answered_correctly: boolean | null
          attempts_count: number | null
          exercise_id: string
          id: string
          order_index: number
          session_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answered_correctly?: boolean | null
          attempts_count?: number | null
          exercise_id: string
          id?: string
          order_index: number
          session_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answered_correctly?: boolean | null
          attempts_count?: number | null
          exercise_id?: string
          id?: string
          order_index?: number
          session_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          child_id: string
          correct_count: number
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          total_exercises: number
        }
        Insert: {
          child_id: string
          correct_count?: number
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          total_exercises?: number
        }
        Update: {
          child_id?: string
          correct_count?: number
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          total_exercises?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_family_view"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          patient_id: string
          therapist_id: string
          week_code: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          patient_id: string
          therapist_id: string
          week_code: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          therapist_id?: string
          week_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_comments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_comments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          center_name: string
          city: string
          created_at: string | null
          id: string
          license_number: string
          max_patients: number | null
          profile_id: string | null
          specialty: string
        }
        Insert: {
          center_name: string
          city: string
          created_at?: string | null
          id?: string
          license_number: string
          max_patients?: number | null
          profile_id?: string | null
          specialty: string
        }
        Update: {
          center_name?: string
          city?: string
          created_at?: string | null
          id?: string
          license_number?: string
          max_patients?: number | null
          profile_id?: string | null
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      children_family_view: {
        Row: {
          birth_date: string | null
          created_at: string | null
          family_id: string | null
          family_notes: string | null
          full_name: string | null
          id: string | null
          therapist_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          family_notes?: string | null
          full_name?: string | null
          id?: string | null
          therapist_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          family_notes?: string | null
          full_name?: string | null
          id?: string | null
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_user_related_to_child: {
        Args: { p_child_id: string }
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
