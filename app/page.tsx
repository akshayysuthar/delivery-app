// app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { CategoryList } from "@/components/home/category-list";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PopularItems } from "@/components/home/popular-items";
import { DeliveryInfo } from "@/components/home/delivery-info";
import { AppFeatures } from "@/components/home/app-features";
import { AppPromo } from "@/components/home/app-promo";
import { Testimonials } from "@/components/home/testimonials";
import {
  getCategories,
  getProducts,
  getActiveBanners,
} from "@/lib/supabase-client";
// import { InstallButton } from "@/components/InstallButton";

export default async function Home() {
  const categories = await getCategories();
  const products = await getProducts();
  const banners = await getActiveBanners();
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);
  const popularProducts = products
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome to QuickBasket</h1>
        <InstallButton />
      </div> */}
      <HeroSection banners={banners} />
      <DeliveryInfo />
      <CategoryList categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <PopularItems products={popularProducts} />
      <AppFeatures />
      <AppPromo />
      <Testimonials />
    </div>
  );
}
