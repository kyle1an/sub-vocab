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
      derivation: {
        Row: {
          derivation_type: number | null
          derived_word: string
          is_valid: boolean | null
          stem_word: string
          tense: string | null
        }
        Insert: {
          derivation_type?: number | null
          derived_word: string
          is_valid?: boolean | null
          stem_word: string
          tense?: string | null
        }
        Update: {
          derivation_type?: number | null
          derived_word?: string
          is_valid?: boolean | null
          stem_word?: string
          tense?: string | null
        }
        Relationships: []
      }
      derivation_class: {
        Row: {
          derivation_type: string | null
          type_id: number
        }
        Insert: {
          derivation_type?: string | null
          type_id: number
        }
        Update: {
          derivation_type?: string | null
          type_id?: number
        }
        Relationships: []
      }
      derivation_tense: {
        Row: {
          id: number
          tense: string
        }
        Insert: {
          id: number
          tense: string
        }
        Update: {
          id?: number
          tense?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          username: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          username?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      tag: {
        Row: {
          id: number
          is_enabled: number | null
          tag_name: string | null
        }
        Insert: {
          id: number
          is_enabled?: number | null
          tag_name?: string | null
        }
        Update: {
          id?: number
          is_enabled?: number | null
          tag_name?: string | null
        }
        Relationships: []
      }
      tag_word: {
        Row: {
          id: number
          tag: number | null
          word: string | null
        }
        Insert: {
          id: number
          tag?: number | null
          word?: string | null
        }
        Update: {
          id?: number
          tag?: number | null
          word?: string | null
        }
        Relationships: []
      }
      user_cookies: {
        Row: {
          active: boolean
          created_at: string | null
          id: number
          token: string | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          active: boolean
          created_at?: string | null
          id: number
          token?: string | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: number
          token?: string | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: []
      }
      user_vocab_record: {
        Row: {
          acquainted: boolean | null
          id: number
          time_created: string
          time_modified: string
          user_id: string
          vocabulary: string
        }
        Insert: {
          acquainted?: boolean | null
          id?: number
          time_created?: string
          time_modified?: string
          user_id: string
          vocabulary: string
        }
        Update: {
          acquainted?: boolean | null
          id?: number
          time_created?: string
          time_modified?: string
          user_id?: string
          vocabulary?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_vocab_record_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      vocabulary_list: {
        Row: {
          created_at: string
          id: number
          is_user: boolean | null
          original: boolean | null
          share: boolean | null
          time_modified: string
          word: string
          word_rank: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_user?: boolean | null
          original?: boolean | null
          share?: boolean | null
          time_modified?: string
          word: string
          word_rank?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          is_user?: boolean | null
          original?: boolean | null
          share?: boolean | null
          time_modified?: string
          word?: string
          word_rank?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user: {
        Args: {
          username: string
          email: string
          password: string
          created_at: string
          updated_at: string
          last_sign_in_at: string
        }
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

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
  PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
