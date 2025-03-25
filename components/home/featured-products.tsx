"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { ChevronRight } from "lucide-react"
import { useSound } from "@/context/sound-context"

// Mock featured products data
const featuredProducts = [
  {
    id: 1,
    name: "Fresh Organic Apples",
    description: "1 kg, Premium Quality",
    price: 99,
    image: "/placeholder.svg?height=200&width=200",
    category: "fruits-vegetables",
    inStock: true,
    discount: 10,
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    description: "400g, Freshly Baked",
    price: 45,
    image: "/placeholder.svg?height=200&width=200",
    category: "dairy-breakfast",
    inStock: true,
    discount: 0,
  },
  {
    id: 3,
    name: "Farm Fresh Eggs",
    description: "Pack of 6",
    price: 75,
    image: "/placeholder.svg?height=200&width=200",
    category: "dairy-breakfast",
    inStock: true,
    discount: 5,
  },
  {
    id: 4,
    name: "Amul Butter",
    description: "500g",
    price: 245,
    image: "/placeholder.svg?height=200&width=200",
    category: "dairy-breakfast",
    inStock: true,
    discount: 0,
  },
]

export function FeaturedProducts() {
  const [products] = useState(featuredProducts)
  const { playSound } = useSound()

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Featured Products</h2>
        <Link
          href="/products/featured"
          className="text-sm font-medium text-primary flex items-center"
          onClick={() => playSound("click")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

