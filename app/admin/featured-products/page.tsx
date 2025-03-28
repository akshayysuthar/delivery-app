"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { AdminNav } from "@/components/admin/admin-nav";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase-client";
import { siteConfig } from "@/config/site";

export default function FeaturedProductsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin, router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch all products
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (productsError) throw productsError;

      // Filter featured products
      const featured =
        allProducts?.filter((product) => product.is_featured) || [];

      setProducts(allProducts || []);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 1) {
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const toggleFeatured = async (product: any) => {
    setIsSubmitting(true);
    try {
      const newValue = !product.is_featured;

      const { error } = await supabase
        .from("products")
        .update({ is_featured: newValue })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: newValue ? "Product featured" : "Product unfeatured",
        description: `${product.name} has been ${
          newValue ? "added to" : "removed from"
        } featured products`,
      });

      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to update product",
        description: "An error occurred while updating the product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFeatured = (product: any) => {
    toggleFeatured(product);
    setIsDialogOpen(false);
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>You don&apos;t have permission to access this page.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Featured Products</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Featured Products</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Star className="h-4 w-4 mr-2" />
                  Add Featured Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add Featured Product</DialogTitle>
                  <DialogDescription>
                    Search for products to add to the featured section on the
                    homepage.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name or description..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto border rounded-md">
                    {searchResults.length === 0 &&
                    searchQuery.trim().length > 1 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No products found matching &quot;{searchQuery}&quot;
                      </div>
                    ) : searchQuery.trim().length <= 1 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Type at least 2 characters to search
                      </div>
                    ) : (
                      <div className="divide-y">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center p-3 hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleAddFeatured(product)}
                          >
                            <div className="h-12 w-12 relative rounded overflow-hidden mr-3">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                            <div className="ml-2 flex items-center">
                              <span className="font-medium mr-2">
                                {siteConfig.currency}
                                {product.sale_price || product.price}
                              </span>
                              {product.is_featured && (
                                <span className="text-primary">
                                  <Star className="h-4 w-4 fill-primary" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No featured products</h3>
              <p className="text-muted-foreground mb-4">
                Add products to feature them on the homepage.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Star className="h-4 w-4 mr-2" />
                Add Featured Product
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.sale_price ? (
                          <div>
                            <span className="font-medium">
                              {siteConfig.currency}
                              {product.sale_price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {siteConfig.currency}
                              {product.price}
                            </span>
                          </div>
                        ) : (
                          <span>
                            {siteConfig.currency}
                            {product.price}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category?.name || "Uncategorized"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeatured(product)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Remove"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
