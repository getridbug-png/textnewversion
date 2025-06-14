"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";

// Import your images
import baseImageSrc from "@/images/reveal-base.jpg"; // Your full background image
import foregroundCutoutSrc from "@/images/reveal-foreground.png"; // Your image with background removed (subject only)

const headline = "Text Behind Image";
const subHeadline = "Transform your photos with our AI-powered text placement technology. Create stunning visuals where text seamlessly integrates behind your subjects.";

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  // Ensure images are correctly typed if they might not have width/height initially (e.g. remote URLs)
  // For static imports, Next.js provides these.
  const imageWidth = (baseImageSrc as StaticImageData)?.width || 1920; // Fallback width
  const imageHeight = (baseImageSrc as StaticImageData)?.height || 1080; // Fallback height

  useEffect(() => {
    const sectionVisibilityTimer = setTimeout(() => {
      setIsSectionVisible(true);
    }, 100);

    return () => clearTimeout(sectionVisibilityTimer);
  }, []);

  const patternColor = "hsl(var(--border))";
  const patternSquareSize = "20px";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: isSectionVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative grid place-items-center min-h-[calc(80vh)] md:min-h-[calc(100vh-8rem)] pt-24 md:pt-32 pb-16 md:pb-20 text-center overflow-hidden bg-white text-black"
    >
      {/* Diagonal Square/Grid Background Pattern Div */}
      <div
        className="absolute inset-0 z-0" // z-index is -1 (behind everything in this section)
        style={{
          backgroundImage: `
            linear-gradient(${patternColor} 1px, transparent 1px),
            linear-gradient(to right, ${patternColor} 1px, transparent 1px)
          `,
          backgroundSize: `${patternSquareSize} ${patternSquareSize}`,
          opacity: 0.3, // Opacity of the background pattern
        }}
      />

      <AnimatePresence>
        {isSectionVisible && (
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Image and Text Container */}
            <motion.div
              className="relative max-w-2xl mx-auto cursor-pointer rounded-lg shadow-xl overflow-hidden"
              style={{ aspectRatio: `${imageWidth}/${imageHeight}` }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {/* 1. Base Image (Bottom Layer) */}
              <Image
                src={baseImageSrc}
                alt="Background layer"
                fill
                style={{ objectFit: "cover" }}
                priority
                placeholder="blur"
                className="z-0" // Lowest layer within this stack
              />

              {/* 2. Text Layer (Middle Layer - ALWAYS 100% OPAQUE) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none z-10" // Above base image
              >
                <h1
                  className="glitch-text-jitter text-4xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)]" // Adjusted shadow for better visibility
                  data-text={headline}>
                  {headline}
                </h1>
              </div>

              {/* 3. Foreground Cutout Image (Top Layer - animates opacity) */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20" // On top of the text initially
                animate={{
                  opacity: isHovered ? 0 : 1, // On hover, becomes very transparent
                                                // Adjust 0.15 (15% opacity) to control how "see-through" it becomes
                }}
                transition={{ duration: 0.3, ease: "circOut" }}
              >
                <Image
                  src={foregroundCutoutSrc}
                  alt="Foreground subject"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </motion.div>
            </motion.div>

            {/* Sub-headline and Button - Below the image */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              className="relative z-30 mt-8 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto" // Ensure this is above the pattern
            >
              {subHeadline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
              className="relative z-30 mt-10" // Ensure this is above the pattern
            >
              <Button size="lg" variant="default">
                Discover The Effect
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}