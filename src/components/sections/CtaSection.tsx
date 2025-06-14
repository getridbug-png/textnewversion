"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { removeBackground, Config as ImglyConfig } from "@imgly/background-removal";
import Konva from 'konva';

// Import the UploaderView
import UploaderView from "./UploaderView"; // Assuming UploaderView.tsx is in the same directory
import { Loader2 } from "lucide-react"; // For the main loading state

// Define types here or import from a shared types file
// These types will be used by CtaSection and passed as initial props to EditorView
interface TextConfig {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle: "normal" | "italic";
  fontWeight: "normal" | "bold";
  draggable: boolean;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface CanvasImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

const MAX_CANVAS_WIDTH_FALLBACK = 600; // Used for initial text node positioning

// Dynamically import the EditorView to code-split and load only when needed
const EditorView = dynamic(() => import("./EditorView"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center flex-grow text-slate-600 h-96"> {/* Added h-96 for defined loading space */}
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
      <p className="font-semibold text-lg">Loading Editor Interface...</p>
    </div>
  ),
});

export default function CtaSection() {
  const [viewMode, setViewMode] = useState<'uploader' | 'editor'>('uploader');
  const [imageFile, setImageFile] = useState<File | null>(null); // The raw uploaded file
  
  // Data to pass to EditorView once processing is done
  const [originalKonvaImage, setOriginalKonvaImage] = useState<CanvasImage | null>(null);
  const [cutoutKonvaImage, setCutoutKonvaImage] = useState<CanvasImage | null>(null);
  const [initialTextNodes, setInitialTextNodes] = useState<TextConfig[]>([]);
  
  const [isLoading, setIsLoading] = useState(false); // General loading (covers BG removal)
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Function to load image file into an HTMLImageElement (needed by Konva)
  const loadImageForKonva = (src: string): Promise<CanvasImage> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous"; // For potential tainted canvas issues
      img.src = src;
      img.onload = () => {
        console.log(`CtaSection: Image loaded for Konva ${src.substring(0,30)}, w: ${img.width}, h: ${img.height}`);
        resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight }); // Use naturalWidth/Height
      };
      img.onerror = (err) => {
        console.error(`CtaSection: Error loading image ${src}`, err);
        reject(err);
      };
    });
  };

  // Main image processing logic
  const processUploadedImage = async (file: File) => {
    if (!file) return;
    
    setIsLoading(true);
    setStatusMessage({ type: 'success', message: 'Processing image... This may take a moment.'});
    console.log("CtaSection: processUploadedImage - Started for file:", file.name);

    try {
      const originalImageUrl = URL.createObjectURL(file);
      const originalImgData = await loadImageForKonva(originalImageUrl);
      
      setStatusMessage({ type: 'success', message: 'Removing background...'});

      const config: ImglyConfig = { 
        model: 'isnet_fp16', // Or 'medium' if that's the actual model filename key for browser version
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          console.log(`IMG.LY Progress - ${key}: ${current}/${total} (${percent}%)`); 
          if (key.startsWith('fetch')) { // Only show detailed progress for model download
            setStatusMessage({ type: 'success', message: `Preparing AI Model: ${percent}%` });
          }
        },
      };
      const blob = await removeBackground(file, config);
      const cutoutImageUrl = URL.createObjectURL(blob);
      const cutoutImgData = await loadImageForKonva(cutoutImageUrl);

      // Set data needed for EditorView
      setOriginalKonvaImage(originalImgData);
      setCutoutKonvaImage(cutoutImgData);
      
      
      const defaultFontSize = Math.max(24, Math.min(48, Math.round((originalImgData.image.naturalHeight || MAX_CANVAS_WIDTH_FALLBACK / (originalImgData.image.naturalWidth / originalImgData.image.naturalHeight || 16/9)) / 12)));// Calculate initial text properties based on original image size (EditorView will calculate final canvas size)
      const textCanvasWidth = originalImgData.width || MAX_CANVAS_WIDTH_FALLBACK;
      const textCanvasHeight = originalImgData.height || (MAX_CANVAS_WIDTH_FALLBACK / (originalImgData.width / originalImgData.height || 16/9));
      const defaultTextId = `text-${Date.now()}`;
      setInitialTextNodes([{
        id: defaultTextId,
        text: 'Your Text Here',
        x: 50, 
        y: 50,
        fontSize: defaultFontSize,
        fontFamily: 'Arial', fill: '#333333', fontStyle: 'normal', fontWeight: 'bold',
        draggable: true, rotation: 0, scaleX: 1, scaleY: 1,
      }]);
      
      setViewMode('editor'); // Switch to editor view
      setStatusMessage(null);

    } catch (error: any) {
      console.error("CtaSection: Error processing image:", error);
      setStatusMessage({ type: 'error', message: error.message || "Image processing failed. Please check console or try another image." });
      // Reset relevant states
      setOriginalKonvaImage(null);
      setCutoutKonvaImage(null);
      setImageFile(null); // Clear the problematic file
      setViewMode('uploader'); // Revert to uploader on critical error
    } finally {
      setIsLoading(false);
      console.log("CtaSection: processUploadedImage - Finished.");
    }
  };
  
  // Effect to trigger processing when imageFile is set
  useEffect(() => {
    let didProcess = false; // Flag to ensure processing happens once per imageFile change in uploader mode
    if (imageFile && viewMode === 'uploader' && !isLoading && !didProcess) {
      didProcess = true;
      processUploadedImage(imageFile);
    }
  }, [imageFile, viewMode, isLoading, processUploadedImage]); 

  const handleExportImage = async (
    currentDisplayStage: Konva.Stage | null,
    textNodesForExport: TextConfig[] | null,
    exportFinishedCallback?: () => void
  ) => {
    console.log("CtaSection: EXPORT - handleExportImage called.");
    if (!currentDisplayStage || !originalKonvaImage || !cutoutKonvaImage || !textNodesForExport || textNodesForExport.length === 0) {
      console.error("CtaSection: EXPORT - Aborting. Missing necessary data.");
      setStatusMessage({type: 'error', message: "Cannot export. Data missing."});
      if (exportFinishedCallback) exportFinishedCallback();
      // No need to set isLoading here if it wasn't set to true yet
      return;
    }

    setIsLoading(true); // Set loading true at the beginning of the attempt
    setStatusMessage({type: 'success', message: "Preparing high-quality export..."});

    let exportStage: Konva.Stage | null = null;
    let tempContainer: HTMLDivElement | null = null;

    // Define the core export logic as a promise
    const performExport = () => new Promise<void>((resolve, reject) => {
      setTimeout(() => { // Keep the setTimeout to ensure canvas is flushed
        try {
          if (!originalKonvaImage || !cutoutKonvaImage || !textNodesForExport || !currentDisplayStage) { // Re-check critical refs/data
            console.error("CtaSection: EXPORT (Promise) - Critical data became null.");
            reject(new Error("Critical data missing during export generation."));
            return;
          }

          const originalWidth = originalKonvaImage.image.naturalWidth;
          const originalHeight = originalKonvaImage.image.naturalHeight;
          const displayWidth = currentDisplayStage.width();

          if (!originalWidth || !originalHeight || !displayWidth) {
            console.error("CtaSection: EXPORT (Promise) - Invalid dimensions for scaling.");
            reject(new Error("Image dimension error for export."));
            return;
          }
          const scaleFactor = originalWidth / displayWidth;

          tempContainer = document.createElement('div');
          exportStage = new Konva.Stage({
            container: tempContainer,
            width: originalWidth,
            height: originalHeight,
          });
          const exportLayer = new Konva.Layer();
          exportStage.add(exportLayer);
          console.log("CtaSection: EXPORT (Promise) - Off-screen stage created.");

          exportLayer.add(new Konva.Image({ image: originalKonvaImage.image, width: originalWidth, height: originalHeight }));
          textNodesForExport.forEach(tn => {
            exportLayer.add(new Konva.Text({ /* ... text properties scaled ... */
              x: tn.x * scaleFactor, y: tn.y * scaleFactor, text: tn.text, fontSize: tn.fontSize * scaleFactor,
              fontFamily: tn.fontFamily, fill: tn.fill, fontStyle: tn.fontStyle, fontWeight: tn.fontWeight,
              rotation: tn.rotation, scaleX: tn.scaleX, scaleY: tn.scaleY,
            }));
          });
          exportLayer.add(new Konva.Image({ image: cutoutKonvaImage.image, width: originalWidth, height: originalHeight }));
          exportLayer.draw();
          console.log("CtaSection: EXPORT (Promise) - Off-screen layer drawn.");
          
          const mimeType = 'image/jpeg'; 
          const fileExtension = mimeType === 'image/jpeg' ? 'jpeg' : 'jpg';
          const dataURL = exportStage.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
          const originalFileNameWithoutExtension = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
          const newFileName = `${originalFileNameWithoutExtension}-textBehind.${fileExtension}`;
          
          if (dataURL && dataURL.length > 100) {
            console.log("CtaSection: EXPORT (Promise) - Data URL generated.");
            const link = document.createElement('a');
            link.download = newFileName;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("CtaSection: EXPORT (Promise) - Download triggered.");
            setStatusMessage({type: 'success', message: "Image exported successfully!"});
            resolve();
          } else {
            console.error("CtaSection: EXPORT (Promise) - Failed to generate valid Data URL.");
            setStatusMessage({type: 'error', message: "Failed to generate image (empty data)."});
            reject(new Error("Failed to generate valid Data URL."));
          }
        } catch (e_promise: any) {
          console.error("CtaSection: EXPORT (Promise) - Error during toDataURL or download:", e_promise, e_promise.stack);
          setStatusMessage({type: 'error', message: `Export error: ${e_promise.message}`});
          reject(e_promise);
        } finally {
          if (exportStage) {
            exportStage.destroy();
            console.log("CtaSection: EXPORT (Promise) - Off-screen stage destroyed.");
          }
        }
      }, 250); // Keep a reasonable delay
    });

    // Execute the export
    try {
      await performExport();
    } catch (e_export_async) {
      console.log("CtaSection: EXPORT - performExport promise was rejected.", e_export_async);
      // Status message should have been set inside performExport's catch
    } finally {
      if (exportFinishedCallback) {
        exportFinishedCallback();
      }
      setIsLoading(false);
      console.log("CtaSection: EXPORT - handleExportImage fully finished.");
    }
  };

  // Bubble background constants
  const debugPatternOpacity = "opacity-50"; 
  const debugBubbleColor1 = "rgba(200, 200, 255, 0.7)"; 
  const debugBubbleColor2 = "rgba(220, 220, 255, 0.6)"; 
  const debugBubbleColor3 = "rgba(210, 210, 245, 0.65)";

  return (
    <motion.section
      id="editor-canvas-section"
      className="relative py-16 md:py-24 bg-slate-50 text-slate-800 overflow-hidden min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div
        className={`absolute inset-0 z-0 ${debugPatternOpacity} pointer-events-none`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${debugBubbleColor1} 50px, transparent 51px),
            radial-gradient(circle at 70% 60%, ${debugBubbleColor2} 80px, transparent 81px),
            radial-gradient(circle at 40% 80%, ${debugBubbleColor3} 60px, transparent 61px),
            radial-gradient(circle at 85% 15%, ${debugBubbleColor1} 40px, transparent 41px),
            radial-gradient(circle at 50% 5%, ${debugBubbleColor2} 10px, transparent 35px),
            radial-gradient(circle at 95% 90%, ${debugBubbleColor3} 60px, transparent 70px),
            radial-gradient(circle at 25% 90%, ${debugBubbleColor1} 90px, transparent 65px),
            radial-gradient(circle at 60% 50%, ${debugBubbleColor2} 50px, transparent 20px)
          `,
          backgroundRepeat: `repeat`,
        }}
      />

<div className="container relative z-10 px-4 md:px-6 flex flex-col flex-grow items-center justify-center">
        <AnimatePresence mode="wait">
          {viewMode === 'uploader' && (
            <UploaderView 
              key="uploader-view"
              onFileSelect={setImageFile} 
              isLoading={isLoading} // This isLoading is for BG removal / initial processing
              statusMessage={statusMessage}
            />
          )}

          {/* Render EditorView if viewMode is 'editor' AND necessary images are loaded */}
          {/* The 'isLoading' state for export will be handled *inside* EditorView */}
          {viewMode === 'editor' && originalKonvaImage && cutoutKonvaImage && (
            <EditorView
              key="editor-view" // Ensure key is consistent for AnimatePresence
              initialOriginalImage={originalKonvaImage}
              initialCutoutImage={cutoutKonvaImage}
              initialTextNodes={initialTextNodes}
              onExport={handleExportImage}
              isProcessing={isLoading} // This isLoading is for export and BG removal feedback WITHIN EditorView
            />
          )}

          {/* This loading state is ONLY for the initial background removal phase
              BEFORE EditorView is shown, or if EditorView cannot be shown due to missing images */}
          {isLoading && viewMode === 'uploader' && ( 
            <motion.div 
                key="initial-loading" // Different key from editor
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-grow text-slate-600">
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}