import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";

// For client components
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});

// For server components and API routes
export const createServerSupabaseClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*");
  console.log(data);
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  return data || [];
}

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  return data || [];
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
  return data;
}

export async function getProductsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId);
  if (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) {
    console.error("Error fetching category by slug:", error);
    throw error;
  }
  return data;
}

export async function getRelatedProducts(productId: number) {
  const { data: product } = await supabase
    .from("products")
    .select("category_id")
    .eq("id", productId)
    .single();
  if (!product) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", productId)
    .limit(4);
  if (error) {
    console.error("Error fetching related products:", error);
    throw error;
  }
  return data || [];
}

// Helper functions for common database operations
export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
}

export async function fetchFeaturedProducts(limit = 4) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .not("sale_price", "is", null)
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
  return data || [];
}

export async function fetchPopularProducts(limit = 4) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("stock_quantity", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching popular products:", error);
    return [];
  }
  return data || [];
}

export async function fetchProductsByCategory(categoryId: string, limit = 20) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
  return data || [];
}

export async function fetchProductById(productCode: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("product_code", productCode)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  return data;
}

export async function searchProducts(query: string, limit = 20) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }
  return data || [];
}

export async function fetchUserAddresses(userId: string) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId) // Assumes user_id is Clerk's ID (user_uuid)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
  return data || [];
}

export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, addresses(*), delivery_slots(*, service_areas(*))")
    .eq("user_id", userId) // Assumes user_id is Clerk's ID (user_uuid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data || [];
}

export async function fetchOrderDetails(orderId: string, userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, addresses(*), delivery_slots(*, service_areas(*)), order_items(*, products(*))"
    )
    .eq("id", orderId)
    .eq("user_id", userId) // Assumes user_id is Clerk's ID (user_uuid)
    .single();

  if (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
  return data;
}

export async function getServiceAreaByPincode(pincode: string) {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .filter("pincodes", "cs", `{${pincode}}`)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching service area:", error);
    return null;
  }
  return data;
}

export async function getAvailableDeliverySlots(
  serviceAreaId: string,
  date: string
) {
  const { data: slots, error: slotsError } = await supabase

    .from("delivery_slots")
    .select("*")
    .eq("service_area_id", Number(serviceAreaId)) // If BIGINT
    .eq("is_active", true);

  if (slotsError) {
    console.error("Error fetching delivery slots:", slotsError);
    return [];
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("slot_bookings")
    .select("*")
    .eq("delivery_slot_id", 1) // Ensure number if BIGINT
    .eq("delivery_date", "2025-03-27"); // Match DATE forma
  if (bookingsError) {
    console.error("Error fetching slot bookings:", bookingsError);
    return [];
  }

  const availableSlots = slots.filter((slot) => {
    const booking = bookings?.find((b) => b.delivery_slot_id === slot.id);
    return !booking || booking.orders_count < slot.max_orders;
  });

  return availableSlots;
}

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
        () => resolve(null)
      );
    } else {
      resolve(null);
    }
  });
}

export async function createOrder(orderData: any) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    throw orderError;
  }
  return order;
}

export async function createOrderItems(orderItems: any[]) {
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);
  if (itemsError) throw itemsError;
  return true;
}
