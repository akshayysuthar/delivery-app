"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";
import {
  getProductById,
  getRelatedProducts,
  getCategoryBySlug,
} from "@/lib/mock-data";
import { getProductImageUrl } from "@/lib/image-placeholders";
import { ProductCard } from "@/components/product/product-card";
import { mockCategories } from "@/lib/mock-data"; // Import mockCategories

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const { playSound } = useSound();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (id) {
      const productData = getProductById(id as string);
      setProduct(productData);

      if (productData) {
        const related = getRelatedProducts(productData.id);
        setRelatedProducts(related);

        const categoryData = getCategoryBySlug(
          productData.category_id.startsWith("cat-")
            ? mockCategories.find((c) => c.id === productData.category_id)
                ?.slug || ""
            : productData.category_id
        );
        setCategory(categoryData);

        setQuantity(getItemQuantity(productData.id));
      }

      setIsLoading(false);
    }
  }, [id, getItemQuantity]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      playSound("add");
      setQuantity(quantity + 1);
    }
  };

  const handleRemoveFromCart = () => {
    if (product && quantity > 0) {
      removeFromCart(product.id);
      playSound("remove");
      setQuantity(quantity - 1);
    }
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
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const discountedPrice = product.sale_price || product.price;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={category ? `/categories/${category.slug}` : "/categories"}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to {category ? category.name : "Categories"}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          {discount > 0 && (
            <div className="absolute left-4 top-4 z-10 bg-red-500 px-2 py-1 text-xs font-medium text-white rounded-md">
              {discount}% OFF
            </div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg overflow-hidden aspect-square relative"
          >
            <Image
              src={getProductImageUrl(product.image) || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {product.name}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= 4
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                4.0 (24 reviews)
              </span>
            </div>

            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold mr-2">
                {siteConfig.currency}
                {discountedPrice}
              </span>
              {discount > 0 && (
                <span className="text-muted-foreground line-through">
                  {siteConfig.currency}
                  {product.price}
                </span>
              )}
              <span className="text-sm text-muted-foreground ml-2">
                per {product.unit}
              </span>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="flex items-center mb-6">
              <div className="mr-4">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center mt-1 border rounded-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={handleRemoveFromCart}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={handleAddToCart}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center mt-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      product.in_stock ? "bg-green-500" : "bg-red-500"
                    } mr-2`}
                  ></span>
                  <span className="text-sm">
                    {product.in_stock
                      ? `In Stock (${product.stock_quantity} ${product.unit}s available)`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share product</span>
                </Button>
              </motion.div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Truck className="h-4 w-4 mr-2 text-primary" />
                <span>
                  Free delivery on orders over {siteConfig.currency}500
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>Delivery in {siteConfig.deliveryTime}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span>100% authentic products</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mb-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget
              aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies
              lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet
              nisl.
            </p>
            <ul>
              <li>Fresh and high quality</li>
              <li>Sourced from trusted suppliers</li>
              <li>Carefully packed and delivered</li>
              <li>Best in class quality assurance</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            {[1, 2, 3].map((review) => (
              <div key={review} className="border-b pb-4 last:border-0">
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Customer {review}</h4>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= 4
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    2 days ago
                  </span>
                </div>
                <p className="text-sm">
                  Great product! Exactly as described and arrived quickly.
                </p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Load More Reviews
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
            <p>
              We deliver to all areas in Surat within {siteConfig.deliveryTime}.
            </p>
            <p>Free delivery on orders above {siteConfig.currency}500.</p>

            <h3 className="text-lg font-medium mt-4 mb-2">Return Policy</h3>
            <p>
              If you're not satisfied with your purchase, you can return it
              within 24 hours of delivery.
            </p>
            <p>
              Please ensure the product is unused and in its original packaging.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Related Products</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={category ? `/categories/${category.slug}` : "/categories"}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
