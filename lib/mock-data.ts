import type { Product, Category, Order, OrderItem, Address } from "./supabase";

export const mockCategories: Category[] = [];
//   {
//     id: "cat-001",
//     name: "Fruits & Vegetables",
//     slug: "fruits-vegetables",
//     image: "/images/categories/fruits-vegetables.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-002",
//     name: "Dairy & Breakfast",
//     slug: "dairy-breakfast",
//     image: "/images/categories/dairy-breakfast.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-003",
//     name: "Snacks & Beverages",
//     slug: "snacks-beverages",
//     image: "/images/categories/snacks-beverages.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-004",
//     name: "Staples & Cooking",
//     slug: "staples-cooking",
//     image: "/images/categories/staples-cooking.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-005",
//     name: "Household & Cleaning",
//     slug: "household-cleaning",
//     image: "/images/categories/household-cleaning.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-006",
//     name: "Personal Care",
//     slug: "personal-care",
//     image: "/images/categories/personal-care.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-007",
//     name: "Baby Care",
//     slug: "baby-care",
//     image: "/images/categories/baby-care.jpg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "cat-008",
//     name: "Meat & Seafood",
//     slug: "meat-seafood",
//     image: "/images/categories/meat-seafood.jpg",
//     created_at: new Date().toISOString(),
//   },
// ];

