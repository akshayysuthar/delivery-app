"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ChevronRight } from "lucide-react";
import { useSound } from "@/context/sound-context";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image: string | null;
  category_id: number;
  in_stock: boolean;
  stock_quantity: number;
  unit: string;
  created_at: string;
};

export function PopularItems({ products }: { products: Product[] }) {
  const { playSound } = useSound();

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
  );
}
