import { HeroSection } from "@/components/home/hero-section";
import { CategoryList } from "@/components/home/category-list";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PopularItems } from "@/components/home/popular-items";
import { AppFeatures } from "@/components/home/app-features";
import { AppPromo } from "@/components/home/app-promo";
import { Testimonials } from "@/components/home/testimonials";

import {
  getCategories,
  getProducts,
  getActiveBanners,
  getFeaturedCategories,
} from "@/lib/supabase-client";

export default async function Home() {
  const categories = await getCategories();
  const products = await getProducts();
  const banners = await getActiveBanners();
  const featuredCategories = await getFeaturedCategories();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);
  const popularProducts = products
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <HeroSection banners={banners} featuredCategories={featuredCategories} />
      <CategoryList categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <PopularItems products={popularProducts} />
      <AppFeatures />
      <AppPromo />
      <Testimonials />
      {/* <MobileNavbar /> */}
    </div>
  );
}