export const mockProducts: Product[] = [];
//   {
//     id: "prod-001",
//     name: "Fresh Organic Apples",
//     description:
//       "Premium quality organic apples sourced from Himalayan orchards. Rich in antioxidants and dietary fiber.",
//     price: 99,
//     sale_price: 89,
//     image: "/images/products/apples.jpg",
//     category_id: "cat-001",
//     in_stock: true,
//     stock_quantity: 50,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-002",
//     name: "Whole Wheat Bread",
//     description:
//       "Freshly baked whole wheat bread made with 100% whole grain flour. No preservatives added.",
//     price: 45,
//     image: "/images/products/bread.jpg",
//     category_id: "cat-002",
//     in_stock: true,
//     stock_quantity: 30,
//     unit: "pack",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-003",
//     name: "Farm Fresh Eggs",
//     description:
//       "Free-range eggs from healthy hens raised in natural environments. Rich in protein and essential nutrients.",
//     price: 75,
//     sale_price: 70,
//     image: "/images/products/eggs.jpg",
//     category_id: "cat-002",
//     in_stock: true,
//     stock_quantity: 100,
//     unit: "dozen",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-004",
//     name: "Amul Butter",
//     description:
//       "Creamy and delicious butter made from pure cow's milk. Perfect for spreading on bread or cooking.",
//     price: 245,
//     image: "/images/products/butter.jpg",
//     category_id: "cat-002",
//     in_stock: true,
//     stock_quantity: 45,
//     unit: "pack",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-005",
//     name: "Tata Salt",
//     description:
//       "Iodized salt that provides essential nutrients. Enhances the taste of your food.",
//     price: 25,
//     image: "/images/products/salt.jpg",
//     category_id: "cat-004",
//     in_stock: true,
//     stock_quantity: 200,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-006",
//     name: "Maggi Noodles",
//     description:
//       "Quick and easy to prepare instant noodles. Ready in just 2 minutes.",
//     price: 60,
//     sale_price: 55,
//     image: "/images/products/maggi.jpg",
//     category_id: "cat-003",
//     in_stock: true,
//     stock_quantity: 150,
//     unit: "pack",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-007",
//     name: "Aashirvaad Atta",
//     description:
//       "Premium quality whole wheat flour. Perfect for making soft rotis and parathas.",
//     price: 250,
//     sale_price: 225,
//     image: "/images/products/atta.jpg",
//     category_id: "cat-004",
//     in_stock: true,
//     stock_quantity: 80,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-008",
//     name: "Surf Excel Detergent",
//     description:
//       "Powerful stain removal detergent that keeps your clothes clean and fresh.",
//     price: 180,
//     image: "/images/products/detergent.jpg",
//     category_id: "cat-005",
//     in_stock: true,
//     stock_quantity: 60,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-009",
//     name: "Fresh Tomatoes",
//     description:
//       "Juicy and ripe tomatoes perfect for curries, salads, and sauces.",
//     price: 40,
//     image: "/images/products/tomatoes.jpg",
//     category_id: "cat-001",
//     in_stock: true,
//     stock_quantity: 100,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-010",
//     name: "Onions",
//     description:
//       "Fresh and firm onions, an essential ingredient for Indian cooking.",
//     price: 35,
//     image: "/images/products/onions.jpg",
//     category_id: "cat-001",
//     in_stock: true,
//     stock_quantity: 150,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-011",
//     name: "Potatoes",
//     description: "Fresh potatoes perfect for curries, fries, and snacks.",
//     price: 30,
//     image: "/images/products/potatoes.jpg",
//     category_id: "cat-001",
//     in_stock: true,
//     stock_quantity: 200,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-012",
//     name: "Banana",
//     description:
//       "Sweet and nutritious bananas, rich in potassium and vitamins.",
//     price: 60,
//     image: "/images/products/bananas.jpg",
//     category_id: "cat-001",
//     in_stock: true,
//     stock_quantity: 80,
//     unit: "dozen",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-013",
//     name: "Coca-Cola",
//     description:
//       "Refreshing carbonated soft drink, perfect for parties and gatherings.",
//     price: 90,
//     sale_price: 85,
//     image: "/images/products/coke.jpg",
//     category_id: "cat-003",
//     in_stock: true,
//     stock_quantity: 120,
//     unit: "bottle",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-014",
//     name: "Lay's Potato Chips",
//     description: "Crispy and flavorful potato chips, perfect for snacking.",
//     price: 30,
//     image: "/images/products/chips.jpg",
//     category_id: "cat-003",
//     in_stock: true,
//     stock_quantity: 100,
//     unit: "pack",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-015",
//     name: "Dove Soap",
//     description: "Gentle and moisturizing soap for soft and smooth skin.",
//     price: 45,
//     image: "/images/products/soap.jpg",
//     category_id: "cat-006",
//     in_stock: true,
//     stock_quantity: 90,
//     unit: "piece",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-016",
//     name: "Colgate Toothpaste",
//     description: "Fluoride toothpaste for strong teeth and fresh breath.",
//     price: 55,
//     sale_price: 50,
//     image: "/images/products/toothpaste.jpg",
//     category_id: "cat-006",
//     in_stock: true,
//     stock_quantity: 110,
//     unit: "tube",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-017",
//     name: "Pampers Diapers",
//     description:
//       "Ultra-absorbent diapers for babies, providing up to 12 hours of dryness.",
//     price: 350,
//     image: "/images/products/diapers.jpg",
//     category_id: "cat-007",
//     in_stock: true,
//     stock_quantity: 50,
//     unit: "pack",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-018",
//     name: "Chicken Breast",
//     description:
//       "Fresh boneless chicken breast, high in protein and low in fat.",
//     price: 220,
//     image: "/images/products/chicken.jpg",
//     category_id: "cat-008",
//     in_stock: true,
//     stock_quantity: 40,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-019",
//     name: "Prawns",
//     description:
//       "Fresh and cleaned prawns, perfect for curries and stir-fries.",
//     price: 450,
//     sale_price: 400,
//     image: "/images/products/prawns.jpg",
//     category_id: "cat-008",
//     in_stock: true,
//     stock_quantity: 30,
//     unit: "kg",
//     created_at: new Date().toISOString(),
//   },
//   {
//     id: "prod-020",
//     name: "Harpic Toilet Cleaner",
//     description:
//       "Powerful toilet cleaner that removes tough stains and kills germs.",
//     price: 85,
//     image: "/images/products/toilet-cleaner.jpg",
//     category_id: "cat-005",
//     in_stock: true,
//     stock_quantity: 70,
//     unit: "bottle",
//     created_at: new Date().toISOString(),
//   },
// ];

// export const mockOrders: Order[] = [
//   {
//     id: "ord-001",
//     user_id: "user-001",
//     address_id: "addr-001",
//     total_amount: 450,
//     status: "delivered",
//     payment_method: "cod",
//     payment_status: "paid",
//     created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
//   },
//   {
//     id: "ord-002",
//     user_id: "user-001",
//     address_id: "addr-001",
//     total_amount: 675,
//     status: "processing",
//     payment_method: "card",
//     payment_status: "paid",
//     created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
//   },
//   {
//     id: "ord-003",
//     user_id: "user-001",
//     address_id: "addr-002",
//     total_amount: 320,
//     status: "pending",
//     payment_method: "cod",
//     payment_status: "pending",
//     created_at: new Date().toISOString(), // Today
//   },
// ];

