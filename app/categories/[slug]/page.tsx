"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { getCategoryBySlug, getProductsByCategory } from "@/lib/mock-data";

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
    if (slug) {
      const categoryData = getCategoryBySlug(slug as string);
      setCategory(categoryData);

      if (categoryData) {
        const categoryProducts = getProductsByCategory(categoryData.id);
        setProducts(categoryProducts);
        setFilteredProducts(categoryProducts);
      }

      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      // Filter by price range
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        filtered = filtered.filter((product) => {
          const price = product.sale_price || product.price;
          if (max) {
            return price >= min && price <= max;
          } else {
            return price >= min;
          }
        });
      }

      // Filter by stock
      if (inStockOnly) {
        filtered = filtered.filter((product) => product.in_stock);
      }

      // Sort products
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
          // Keep original order or prioritize discounted items
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

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The category you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/categories">View All Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/categories">
                <ChevronLeft className="mr-1 h-4 w-4" />
                All Categories
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="sm:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sort & Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sort & Filter</SheetTitle>
                <SheetDescription>Customize your product view</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Sort By</h3>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-50">Under ₹50</SelectItem>
                      <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                      <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                      <SelectItem value="200-500">₹200 - ₹500</SelectItem>
                      <SelectItem value="500-">Over ₹500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in-stock-mobile"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="in-stock-mobile"
                    className="text-sm font-medium"
                  >
                    In Stock Only
                  </label>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    document
                      .querySelector<HTMLButtonElement>("[data-sheet-close]")
                      ?.click()
                  }
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Narrow down your product selection
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-50">Under ₹50</SelectItem>
                        <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                        <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                        <SelectItem value="200-500">₹200 - ₹500</SelectItem>
                        <SelectItem value="500-">Over ₹500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="in-stock" className="text-sm font-medium">
                      In Stock Only
                    </label>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() =>
                      document
                        .querySelector<HTMLButtonElement>("[data-sheet-close]")
                        ?.click()
                    }
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6">
            Try changing your filters or check back later.
          </p>
          <Button
            onClick={() => {
              setPriceRange("all");
              setInStockOnly(false);
              setSortOption("featured");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
