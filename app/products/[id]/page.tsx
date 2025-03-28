"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/image-placeholders";
import { getProductById } from "@/lib/supabase-client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: string;
  in_stock: boolean;
  stock_quantity: number;
  unit: string;
  highlights: Record<string, string>;
  information: Record<string, string>;
  is_featured: boolean;
  created_at: string;
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const { playSound } = useSound();
  const { id } = useParams();
  const quantity = getItemQuantity(id as string);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getProductById(Number(id));
        if (error) {
          console.error("Error fetching product:", error);
        }
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      playSound("add");
      // setQuantity(quantity + 1);
    }
  };

  const handleRemoveFromCart = () => {
    if (!product) return;
    removeFromCart(product.id);
    playSound("remove");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>Sorry, the product you are looking for could not be found.</p>
      </div>
    );
  }

  const discountedPrice = product.sale_price || product.price;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={getProductImageUrl(product.image) || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
          {discount > 0 && (
            <div className="absolute left-3 top-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.description}</p>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-semibold">
              {siteConfig.currency}
              {discountedPrice}
            </span>
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {siteConfig.currency}
                {product.price}
              </span>
            )}
          </div>

          <p className="mb-4">
            {product.unit === "item"
              ? `${product.stock_quantity} units available`
              : `${product.stock_quantity} ${product.unit} available`}
          </p>

          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={cn(
                !product.in_stock && "cursor-not-allowed opacity-50"
              )}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFromCart}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span>{quantity}</span>
              <Button variant="ghost" size="icon" onClick={handleAddToCart}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="link" className="mt-4">
                View Highlights
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Highlights</SheetTitle>
                <SheetDescription>
                  Key features and benefits of this product.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {Object.entries(product.highlights).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[100px_1fr] gap-4">
                    <div className="text-right font-semibold">{key}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="link" className="mt-2">
                View Information
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Information</SheetTitle>
                <SheetDescription>
                  Detailed information about this product.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {Object.entries(product.information).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[100px_1fr] gap-4">
                    <div className="text-right font-semibold">{key}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
