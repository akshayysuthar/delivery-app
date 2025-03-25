"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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
import { searchProducts, mockCategories } from "@/lib/mock-data";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (query) {
      const searchResults = searchProducts(query);
      setProducts(searchResults);
      setFilteredProducts(searchResults);
    } else {
      setProducts([]);
      setFilteredProducts([]);
    }
    setIsLoading(false);
  }, [query]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      // Filter by category
      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (product) => product.category_id === selectedCategory
        );
      }

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
  }, [products, sortOption, priceRange, inStockOnly, selectedCategory]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "result" : "results"} for "{query}"
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
                <SheetDescription>
                  Customize your search results
                </SheetDescription>
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
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
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
                    Narrow down your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Category</h3>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
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
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any products matching "{query}".
            {(selectedCategory !== "all" ||
              priceRange !== "all" ||
              inStockOnly) &&
              " Try changing your filters or search with different keywords."}
          </p>
          {(selectedCategory !== "all" ||
            priceRange !== "all" ||
            inStockOnly) && (
            <Button
              onClick={() => {
                setPriceRange("all");
                setInStockOnly(false);
                setSelectedCategory("all");
              }}
            >
              Reset Filters
            </Button>
          )}
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
