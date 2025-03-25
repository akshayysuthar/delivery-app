import { createClient } from "@supabase/supabase-js"

// These would be environment variables in a real application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  phone: string
  full_name: string
  created_at: string
}

export type Address = {
  id: string
  user_id: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  is_default: boolean
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  sale_price?: number
  image: string
  category_id: string
  in_stock: boolean
  stock_quantity: number
  unit: string
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image: string
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  address_id: string
  total_amount: number
  status: "pending" | "processing" | "delivered" | "cancelled"
  payment_method: "cod" | "card" | "upi"
  payment_status: "pending" | "paid" | "failed"
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

