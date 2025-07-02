export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          last_reminder_sent: string | null
          location: string | null
          reminder_enabled: boolean | null
          reminder_minutes_before: number | null
          reminder_sent: boolean | null
          start_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string
          id?: string
          last_reminder_sent?: string | null
          location?: string | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          reminder_sent?: boolean | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          last_reminder_sent?: string | null
          location?: string | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_attachments: {
        Row: {
          created_at: string
          experiment_id: string
          file_path: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experiment_id: string
          file_path: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experiment_id?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_attachments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_ideas: {
        Row: {
          budget_estimate: string | null
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          estimated_duration: string | null
          expected_outcomes: string | null
          hypothesis: string | null
          id: string
          methodology: string | null
          priority: string
          required_materials: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_estimate?: string | null
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          expected_outcomes?: string | null
          hypothesis?: string | null
          id?: string
          methodology?: string | null
          priority?: string
          required_materials?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_estimate?: string | null
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_duration?: string | null
          expected_outcomes?: string | null
          hypothesis?: string | null
          id?: string
          methodology?: string | null
          priority?: string
          required_materials?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_note_attachments: {
        Row: {
          created_at: string
          file_content: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          note_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_content?: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          note_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_content?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          note_id?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_note_protocols: {
        Row: {
          attached_at: string
          id: string
          note_id: string
          notes: string | null
          protocol_id: string
          user_id: string
        }
        Insert: {
          attached_at?: string
          id?: string
          note_id: string
          notes?: string | null
          protocol_id: string
          user_id: string
        }
        Update: {
          attached_at?: string
          id?: string
          note_id?: string
          notes?: string | null
          protocol_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_experiment_note_protocols_note"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "experiment_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_experiment_note_protocols_protocol"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_notes: {
        Row: {
          content: string | null
          created_at: string
          experiment_id: string
          folder_id: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          experiment_id: string
          folder_id?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          experiment_id?: string
          folder_id?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_notes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_protocols: {
        Row: {
          attached_at: string
          experiment_id: string
          id: string
          notes: string | null
          protocol_id: string
          user_id: string
        }
        Insert: {
          attached_at?: string
          experiment_id: string
          id?: string
          notes?: string | null
          protocol_id: string
          user_id: string
        }
        Update: {
          attached_at?: string
          experiment_id?: string
          id?: string
          notes?: string | null
          protocol_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_experiment_protocols_experiment"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_experiment_protocols_protocol"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          end_date: string | null
          folder_id: string | null
          id: string
          progress: number
          project_id: string | null
          protocols: number
          researcher: string
          samples: number
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          folder_id?: string | null
          id?: string
          progress?: number
          project_id?: string | null
          protocols?: number
          researcher: string
          samples?: number
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          folder_id?: string | null
          id?: string
          progress?: number
          project_id?: string | null
          protocols?: number
          researcher?: string
          samples?: number
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          idea_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          idea_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          idea_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_notes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "experiment_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          cost: string | null
          created_at: string
          current_stock: number
          expiry_date: string | null
          id: string
          last_ordered: string | null
          location: string | null
          max_stock: number
          min_stock: number
          name: string
          status: string
          supplier: string
          unit: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category: string
          cost?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          last_ordered?: string | null
          location?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          status?: string
          supplier: string
          unit?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          cost?: string | null
          created_at?: string
          current_stock?: number
          expiry_date?: string | null
          id?: string
          last_ordered?: string | null
          location?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          status?: string
          supplier?: string
          unit?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      label_templates: {
        Row: {
          created_at: string
          height_mm: number
          id: string
          is_default: boolean
          name: string
          size: string
          type: string
          updated_at: string
          user_id: string
          width_mm: number
        }
        Insert: {
          created_at?: string
          height_mm?: number
          id?: string
          is_default?: boolean
          name: string
          size: string
          type: string
          updated_at?: string
          user_id: string
          width_mm?: number
        }
        Update: {
          created_at?: string
          height_mm?: number
          id?: string
          is_default?: boolean
          name?: string
          size?: string
          type?: string
          updated_at?: string
          user_id?: string
          width_mm?: number
        }
        Relationships: []
      }
      labels: {
        Row: {
          barcode_data: string | null
          created_at: string
          date: string | null
          id: string
          notes: string | null
          quantity: number
          researcher: string | null
          subtitle: string | null
          template_name: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode_data?: string | null
          created_at?: string
          date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          researcher?: string | null
          subtitle?: string | null
          template_name: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode_data?: string | null
          created_at?: string
          date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          researcher?: string | null
          subtitle?: string | null
          template_name?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: string | null
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          end_date: string | null
          experiments_count: number
          id: string
          progress: number
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: string | null
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          experiments_count?: number
          id?: string
          progress?: number
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: string | null
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          experiments_count?: number
          id?: string
          progress?: number
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_template: boolean
          title: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_template?: boolean
          title: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_template?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          author: string
          created_at: string
          description: string | null
          downloads: number
          format: string
          id: string
          size: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          created_at?: string
          description?: string | null
          downloads?: number
          format?: string
          id?: string
          size?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          description?: string | null
          downloads?: number
          format?: string
          id?: string
          size?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string
          category: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          last_reminder_sent: string | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee: string
          category: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          last_reminder_sent?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee?: string
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          last_reminder_sent?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar: string | null
          created_at: string
          current_projects: number
          department: string
          email: string
          experiments_completed: number
          expertise: string[]
          id: string
          join_date: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          current_projects?: number
          department: string
          email: string
          experiments_completed?: number
          expertise?: string[]
          id?: string
          join_date: string
          name: string
          phone?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          current_projects?: number
          department?: string
          email?: string
          experiments_completed?: number
          expertise?: string[]
          id?: string
          join_date?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          hidden_pages: string[] | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_pages?: string[] | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_pages?: string[] | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_calendar_reminders: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
