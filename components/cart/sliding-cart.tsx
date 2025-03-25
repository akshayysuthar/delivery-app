"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";

export function SlidingCart() {
  const {
    cartItems,
    removeFromCart,
    addToCart,
    getCartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { playSound } = useSound();

  // Close cart when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsCartOpen]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  const handleClose = () => {
    setIsCartOpen(false);
    playSound("click");
  };

  const handleIncreaseQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    if (item) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        unit: item.unit,
        in_stock: true,
        stock_quantity: 100,
        category_id: "",
        description: "",
        created_at: "",
      });
      playSound("add");
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    removeFromCart(productId);
    playSound("remove");
  };

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? (subtotal > 500 ? 0 : 40) : 0;
  const total = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background z-50 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Cart (
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{" "}
                items)
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button onClick={handleClose}>Start Shopping</Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start border rounded-lg p-3"
                    >
                      <div className="h-16 w-16 relative rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {siteConfig.currency}
                          {item.price} per {item.unit}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-full">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full p-0"
                              onClick={() => handleDecreaseQuantity(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="w-7 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full p-0"
                              onClick={() => handleIncreaseQuantity(item.id)}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Increase quantity</span>
                            </Button>
                          </div>
                          <div className="font-medium text-sm">
                            {siteConfig.currency}
                            {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        {siteConfig.currency}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span>
                        {deliveryFee === 0 && subtotal > 0
                          ? "Free"
                          : `${siteConfig.currency}${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Add {siteConfig.currency}
                        {(500 - subtotal).toFixed(2)} more for free delivery
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>
                        {siteConfig.currency}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      asChild
                      onClick={() => {
                        setIsCartOpen(false);
                        playSound("click");
                      }}
                    >
                      <Link href="/cart">
                        Go to Cart
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleClose}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
