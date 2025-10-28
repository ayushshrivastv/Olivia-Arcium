'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type PromoItem = {
  id: string;
  title: string;
  subtitle?: string;
  timeRemaining?: string;
  dateRange?: { from: string; to: string };
  linkUrl: string;
  bgColor: string;
  textColor: string;
  buttonText?: string;
};

const promos: PromoItem[] = [
  {
    id: '1',
    title: 'Welcome to Olivia',
    subtitle: 'The Future of Prediction Markets',
    timeRemaining: 'LIVE NOW - JOIN THE BETA',
    linkUrl: '/markets',
    bgColor: 'from-[#121212] to-[#001A2C]',
    textColor: 'text-white',
    buttonText: 'Explore Markets',
  },
  {
    id: '2',
    title: 'Predict. Win. Earn.',
    subtitle: 'Turn Your Knowledge Into Rewards',
    timeRemaining: 'ZERO FEES - BETA LAUNCH',
    linkUrl: '/signup',
    bgColor: 'from-[#121212] to-[#291500]',
    textColor: 'text-white',
    buttonText: 'Start Predicting',
  },
  {
    id: '3',
    title: 'Privacy-First Trading',
    subtitle: 'Secure, Anonymous, Decentralized',
    timeRemaining: 'POWERED BY ARCIUM MPC',
    linkUrl: '/about',
    bgColor: 'from-[#121212] to-[#1A0F00]',
    textColor: 'text-white',
    buttonText: 'Learn More',
  },
];

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-8 pb-4">
      <div className="relative rounded-xl overflow-hidden">
        {/* Carousel items */}
        <div className="relative h-[180px]">
          {promos.map((promo, index) => (
            <div
              key={promo.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Link href={promo.linkUrl} className="block h-full">
                <div
                  className={`h-full w-full bg-gradient-to-r ${promo.bgColor} p-8 flex flex-col justify-center`}
                >
                  {promo.timeRemaining && (
                    <div className="mb-2 text-xs bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full w-fit">
                      {promo.timeRemaining}
                    </div>
                  )}

                  {promo.dateRange && (
                    <div className="mb-2 text-xs bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full w-fit">
                      {promo.dateRange.from} - {promo.dateRange.to}
                    </div>
                  )}

                  <h2
                    className={`text-2xl md:text-3xl font-light mb-1 ${promo.textColor}`}
                  >
                    {promo.title}
                  </h2>
                  {promo.subtitle && (
                    <p
                      className={`text-lg md:text-xl ${promo.textColor} opacity-80`}
                    >
                      {promo.subtitle}
                    </p>
                  )}

                  {promo.buttonText && (
                    <div className="mt-4">
                      <button className="px-4 py-1.5 bg-[#5522e0] text-white text-xs rounded-full hover:bg-[#5522e0]/90 transition">
                        {promo.buttonText}
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-white' : 'bg-white/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
