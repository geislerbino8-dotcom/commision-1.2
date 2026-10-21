import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Sparkles, Heart, Leaf, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FeaturedCarousel } from './FeaturedCarousel';

interface HeroProps {
  onStartOrdering: () => void;
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onExploreCategory: (category: string) => void;
}

const HERO_SLIDES = [
  { src: '/images/storefront.webp', alt: 'Mr. Boy SpecialTea storefront' },
  { src: '/images/Boy.jpeg', alt: 'Mr. Boy SpecialTea at night' },
  { src: '/images/menuboard.webp', alt: 'Our menu board' },
  { src: '/images/475807591_609840018360890_5530054815047393827_n.jpg', alt: 'Freshly poured iced drink' },
];

const AUTO_MS = 5000;

export const Hero: React.FC<HeroProps> = ({
  onStartOrdering,
  onAddToCart,
  onExploreCategory,
}) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HERO_SLIDES.length;

  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);
  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(id);
  }, [next, paused]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Banner Carousel */}
      <section
        className="relative overflow-hidden rounded-3xl bg-brand-brown py-12 sm:py-20 text-center text-white shadow-xl mx-2.5 sm:mx-4 mt-2.5 sm:mt-4 group/carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Mr. Boy SpecialTea highlights"
      >
        {/* Slides */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center kenburns"
              style={{ backgroundImage: `url('${slide.src}')` }}
            />
          </div>
        ))}

        {/* Readability scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/75 to-brand-brown/45" />

        {/* Prev / Next controls */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 sm:p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber/70 opacity-0 group-hover/carousel:opacity-100 sm:opacity-60 sm:hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 sm:p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber/70 opacity-0 group-hover/carousel:opacity-100 sm:opacity-60 sm:hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber/70 ${
                i === active ? 'w-6 bg-brand-amber' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Foreground content */}
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 sm:gap-6 px-4">
          <div className="relative">
            <img
              src="/images/IMG_2476.jpeg"
              alt="Mr. Boy SpecialTea Logo"
              className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-3 sm:border-4 border-white shadow-2xl object-cover ring-4 ring-brand-amber/50"
            />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-orange p-1 sm:p-1.5 text-white shadow">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-amber-50 drop-shadow leading-tight">
              Mr. Boy SpecialTea
            </h1>
            <p className="text-xs sm:text-lg text-amber-100/90 font-medium">
              Dela Costa V, Burgos Montalban, Rodriguez Rizal
            </p>
          </div>

          <p className="max-w-xl text-xs sm:text-base italic text-amber-200/80 leading-relaxed px-2">
            “Welcome to Mr.Boy SpecialTea. Enjoy the taste of our drinks at an affordable price! From Milk Tea, Fruit Tea, to freshly brewed Coffee!”
          </p>

          <Button
            variant="brand"
            size="lg"
            onClick={onStartOrdering}
            className="group gap-2 rounded-full px-6 py-5 sm:px-8 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-95 transition-transform"
          >
            Start Ordering Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Product Showcase Sliding Carousel (1 from each category) */}
      <FeaturedCarousel
        onAddToCart={onAddToCart}
        onExploreCategory={onExploreCategory}
      />

      {/* Our Approach Section */}
      <section className="container mx-auto px-4 pt-4">
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-brown">
            Our Approach
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's how we make your every sip better.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-t-4 border-t-brand-amber bg-white/80 backdrop-blur transition-transform hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-brand-coffee">
                <Sparkles className="h-6 w-6 text-brand-orange" />
              </div>
              <CardTitle className="text-lg text-brand-brown">Simple Flavors</CardTitle>
              <CardDescription className="text-xs">
                Easy, balanced blends curated for maximum delight.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-t-4 border-t-brand-coffee bg-white/80 backdrop-blur transition-transform hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-brand-coffee">
                <ShieldCheck className="h-6 w-6 text-brand-coffee" />
              </div>
              <CardTitle className="text-lg text-brand-brown">Clean Labels</CardTitle>
              <CardDescription className="text-xs">
                Clear, honest, and high-quality ingredients you can trust.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-t-4 border-t-green-600 bg-white/80 backdrop-blur transition-transform hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Leaf className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-brand-brown">Ethically Sourced</CardTitle>
              <CardDescription className="text-xs">
                Sourced sustainably from dedicated and fair farms.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-t-4 border-t-red-500 bg-white/80 backdrop-blur transition-transform hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-brand-brown">Balanced Sweetness</CardTitle>
              <CardDescription className="text-xs">
                Naturally brewed, lightly sweetened to perfection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};
