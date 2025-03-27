import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// These would be environment variables in a real application
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://your-supabase-url.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  created_at: string;
};
// lib/supabase.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  category_id: string;
  stock_quantity: number;
  unit: string;
  in_stock: boolean;
  is_featured: boolean;
  image: string | null;
  created_at: string;
  highlights: Record<string, string>; // Add this
  information: Record<string, string>; // Add this
}

// export interface Category {
//   id: string;
//   name: string;
// }

// ...rest of the file (supabase client, fetchCategories, etc.)

export type Address = {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
};

// export type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   sale_price?: number;
//   image: string;
//   category_id: string;
//   in_stock: boolean;
//   stock_quantity: number;
//   unit: string;
//   created_at: string;
// };

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  created_at: string;
};

export type ServiceArea = {
  id: string;
  name: string;
  pincodes: string[];
  is_active: boolean;
  delivery_fee: number;
  min_order_free_delivery: number;
  delivery_time_minutes: number;
  created_at: string;
};

export type DeliverySlot = {
  id: string;
  service_area_id: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  is_active: boolean;
  created_at: string;
};

export type SlotBooking = {
  id: string;
  delivery_slot_id: string;
  delivery_date: string;
  orders_count: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  address_id: string;
  delivery_slot_id?: string;
  delivery_date?: string;
  total_amount: number;
  delivery_fee: number;
  status:
    | "pending"
    | "processing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  payment_method: "cod" | "card" | "upi";
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
};

// Function to get service area by pincode
export async function getServiceAreaByPincode(
  pincode: string
): Promise<ServiceArea | null> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .filter("pincodes", "cs", `{${pincode}}`)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching service area:", error);
    return null;
  }

  return data as ServiceArea;
}

// Function to get available delivery slots
export async function getAvailableDeliverySlots(
  serviceAreaId: string,
  date: string
): Promise<DeliverySlot[]> {
  // First, get all delivery slots for the service area
  const { data: slots, error: slotsError } = await supabase
    .from("delivery_slots")
    .select("*")
    .eq("service_area_id", serviceAreaId)
    .eq("is_active", true)
    .order("start_time", { ascending: true });

  if (slotsError || !slots) {
    console.error("Error fetching delivery slots:", slotsError);
    return [];
  }

  // Then, get all slot bookings for the date
  const { data: bookings, error: bookingsError } = await supabase
    .from("slot_bookings")
    .select("*")
    .eq("delivery_date", date);

  if (bookingsError) {
    console.error("Error fetching slot bookings:", bookingsError);
    return [];
  }

  // Filter out slots that are fully booked
  const availableSlots = slots.filter((slot) => {
    const booking = bookings?.find((b) => b.delivery_slot_id === slot.id);
    return !booking || booking.orders_count < slot.max_orders;
  });

  return availableSlots as DeliverySlot[];
}

// Function to check if a delivery slot is available
export async function isDeliverySlotAvailable(
  slotId: string,
  date: string
): Promise<boolean> {
  // Get the slot details
  const { data: slot, error: slotError } = await supabase
    .from("delivery_slots")
    .select("*")
    .eq("id", slotId)
    .single();

  if (slotError || !slot) {
    console.error("Error fetching delivery slot:", slotError);
    return false;
  }

  // Get the booking for this slot and date
  const { data: booking, error: bookingError } = await supabase
    .from("slot_bookings")
    .select("*")
    .eq("delivery_slot_id", slotId)
    .eq("delivery_date", date)
    .single();

  if (bookingError && bookingError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching slot booking:", bookingError);
    return false;
  }

  // If no booking exists or orders count is less than max orders, the slot is available
  return !booking || booking.orders_count < slot.max_orders;
}

// Function to get user's location
export async function getUserLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        }
      );
    } else {
      resolve(null);
    }
  });
}
