"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { mockCategories } from "@/lib/mock-data"
import { getCategoryImageUrl } from "@/lib/image-placeholders"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCategories(mockCategories)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
          >
            <Link
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors h-full"
            >
              <div className="relative h-24 w-24 mb-3">
                <Image
                  src={getCategoryImageUrl(category.image, category.slug) || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

