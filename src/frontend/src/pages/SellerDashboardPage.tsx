import { useGetSellerProducts } from "../hooks/useSellerProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit } from "lucide-react";

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

interface SellerDashboardPageProps {
  onNavigate: (page: Page) => void;
}

export function SellerDashboardPage({ onNavigate }: SellerDashboardPageProps) {
  const { data: products, isLoading } = useGetSellerProducts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendingApproval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendingApproval":
        return "Pending Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
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
          <h1 className="text-3xl font-serif font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onNavigate({ type: "sellerOrders" })} variant="outline">
            View Orders
          </Button>
          <Button onClick={() => onNavigate({ type: "sellerProductForm" })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl =
              product.images.length > 0
                ? product.images[0].getDirectURL()
                : "/assets/generated/placeholder-product.dim_800x800.png";

            return (
              <Card key={product.id.toString()}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {product.name}
                    </h3>
                    <Badge className={getStatusColor(product.status)}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₹{product.basePrice.toString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onNavigate({
                          type: "sellerProductForm",
                          productId: product.id,
                        })
                      }
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">
            You haven't added any products yet
          </p>
          <Button onClick={() => onNavigate({ type: "sellerProductForm" })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
}
