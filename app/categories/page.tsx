"use client";

import { CategoriesList } from "@/components/home/CategoriesList";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/supabase-client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
        try {
          const { data: categoryData, error: categoryError } =
            await getCategoryBySlug(slug as string);

          if (categoryError) {
            console.error("Error fetching category:", categoryError);
            return;
          }

          if (categoryData) {
            setCategory(categoryData);
            const { data: productsData, error: productsError } =
              await getProductsByCategory(categoryData.id);

            if (productsError) {
              console.error("Error fetching products:", productsError);
              return;
            }

            if (productsData) {
              setProducts(productsData);
              setFilteredProducts(productsData);
            }
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchData();
  }, [slug]);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>
      <CategoriesList />
    </div>
  );
}
