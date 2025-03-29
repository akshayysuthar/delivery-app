"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/supabase-client";

export function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
                src={category.image || "/placeholder.svg"}
                alt={
                  typeof category.name === "string"
                    ? category.name
                    : "Category Image"
                }
                fill
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-center">
              {category.name}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
