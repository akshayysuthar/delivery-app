// supabase.types.ts
import type { Database } from "./database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface ProductWithCategory extends ProductRow {
  category: Database["public"]["Tables"]["categories"]["Row"] | null;
}

export interface CategoryWithProducts {
  // extends Database["public"]["Tables"]["categories"]["Row"]
  products: Database["public"]["Tables"]["products"]["Row"][];
}

export interface AddressWithServiceArea {
  // extends Database["public"]["Tables"]["addresses"]["Row"]
  service_area: Database["public"]["Tables"]["service_areas"]["Row"] | null;
}

export interface ServiceAreaWithSlots {
  // extends Database["public"]["Tables"]["service_areas"]["Row"]
  delivery_slots: Database["public"]["Tables"]["delivery_slots"]["Row"][];
}

export type DeliverySlot =
  Database["public"]["Tables"]["delivery_slots"]["Row"];

export interface OrderWithItems {
  // extends Database["public"]["Tables"]["orders"]["Row"]
  items: Array<
    Database["public"]["Tables"]["order_items"]["Row"] & {
      product: Database["public"]["Tables"]["products"]["Row"] | null;
    }
  >;
  address: Database["public"]["Tables"]["addresses"]["Row"] | null;
  slot_booking: {
    delivery_slot: Database["public"]["Tables"]["delivery_slots"]["Row"] | null;
  } | null;
  user?: Database["public"]["Tables"]["profiles"]["Row"] | null;
}

export type Fee = Database["public"]["Tables"]["fees"]["Row"];

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  min_order_value: number;
  max_discount_value: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Banner = Database["public"]["Tables"]["banners"]["Row"];

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  min_order_value: number;
  max_discount_value: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
