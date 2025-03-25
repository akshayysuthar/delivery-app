import { HeroSection } from "@/components/home/hero-section";
import { CategoryList } from "@/components/home/category-list";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PopularItems } from "@/components/home/popular-items";
import { DeliveryInfo } from "@/components/home/delivery-info";
import { AppFeatures } from "@/components/home/app-features";
import { AppPromo } from "@/components/home/app-promo";
import { Testimonials } from "@/components/home/testimonials";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <DeliveryInfo />
      <CategoryList />
      <FeaturedProducts />
      <PopularItems />
      <AppFeatures />
      <AppPromo />
      <Testimonials />
    </div>
  );
}
