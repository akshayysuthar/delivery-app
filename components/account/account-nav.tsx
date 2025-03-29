"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const navItems = [
  {
    title: "Profile",
    href: "/account",
    icon: User,
  },
  {
    title: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    title: "Payment Methods",
    href: "/account/payment",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

export function AccountNav() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <item.icon className="h-4 w-4 mr-3" />
          {item.title}
        </Link>
      ))}
      {/* <button>Sign out</button> */}
      <Button
        variant="ghost"
        className="flex w-full items-center justify-start px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => signOut({ redirectUrl: "/" })}
      >
        <LogOut className="h-4 w-4 mr-3" />
        Sign Out
      </Button>
    </nav>
  );
}
