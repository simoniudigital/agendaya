export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'employee'
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          slot_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          slug: string
          logo_url?: string | null
          slot_duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          slot_duration?: number
          created_at?: string
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          id: string
          weekday: number
          open_time: string | null
          close_time: string | null
          is_open: boolean
        }
        Insert: {
          id?: string
          weekday: number
          open_time?: string | null
          close_time?: string | null
          is_open?: boolean
        }
        Update: {
          id?: string
          weekday?: number
          open_time?: string | null
          close_time?: string | null
          is_open?: boolean
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_min: number
          price: number
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_min: number
          price: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_min?: number
          price?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string
          employee_id: string | null
          starts_at: string
          ends_at: string
          status: AppointmentStatus
          cancel_token: string
          notes: string | null
          send_reminder: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          employee_id?: string | null
          starts_at: string
          ends_at: string
          status?: AppointmentStatus
          cancel_token?: string
          notes?: string | null
          send_reminder?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          employee_id?: string | null
          starts_at?: string
          ends_at?: string
          status?: AppointmentStatus
          cancel_token?: string
          notes?: string | null
          send_reminder?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      book_appointment: {
        Args: {
          p_client_id: string
          p_service_id: string
          p_employee_id: string | null
          p_starts_at: string
          p_ends_at: string
          p_notes: string | null
          p_send_reminder: boolean
        }
        Returns: {
          id: string
          client_id: string
          service_id: string
          employee_id: string | null
          starts_at: string
          ends_at: string
          status: AppointmentStatus
          cancel_token: string
          notes: string | null
          send_reminder: boolean
          created_at: string
        }
      }
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      appointment_status: AppointmentStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BusinessSettings = Database['public']['Tables']['business_settings']['Row']
export type BusinessHours = Database['public']['Tables']['business_hours']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']

export type AppointmentWithDetails = Appointment & {
  client: Client | null
  service: Service | null
  employee: Profile | null
}
