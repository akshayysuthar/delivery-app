"use client";

import Link from "next/link";
import { Home, ShoppingCart, ListChecks, Grid, User } from "lucide-react";
import { usePathname } from "next/navigation";

const MobileNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/cart", icon: ShoppingCart, label: "Cart" },
    { href: "/account/orders", icon: ListChecks, label: "Orders" },
    { href: "/categories", icon: Grid, label: "Categories" },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-5">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`flex flex-col items-center justify-center py-2 hover:bg-muted/50 transition-colors ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
