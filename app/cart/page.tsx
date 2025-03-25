"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useSound } from "@/context/sound-context"
import { siteConfig } from "@/config/site"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const { playSound } = useSound()
  const { toast } = useToast()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = getCartTotal()
  const deliveryFee = subtotal > 0 ? (subtotal > 500 ? 0 : 40) : 0
  const total = subtotal + deliveryFee

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId)
    playSound("remove")
  }

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
      playSound("click")
    }
  }

  const handleClearCart = () => {
    clearCart()
    playSound("remove")
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      playSound("error")
      return
    }

    setIsCheckingOut(true)

    // Simulate checkout process
    setTimeout(() => {
      router.push("/checkout")
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </h2>
              <Button variant="outline" size="sm" onClick={handleClearCart} className="text-sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="flex p-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {siteConfig.currency}
                          {item.price} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {siteConfig.currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="border rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {siteConfig.currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 && subtotal > 0 ? "Free" : `${siteConfig.currency}${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {siteConfig.currency}
                      {total.toFixed(2)}
                    </span>
                  </div>
                  {deliveryFee === 0 && subtotal > 0 && (
                    <p className="text-xs text-green-600 mt-1">You've got free delivery!</p>
                  )}
                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Add {siteConfig.currency}
                      {(500 - subtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                </div>
              </div>
              <Button className="w-full mt-6" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

