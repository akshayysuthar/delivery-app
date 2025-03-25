"use client";

import type React from "react";

import { motion } from "framer-motion";
import {
  Zap,
  ShoppingBag,
  Apple,
  Tag,
  RefreshCw,
  Shield,
  Truck,
  Clock,
  CreditCard,
  Smartphone,
  MapPin,
  Heart,
} from "lucide-react";
import { siteConfig } from "@/config/site";

const iconComponents: Record<string, React.ComponentType<any>> = {
  Zap,
  ShoppingBag,
  Apple,
  Tag,
  RefreshCw,
  Shield,
  Truck,
  Clock,
  CreditCard,
  Smartphone,
  MapPin,
  Heart,
};

export function AppFeatures() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12 mb-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Why Choose {siteConfig.name}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're committed to making grocery shopping easier, faster, and more
          convenient for you.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {siteConfig.appFeatures.map((feature, index) => {
          const IconComponent = iconComponents[feature.icon] || ShoppingBag;

          return (
            <motion.div
              key={index}
              className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
              variants={item}
            >
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
