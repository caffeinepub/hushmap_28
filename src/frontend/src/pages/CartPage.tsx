import { useGetCart, useUpdateCartItem, useRemoveFromCart } from "../hooks/useCart";
import { useGetAllProducts } from "../hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
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

interface CartPageProps {
  onNavigate: (page: Page) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products } = useGetAllProducts();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: removeFromCart } = useRemoveFromCart();

  const handleUpdateQuantity = (
    productId: bigint,
    variantIndex: bigint,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    updateCartItem(
      { productId, variantIndex, quantity: BigInt(newQuantity) },
      {
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update cart");
        },
      }
    );
  };

  const handleRemove = (productId: bigint, variantIndex: bigint) => {
    removeFromCart(
      { productId, variantIndex },
      {
        onSuccess: () => {
          toast.success("Removed from cart");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to remove item");
        },
      }
    );
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Button onClick={() => onNavigate({ type: "catalog" })}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  let totalAmount = 0;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const product = products?.find((p) => p.id === item.productId);
            if (!product) return null;

            const variant = product.variants[Number(item.variantIndex)];
            const itemTotal = Number(variant.price) * Number(item.quantity);
            totalAmount += itemTotal;

            const imageUrl =
              product.images.length > 0
                ? product.images[0].getDirectURL()
                : "/assets/generated/placeholder-product.dim_800x800.png";

            return (
              <Card key={`${item.productId}-${item.variantIndex}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <div className="text-sm text-muted-foreground mb-2">
                        {variant.size && <span>Size: {variant.size}</span>}
                        {variant.size && variant.color && <span> • </span>}
                        {variant.color && <span>Color: {variant.color}</span>}
                      </div>
                      <p className="font-semibold text-primary">
                        ₹{variant.price.toString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemove(item.productId, item.variantIndex)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.variantIndex,
                              Number(item.quantity) - 1
                            )
                          }
                          disabled={Number(item.quantity) <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity.toString()}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.variantIndex,
                              Number(item.quantity) + 1
                            )
                          }
                          disabled={Number(item.quantity) >= Number(variant.stock)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full rounded-full"
                onClick={() => onNavigate({ type: "checkout" })}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
