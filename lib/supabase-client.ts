// supabase-client.ts
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";
import type {
  ProductWithCategory,
  CategoryWithProducts,
  AddressWithServiceArea,
  ServiceAreaWithSlots,
  DeliverySlot,
  OrderWithItems,
  Fee,
  Offer,
  Banner,
} from "./supabase.types"; // Adjust path if needed

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

// Existing Old Functions
export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*");
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
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("category_id", categoryId)
    .order("name");
  return { data: data as ProductWithCategory[], error };
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      products:products(*)
    `
    )
    .eq("slug", slug)
    .single();
  return { data: data as CategoryWithProducts, error };
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
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
  return data || [];
}
// supabase-client.ts
// import type { Offer } from "./supabase.types"; // Ensure this import exists

export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<Offer | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .single();

  if (error || !data) {
    return null;
  }
  if (data.min_order_value && subtotal < data.min_order_value) {
    return null;
  }
  // Note: 'offers' table doesn’t have usage_limit/usage_count in your schema.
  // Add these fields to your DB if needed, or remove this check.
  // if (data.usage_limit && data.usage_count >= data.usage_limit) {
  //   return null;
  // }
  return data as Offer;
}

export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, addresses(*), delivery_slots(*, service_areas(*))")
    .eq("user_id", userId)
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
    .eq("user_id", userId)
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
    .eq("service_area_id", Number(serviceAreaId))
    .eq("is_active", true);
  if (slotsError) {
    console.error("Error fetching delivery slots:", slotsError);
    return [];
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("slot_bookings")
    .select("*")
    .eq("delivery_slot_id", 1) // This seems hardcoded; should be dynamic
    .eq("delivery_date", "2025-03-27"); // Hardcoded date
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

export async function uploadProductImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("products")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(data.path);
  return publicUrl;
}

export async function uploadBannerImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("banners")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    console.error("Error uploading banner:", error);
    throw error;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("banners").getPublicUrl(data.path);
  return publicUrl;
}

export async function fetchBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
  return data || [];
}

export async function fetchServiceAreas() {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .order("name");
  if (error) {
    console.error("Error fetching service areas:", error);
    return [];
  }
  return data || [];
}

export async function fetchDeliverySlots(serviceAreaId?: string) {
  let query = supabase
    .from("delivery_slots")
    .select("*, service_areas(name)")
    .order("start_time");
  if (serviceAreaId) {
    query = query.eq("service_area_id", serviceAreaId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching delivery slots:", error);
    return [];
  }
  return data || [];
}

export async function fetchAdminDashboardStats() {
  const { count: totalOrders, error: ordersError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  const { data: revenueData, error: revenueError } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "delivered");
  const { count: totalCustomers, error: customersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: totalProducts, error: productsError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  if (ordersError || revenueError || customersError || productsError) {
    console.error("Error fetching dashboard stats");
  }
  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    totalCustomers: totalCustomers || 0,
    totalProducts: totalProducts || 0,
  };
}

export async function fetchRecentOrders(limit = 5) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
  return data || [];
}

export async function getActiveFees() {
  const { data, error } = await supabase
    .from("fees")
    .select("*")
    .eq("is_active", true);
  if (error) throw error;
  return data || [];
}

export async function calculateOrderFees(cartTotal: number) {
  const fees = await getActiveFees();
  let platform_fee = 0;
  let handling_fee = 0;
  let packaging_fee = 0;
  fees.forEach((fee) => {
    if (cartTotal >= fee.min_order_value) {
      let feeValue =
        fee.fee_type === "fixed"
          ? fee.fee_value
          : (cartTotal * fee.fee_value) / 100;
      if (fee.max_fee_value && feeValue > fee.max_fee_value) {
        feeValue = fee.max_fee_value;
      }
      switch (fee.name.toLowerCase()) {
        case "platform fee":
          platform_fee = feeValue;
          break;
        case "handling fee":
          handling_fee = feeValue;
          break;
        case "packaging fee":
          packaging_fee = feeValue;
          break;
      }
    }
  });
  return { platform_fee, handling_fee, packaging_fee };
}

export async function getActiveBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

// New Functions from New Version
// Auth Functions
// export async function signUp(email: string, password: string) {
//   const { data, error } = await supabase.auth.signUp({ email, password });
//   return { data, error };
// }

// export async function signIn(email: string, password: string) {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });
//   return { data, error };
// }

// export async function signInWithGoogle() {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: { redirectTo: `${window.location.origin}/auth/callback` },
//   });
//   return { data, error };
// }

// export async function signOut() {
//   const { error } = await supabase.auth.signOut();
//   return { error };
// }

// export async function getSession() {
//   const { data, error } = await supabase.auth.getSession();
//   return { data, error };
// }

// export async function getUser() {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   if (!session) return { data: null, error: null };
//   const { data, error } = await supabase.auth.getUser();
//   return { data, error };
// }

// // Profile Functions
// export async function getProfile(userId: string) {
//   const { data, error } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", userId)
//     .single();
//   return { data, error };
// }

export async function updateProfile(userId: string, profile: any) {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId);
  return { data, error };
}

// Category Functions (New)
export async function getFeaturedCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")
    .limit(8);
  if (error) {
    console.error("Error fetching featured categories:", error);
    return [];
  }
  return data || [];
}

export async function createCategory(category: any) {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select();
  return { data, error };
}

export async function updateCategory(id: number, category: any) {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return { error };
}

// Product Functions (New or Enhanced)
export async function createProduct(product: any) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select();
  return { data, error };
}

export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_featured", true)
    .order("name");
  return { data: data as ProductWithCategory[], error };
}

export async function getPopularProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("sales_count", { ascending: false })
    .limit(8);
  return { data: data as ProductWithCategory[], error };
}

export async function updateFeaturedStatus(id: number, isFeatured: boolean) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_featured: isFeatured })
    .eq("id", id)
    .select();
  return { data, error };
}

// Address Functions
export async function getAddresses(userId: string) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*, service_area:service_areas(*)")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  return { data: data as AddressWithServiceArea[], error };
}

export async function getAddressById(id: number) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*, service_area:service_areas(*)")
    .eq("id", id)
    .single();
  return { data: data as AddressWithServiceArea, error };
}

export async function createAddress(address: any) {
  const { data, error } = await supabase
    .from("addresses")
    .insert(address)
    .select();
  return { data, error };
}

export async function updateAddress(id: number, address: any) {
  const { data, error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteAddress(id: number) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  return { error };
}

export async function setDefaultAddress(userId: string, addressId: number) {
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .select();
  return { data, error };
}

// Service Area Functions
export async function getServiceAreas() {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .order("name");
  return { data, error };
}

export async function getServiceAreaById(id: number) {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function createServiceArea(serviceArea: any) {
  const { data, error } = await supabase
    .from("service_areas")
    .insert(serviceArea)
    .select();
  return { data, error };
}

export async function updateServiceArea(id: number, serviceArea: any) {
  const { data, error } = await supabase
    .from("service_areas")
    .update(serviceArea)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteServiceArea(id: number) {
  const { error } = await supabase.from("service_areas").delete().eq("id", id);
  return { error };
}

export async function getServiceAreasWithSlots() {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*, delivery_slots:delivery_slots(*)")
    .order("name");
  return { data: data as ServiceAreaWithSlots[], error };
}

// Delivery Slot Functions
export async function getDeliverySlots() {
  const { data, error } = await supabase
    .from("delivery_slots")
    .select("*, service_area:service_areas(*)")
    .order("start_time");
  return { data, error };
}

export async function getDeliverySlotsByServiceArea(serviceAreaId: number) {
  const { data, error } = await supabase
    .from("delivery_slots")
    .select("*")
    .eq("service_area_id", serviceAreaId)
    .order("start_time");
  return { data: data as DeliverySlot[], error };
}

export async function getDeliverySlotById(id: number) {
  const { data, error } = await supabase
    .from("delivery_slots")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as DeliverySlot, error };
}

export async function createDeliverySlot(slot: any) {
  const { data, error } = await supabase
    .from("delivery_slots")
    .insert(slot)
    .select();
  return { data, error };
}

export async function updateDeliverySlot(id: number, slot: any) {
  const { data, error } = await supabase
    .from("delivery_slots")
    .update(slot)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteDeliverySlot(id: number) {
  const { error } = await supabase.from("delivery_slots").delete().eq("id", id);
  return { error };
}

// Slot Booking Functions
export async function getSlotBookings(date: string) {
  const { data, error } = await supabase
    .from("slot_bookings")
    .select("*, delivery_slot:delivery_slots(*)")
    .eq("booking_date", date);
  return { data, error };
}

export async function createSlotBooking(booking: any) {
  const { data, error } = await supabase
    .from("slot_bookings")
    .insert(booking)
    .select();
  return { data, error };
}

export async function getSlotAvailability(slotId: number, date: string) {
  const { data: slot } = await supabase
    .from("delivery_slots")
    .select("max_orders")
    .eq("id", slotId)
    .single();
  if (!slot) return { available: false, remaining: 0 };
  const { count, error } = await supabase
    .from("slot_bookings")
    .select("*", { count: "exact", head: true })
    .eq("delivery_slot_id", slotId)
    .eq("booking_date", date);
  if (error) return { available: false, remaining: 0, error };
  const remaining = slot.max_orders - (count || 0);
  return { available: remaining > 0, remaining, total: slot.max_orders };
}

// Order Functions (Enhanced)
export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*, product:products(*)),
      address:addresses(*),
      slot_booking:slot_bookings(*, delivery_slot:delivery_slots(*))
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data as OrderWithItems[], error };
}

export async function getOrderById(id: number) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*, product:products(*)),
      address:addresses(*),
      slot_booking:slot_bookings(*, delivery_slot:delivery_slots(*)),
      user:profiles(*)
    `
    )
    .eq("id", id)
    .single();
  return { data: data as OrderWithItems, error };
}

