import { useGetPendingProducts, useApproveProduct, useRejectProduct } from "../hooks/useAdminProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Package } from "lucide-react";
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

interface AdminDashboardPageProps {
  onNavigate: (page: Page) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { data: products, isLoading } = useGetPendingProducts();
  const { mutate: approveProduct, isPending: isApproving } = useApproveProduct();
  const { mutate: rejectProduct, isPending: isRejecting } = useRejectProduct();

  const handleApprove = (productId: bigint) => {
    approveProduct(productId, {
      onSuccess: () => {
        toast.success("Product approved successfully!");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to approve product");
      },
    });
  };

  const handleReject = (productId: bigint) => {
    rejectProduct(productId, {
      onSuccess: () => {
        toast.success("Product rejected");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to reject product");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and approve products</p>
        </div>
        <Button onClick={() => onNavigate({ type: "adminOrders" })} variant="outline">
          Manage Orders
        </Button>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => {
            const imageUrl =
              product.images.length > 0
                ? product.images[0].getDirectURL()
                : "/assets/generated/placeholder-product.dim_800x800.png";

            return (
              <Card key={product.id.toString()}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="line-clamp-1">{product.name}</span>
                    <Badge variant="secondary">Pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold text-lg">
                          ₹{product.basePrice.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Variants</p>
                        <p className="font-semibold">{product.variants.length}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm line-clamp-3">{product.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(product.id)}
                      disabled={isApproving || isRejecting}
                    >
                      {isApproving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(product.id)}
                      disabled={isApproving || isRejecting}
                    >
                      {isRejecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No pending products</h2>
          <p className="text-muted-foreground">
            All products have been reviewed
          </p>
        </div>
      )}
    </div>
  );
}
