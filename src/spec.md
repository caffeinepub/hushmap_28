# Specification

## Summary
**Goal:** Replace the existing HushMap/map-focused app experience with an SK Clothes e-commerce storefront featuring buyer/seller/admin roles, product catalog, cart/checkout, orders, seller product management, and admin approvals.

**Planned changes:**
- Remove/disable Leaflet map UI and all map/ratings-related screens and flows; replace default navigation and pages with storefront-first UX.
- Implement Internet Identity login with a backend user profile storing display name + role (buyer/seller/admin), and role-based navigation (buyer storefront vs seller/admin dashboards).
- Add buyer-facing storefront pages: product catalog (basic search/filter/sort) and product detail (images, price, description, size/color selection, stock/availability).
- Add seller product creation/editing with multi-image upload stored in the backend and rendered reliably on catalog/detail pages; include basic upload validation and error handling.
- Support clothing attributes/variants (size/color) and ensure selected options persist into cart line items and orders.
- Implement cart → checkout → order confirmation: cart management, shipping/contact form, payment method selection (UPI/Card/Cash on Delivery recorded only), and persisted order placement.
- Add order management views: buyers (order history/details), sellers (orders containing their products), admins (all orders + status updates).
- Create seller panel for managing their products and submission statuses; add admin approval workflow (approve/reject, optional rejection reason) with only approved products visible to buyers.
- Update all branding/copy to SK Clothes and apply a consistent fashion storefront visual theme across all core pages.

**User-visible outcome:** Users can log in via Internet Identity and use an SK Clothes storefront: buyers can browse approved products, select size/color, add to cart, checkout, and view orders; sellers can upload/manage products for approval and view relevant orders; admins can approve/reject products and manage order statuses.
