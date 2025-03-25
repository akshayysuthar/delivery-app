"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Regular Customer",
    image: "/placeholder.svg?height=100&width=100&text=PS",
    content:
      "I've been using QuickBasket for 3 months now and it has completely changed how I shop for groceries. The delivery is always on time and the products are fresh!",
    rating: 5,
  },
  {
    id: 2,
    name: "Raj Patel",
    role: "Busy Professional",
    image: "/placeholder.svg?height=100&width=100&text=RP",
    content:
      "As someone who works long hours, QuickBasket has been a lifesaver. I can order groceries during my lunch break and have them delivered by the time I get home.",
    rating: 4,
  },
  {
    id: 3,
    name: "Anita Desai",
    role: "Mother of Two",
    image: "/placeholder.svg?height=100&width=100&text=AD",
    content:
      "The variety of products available is impressive. From fresh produce to household items, I can find everything I need for my family in one place.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-12 mb-10">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't just take our word for it. Here's what our customers have to say
          about their experience with us.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-8 relative"
          >
            <Quote className="absolute text-primary/10 h-24 w-24 -top-4 -left-4 rotate-180" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative h-20 w-20 rounded-full overflow-hidden">
                  <Image
                    src={testimonials[currentIndex].image || "/placeholder.svg"}
                    alt={testimonials[currentIndex].name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonials[currentIndex].rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="mb-4 italic">
                  {testimonials[currentIndex].content}
                </p>

                <div>
                  <h4 className="font-semibold">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous testimonial</span>
          </Button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="sr-only">Go to testimonial {index + 1}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next testimonial</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
