import { useGetOrder } from "../hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";

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

interface OrderDetailPageProps {
  orderId: bigint;
  onNavigate: (page: Page) => void;
}

export function OrderDetailPage({
  orderId,
  onNavigate,
}: OrderDetailPageProps) {
  const { data: order, isLoading } = useGetOrder(orderId);

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

  if (!order) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <p className="text-center text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => onNavigate({ type: "orders" })}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">
          Order #{order.id.toString()}
        </h1>
        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between pb-4 border-b last:border-0">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <div className="text-sm text-muted-foreground">
                      {item.variantSize && <span>Size: {item.variantSize}</span>}
                      {item.variantSize && item.variantColor && <span> • </span>}
                      {item.variantColor && <span>Color: {item.variantColor}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity.toString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price.toString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ₹{(Number(item.price) * Number(item.quantity)).toString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount.toString()}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold capitalize">
                  {order.paymentMethod === "cashOnDelivery"
                    ? "Cash on Delivery"
                    : order.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date(Number(order.createdAt) / 1000000).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {order.shippingInfo.name}
                <br />
                {order.shippingInfo.address}
                <br />
                {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                {order.shippingInfo.pincode}
                <br />
                {order.shippingInfo.phone}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
