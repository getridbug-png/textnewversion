"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import WebFont from 'webfontloader';
import CanvasArea from "./CanvasArea";
import TextEditorPanel, { AVAILABLE_FONTS } from "./TextEditorPanel";
import type Konva from 'konva';
import type { TextConfig, CanvasImage } from './CanvasArea';
import { Loader2 } from "lucide-react";

const MAX_CANVAS_WIDTH_FALLBACK_EDITOR = 600;
const MAX_CANVAS_HEIGHT_EDITOR = 500;


interface EditorViewProps {
  initialOriginalImage: CanvasImage | null;
  initialCutoutImage: CanvasImage | null;
  initialTextNodes: TextConfig[];
  onExport: (
    stage: Konva.Stage | null,
    textNodesForExport: TextConfig[] | null,
    callback?: () => void
  ) => void;
  isProcessing: boolean;
}

export default function EditorView({
  initialOriginalImage,
  initialCutoutImage,
  initialTextNodes,
  onExport,
  isProcessing
}: EditorViewProps) {
  const [originalImage, setOriginalImage] = useState<CanvasImage | null>(initialOriginalImage);
  const [cutoutImage, setCutoutImage] = useState<CanvasImage | null>(initialCutoutImage);
  const [textNodes, setTextNodes] = useState<TextConfig[]>(initialTextNodes);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(
    initialTextNodes.length > 0 ? initialTextNodes[0].id : null
  );
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false); // Track when webfonts are ready
  
  const stageRef = useRef<Konva.Stage | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load Google fonts for use in both DOM and Konva text
  useEffect(() => {
    const webFontFamilies = AVAILABLE_FONTS
      // exclude system or next/font–loaded faces
      .filter(font => !['Arial', 'Geist Sans'].includes(font.name))
      .map(font => `${font.konvaFamily}:400,700,400i,700i`);

    WebFont.load({
      google: { families: webFontFamilies },
      active: () => {
        console.log('Web fonts loaded:', webFontFamilies);
        setFontsLoaded(true);
      },
      inactive: () => {
        console.warn('Some web fonts failed to load, using fallbacks.');
        setFontsLoaded(true);
      }
    });
  }, []);

  // Calculate and set canvas size based on image natural dimensions
  useEffect(() => {
    if (initialOriginalImage && canvasContainerRef.current) {
      const { naturalWidth: imgW, naturalHeight: imgH } = initialOriginalImage.image;
      if (!imgW || !imgH) { setIsCanvasReady(false); return; }
      const aspect = imgW / imgH;
      let w = imgW;
      let h = imgH;
      const contW = canvasContainerRef.current.offsetWidth - 40;
      if (contW > 0) {
        w = Math.min(w, contW);
        h = w / aspect;
      } else {
        w = Math.min(w, MAX_CANVAS_WIDTH_FALLBACK_EDITOR);
        h = w / aspect;
      }
      if (h > MAX_CANVAS_HEIGHT_EDITOR) {
        h = MAX_CANVAS_HEIGHT_EDITOR;
        w = h * aspect;
      }
      setCanvasSize({ width: Math.round(w), height: Math.round(h) });
      setIsCanvasReady(true);
    }
  }, [initialOriginalImage]);

  // Center initial text nodes once canvas is ready
  useEffect(() => {
    if (isCanvasReady && canvasSize.width && initialTextNodes.length) {
      const centered = initialTextNodes.map(node => {
        const approxW = node.text.length * (node.fontSize * 0.5);
        const approxH = node.fontSize;
        return {
          ...node,
          x: Math.round((canvasSize.width - approxW) / 2),
          y: Math.round((canvasSize.height - approxH) / 2)
        };
      });
      setTextNodes(centered);
      if (centered.length) setSelectedTextId(centered[0].id);
    }
  }, [isCanvasReady, canvasSize, initialTextNodes]);

  const handleTextConfigChange = (
    prop: keyof Omit<TextConfig, 'id'|'draggable'|'x'|'y'|'rotation'|'scaleX'|'scaleY'>,
    value: any
  ) => {
    if (!selectedTextId) return;
    setTextNodes(nodes => nodes.map(n => n.id === selectedTextId ? { ...n, [prop]: value } : n));
  };

  const currentTextNode = textNodes.find(n => n.id === selectedTextId);

  const handlePanelExport = () => {
    if (!stageRef.current) { onExport(null, null); return; }
    const prev = selectedTextId;
    if (prev) setSelectedTextId(null);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (stageRef.current) {
          onExport(stageRef.current, textNodes, () => prev && setSelectedTextId(prev));
        }
      }, 50);
    });
  };

  if (!originalImage || !cutoutImage) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow text-slate-600">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <p className="font-semibold text-lg">Loading image data...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-6 md:gap-8 flex-grow items-stretch w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      key="editor-view-content"
    >
      <div
        className="flex-grow md:w-2/3 bg-slate-200/60 rounded-lg shadow-inner flex items-center justify-center p-2 md:p-4 overflow-hidden border border-slate-300 min-h-[300px] md:min-h-0"
        ref={canvasContainerRef}
      >
        {isCanvasReady && canvasSize.width > 0 ? (
          <CanvasArea
            stageRef={stageRef}
            originalImage={originalImage}
            cutoutImage={cutoutImage}
            textNodes={textNodes}
            setTextNodes={setTextNodes}
            selectedTextId={selectedTextId}
            setSelectedTextId={setSelectedTextId}
            canvasSize={canvasSize}
            fontsLoaded={fontsLoaded}
          />
        ) : (
          <div className="text-muted-foreground">
            {isProcessing ? 'Processing...' : 'Calculating canvas size...'}
          </div>
        )}
      </div>
      <motion.div
        className="md:w-1/3 bg-card p-4 md:p-6 rounded-lg shadow-xl border border-slate-200 overflow-y-auto space-y-4 min-w-[300px] md:min-w-[350px] max-h-[calc(100vh-18rem)] md:max-h-full"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      >
        <TextEditorPanel
          selectedTextNode={currentTextNode}
          onTextConfigChange={handleTextConfigChange}
          onExport={handlePanelExport}
          isProcessing={isProcessing}
          fontsLoaded={fontsLoaded}
        />
      </motion.div>
    </motion.div>
  );
}
