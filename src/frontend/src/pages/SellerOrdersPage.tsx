import { useGetSellerOrders } from "../hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ArrowLeft } from "lucide-react";

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

interface SellerOrdersPageProps {
  onNavigate: (page: Page) => void;
}

export function SellerOrdersPage({ onNavigate }: SellerOrdersPageProps) {
  const { data: orders, isLoading } = useGetSellerOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => onNavigate({ type: "sellerDashboard" })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">
            Orders containing your products will appear here
          </p>
        </div>
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

      <h1 className="text-3xl font-serif font-bold mb-8">Seller Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const sellerItems = order.items.filter(
            (item) => item.seller.toString() === order.buyer.toString()
          );

          return (
            <Card key={order.id.toString()}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          Order #{order.id.toString()}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          Number(order.createdAt) / 1000000
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Your Items:</h4>
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm p-2 bg-muted rounded"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground">
                            {item.variantSize && `Size: ${item.variantSize}`}
                            {item.variantSize && item.variantColor && " • "}
                            {item.variantColor && `Color: ${item.variantColor}`}
                            {" • "}Qty: {item.quantity.toString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹
                          {(
                            Number(item.price) * Number(item.quantity)
                          ).toString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
