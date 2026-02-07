import { useState } from "react";
import { useGetProduct } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VariantSelector } from "../components/VariantSelector";
import { ArrowLeft, ShoppingCart, Loader2, Minus, Plus } from "lucide-react";
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

interface ProductDetailPageProps {
  productId: bigint;
  onNavigate: (page: Page) => void;
}

export function ProductDetailPage({
  productId,
  onNavigate,
}: ProductDetailPageProps) {
  const { data: product, isLoading } = useGetProduct(productId);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (!product || selectedVariantIndex === null) return;

    const variant = product.variants[selectedVariantIndex];
    if (variant.stock < BigInt(quantity)) {
      toast.error("Not enough stock available");
      return;
    }

    addToCart(
      {
        productId: product.id,
        variantIndex: BigInt(selectedVariantIndex),
        quantity: BigInt(quantity),
      },
      {
        onSuccess: () => {
          toast.success("Added to cart!");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to add to cart");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <p className="text-center text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const selectedVariant =
    selectedVariantIndex !== null ? product.variants[selectedVariantIndex] : null;
  const price = selectedVariant?.price || product.basePrice;
  const stock = selectedVariant?.stock || 0n;
  const inStock = stock > 0n;

  const images =
    product.images.length > 0
      ? product.images
      : [{ getDirectURL: () => "/assets/generated/placeholder-product.dim_800x800.png" }];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate({ type: "catalog" })}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Catalog
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={images[selectedImageIndex].getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={image.getDirectURL()}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary">₹{price.toString()}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <VariantSelector
            variants={product.variants}
            selectedIndex={selectedVariantIndex}
            onSelect={setSelectedVariantIndex}
          />

          {selectedVariantIndex !== null && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(Number(stock), quantity + 1))
                    }
                    disabled={quantity >= Number(stock)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stock.toString()} items in stock
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock || isAddingToCart}
                className="w-full rounded-full"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </Button>
            </>
          )}

          {selectedVariantIndex === null && product.variants.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Please select options to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
