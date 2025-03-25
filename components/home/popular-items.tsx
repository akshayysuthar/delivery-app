"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { ChevronRight } from "lucide-react"
import { useSound } from "@/context/sound-context"

// Mock popular products data
const popularProducts = [
  {
    id: 5,
    name: "Tata Salt",
    description: "1 kg, Iodized",
    price: 25,
    image: "/placeholder.svg?height=200&width=200",
    category: "staples-cooking",
    inStock: true,
    discount: 0,
  },
  {
    id: 6,
    name: "Maggi Noodles",
    description: "Pack of 4",
    price: 60,
    image: "/placeholder.svg?height=200&width=200",
    category: "snacks-beverages",
    inStock: true,
    discount: 8,
  },
  {
    id: 7,
    name: "Aashirvaad Atta",
    description: "5 kg, Whole Wheat",
    price: 250,
    image: "/placeholder.svg?height=200&width=200",
    category: "staples-cooking",
    inStock: true,
    discount: 15,
  },
  {
    id: 8,
    name: "Surf Excel Detergent",
    description: "1 kg",
    price: 180,
    image: "/placeholder.svg?height=200&width=200",
    category: "household-cleaning",
    inStock: true,
    discount: 0,
  },
]

export function PopularItems() {
  const [products] = useState(popularProducts)
  const { playSound } = useSound()

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Popular Items</h2>
        <Link
          href="/products/popular"
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

