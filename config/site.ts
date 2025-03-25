export const siteConfig = {
  name: "QuickBasket",
  description:
    "Surat's fastest grocery delivery service - get your essentials in minutes!",
  logo: "/logo.svg",
  navigation: [
    { title: "Home", href: "/" },
    { title: "Categories", href: "/categories" },
    { title: "Offers", href: "/offers" },
    { title: "My Account", href: "/account" },
  ],
  footer: {
    company: {
      name: "QuickBasket Groceries Pvt. Ltd.",
      address: "123 City Light Road, Surat, Gujarat, India",
      phone: "+91 9876543210",
      email: "support@quickbasket.com",
    },
    links: [
      { title: "About Us", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Terms & Conditions", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "FAQs", href: "/faqs" },
    ],
    social: [
      { name: "Twitter", href: "https://twitter.com/quickbasket" },
      { name: "Facebook", href: "https://facebook.com/quickbasket" },
      { name: "Instagram", href: "https://instagram.com/quickbasket" },
    ],
  },
  deliveryAreas: ["Adajan", "City Light", "Vesu", "Piplod", "Pal", "Athwa"],
  deliveryTime: "10-15 minutes",
  currency: "₹",
  adminEmail: "akshaysuthar05@gmail.com",
  developer: {
    name: "TechInnovate Solutions",
    website: "https://techinnovate.dev",
    email: "contact@techinnovate.dev",
    year: 2023,
  },
  appFeatures: [
    {
      title: "Fast Delivery",
      description: "Get your groceries delivered in just 10-15 minutes",
      icon: "Zap",
    },
    {
      title: "Wide Selection",
      description: "Choose from over 5000+ products across multiple categories",
      icon: "ShoppingBag",
    },
    {
      title: "Fresh Produce",
      description:
        "Farm-fresh fruits and vegetables sourced directly from local farmers",
      icon: "Apple",
    },
    {
      title: "Best Prices",
      description: "Competitive pricing with regular discounts and offers",
      icon: "Tag",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free returns and refunds for any issues",
      icon: "RefreshCw",
    },
    {
      title: "Secure Payments",
      description: "Multiple secure payment options for your convenience",
      icon: "Shield",
    },
  ],
  version: "1.0.0",
};
