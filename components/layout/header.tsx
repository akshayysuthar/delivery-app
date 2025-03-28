"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  Search,
  Home,
  LogOut,
  Volume1,
  VolumeX,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { SlidingCart } from "@/components/cart/sliding-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  searchProducts,
  fetchUserAddresses,
  fetchUserOrders,
} from "@/lib/supabase-client";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { cartItems, setIsCartOpen } = useCart();
  const { playSound, isSoundEnabled, toggleSound } = useSound();
  const { user, signOut, isAdmin } = useAuth();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const addresses = await fetchUserAddresses(user.id);
        if (addresses.length > 0) {
          const defaultAddr = addresses[0];
          setDefaultAddress(`${defaultAddr.address_line1}`);
        }

        const orders = await fetchUserOrders(user.id);
        if (orders.length > 0) {
          const latestOrder = orders[0];
          const slot = latestOrder.delivery_slots;
          if (slot) {
            const start = slot.start_time.slice(0, 5);
            const end = slot.end_time.slice(0, 5);
            setSlotTime(`${start} - ${end}`);
          } else {
            setSlotTime("No slot booked");
          }
        } else {
          setSlotTime("No slot booked");
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const handleSearch = async () => {
        const results = await searchProducts(searchQuery);
        if (!Array.isArray(results)) {
          console.error("Error searching products: Invalid response format");
          return;
        }
        setSearchResults(results.slice(0, 5));
      };
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCartClick = () => {
    setIsCartOpen(true);
    playSound("click");
  };

  const handleSignOut = async () => {
    await signOut();
    playSound("click");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchItemClick = (productId: string) => {
    setIsSearchOpen(false);
    router.push(`/products/${productId}`);
    setSearchQuery("");
    playSound("click");
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200 hidden md:block",
          isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/placeholder.svg"
                  alt={siteConfig.name}
                  width={40}
                  height={40}
                />
                <span className="hidden font-bold text-xl sm:inline-block">
                  {siteConfig.name}
                </span>
              </Link>
              <div className="ml-6">
                <span className="text-sm">
                  Early Slot: {slotTime || "Loading..."}
                </span>
                <br />
                <span className="text-sm flex items-center">
                  <Home className="h-3 w-3 mr-1" /> {user?.full_name},{" "}
                  {defaultAddress || "No address set"}
                </span>
              </div>
            </div>
            <div className="flex-1 mx-4 lg:mx-8">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for groceries, vegetables, fruits..."
                  className="w-full pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsSearchOpen(false);
                    else if (e.key === "Enter") handleSearch(e);
                  }}
                  ref={searchInputRef}
                />
                <AnimatePresence>
                  {isSearchOpen && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSearchItemClick(product.id)}
                        >
                          <div className="h-10 w-10 relative rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {siteConfig.currency}
                              {product.sale_price || product.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-primary"
                          onClick={handleSearch}
                        >
                          See all results for "{searchQuery}"
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <nav className="flex items-center space-x-1">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                >
                  {item.title}
                </Link>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                className="text-muted-foreground"
                title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {isSoundEnabled ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-primary"
                >
                  Admin
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium">
                          {user.full_name || "User"}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/addresses">My Addresses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <SlidingCart />
    </>
  );
}