export async function getAllOrders(status?: string) {
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*, product:products(*)),
      address:addresses(*),
      slot_booking:slot_bookings(*, delivery_slot:delivery_slots(*)),
      user:profiles(*)
    `
    )
    .order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  return { data: data as OrderWithItems[], error };
}

export async function updateOrderStatus(id: number, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select();
  return { data, error };
}

// Fee Functions
export async function getFees() {
  const { data, error } = await supabase.from("fees").select("*");
  return { data: data as Fee[], error };
}

export async function updateFee(id: number, fee: any) {
  const { data, error } = await supabase
    .from("fees")
    .update(fee)
    .eq("id", id)
    .select();
  return { data, error };
}

// Offer Functions (Assuming 'offers' table exists)
export async function getOffers() {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data as Offer[], error };
}

export async function getActiveOffers() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return { data: data as Offer[], error };
}

export async function getOfferById(id: number) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as Offer, error };
}

export async function createOffer(offer: any) {
  const { data, error } = await supabase.from("offers").insert(offer).select();
  return { data, error };
}

export async function updateOffer(id: number, offer: any) {
  const { data, error } = await supabase
    .from("offers")
    .update(offer)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteOffer(id: number) {
  const { error } = await supabase.from("offers").delete().eq("id", id);
  return { error };
}

// Banner Functions (Enhanced)
export async function getBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("display_order");
  return { data: data as Banner[], error };
}

export async function getActiveBannersOld() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .eq("is_active", true)
    .order("display_order");
  return { data: data as Banner[], error };
}

export async function getBannerById(id: number) {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as Banner, error };
}

export async function createBanner(banner: any) {
  const { data, error } = await supabase
    .from("banners")
    .insert(banner)
    .select();
  return { data, error };
}

export async function updateBanner(id: number, banner: any) {
  const { data, error } = await supabase
    .from("banners")
    .update(banner)
    .eq("id", id)
    .select();
  return { data, error };
}

export async function deleteBanner(id: number) {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  return { error };
}

// Analytics Functions
export async function getOrderStats(
  period: "day" | "week" | "month" | "year" = "month"
) {
  let timeFilter;
  const now = new Date();
  switch (period) {
    case "day":
      timeFilter = now.toISOString().split("T")[0];
      break;
    case "week":
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilter = lastWeek.toISOString();
      break;
    case "month":
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      timeFilter = lastMonth.toISOString();
      break;
    case "year":
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      timeFilter = lastYear.toISOString();
      break;
  }
  const { count: totalOrders, error: countError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", timeFilter);
  const { data: revenueData, error: revenueError } = await supabase
    .from("orders")
    .select("total_amount")
    .gte("created_at", timeFilter);
  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const { data: statusData, error: statusError } = await supabase
    .from("orders")
    .select("status")
    .gte("created_at", timeFilter);
  const ordersByStatus = statusData?.reduce(
    (acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {}
  );
  return {
    totalOrders,
    totalRevenue,
    ordersByStatus,
    error: countError || revenueError || statusError,
  };
}

export async function getTopProducts(
  limit = 10,
  period: "day" | "week" | "month" | "year" = "month"
) {
  let timeFilter;
  const now = new Date();
  switch (period) {
    case "day":
      timeFilter = now.toISOString().split("T")[0];
      break;
    case "week":
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilter = lastWeek.toISOString();
      break;
    case "month":
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      timeFilter = lastMonth.toISOString();
      break;
    case "year":
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      timeFilter = lastYear.toISOString();
      break;
  }
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*, product:products(*), order:orders(created_at)")
    .gte("order.created_at", timeFilter);
  if (itemsError || !orderItems) {
    return { data: [], error: itemsError };
  }
  const productMap = new Map();
  orderItems.forEach((item) => {
    if (!item.product) return;
    const productId = item.product_id;
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        product: item.product,
        quantity: 0,
        revenue: 0,
      });
    }
    const productData = productMap.get(productId);
    productData.quantity += item.quantity;
    productData.revenue += item.price * item.quantity;
  });
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
  return { data: topProducts, error: null };
}

export async function getSalesOverTime(
  period: "day" | "week" | "month" | "year" = "month",
  interval: "hour" | "day" | "week" | "month" = "day"
) {
  let timeFilter;
  const now = new Date();
  switch (period) {
    case "day":
      timeFilter = now.toISOString().split("T")[0];
      break;
    case "week":
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilter = lastWeek.toISOString();
      break;
    case "month":
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      timeFilter = lastMonth.toISOString();
      break;
    case "year":
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      timeFilter = lastYear.toISOString();
      break;
  }
  const { data: orders, error } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .gte("created_at", timeFilter)
    .order("created_at");
  if (error || !orders) {
    return { data: [], error };
  }
  const salesByInterval: Record<
    string,
    { date: string; sales: number; orders: number }
  > = {};
  orders.forEach((order) => {
    let intervalKey;
    const orderDate = new Date(order.created_at);
    switch (interval) {
      case "hour":
        intervalKey = `${
          orderDate.toISOString().split("T")[0]
        } ${orderDate.getHours()}:00`;
        break;
      case "day":
        intervalKey = orderDate.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        intervalKey = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        intervalKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        break;
    }
    if (!salesByInterval[intervalKey]) {
      salesByInterval[intervalKey] = { date: intervalKey, sales: 0, orders: 0 };
    }
    salesByInterval[intervalKey].sales += order.total_amount;
    salesByInterval[intervalKey].orders += 1;
  });
  const salesData = Object.values(salesByInterval).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return { data: salesData, error: null };
}

// Image Upload (Enhanced)
export async function uploadOfferImage(file: File, fileName: string) {
  const { data, error } = await supabase.storage
    .from("offer-images")
    .upload(fileName, file);
  if (error) {
    console.error("Error uploading offer image:", error);
    throw error;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("offer-images").getPublicUrl(data.path);
  return publicUrl;
}
