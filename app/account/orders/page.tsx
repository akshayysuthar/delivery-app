"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronRight, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { supabase, type Order, type OrderItem } from "@/lib/supabase";
import { AccountNav } from "@/components/account/account-nav";
import { siteConfig } from "@/config/site";
import { useToast } from "@/components/ui/use-toast";

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // For each order, fetch order items
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("order_items")
            .select("*, product:products(*)")
            .eq("order_id", order.id);

          if (itemsError) {
            throw itemsError;
          }

          return {
            ...order,
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: Order["payment_status"]) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please sign in to view your orders.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t placed any orders yet.
              </p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id}
                        </p>
                        <p className="text-sm">
                          Placed on{" "}
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                        <Badge
                          variant={getPaymentStatusBadgeVariant(
                            order.payment_status
                          )}
                        >
                          Payment:{" "}
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="items">
                      <AccordionTrigger className="px-4">
                        Order Details
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="border rounded-md divide-y">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex p-3">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                  <Image
                                    src={
                                      item.product.image || "/placeholder.svg"
                                    }
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="text-sm font-medium">
                                        {item.product.name}
                                      </h3>
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {siteConfig.currency}
                                        {item.price} x {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                      {siteConfig.currency}
                                      {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">
                                {siteConfig.currency}
                                {order.total_amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Payment Method</span>
                              <span>
                                {order.payment_method === "cod"
                                  ? "Cash on Delivery"
                                  : order.payment_method === "card"
                                  ? "Credit/Debit Card"
                                  : "UPI"}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/account/orders/${order.id}`}>
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
