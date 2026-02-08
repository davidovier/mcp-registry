export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor: string | null;
          created_at: string;
          details: Json | null;
          id: string;
        };
        Insert: {
          action: string;
          actor?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: string;
        };
        Update: {
          action?: string;
          actor?: string | null;
          created_at?: string;
          details?: Json | null;
          id?: string;
        };
        Relationships: [];
      };
      bootstrap_state: {
        Row: {
          created_at: string;
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      mcp_server_submissions: {
        Row: {
          created_at: string;
          id: string;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          schema_version: string | null;
          status: string;
          submitted_by: string;
          submitted_payload: Json;
          validation_errors: Json | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          schema_version?: string | null;
          status?: string;
          submitted_by: string;
          submitted_payload: Json;
          validation_errors?: Json | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          schema_version?: string | null;
          status?: string;
          submitted_by?: string;
          submitted_payload?: Json;
          validation_errors?: Json | null;
        };
        Relationships: [];
      };
      mcp_servers: {
        Row: {
          auth: string;
          capabilities: Json;
          created_at: string;
          description: string;
          docs_url: string | null;
          homepage_url: string | null;
          id: string;
          name: string;
          owner_id: string | null;
          repo_url: string | null;
          slug: string;
          tags: string[];
          transport: string;
          updated_at: string;
          verified: boolean;
        };
        Insert: {
          auth: string;
          capabilities?: Json;
          created_at?: string;
          description: string;
          docs_url?: string | null;
          homepage_url?: string | null;
          id?: string;
          name: string;
          owner_id?: string | null;
          repo_url?: string | null;
          slug: string;
          tags?: string[];
          transport: string;
          updated_at?: string;
          verified?: boolean;
        };
        Update: {
          auth?: string;
          capabilities?: Json;
          created_at?: string;
          description?: string;
          docs_url?: string | null;
          homepage_url?: string | null;
          id?: string;
          name?: string;
          owner_id?: string | null;
          repo_url?: string | null;
          slug?: string;
          tags?: string[];
          transport?: string;
          updated_at?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      verification_requests: {
        Row: {
          id: string;
          server_id: string;
          requested_by: string;
          status: string;
          request_notes: string | null;
          review_notes: string | null;
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          server_id: string;
          requested_by: string;
          status?: string;
          request_notes?: string | null;
          review_notes?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          server_id?: string;
          requested_by?: string;
          status?: string;
          request_notes?: string | null;
          review_notes?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_requests_server_id_fkey";
            columns: ["server_id"];
            isOneToOne: false;
            referencedRelation: "mcp_servers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_submission: {
        Args: { p_notes?: string; p_submission_id: string };
        Returns: Database["public"]["CompositeTypes"]["moderation_result"];
        SetofOptions: {
          from: "*";
          to: "moderation_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      approve_verification: {
        Args: { p_request_id: string; p_notes?: string };
        Returns: Database["public"]["CompositeTypes"]["verification_result"];
        SetofOptions: {
          from: "*";
          to: "verification_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_admin: { Args: never; Returns: boolean };
      reject_submission: {
        Args: { p_notes: string; p_submission_id: string };
        Returns: Database["public"]["CompositeTypes"]["moderation_result"];
        SetofOptions: {
          from: "*";
          to: "moderation_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      reject_verification: {
        Args: { p_request_id: string; p_notes: string };
        Returns: Database["public"]["CompositeTypes"]["verification_result"];
        SetofOptions: {
          from: "*";
          to: "verification_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      request_verification: {
        Args: { p_server_id: string; p_notes?: string };
        Returns: Database["public"]["CompositeTypes"]["verification_result"];
        SetofOptions: {
          from: "*";
          to: "verification_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      set_user_role: {
        Args: { p_new_role: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      moderation_result: {
        success: boolean | null;
        error_message: string | null;
        server_id: string | null;
      };
      verification_result: {
        success: boolean | null;
        error_message: string | null;
        request_id: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
