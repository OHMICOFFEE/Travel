export type Database = {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string
          created_at: string
          name: string
          location: string
          description: string
          price: number
          currency: string
          duration: string
          schedule: string
          points: number
          rating: number
          review_count: number
          image_url: string | null
          includes: string[]
          category: string
          featured: boolean
        }
        Insert: Omit<Database['public']['Tables']['destinations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['destinations']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          destination_id: string
          guests: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled'
          booking_date: string
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      wishlists: {
        Row: {
          id: string
          created_at: string
          user_id: string
          destination_id: string
        }
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Destination = Database['public']['Tables']['destinations']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
