/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from 'react'; // Keep useState for isClientCanvas
import type Konva from 'konva';
import ClientOnlyCanvas from './ClientOnlyCanvas'; // Import the new wrapper

// Define or import your types
export interface TextConfig { id: string; text: string; x: number; y: number; fontSize: number; fontFamily: string; fill: string; fontStyle: "normal" | "bold" | "italic" | "bold italic"; fontWeight: "normal" | "bold"; draggable: boolean; rotation: number; scaleX: number; scaleY: number; }
export interface CanvasImage { image: HTMLImageElement; width: number; height: number; }

interface CanvasAreaProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  originalImage: CanvasImage | null;
  cutoutImage: CanvasImage | null;
  textNodes: TextConfig[];
  setTextNodes: React.Dispatch<React.SetStateAction<TextConfig[]>>;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  canvasSize: { width: number; height: number };
  fontsLoaded: boolean;
}

export default function CanvasArea({
  stageRef,
  originalImage,
  cutoutImage,
  textNodes,
  setTextNodes,
  selectedTextId,
  setSelectedTextId,
  fontsLoaded,
  canvasSize,
}: CanvasAreaProps) {
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null); // Layer ref is now managed by ClientOnlyCanvas internally if needed, or pass it down too

  const [isClientCanvas, setIsClientCanvas] = useState(false);
  useEffect(() => {
    setIsClientCanvas(true);
  }, []);

  const handleTransformEnd = (e: Konva.KonvaEventObject<any>) => {
    const node = e.target;
    const id = node.id();
    setTextNodes(prevNodes =>
      prevNodes.map(tn =>
        tn.id === id
          ? {
              ...tn,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
            }
          : tn
      )
    );
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedTextId(null);
    }
  };

  // This useEffect for redrawing might now belong in ClientOnlyCanvas if layerRef is managed there,
  // or it can stay if layerRef is passed down to ClientOnlyCanvas as well.
  // For now, ClientOnlyCanvas will manage its own internal layer drawing.
  useEffect(() => {
    if (isClientCanvas && stageRef.current && originalImage && cutoutImage && layerRef.current) { // layerRef is now internal to ClientOnlyCanvas if not passed
        console.log("CanvasArea: Prop changes might trigger redraw inside ClientOnlyCanvas.");
        // The redraw will happen inside ClientOnlyCanvas based on its own useEffects
    }
  }, [originalImage, cutoutImage, canvasSize, textNodes, stageRef, isClientCanvas]);

  useEffect(() => {
    if (isClientCanvas && layerRef.current && fontsLoaded) {
      // This effect specifically triggers a redraw whenever textNodes array changes.
      // This is the fix for the font not updating visually.
      console.log("CanvasArea: textNodes prop changed, redrawing layer.");
      layerRef.current.batchDraw();
    }
  }, [isClientCanvas, textNodes, fontsLoaded]); 

  useEffect(() => {
    if (isClientCanvas && transformerRef.current && stageRef.current) { // Check transformerRef.current exists
      if (selectedTextId) {
        const selectedNode = stageRef.current.findOne('#' + selectedTextId);
        if (selectedNode && typeof selectedNode.getLayer === 'function') {
          transformerRef.current.nodes([selectedNode]);
        } else {
          transformerRef.current.nodes([]); // Detach if node not found
        }
      } else {
        transformerRef.current.nodes([]); // Detach if no selectedTextId
      }
      // Get layer and batchDraw
      const layer = transformerRef.current.getLayer() || layerRef.current; // Get transformer's layer or main layer
      if (layer) {
        layer.batchDraw();
      }
    }
  }, [selectedTextId, textNodes, stageRef, isClientCanvas, layerRef, transformerRef]);

  if (!isClientCanvas) {
    return <div className="w-full h-full flex items-center justify-center text-muted-foreground"><p>Preparing Canvas Area...</p></div>;
  }

  return (
    <ClientOnlyCanvas
      stageRef={stageRef}
      layerRef={layerRef} // Pass layerRef to ClientOnlyCanvas
      transformerRef={transformerRef} // Pass transformerRef
      originalImage={originalImage}
      cutoutImage={cutoutImage}
      textNodes={textNodes}
      setTextNodes={setTextNodes}
      selectedTextId={selectedTextId}
      setSelectedTextId={setSelectedTextId}
      canvasSize={canvasSize}
      onTransformEnd={handleTransformEnd}
      checkDeselect={checkDeselect}
    />
  );
}