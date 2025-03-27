"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, addHours, isAfter, parseISO } from "date-fns";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useSound } from "@/context/sound-context";
import { siteConfig } from "@/config/site";
import { useToast } from "@/components/ui/use-toast";
import {
  supabase,
  getServiceAreaByPincode,
  getAvailableDeliverySlots,
  fetchUserAddresses,
  createOrder,
  createOrderItems,
  validateCouponCode,
} from "@/lib/supabase-client";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, hasAddress } = useAuth();
  const { playSound } = useSound();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [serviceArea, setServiceArea] = useState<any>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingServiceArea, setIsLoadingServiceArea] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [notes, setNotes] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Fees state
  const [fees, setFees] = useState<any[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  const [applicableFees, setApplicableFees] = useState<any[]>([]);

  // New state for additional charges and coupon
  const [packagingFee, setPackagingFee] = useState(10); // Default packaging fee
  const [taxRate, setTaxRate] = useState(0.05); // 5% tax rate

  const subtotal = getCartTotal();
  const deliveryFee = serviceArea
    ? subtotal > serviceArea.min_order_free_delivery
      ? 0
      : serviceArea.delivery_fee
    : subtotal > 0
    ? subtotal > 500
      ? 0
      : 40
    : 0;

  // Calculate discount from coupon
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;

  // Calculate tax
  const taxableAmount = subtotal - couponDiscount;
  const tax = taxableAmount * taxRate;

  // Calculate total
  const total = taxableAmount + deliveryFee + packagingFee + tax;

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin?redirect=/checkout");
      return;
    }

    if (!hasAddress) {
      router.push("/account/addresses/new?first=true");
      return;
    }

    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    fetchAddresses();
    generateAvailableDates();
  }, [user, hasAddress, cartItems, router]);

  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const address = addresses.find((addr) => addr.id === selectedAddressId);
      setSelectedAddress(address);

      if (address) {
        fetchServiceArea(address.pincode);
      }
    }
  }, [selectedAddressId, addresses]);

  useEffect(() => {
    if (serviceArea && deliveryDate) {
      fetchDeliverySlots();
    }
  }, [serviceArea, deliveryDate]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const data = await fetchUserAddresses(user.id);
      setAddresses(data);

      if (data && data.length > 0) {
        // Select the default address or the first one
        const defaultAddress = data.find((addr) => addr.is_default) || data[0];
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchServiceArea = async (pincode: string) => {
    setIsLoadingServiceArea(true);

    try {
      const area = await getServiceAreaByPincode(pincode);
      setServiceArea(area);

      if (!area) {
        toast({
          title: "Service not available",
          description: `We don't deliver to pincode ${pincode} yet.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching service area:", error);
      toast({
        title: "Failed to check delivery availability",
        variant: "destructive",
      });
    } finally {
      setIsLoadingServiceArea(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const startDate = addHours(today, 2); // Start from 2 hours from now

    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(format(date, "yyyy-MM-dd"));
    }

    setAvailableDates(dates);
    setDeliveryDate(dates[0]); // Select the first available date by default
  };

  const fetchDeliverySlots = async () => {
    if (!serviceArea || !deliveryDate) return;

    setIsLoadingSlots(true);

    try {
      const slots = await getAvailableDeliverySlots(
        serviceArea.id,
        deliveryDate
      );

      // Filter out past slots for today
      const filteredSlots = slots.filter((slot) => {
        if (deliveryDate !== format(new Date(), "yyyy-MM-dd")) {
          return true;
        }

        const now = new Date();
        const slotTime = parseISO(`${deliveryDate}T${slot.start_time}`);
        return isAfter(slotTime, addHours(now, 2)); // Only show slots at least 2 hours in the future
      });

      setDeliverySlots(filteredSlots);

      if (filteredSlots.length > 0) {
        setSelectedSlotId(filteredSlots[0].id);
      } else {
        setSelectedSlotId("");
      }
    } catch (error) {
      console.error("Error fetching delivery slots:", error);
      toast({
        title: "Failed to load delivery slots",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);
    playSound("click");

    try {
      const coupon = await validateCouponCode(couponCode, subtotal);

      if (coupon) {
        setAppliedCoupon(coupon);
        toast({
          title: "Coupon applied",
          description: `${
            coupon.discount_type === "percentage"
              ? `${coupon.discount_value}% off`
              : `${siteConfig.currency}${coupon.discount_value} off`
          } your order`,
        });
        playSound("success");
      } else {
        setAppliedCoupon(null);
        toast({
          title: "Invalid coupon",
          description: "This coupon code is invalid or has expired",
          variant: "destructive",
        });
        playSound("error");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({
        title: "Failed to apply coupon",
        description: "An error occurred while applying the coupon",
        variant: "destructive",
      });
      playSound("error");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    playSound("click");
    toast({
      title: "Coupon removed",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks (unchanged)
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    if (!selectedAddressId) {
      toast({
        title: "Address required",
        description: "Please select a delivery address.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    if (!serviceArea) {
      toast({
        title: "Service not available",
        description: "We don't deliver to your area yet.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    if (!selectedSlotId) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery slot.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    const isSlotAvailable = await isDeliverySlotAvailable(
      selectedSlotId,
      deliveryDate
    );
    if (!isSlotAvailable) {
      toast({
        title: "Slot no longer available",
        description:
          "The selected delivery slot is no longer available. Please select another slot.",
        variant: "destructive",
      });
      playSound("error");
      fetchDeliverySlots();
      return;
    }

    setIsProcessing(true);
    playSound("click");

    try {
      // Create order in Supabase
      const order = await createOrder({
        user_id: user?.id,
        address_id: selectedAddressId,
        delivery_slot_id: selectedSlotId,
        delivery_date: deliveryDate,
        subtotal: subtotal,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
        packaging_fee: packagingFee,
        tax: tax,
        delivery_fee: deliveryFee,
        total_amount: total,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        notes: notes || null,
      });

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await createOrderItems(orderItems);

      playSound("success");

      // Pass the order ID to the order success page via query parameter
      await router.push(`/order-success?orderId=${order.id}`);
      setIsProcessing(false); // Reset processing state after successful navigation
      // clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      playSound("error");
      toast({
        title: "Failed to place order",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Helper function to check if a slot is available
  const isDeliverySlotAvailable = async (slotId: string, date: string) => {
    // Get the slot details
    const { data: slot, error: slotError } = await supabase
      .from("delivery_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      console.error("Error fetching delivery slot:", slotError);
      return false;
    }

    // Get the booking for this slot and date
    const { data: booking, error: bookingError } = await supabase
      .from("slot_bookings")
      .select("*")
      .eq("delivery_slot_id", slotId)
      .eq("delivery_date", date)
      .single();

    if (bookingError && bookingError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching slot booking:", bookingError);
      return false;
    }

    // If no booking exists or orders count is less than max orders, the slot is available
    return !booking || booking.orders_count < slot.max_orders;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please sign in to continue to checkout.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin?redirect=/checkout">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingAddresses) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Add Delivery Address</h1>
        <p className="mb-6">
          Please add a delivery address to continue with checkout.
        </p>
        <Button asChild>
          <Link href="/account/addresses/new">Add Address</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
              <CardDescription>
                Select where you want your order delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-3"
                >
                  {addresses.map((address) => {
                    const addressType =
                      address.address_line2?.split(":")[0] || "Address";
                    return (
                      <div
                        key={address.id}
                        className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={address.id}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={address.id}
                            className="font-medium cursor-pointer"
                          >
                            {addressType}
                            {address.is_default && (
                              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </Label>
                          <p className="text-sm mt-1">
                            {address.address_line1}
                          </p>
                          <p className="text-sm">
                            {address.address_line2?.split(":")[1]?.trim()}
                          </p>
                          {address.landmark && (
                            <p className="text-sm">
                              Landmark: {address.landmark}
                            </p>
                          )}
                          <p className="text-sm">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t have any saved addresses.
                  </p>
                  <Button asChild>
                    <Link href="/account/addresses/new">Add New Address</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/account/addresses/new">Add New Address</Link>
              </Button>
            </CardFooter>
          </Card>

          {isLoadingServiceArea ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : serviceArea ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Delivery Slot
                </CardTitle>
                <CardDescription>
                  Select when you want your order delivered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <Select value={deliveryDate} onValueChange={setDeliveryDate}>
                    <SelectTrigger id="delivery-date" className="w-full">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                          {date === format(new Date(), "yyyy-MM-dd") && (
                            <span className="ml-2 text-xs text-green-600">
                              (Today)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingSlots ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : deliverySlots.length > 0 ? (
                  <div>
                    <Label>Delivery Time</Label>
                    <RadioGroup
                      value={selectedSlotId}
                      onValueChange={setSelectedSlotId}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2"
                    >
                      {deliverySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <RadioGroupItem value={slot.id} id={slot.id} />
                          <Label
                            htmlFor={slot.id}
                            className="text-sm cursor-pointer"
                          >
                            {format(
                              new Date(`2000-01-01T${slot.start_time}`),
                              "h:mm a"
                            )}{" "}
                            -
                            {format(
                              new Date(`2000-01-01T${slot.end_time}`),
                              "h:mm a"
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">
                      No delivery slots available for this date. Please select
                      another date.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ) : selectedAddress ? (
            <div className="flex items-center justify-center p-6 border border-red-200 bg-red-50 rounded-md">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <div>
                <p className="font-medium text-red-700">
                  Service not available
                </p>
                <p className="text-sm text-red-600">
                  We don't deliver to pincode {selectedAddress.pincode} yet.
                  Please select a different address.
                </p>
              </div>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Select how you want to pay for your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div
                  className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setPaymentMethod("cod")}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <Label
                    htmlFor="cod"
                    className="flex items-center cursor-pointer"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Cash on Delivery
                  </Label>
                </div>
                <div
                  className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setPaymentMethod("card")}
                >
                  <RadioGroupItem value="card" id="card" />
                  <Label
                    htmlFor="card"
                    className="flex items-center cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div
                  className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setPaymentMethod("upi")}
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <Label
                    htmlFor="upi"
                    className="flex items-center cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 0L1 6V18L12 24L23 18V6L12 0Z"
                        fill="#3A3A3A"
                      />
                      <path d="M12 0L1 6V18L12 24V0Z" fill="#3A3A3A" />
                      <path d="M12 0V24L23 18V6L12 0Z" fill="#3A3A3A" />
                      <path
                        d="M5.5 9.5L12 13.5L18.5 9.5"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    </svg>
                    UPI
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input id="nameOnCard" required />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" placeholder="name@upi" required />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="border rounded-lg p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name}{" "}
                    <span className="text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </span>
                  <span>
                    {siteConfig.currency}
                    {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="border-t pt-4 mb-4">
              <div className="flex items-center mb-2">
                <Tag className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium">Apply Coupon</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-green-700">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-xs text-green-600">
                      {appliedCoupon.discount_type === "percentage"
                        ? `${appliedCoupon.discount_value}% off`
                        : `${siteConfig.currency}${appliedCoupon.discount_value} off`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="whitespace-nowrap"
                  >
                    {isApplyingCoupon ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {siteConfig.currency}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>
                    -{siteConfig.currency}
                    {couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>
                  {deliveryFee === 0 && subtotal > 0
                    ? "Free"
                    : `${siteConfig.currency}${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Packaging Fee</span>
                <span>
                  {siteConfig.currency}
                  {packagingFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>
                  {siteConfig.currency}
                  {tax.toFixed(2)}
                </span>
              </div>

              {serviceArea && deliveryFee > 0 && (
                <div className="text-xs text-muted-foreground">
                  Add {siteConfig.currency}
                  {(serviceArea.min_order_free_delivery - subtotal).toFixed(
                    2
                  )}{" "}
                  more for free delivery
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {siteConfig.currency}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  isProcessing ||
                  cartItems.length === 0 ||
                  !selectedAddressId ||
                  !serviceArea ||
                  !selectedSlotId
                }
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Place Order • ${siteConfig.currency}${total.toFixed(2)}`
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
