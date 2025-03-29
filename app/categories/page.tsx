"use client";

import {
  useState,
  useEffect,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";

import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/supabase-client"; // Adjust path

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (slug) {
        const categoryData = await getCategoryBySlug(slug as string);
        setCategory(categoryData);

        if (categoryData) {
          const { data: categoryProducts, error } = await getProductsByCategory(
            categoryData.data?.id as number
          );
          if (!error && categoryProducts) {
            setProducts(categoryProducts);
            setFilteredProducts(categoryProducts);
          }
        }
        setIsLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        filtered = filtered.filter((product) => {
          const price = product.sale_price || product.price;
          return max ? price >= min && price <= max : price >= min;
        });
      }

      if (inStockOnly) {
        filtered = filtered.filter((product) => product.in_stock);
      }

      switch (sortOption) {
        case "price-low":
          filtered.sort(
            (a, b) => (a.sale_price || a.price) - (b.sale_price || b.price)
          );
          break;
        case "price-high":
          filtered.sort(
            (a, b) => (b.sale_price || b.price) - (a.sale_price || a.price)
          );
          break;
        case "newest":
          filtered.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          break;
        case "featured":
        default:
          filtered.sort(
            (a, b) => (b.sale_price ? 1 : 0) - (a.sale_price ? 1 : 0)
          );
          break;
      }

      setFilteredProducts(filtered);
    }
  }, [products, sortOption, priceRange, inStockOnly]);
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {category.map(
          (
            category: {
              id: Key | null | undefined;
              slug: any;
              image: any;
              name:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
            },
            index: number
          ) => (
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
          )
        )}
      </div>
    </div>
  );
}
