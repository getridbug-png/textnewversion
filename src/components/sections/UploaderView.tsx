"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, XCircle } from "lucide-react"; // Added XCircle here
import { cn } from "@/lib/utils";

interface UploaderViewProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean; // To show a general loading state from parent
  statusMessage: { type: 'success' | 'error'; message: string } | null;
}

export default function UploaderView({ 
  onFileSelect, 
  isLoading,
  statusMessage 
}: UploaderViewProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
      event.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const accentColor = "text-primary"; // Or define in parent and pass as prop
  const accentBorderColor = "border-primary";

  return (
    <motion.div
      key="uploader"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: "-50%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center flex-grow"
    >
      <div className="text-center mb-8 md:mb-12">
        <motion.h2 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}} 
          transition={{delay:0.1}} 
          className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900"
        >
          The Digital AI Canvas
        </motion.h2>
        <motion.p 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}} 
          transition={{delay:0.2}} 
          className="mt-4 text-lg leading-relaxed text-muted-foreground"
        >
          Upload, type, and boom! Your text is behind image.
        </motion.p>
      </div>

      {isLoading ? (
         <div className="flex flex-col items-center justify-center text-slate-600 py-10">
           <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
           <p className="font-semibold text-lg">{statusMessage?.message || "Processing your image..."}</p>
           <p className="text-sm text-muted-foreground">This might take a moment, especially the first time.</p>
         </div>
      ) : (
       <div className="w-full max-w-xl bg-card p-6 md:p-8 rounded-xl shadow-2xl border">
         <div
           onDragEnter={handleDragEnter}
           onDragLeave={handleDragLeave}
           onDragOver={handleDragOver}
           onDrop={handleDrop}
           className={cn(
             "relative group aspect-video w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors duration-300 ease-in-out p-4",
             isDragging ? `${accentBorderColor} bg-primary/10` : `border-border hover:border-muted-foreground/70`,
             "bg-background hover:bg-slate-50" 
           )}
         >
           <UploadCloud className={cn("mx-auto h-12 w-12 text-muted-foreground/80 group-hover:text-primary transition-colors", isDragging ? accentColor : "")} />
           <p className="mt-3 text-sm text-muted-foreground">
             Drag & drop an image here, or
           </p>
           <Label
             htmlFor="image-upload-input" // Changed ID for clarity
             className={cn(
               "mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
               "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700",
               "h-10 px-4 py-2 cursor-pointer"
             )}
           >
             Click to Browse
           </Label>
           <p className="text-xs text-muted-foreground/70 mt-2">PNG, JPG, WEBP up to 10MB</p>
           <Input
             id="image-upload-input" // Changed ID
             type="file"
             accept="image/*"
             onChange={handleFileChange}
             className="absolute w-px h-px p-0 m-[-1px] overflow-hidden clip-rect-0 whitespace-nowrap border-0"
           />
         </div>
          {statusMessage && statusMessage.type === 'error' && !isLoading && (
             <p className="mt-4 text-sm text-center text-red-600 flex items-center justify-center gap-2">
                 <XCircle size={18} />{statusMessage.message}
             </p>
          )}
       </div>
      )}
    </motion.div>
  );
}