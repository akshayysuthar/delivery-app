"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    title: "Fresh Vegetables & Fruits",
    description: "Get farm-fresh produce delivered to your doorstep in minutes",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Shop Now",
    link: "/categories/fresh-produce",
  },
  {
    id: 2,
    title: "50% OFF on First Order",
    description: "Use code WELCOME50 at checkout",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Claim Offer",
    link: "/offers",
  },
  {
    id: 3,
    title: "Daily Essentials",
    description: "Stock up on everyday items with our quick delivery",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Explore",
    link: "/categories/daily-essentials",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl mb-8">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-12">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{slide.title}</h1>
              <p className="text-sm md:text-base lg:text-lg text-white/90 mb-6 max-w-md">{slide.description}</p>
              <div>
                <Button asChild size="lg" className="font-semibold">
                  <a href={slide.link}>{slide.cta}</a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentSlide ? "bg-white w-4" : "bg-white/50",
            )}
            onClick={() => setCurrentSlide(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

