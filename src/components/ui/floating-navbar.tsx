"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className={`fixed inset-x-0 top-10 z-50 mx-auto w-max ${className}`}
      >
        <div className="flex space-x-2 items-center justify-center">
          {navItems.map((navItem, idx: number) => {
            const isActive = pathname === navItem.link;

            return (
              <a
                key={`link-${idx}`}
                href={navItem.link}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative rounded-full px-4 py-2 text-sm transition-all duration-200"
                style={{
                  backgroundColor: hoveredIndex === idx || isActive
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(10, 10, 10, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className="flex items-center gap-2 text-white">
                  {navItem.icon}
                  {navItem.name}
                </span>
              </a>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
