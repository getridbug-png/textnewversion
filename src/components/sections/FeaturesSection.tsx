"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Move, Palette, Layers } from "lucide-react";

// The features data remains the same
const featuresList = [
  {
    icon: <Move className="h-10 w-10 text-primary mb-4" />,
    title: "Draggable Text",
    description: "Don't settle for static placement. Click and drag your text anywhere on the canvas to find the perfect spot for your message.",
  },
  {
    icon: <Palette className="h-10 w-10 text-primary mb-4" />,
    title: "Rich Font Styling",
    description: "Your message, your style. Choose from curated fonts, adjust weights and styles, and pick any color to make your text pop.",
  },
  {
    icon: <Layers className="h-10 w-10 text-primary mb-4" />,
    title: "Intelligent AI Layering",
    description: "Our core AI technology automatically detects the subject and intelligently places your text behind it for a professional depth effect.",
  },
];

export default function FeaturesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl"
          >
            Powerful Features, Simple Interface
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg leading-relaxed text-muted-foreground"
          >
            Our tool is packed with features designed to give you creative freedom without the complexity.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featuresList.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className="flex w-full flex-col items-center p-6 text-center rounded-xl border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out">
                
                {/* Icon */}
                {feature.icon}
                
                {/* We can remove CardHeader and apply classes directly to CardTitle and CardDescription */}
                {/* This gives us more direct control over alignment and spacing. */}
                
                <CardTitle className="text-xl font-semibold text-slate-800">
                  {feature.title}
                </CardTitle>
                
                <CardDescription className="mt-2 text-slate-600 text-sm leading-relaxed flex-grow">
                  {/* flex-grow will help with equal height alignment if descriptions vary */}
                  {feature.description}
                </CardDescription>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}