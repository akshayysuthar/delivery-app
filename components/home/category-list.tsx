import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export function CategoryList({ categories }: { categories: Category[] }) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
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
    </section>
  );
}
