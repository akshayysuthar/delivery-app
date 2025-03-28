"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface CategoryListProps {
  categories: any[];
}

export function CategoryList({ categories }: CategoryListProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <Link
          href="/categories"
          className="text-sm font-medium text-primary flex items-center"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex space-x-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-6 md:space-x-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors min-w-[120px] md:min-w-0"
            >
              <div className="relative h-16 w-16 mb-3">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
