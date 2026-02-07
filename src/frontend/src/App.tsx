import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import { useGetCallerUserProfile } from "./hooks/useUserProfile";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { StoreLayout } from "./components/StoreLayout";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { SellerProductFormPage } from "./pages/SellerProductFormPage";
import { SellerOrdersPage } from "./pages/SellerOrdersPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";

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

export default function App() {
  const { identity, isInitializing, login, isLoggingIn } =
    useInternetIdentity();
  const { isFetching, actor } = useActor();

  const isAuthenticated = !!identity;

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Landing page (not authenticated)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 lg:px-8 py-6 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/generated/sk-clothes-logo.dim_512x192.png"
              alt="SK Selling Clothes"
              className="h-10 w-auto"
            />
          </div>
          <Button
            variant="outline"
            onClick={login}
            disabled={isLoggingIn}
            className="rounded-full"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col">
          <div
            className="relative h-[400px] lg:h-[500px] bg-cover bg-center"
            style={{
              backgroundImage: "url(/assets/generated/hero-fabric.dim_1600x600.png)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
            <div className="relative container mx-auto px-4 lg:px-8 h-full flex flex-col justify-center items-center text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                Affordable Fashion
                <br />
                <span className="text-primary-foreground">For Everyone</span>
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-2xl">
                Discover quality clothing at the best prices. Shop from verified
                sellers and enjoy a seamless shopping experience.
              </p>
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold shadow-lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Start Shopping
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-muted-foreground">
                  Quality clothing at affordable prices for everyone
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
                <p className="text-muted-foreground">
                  All products are reviewed and approved by our team
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Payment</h3>
                <p className="text-muted-foreground">
                  Pay online via UPI/Card or choose Cash on Delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 lg:px-8 text-center text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </main>
    );
  }

  // Loading actor
  if (!actor || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Main app (authenticated)
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>({ type: "catalog" });

  const showProfileSetup =
    !profileLoading && isFetched && profile === null;

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />
      {profile && (
        <StoreLayout
          userProfile={profile}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        >
          {currentPage.type === "catalog" && (
            <CatalogPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "product" && (
            <ProductDetailPage
              productId={currentPage.productId}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage.type === "cart" && (
            <CartPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "checkout" && (
            <CheckoutPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "orderConfirmation" && (
            <OrderConfirmationPage
              orderId={currentPage.orderId}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage.type === "orders" && (
            <OrdersPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "orderDetail" && (
            <OrderDetailPage
              orderId={currentPage.orderId}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage.type === "sellerDashboard" && (
            <SellerDashboardPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "sellerProductForm" && (
            <SellerProductFormPage
              productId={currentPage.productId}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage.type === "sellerOrders" && (
            <SellerOrdersPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "adminDashboard" && (
            <AdminDashboardPage onNavigate={setCurrentPage} />
          )}
          {currentPage.type === "adminOrders" && (
            <AdminOrdersPage onNavigate={setCurrentPage} />
          )}
        </StoreLayout>
      )}
    </>
  );
}
