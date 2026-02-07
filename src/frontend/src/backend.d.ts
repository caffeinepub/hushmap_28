import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ShippingInfo {
    city: string;
    name: string;
    state: string;
    address: string;
    phone: string;
    pincode: string;
}
export interface ProductInput {
    name: string;
    description: string;
    variants: Array<Variant>;
    basePrice: bigint;
    images: Array<ExternalBlob>;
}
export type Time = bigint;
export interface OrderItem {
    variantColor?: string;
    productId: bigint;
    productName: string;
    variantSize?: string;
    seller: Principal;
    variantIndex: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Variant {
    color?: string;
    size?: string;
    stock: bigint;
    price: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    createdAt: Time;
    updatedAt: Time;
    shippingInfo: ShippingInfo;
    totalAmount: bigint;
    buyer: Principal;
    items: Array<OrderItem>;
}
export interface CartItem {
    productId: bigint;
    variantIndex: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    status: ProductStatus;
    name: string;
    createdAt: Time;
    description: string;
    variants: Array<Variant>;
    seller: Principal;
    updatedAt: Time;
    basePrice: bigint;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
    role: UserRole;
    email: string;
    phone?: string;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    upi = "upi",
    cashOnDelivery = "cashOnDelivery",
    card = "card"
}
export enum ProductStatus {
    pendingApproval = "pendingApproval",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    seller = "seller",
    buyer = "buyer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(item: CartItem): Promise<void>;
    approveProduct(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    clearCart(): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getBuyerOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCart(): Promise<Array<CartItem>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getPendingProducts(): Promise<Array<Product>>;
    getProduct(productId: bigint): Promise<Product | null>;
    getSellerOrders(): Promise<Array<Order>>;
    getSellerProducts(seller: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(shippingInfo: ShippingInfo, paymentMethod: PaymentMethod): Promise<bigint>;
    rejectProduct(productId: bigint): Promise<void>;
    removeFromCart(productId: bigint, variantIndex: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitProduct(input: ProductInput): Promise<bigint>;
    updateCartItem(productId: bigint, variantIndex: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, input: ProductInput): Promise<void>;
}
