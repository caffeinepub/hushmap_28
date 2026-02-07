import { useState } from "react";
import { Variant } from "../backend";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface VariantSelectorProps {
  variants: Variant[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function VariantSelector({
  variants,
  selectedIndex,
  onSelect,
}: VariantSelectorProps) {
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    findAndSelectVariant(size, selectedColor);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    findAndSelectVariant(selectedSize, color);
  };

  const findAndSelectVariant = (size: string | null, color: string | null) => {
    const index = variants.findIndex((v) => {
      const sizeMatch = !size || v.size === size;
      const colorMatch = !color || v.color === color;
      return sizeMatch && colorMatch;
    });
    if (index !== -1) {
      onSelect(index);
    }
  };

  if (sizes.length === 0 && colors.length === 0) {
    // No variants to select, auto-select first
    if (selectedIndex === null && variants.length > 0) {
      onSelect(0);
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <Label className="mb-2 block">Size</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleSizeSelect(size!)}
                className="min-w-[60px]"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <Label className="mb-2 block">Color</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                size="sm"
                onClick={() => handleColorSelect(color!)}
                className="min-w-[80px]"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
