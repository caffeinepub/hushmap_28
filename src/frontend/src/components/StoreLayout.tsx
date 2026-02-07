import { ReactNode } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "../backend";
import { useGetCart } from "../hooks/useCart";
import { useState } from "react";

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

interface StoreLayoutProps {
  children: ReactNode;
  userProfile: UserProfile;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function StoreLayout({
  children,
  userProfile,
  currentPage,
  onNavigate,
}: StoreLayoutProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isSeller = userProfile.role === "seller" || userProfile.role === "admin";
  const isAdmin = userProfile.role === "admin";

  const NavLink = ({
    icon: Icon,
    label,
    page,
    badge,
    onClick,
  }: {
    icon: any;
    label: string;
    page?: Page;
    badge?: number;
    onClick?: () => void;
  }) => {
    const isActive = page && currentPage.type === page.type;
    return (
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else if (page) {
            onNavigate(page);
            setMobileMenuOpen(false);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => onNavigate({ type: "catalog" })}
              className="flex items-center gap-2"
            >
              <img
                src="/assets/generated/sk-clothes-logo.dim_512x192.png"
                alt="SK Selling Clothes"
                className="h-8 w-auto"
              />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                icon={ShoppingBag}
                label="Catalog"
                page={{ type: "catalog" }}
              />
              <NavLink
                icon={ShoppingCart}
                label="Cart"
                page={{ type: "cart" }}
                badge={cartItemCount}
              />
              <NavLink
                icon={Package}
                label="Orders"
                page={{ type: "orders" }}
              />
              {isSeller && (
                <NavLink
                  icon={LayoutDashboard}
                  label="Seller Panel"
                  page={{ type: "sellerDashboard" }}
                />
              )}
              {isAdmin && (
                <NavLink
                  icon={LayoutDashboard}
                  label="Admin"
                  page={{ type: "adminDashboard" }}
                />
              )}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {userProfile.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="pb-4 border-b border-border">
                    <p className="text-sm font-medium">{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userProfile.role}
                    </p>
                  </div>
                  <NavLink
                    icon={ShoppingBag}
                    label="Catalog"
                    page={{ type: "catalog" }}
                  />
                  <NavLink
                    icon={ShoppingCart}
                    label="Cart"
                    page={{ type: "cart" }}
                    badge={cartItemCount}
                  />
                  <NavLink
                    icon={Package}
                    label="Orders"
                    page={{ type: "orders" }}
                  />
                  {isSeller && (
                    <NavLink
                      icon={LayoutDashboard}
                      label="Seller Panel"
                      page={{ type: "sellerDashboard" }}
                    />
                  )}
                  {isAdmin && (
                    <NavLink
                      icon={LayoutDashboard}
                      label="Admin"
                      page={{ type: "adminDashboard" }}
                    />
                  )}
                  <div className="pt-4 border-t border-border">
                    <NavLink icon={LogOut} label="Logout" onClick={handleLogout} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
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
    </div>
  );
}
