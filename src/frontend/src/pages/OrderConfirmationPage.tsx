import { useGetOrder } from "../hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

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

interface OrderConfirmationPageProps {
  orderId: bigint;
  onNavigate: (page: Page) => void;
}

export function OrderConfirmationPage({
  orderId,
  onNavigate,
}: OrderConfirmationPageProps) {
  const { data: order, isLoading } = useGetOrder(orderId);

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
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. We'll send you a confirmation shortly.
        </p>

        <Card className="text-left mb-8">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold">#{order.id.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                ₹{order.totalAmount.toString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-semibold capitalize">
                {order.paymentMethod === "cashOnDelivery"
                  ? "Cash on Delivery"
                  : order.paymentMethod.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipping Address</p>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => onNavigate({ type: "catalog" })}
          >
            Continue Shopping
          </Button>
          <Button onClick={() => onNavigate({ type: "orders" })}>
            View Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