export const mockOrderItems: OrderItem[] = [];
//   {
//     id: "item-001",
//     order_id: "ord-001",
//     product_id: "prod-001",
//     quantity: 2,
//     price: 89,
//     product: mockProducts.find((p) => p.id === "prod-001")!,
//   },
//   {
//     id: "item-002",
//     order_id: "ord-001",
//     product_id: "prod-006",
//     quantity: 5,
//     price: 55,
//     product: mockProducts.find((p) => p.id === "prod-006")!,
//   },
//   {
//     id: "item-003",
//     order_id: "ord-002",
//     product_id: "prod-003",
//     quantity: 1,
//     price: 70,
//     product: mockProducts.find((p) => p.id === "prod-003")!,
//   },
//   {
//     id: "item-004",
//     order_id: "ord-002",
//     product_id: "prod-007",
//     quantity: 2,
//     price: 225,
//     product: mockProducts.find((p) => p.id === "prod-007")!,
//   },
//   {
//     id: "item-005",
//     order_id: "ord-002",
//     product_id: "prod-013",
//     quantity: 2,
//     price: 85,
//     product: mockProducts.find((p) => p.id === "prod-013")!,
//   },
//   {
//     id: "item-006",
//     order_id: "ord-003",
//     product_id: "prod-009",
//     quantity: 3,
//     price: 40,
//     product: mockProducts.find((p) => p.id === "prod-009")!,
//   },
//   {
//     id: "item-007",
//     order_id: "ord-003",
//     product_id: "prod-014",
//     quantity: 4,
//     price: 30,
//     product: mockProducts.find((p) => p.id === "prod-014")!,
//   },
//   {
//     id: "item-008",
//     order_id: "ord-003",
//     product_id: "prod-016",
//     quantity: 2,
//     price: 50,
//     product: mockProducts.find((p) => p.id === "prod-016")!,
//   },
// ];

export const mockAddresses: Address[] = [
  {
    id: "addr-001",
    user_id: "user-001",
    address_line1: "A-101, Sai Apartment",
    address_line2: "Home: Near City Light Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395007",
    landmark: "Opposite Green Park",
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "addr-002",
    user_id: "user-001",
    address_line1: "Office 305, Business Hub",
    address_line2: "Work: Ring Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395002",
    landmark: "Next to Central Mall",
    is_default: false,
    created_at: new Date().toISOString(),
  },
];

// // Function to get products by category
export function getProductsByCategory(categoryId: string) {
  //   return mockProducts.filter((product) => product.category_id === categoryId);
  // }
  // // Function to get product by ID
  // export function getProductById(productId: string): Product | undefined {
  //   return mockProducts.find((product) => product.id === productId);
  // }
  // // Function to get category by slug
  // export function getCategoryBySlug(slug: string): Category | undefined {
  //   return mockCategories.find((category) => category.slug === slug);
  // }
  // // Function to search products
  // export function searchProducts(query: string): Product[] {
  //   const lowercaseQuery = query.toLowerCase();
  //   return mockProducts.filter(
  //     (product) =>
  //       product.name.toLowerCase().includes(lowercaseQuery) ||
  //       product.description.toLowerCase().includes(lowercaseQuery)
  //   );
  // }
  // // Function to get featured products (products with sale_price)
  // export function getFeaturedProducts(): Product[] {
  //   return mockProducts.filter((product) => product.sale_price !== undefined);
}

// // Function to get popular products (just a subset for demo)
export function getPopularProducts() {
  //   return [
  //     mockProducts.find((p) => p.id === "prod-001")!,
  //     mockProducts.find((p) => p.id === "prod-003")!,
  //     mockProducts.find((p) => p.id === "prod-006")!,
  //     mockProducts.find((p) => p.id === "prod-013")!,
  //     mockProducts.find((p) => p.id === "prod-016")!,
  //     mockProducts.find((p) => p.id === "prod-019")!,
  //   ];
  // }
  // // Function to get related products (products in the same category)
  // export function getRelatedProducts(productId: string, limit = 4): Product[] {
  //   const product = getProductById(productId);
  //   if (!product) return [];
  //   return mockProducts
  //     .filter((p) => p.category_id === product.category_id && p.id !== productId)
  //     .slice(0, limit);
}
