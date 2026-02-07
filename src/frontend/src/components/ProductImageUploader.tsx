import { useState } from "react";
import { ExternalBlob } from "../backend";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ProductImageUploaderProps {
  images: ExternalBlob[];
  onChange: (images: ExternalBlob[]) => void;
  maxImages?: number;
}

export function ProductImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newImages: ExternalBlob[] = [];

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 2MB.`);
        continue;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file.`);
        continue;
      }

      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
          (percentage) => {
            setUploadProgress(percentage);
          }
        );
        newImages.push(blob);
      } catch (error) {
        console.error("Error processing image:", error);
        alert(`Failed to process ${file.name}`);
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
    setUploadProgress(0);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Images (Max {maxImages})</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload up to {maxImages} images. Max 2MB per image.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
            <img
              src={image.getDirectURL()}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {uploadProgress}%
                </span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload Image
                </span>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
