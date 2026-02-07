import { useState, useEffect } from "react";
import { useGetProduct } from "../hooks/useProducts";
import { useSubmitProduct, useUpdateProduct } from "../hooks/useSellerProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageUploader } from "../components/ProductImageUploader";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { ExternalBlob, Variant } from "../backend";
import { toast } from "sonner";

type Page =
  | { type: "catalog" }
  | { type: "product"; productId: bigint }
  | { type: "cart" }
  | { type: "checkout" }
  | { type: "orderConfirmation"; orderId: bigint }
  | { type: "orders" }
  | { type: "orderDetail"; orderId: bigint }
  | { type: "sellerDashboard" }
  | { type: "sellerProductForm"; productId?: bigint }
  | { type: "sellerOrders" }
  | { type: "adminDashboard" }
  | { type: "adminOrders" };

interface SellerProductFormPageProps {
  productId?: bigint;
  onNavigate: (page: Page) => void;
}

export function SellerProductFormPage({
  productId,
  onNavigate,
}: SellerProductFormPageProps) {
  const { data: existingProduct, isLoading: loadingProduct } = useGetProduct(
    productId || null
  );
  const { mutate: submitProduct, isPending: isSubmitting } = useSubmitProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    { size: undefined, color: undefined, price: 0n, stock: 0n },
  ]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setBasePrice(existingProduct.basePrice.toString());
      setImages(existingProduct.images);
      setVariants(existingProduct.variants);
    }
  }, [existingProduct]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: undefined, color: undefined, price: 0n, stock: 0n },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string
  ) => {
    const updated = [...variants];
    if (field === "size" || field === "color") {
      updated[index] = {
        ...updated[index],
        [field]: value || undefined,
      };
    } else if (field === "price" || field === "stock") {
      updated[index] = {
        ...updated[index],
        [field]: BigInt(value || "0"),
      };
    }
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !basePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (variants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    const productInput = {
      name,
      description,
      basePrice: BigInt(basePrice),
      variants,
      images,
    };

    if (productId) {
      updateProduct(
        { productId, input: productInput },
        {
          onSuccess: () => {
            toast.success("Product updated successfully!");
            onNavigate({ type: "sellerDashboard" });
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : "Failed to update product"
            );
          },
        }
      );
    } else {
      submitProduct(productInput, {
        onSuccess: () => {
          toast.success("Product submitted for approval!");
          onNavigate({ type: "sellerDashboard" });
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to submit product"
          );
        },
      });
    }
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate({ type: "sellerDashboard" })}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-serif font-bold mb-8">
        {productId ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price (₹) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductImageUploader images={images} onChange={setImages} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Variants</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariant}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 relative"
                  >
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Size</Label>
                        <Input
                          value={variant.size || ""}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                          placeholder="e.g., S, M, L, XL"
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          value={variant.color || ""}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          placeholder="e.g., Red, Blue"
                        />
                      </div>
                      <div>
                        <Label>Price (₹) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.price.toString()}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Stock *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock.toString()}
                          onChange={(e) =>
                            handleVariantChange(index, "stock", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={isSubmitting || isUpdating}
                >
                  {isSubmitting || isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {productId ? "Updating..." : "Submitting..."}
                    </>
                  ) : productId ? (
                    "Update Product"
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {productId
                    ? "Product will be re-submitted for approval after update"
                    : "Product will be reviewed by admin before going live"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
