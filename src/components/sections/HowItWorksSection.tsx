"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, PencilLine, Download } from "lucide-react"; // Icons

const stepsData = [
  {
    number: "01",
    icon: <UploadCloud className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Upload Your Image",
    description: "Drag & drop any JPG, PNG, or WEBP. Our AI instantly identifies the subject.",
  },
  {
    number: "02",
    icon: <PencilLine className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Write & Style Text",
    description: "Add your message. Customize font, size, color, and precise position.",
  },
  {
    number: "03",
    icon: <Download className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Download & Share",
    description: "Get your high-res, layered image, ready for social media or websites.",
  },
];

export default function HowItWorksSection() {
  const sectionVariants = { /* ... same as before ... */ };
  const cardVariants = { /* ... same as before ... */ };

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white text-gray-900"> {/* Ensuring section has a light background and dark text */}
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl" // Removed text-gray-900 as section has it
          >
            Effortless in Three Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-lg leading-relaxed text-muted-foreground"
          >
            Creating stunning text-behind-image effects has never been simpler.
            Follow our intuitive process to bring your ideas to life.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {stepsData.map((step, index) => (
            <motion.div key={index} variants={cardVariants} className="flex">
              <Card className="flex flex-grow flex-col items-center p-6 text-center rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
                {/* Div grouping number and icon */}
                <div className="flex flex-col items-center"> {/* CHANGED: mb-4 to mb-2 (or mb-1 or remove completely) */}
                  <div className="text-5xl font-extrabold text-primary/10 mb-2"> {/* Reduced mb-3 to mb-2 for space above icon */}
                    {step.number}
                  </div>
                  {step.icon}
                </div>
                {/* CardHeader now directly follows the icon block */}
                <CardHeader className="p-0 w-full">
                  <CardTitle className="text-xl font-semibold text-slate-800"> {/* Removed mb-2 from here, space is now controlled by CardHeader or its parent */}
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardDescription className="text-slate-600 text-sm leading-relaxed"> {/* Added mt-2 for space between title and description */}
                  {step.description}
                </CardDescription>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}