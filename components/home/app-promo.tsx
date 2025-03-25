"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Check, Download } from "lucide-react";

export function AppPromo() {
  return (
    <section className="py-12 mb-10 bg-muted/50 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          className="px-6 md:pl-10"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Download Our Mobile App
          </h2>
          <p className="text-muted-foreground mb-6">
            Get the {siteConfig.name} mobile app for a seamless shopping
            experience. Order groceries on the go and get them delivered to your
            doorstep in minutes.
          </p>

          <ul className="space-y-2 mb-6">
            {[
              "Exclusive app-only offers and discounts",
              "Real-time order tracking",
              "Save favorite items for quick reordering",
              "Get notifications about deals and promotions",
            ].map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download for Android
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download for iOS
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative h-[400px] w-full"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="/placeholder.svg?height=600&width=400&text=Mobile+App"
            alt="Mobile App"
            fill
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
