import Link from "next/link";
import { siteConfig } from "@/config/site"
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">{siteConfig.name}</h3>
            <address className="not-italic text-sm text-muted-foreground">
              <p>{siteConfig.footer.company.address}</p>
              <p className="mt-2">Phone: {siteConfig.footer.company.phone}</p>
              <p>Email: {siteConfig.footer.company.email}</p>
            </address>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Information</h3>
            <ul className="space-y-2 text-sm">
              {siteConfig.footer.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link
                href={siteConfig.footer.social[0].href}
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href={siteConfig.footer.social[1].href}
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href={siteConfig.footer.social[2].href}
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Delivery Areas: {siteConfig.deliveryAreas.join(", ")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Delivery Time: {siteConfig.deliveryTime}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.footer.company.name}.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
