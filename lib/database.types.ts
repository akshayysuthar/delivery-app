export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number;
          user_uuid: string; // This is fine as-is
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_uuid: string; // This is fine as-is
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_uuid?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      Insert: {
        id?: string;
        name: string;
        slug: string;
        image?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        slug?: string;
        image?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [];
    };
    products: {
      Row: {
        id: number;
        name: string;
        description: string | null;
        price: number;
        sale_price: number | null;
        image: string | null;
        category_id: number | null;
        in_stock: boolean;
        stock_quantity: number;
        unit: string;
        created_at: string;
        updated_at: string;
        product_code?: string; // If added
      };
      Insert: {
        id?: string;
        name: string;
        description?: string | null;
        price: number;
        sale_price?: number | null;
        image?: string | null;
        category_id?: string | null;
        in_stock?: boolean;
        stock_quantity?: number;
        unit?: string;
        created_at?: string;
        updated_at?: string;
        product_code?: string;
      };
      Update: {
        id?: string;
        name?: string;
        description?: string | null;
        price?: number;
        sale_price?: number | null;
        image?: string | null;
        category_id?: string | null;
        in_stock?: boolean;
        stock_quantity?: number;
        unit?: string;
        created_at?: string;
        updated_at?: string;
        product_code?: string;
      };
      Relationships: [
        {
          foreignKeyName: "products_category_id_fkey";
          columns: ["category_id"];
          referencedRelation: "categories";
          referencedColumns: ["id"];
        }
      ];
    };
    addresses: {
      Row: {
        id: string;
        user_id: string; // References profiles.user_uuid (Clerk ID)
        address_line1: string;
        address_line2: string | null;
        city: string;
        state: string;
        pincode: string;
        landmark: string | null;
        latitude: number | null;
        longitude: number | null;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        address_line1: string;
        address_line2?: string | null;
        city: string;
        state: string;
        pincode: string;
        landmark?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        is_default?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        address_line1?: string;
        address_line2?: string | null;
        city?: string;
        state?: string;
        pincode?: string;
        landmark?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        is_default?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [
        { columns: ["user_id"]; referencedColumns: ["user_uuid"] }
      ];
    };
    service_areas: {
      Row: {
        id: string;
        name: string;
        pincodes: string[];
        is_active: boolean;
        delivery_fee: number;
        min_order_free_delivery: number;
        delivery_time_minutes: number;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        pincodes: string[];
        is_active?: boolean;
        delivery_fee?: number;
        min_order_free_delivery?: number;
        delivery_time_minutes?: number;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        pincodes?: string[];
        is_active?: boolean;
        delivery_fee?: number;
        min_order_free_delivery?: number;
        delivery_time_minutes?: number;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [];
    };
    delivery_slots: {
      Row: {
        id: string;
        service_area_id: string;
        start_time: string;
        end_time: string;
        max_orders: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        service_area_id: string;
        start_time: string;
        end_time: string;
        max_orders?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        service_area_id?: string;
        start_time?: string;
        end_time?: string;
        max_orders?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [
        {
          foreignKeyName: "delivery_slots_service_area_id_fkey";
          columns: ["service_area_id"];
          referencedRelation: "service_areas";
          referencedColumns: ["id"];
        }
      ];
    };
    slot_bookings: {
      Row: {
        id: string;
        delivery_slot_id: string;
        delivery_date: string;
        orders_count: number;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        delivery_slot_id: string;
        delivery_date: string;
        orders_count?: number;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        delivery_slot_id?: string;
        delivery_date?: string;
        orders_count?: number;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [
        {
          foreignKeyName: "slot_bookings_delivery_slot_id_fkey";
          columns: ["delivery_slot_id"];
          referencedRelation: "delivery_slots";
          referencedColumns: ["id"];
        }
      ];
    };
    orders: {
      Row: {
        id: string;
        user_id: string | null; // References profiles.user_uuid (Clerk ID)
        address_id: string | null;
        delivery_slot_id: string | null;
        delivery_date: string | null;
        total_amount: number;
        delivery_fee: number;
        status: string;
        payment_method: string;
        payment_status: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        user_id?: string | null;
        address_id?: string | null;
        delivery_slot_id?: string | null;
        delivery_date?: string | null;
        total_amount: number;
        delivery_fee?: number;
        status?: string;
        payment_method?: string;
        payment_status?: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string | null;
        address_id?: string | null;
        delivery_slot_id?: string | null;
        delivery_date?: string | null;
        total_amount?: number;
        delivery_fee?: number;
        status?: string;
        payment_method?: string;
        payment_status?: string;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [
        {
          foreignKeyName: "orders_user_id_fkey";
          columns: ["user_id"];
          referencedRelation: "profiles";
          referencedColumns: ["user_uuid"]; // Updated to user_uuid
        },
        {
          foreignKeyName: "orders_address_id_fkey";
          columns: ["address_id"];
          referencedRelation: "addresses";
          referencedColumns: ["id"];
        },
        {
          foreignKeyName: "orders_delivery_slot_id_fkey";
          columns: ["delivery_slot_id"];
          referencedRelation: "delivery_slots";
          referencedColumns: ["id"];
        }
      ];
    };
    order_items: {
      Row: {
        id: string;
        order_id: string;
        product_id: string | null;
        quantity: number;
        price: number;
        created_at: string;
        updated_at: string;
        delivery_slot_id: string;
        delivery_date: string;
      };
      Insert: {
        id?: string;
        order_id: string;
        product_id?: string | null;
        quantity: number;
        price: number;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        order_id?: string;
        product_id?: string | null;
        quantity?: number;
        price?: number;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [
        {
          foreignKeyName: "order_items_order_id_fkey";
          columns: ["order_id"];
          referencedRelation: "orders";
          referencedColumns: ["id"];
        },
        {
          foreignKeyName: "order_items_product_id_fkey";
          columns: ["product_id"];
          referencedRelation: "products";
          referencedColumns: ["id"];
        }
      ];
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
}
