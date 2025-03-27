"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/context/sound-context";

export function OrderSuccessContent() {
  const { playSound } = useSound();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";

  useEffect(() => {
    playSound("success");
  }, [playSound]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your order. Your order ID is{" "}
          <strong>{orderId}</strong>.
        </p>
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Delivery Information</h2>
          <p className="text-sm text-muted-foreground">
            Your order will be delivered within 10-15 minutes. You will receive
            an SMS with tracking details.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View Order</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
