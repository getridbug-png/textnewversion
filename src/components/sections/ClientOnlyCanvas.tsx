"use client";

import { useState, useEffect, RefObject } from 'react'; // Import RefObject
import type Konva from 'konva';
import type { TextConfig, CanvasImage } from './CanvasArea'; // Ensure these are exported from CanvasArea.tsx

// Forward declare the components we will import dynamically
let Stage: any = () => <p>Loading Stage...</p>; // Placeholder
let Layer: any = () => <p>Loading Layer...</p>; // Placeholder
let KonvaImage: any = () => null;
let KonvaText: any = () => null;
let Transformer: any = () => null;

interface ClientOnlyCanvasProps {
  stageRef: RefObject<Konva.Stage | null>;
  layerRef: RefObject<Konva.Layer | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  originalImage: CanvasImage | null;
  cutoutImage: CanvasImage | null;
  textNodes: TextConfig[];
  setTextNodes: React.Dispatch<React.SetStateAction<TextConfig[]>>;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  canvasSize: { width: number; height: number };
  onTransformEnd: (e: Konva.KonvaEventObject<any>) => void;
  checkDeselect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
}

export default function ClientOnlyCanvas({
  stageRef,
  layerRef,
  transformerRef,
  originalImage,
  cutoutImage,
  textNodes,
  setTextNodes,
  selectedTextId,
  setSelectedTextId,
  canvasSize,
  onTransformEnd,
  checkDeselect,
}: ClientOnlyCanvasProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Dynamically import Konva components only on the client after mount
    import('react-konva').then(ReactKonva => {
      Stage = ReactKonva.Stage;
      Layer = ReactKonva.Layer;
      KonvaImage = ReactKonva.Image;
      KonvaText = ReactKonva.Text;
      Transformer = ReactKonva.Transformer;
      setHasMounted(true); // Set hasMounted to true AFTER components are loaded
    }).catch(err => {
      console.error("Failed to load react-konva components:", err);
      // Optionally set an error state here to display a message
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  // All useEffects that depend on Konva refs should also check for hasMounted
  useEffect(() => {
    if (hasMounted && selectedTextId && transformerRef.current && stageRef.current) {
      // ... (transformer logic as before)
      const selectedNode = stageRef.current.findOne('#' + selectedTextId);
      if (selectedNode && typeof selectedNode.getLayer === 'function') {
        transformerRef.current.nodes([selectedNode]);
        const currentLayer = selectedNode.getLayer();
        if (currentLayer) {
            currentLayer.batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        if (layerRef.current) {
            layerRef.current.batchDraw();
        }
      }
    } else if (hasMounted && !selectedTextId && transformerRef.current) {
        transformerRef.current.nodes([]);
        if (layerRef.current) {
            layerRef.current.batchDraw();
        }
    }
  }, [hasMounted, selectedTextId, textNodes, stageRef, layerRef, transformerRef]); // Added layerRef and transformerRef

  useEffect(() => {
    if (hasMounted && stageRef.current && layerRef.current && originalImage && cutoutImage) {
        console.log("ClientOnlyCanvas: Forcing layer redraw due to props change.");
        layerRef.current.batchDraw();
    }
  }, [hasMounted, originalImage, cutoutImage, canvasSize, textNodes, stageRef, layerRef]); // Added layerRef


  if (!hasMounted || !originalImage || !cutoutImage) {
    return <div className="w-full h-full flex items-center justify-center text-muted-foreground"><p>Loading Canvas...</p></div>;
  }

  if (canvasSize.width <= 0 || canvasSize.height <= 0) {
    return <div className="w-full h-full flex items-center justify-center text-red-500"><p>Error: Invalid canvas dimensions.</p></div>;
  }

  // The actual rendering using the dynamically loaded components
  return (
    <Stage
      width={canvasSize.width}
      height={canvasSize.height}
      ref={stageRef}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      className="bg-white shadow-md"
      style={{ border: '1px solid #ccc' }}
    >
      <Layer ref={layerRef}>
        {originalImage.image.complete && originalImage.width > 0 && (
          <KonvaImage image={originalImage.image} width={canvasSize.width} height={canvasSize.height} listening={false} />
        )}
        {textNodes.map((textNodeConfig) => {
          const { id, ...restOfConfig } = textNodeConfig;
          return (
            <KonvaText
              key={id}
              id={id}
              {...restOfConfig}
              onDragEnd={(e) => {
                setTextNodes(prev => prev.map(n => n.id === id ? { ...n, x: e.target.x(), y: e.target.y() } : n));
              }}
              onTransformEnd={onTransformEnd}
              onClick={() => setSelectedTextId(id)}
              onTap={() => setSelectedTextId(id)}
            />
          );
        })}
        {cutoutImage.image.complete && cutoutImage.width > 0 && (
          <KonvaImage image={cutoutImage.image} width={canvasSize.width} height={canvasSize.height} listening={false} />
        )}
        {selectedTextId && <Transformer ref={transformerRef} borderDash={[6, 2]} />}
      </Layer>
    </Stage>
  );
}