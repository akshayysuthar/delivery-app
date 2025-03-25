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
  Menu,
  X,
  LogOut,
  Volume2,
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
import { searchProducts } from "@/lib/mock-data";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchProducts(searchQuery);
      setSearchResults(results.slice(0, 5));
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
          "sticky top-0 z-40 w-full transition-all duration-200",
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
            </div>

            <div className="hidden md:flex md:flex-1 mx-4 lg:mx-8">
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
                    if (e.key === "Escape") {
                      setIsSearchOpen(false);
                    } else if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                />
                <AnimatePresence>
                  {isSearchOpen && searchResults.length > 0 && (
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
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
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {isSoundEnabled ? "Mute sounds" : "Enable sounds"}
                </span>
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
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
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

            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="relative mr-2"
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t"
            >
              <div className="container mx-auto px-4 py-3">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <form onSubmit={handleSearch}>
                    <Input
                      type="search"
                      placeholder="Search for groceries..."
                      className="w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <nav className="flex flex-col space-y-1">
                  {siteConfig.navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}

                  <div className="flex items-center px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSound}
                      className="text-muted-foreground p-0 h-8 w-8"
                    >
                      {isSoundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="ml-2 text-sm">
                      {isSoundEnabled ? "Sounds On" : "Sounds Off"}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  {user ? (
                    <>
                      <Link
                        href="/account"
                        className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Addresses
                      </Link>
                      <button
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-red-600 w-full text-left"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sliding Cart */}
      <SlidingCart />
    </>
  );
}
