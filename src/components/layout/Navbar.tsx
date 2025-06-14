"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have this from shadcn/ui

// Optional: An icon for your brand
// import { Layers } from "lucide-react"; // Example icon

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50); // Add background when scrolled more than 50px
  });

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    // { href: "/blog", label: "Blog" }, // Example for a future link
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out", // Changed to fixed for scroll effect
        scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border/40 shadow-sm" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container h-16 flex items-center justify-between">
        {/* Site Title/Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* <Layers className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" /> */}
          <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-muted-foreground transition-colors">
            TextBehindImage
          </span>
        </Link>

        {/* Navigation Links - Centered */}
        <nav className="hidden md:flex gap-1 items-center"> {/* Reduced gap slightly */}
          {navLinks.map((link) => (
            <Button key={link.label} variant="ghost" asChild size="sm">
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Call to Action Button */}
        <div>
          <Button variant="default" size="sm">
            Try It Free
          </Button>
        </div>
      </div>
    </motion.header>
  );
}