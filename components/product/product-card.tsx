"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/image-placeholders";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image: string;
  category_id: string;
  in_stock: boolean;
  stock_quantity: number;
  unit: string;
  created_at: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    playSound("add");
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    playSound("remove");
  };

  const discountedPrice = product.sale_price || product.price;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md"
    >
      {discount > 0 && (
        <div className="absolute left-0 top-0 z-10 bg-red-500 px-2 py-1 text-xs font-medium text-white">
          {discount}% OFF
        </div>
      )}
      <Link
        href={`/products/${product.id}`}
        className="aspect-square overflow-hidden"
      >
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          <Image
            src={getProductImageUrl(product.image) || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-medium line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-semibold">
                {siteConfig.currency}
                {discountedPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {siteConfig.currency}
                  {product.price}
                </span>
              )}
            </div>
            {quantity === 0 ? (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={cn(
                    "h-8 rounded-full",
                    !product.in_stock && "cursor-not-allowed opacity-50"
                  )}
                >
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </motion.div>
            ) : (
              <div className="flex items-center border rounded-full">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={handleRemoveFromCart}
                  >
                    <Minus className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </motion.div>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={handleAddToCart}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="sr-only">Add item</span>
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
