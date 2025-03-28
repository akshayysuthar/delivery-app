"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { playSound } = useSound();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    playSound("add");
  };

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  // Format the weight/unit display
  const formatWeightUnit = () => {
    if (!product.unit) return "";

    if (product.unit === "item" || product.unit === "piece") {
      return product.stock_quantity > 1
        ? `${product.stock_quantity} units`
        : "1 unit";
    }

    if (["kg", "g", "l", "ml"].includes(product.unit)) {
      return `${product.stock_quantity} ${product.unit}`;
    }

    return `${product.stock_quantity} ${product.unit}`;
  };

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        className="group relative h-full rounded-lg border bg-background p-2 transition-colors hover:bg-muted/50"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {discountPercentage > 0 && (
            <Badge className="absolute left-2 top-2 bg-red-500 hover:bg-red-600">
              {discountPercentage}% OFF
            </Badge>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        <div className="pt-3">
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.description}
          </p>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatWeightUnit()}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              {product.sale_price ? (
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {siteConfig.currency}
                    {product.sale_price}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {siteConfig.currency}
                    {product.price}
                  </span>
                </div>
              ) : (
                <span className="font-medium">
                  {siteConfig.currency}
                  {product.price}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
