"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Download, Settings2, Loader2 } from "lucide-react";
import type { TextConfig } from './CanvasArea'; // Assuming type is exported from CanvasArea

// This array defines the fonts your editor will offer.
export const AVAILABLE_FONTS = [
  { name: "Geist Sans", cssVariable: "var(--font-geist-sans)", konvaFamily: "Geist Sans" },
  { name: "Arial", cssVariable: "Arial", konvaFamily: "Arial" }, // System font
  { name: "Roboto", cssVariable: "var(--font-roboto)", konvaFamily: "Roboto" },
  { name: "Open Sans", cssVariable: "var(--font-open-sans)", konvaFamily: "Open Sans" },
  { name: "Montserrat", cssVariable: "var(--font-montserrat)", konvaFamily: "Montserrat" },
  { name: "Merriweather", cssVariable: "var(--font-merriweather)", konvaFamily: "Merriweather" },
  { name: "Lobster", cssVariable: "var(--font-lobster)", konvaFamily: "Lobster" },
  { name: "Pacifico", cssVariable: "var(--font-pacifico)", konvaFamily: "Pacifico" },
  { name: "Source Code Pro", cssVariable: "var(--font-source-code-pro)", konvaFamily: "Source Code Pro" },
  { name: "Barlow Condensed", cssVariable: "var(--font-barlow-condensed)", konvaFamily: "Barlow Condensed" },
  { name: "Bebas Neue", cssVariable: "var(--font-bebas-neue)", konvaFamily: "Bebas Neue" },
  { name: "Bitter", cssVariable: "var(--font-bitter)", konvaFamily: "Bitter" },
  { name: "Bungee", cssVariable: "var(--font-bungee)", konvaFamily: "Bungee" },
];

const FONT_SIZES = [16, 24, 32, 40, 48, 56, 64, 72, 96, 128];

interface TextEditorPanelProps {
  selectedTextNode: TextConfig | undefined;
  onTextConfigChange: (prop: keyof Omit<TextConfig, 'id' | 'draggable' | 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY'>, value:  string | number) => void;
  onExport: () => void;
  isProcessing: boolean;
  fontsLoaded: boolean; // New prop to control the font selector
}

export default function TextEditorPanel({
  selectedTextNode,
  onTextConfigChange,
  onExport,
  isProcessing,
  fontsLoaded,
}: TextEditorPanelProps) {

  if (!selectedTextNode && !isProcessing) { 
    return (
      <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
        <Settings2 size={32} className="mb-3 text-slate-400" />
        <p className="font-medium">Select a text layer on the canvas to edit its properties.</p>
        <p className="mt-1 text-xs">(No text selected)</p>
      </div>
    );
  }

  const controlsDisabled = isProcessing || !selectedTextNode;
  const fontSelectorDisabled = isProcessing || !fontsLoaded || !selectedTextNode;

  return (
    <>
      <h3 className="text-xl font-semibold text-slate-700 border-b pb-3 mb-4 flex items-center">
        <Settings2 size={20} className="mr-2 text-primary"/>Editing Tools
      </h3>
      
      <div>
        <Label htmlFor="text-content" className="text-xs font-medium text-muted-foreground">Text</Label>
        <Input 
          id="text-content" 
          value={selectedTextNode?.text || ""} 
          onChange={(e) => onTextConfigChange('text', e.target.value)} 
          className="mt-1 h-9" 
          disabled={controlsDisabled}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div>
          <Label htmlFor="font-size" className="text-xs font-medium text-muted-foreground">Size</Label>
          <Select 
            value={String(selectedTextNode?.fontSize || 48)} 
            onValueChange={(val) => onTextConfigChange('fontSize', parseInt(val))}
            disabled={controlsDisabled}
          >
            <SelectTrigger id="font-size" className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{FONT_SIZES.map(size => <SelectItem key={size} value={String(size)}>{size}px</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="font-color" className="text-xs font-medium text-muted-foreground">Color</Label>
          <Input 
            id="font-color" 
            type="color" 
            value={selectedTextNode?.fill || "#333333"} 
            onChange={(e) => onTextConfigChange('fill', e.target.value)} 
            className="mt-1 w-full h-9 p-1" 
            disabled={controlsDisabled}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="font-family" className="text-xs font-medium text-muted-foreground">Font Family</Label>
          <Select
            value={selectedTextNode?.fontFamily || "Geist Sans"}
            onValueChange={(val) => onTextConfigChange('fontFamily', val)}
            disabled={fontSelectorDisabled}
          >
            <SelectTrigger id="font-family" className="mt-1 h-9">
              {!fontsLoaded ? (
                <span className="text-muted-foreground text-xs flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Loading Fonts...
                </span>
              ) : (
                <SelectValue 
                  placeholder="Select a font" 
                  style={{ fontFamily: AVAILABLE_FONTS.find(f => f.konvaFamily === selectedTextNode?.fontFamily)?.cssVariable || 'inherit' }}
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map(font => (
                <SelectItem 
                  key={font.konvaFamily} 
                  value={font.konvaFamily}
                  style={{ fontFamily: font.konvaFamily }}
                  className="text-base"
                >
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="font-style" className="text-xs font-medium text-muted-foreground">Style</Label>
          <Select 
            value={selectedTextNode?.fontStyle || "normal"} 
            onValueChange={(val) => onTextConfigChange('fontStyle', val as TextConfig['fontStyle'])}
            disabled={controlsDisabled}>
            <SelectTrigger id="font-style" className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="bold italic">Bold Italic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={onExport} 
        className="w-full !mt-6 h-11" 
        disabled={isProcessing} 
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={18} className="mr-2" />}
        {isProcessing ? "Exporting..." : "Export Image"}
      </Button>
    </>
  );
}