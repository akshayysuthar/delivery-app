"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Search, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BannerSlider } from "./banner-slider";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useSound } from "@/context/sound-context";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
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
import { useClerk } from "@clerk/nextjs";

type Banner = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  link: string | null;
  cta?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

interface HeroSectionProps {
  banners: Banner[];
  featuredCategories: Category[];
}

export function HeroSection({ banners, featuredCategories }: HeroSectionProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { user } = useAuth();
  const { signOut } = useClerk();
  const { cartItems, setIsCartOpen } = useCart();
  const { playSound } = useSound();

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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchItemClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setSearchQuery("");
    playSound("click");
  };

  const handleMobileSearchClick = () => {
    router.push(
      `/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`
    );
  };

  return (
    <div className="mb-8">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden">
        <div className="grid grid-cols-3 gap-2 items-center mb-3">
          <div className="flex flex-col col-span-2">
            <span className="text-base font-bold">Delivery in</span>
            <span className="text-lg font-semibold">
              {slotTime || "Loading..."}
            </span>
            <span className="text-sm text-muted-foreground flex items-center">
              <Home className="h-4 w-4 mr-1" />- {user?.full_name},{" "}
              {defaultAddress || "No address set"}
            </span>
          </div>
          <div className="flex justify-end">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{user.full_name || "User"}</p>
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
          </div>
        </div>

        {/* Sticky Search Bar */}
        <div
          className={cn(
            "sticky top-0 z-50 py-2 transition-all",
            isScrolled ? "bg-white shadow-md" : "bg-transparent"
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search for groceries..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleMobileSearchClick}
              />
            </form>
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-2">
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
                          <p className="text-sm font-medium">{product.name}</p>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Featured Categories Horizontal Scroll */}
        <div className="mt-4 mb-6">
          <div className="overflow-x-auto whitespace-nowrap pb-2">
            <div className="inline-flex space-x-4">
              {featuredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center w-20"
                >
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mb-1 bg-muted/30">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-center line-clamp-1">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Slider */}
      <BannerSlider banners={banners} />

      {/* Cart Button - Fixed on mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={handleCartClick}
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
