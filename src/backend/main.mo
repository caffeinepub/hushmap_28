import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  // --- Authorization ----------------------------------------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- User Profile Types -----------------------------------
  public type UserRole = {
    #buyer;
    #seller;
    #admin;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : ?Text;
    role : UserRole;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // --- Product Types ----------------------------------------
  public type ProductStatus = {
    #pendingApproval;
    #approved;
    #rejected;
  };

  public type Variant = {
    size : ?Text;
    color : ?Text;
    price : Nat;
    stock : Nat;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    basePrice : Nat;
    variants : [Variant];
    images : [Storage.ExternalBlob];
  };

  public type Product = {
    id : Nat;
    seller : Principal;
    name : Text;
    description : Text;
    basePrice : Nat;
    variants : [Variant];
    images : [Storage.ExternalBlob];
    status : ProductStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // --- Order Types ------------------------------------------
  public type PaymentMethod = {
    #upi;
    #card;
    #cashOnDelivery;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type CartItem = {
    productId : Nat;
    variantIndex : Nat;
    quantity : Nat;
  };

  public type OrderItem = {
    productId : Nat;
    productName : Text;
    variantIndex : Nat;
    variantSize : ?Text;
    variantColor : ?Text;
    price : Nat;
    quantity : Nat;
    seller : Principal;
  };

  public type ShippingInfo = {
    name : Text;
    phone : Text;
    address : Text;
    city : Text;
    state : Text;
    pincode : Text;
  };

  public type Order = {
    id : Nat;
    buyer : Principal;
    items : [OrderItem];
    shippingInfo : ShippingInfo;
    paymentMethod : PaymentMethod;
    totalAmount : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // --- Storage ---------------------------------------------
  include MixinStorage();

  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;

  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  // --- User Profile Management -----------------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Product Management ----------------------------------
  public shared ({ caller }) func submitProduct(input : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only sellers can submit products");
    };

    // Verify caller has seller role
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please create a seller profile first");
      };
      case (?profile) {
        if (profile.role != #seller and profile.role != #admin) {
          Runtime.trap("Unauthorized: Only sellers can submit products");
        };
      };
    };

    let productId = nextProductId;
    nextProductId += 1;

    switch (input.variants.size()) {
      case (0) {
        Runtime.trap("At least one variant is required");
      };
      case (_) {};
    };

    let newProduct : Product = {
      id = productId;
      seller = caller;
      name = input.name;
      description = input.description;
      basePrice = input.basePrice;
      variants = input.variants;
      images = input.images;
      status = #pendingApproval;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        // Only the seller or admin can update
        if (product.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the product owner or admin can update this product");
        };

        let updatedProduct : Product = {
          product with
          name = input.name;
          description = input.description;
          basePrice = input.basePrice;
          variants = input.variants;
          images = input.images;
          status = #pendingApproval; // Reset to pending after update
          updatedAt = Time.now();
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func approveProduct(productId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve products");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        let updatedProduct = { product with status = #approved; updatedAt = Time.now() };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func rejectProduct(productId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject products");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        let updatedProduct = { product with status = #rejected; updatedAt = Time.now() };
        products.add(productId, updatedProduct);
      };
    };
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) {
        // Buyers and guests can only see approved products
        // Sellers can see their own products regardless of status
        // Admins can see all products
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        let isSeller = product.seller == caller;
        let isApproved = product.status == #approved;

        if (isAdmin or isSeller or isApproved) {
          ?product;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (isAdmin) {
      // Admins see all products
      products.values().toArray();
    } else {
      // Others only see approved products
      products.values().toArray().filter(func(p : Product) : Bool {
        p.status == #approved;
      });
    };
  };

  public query ({ caller }) func getSellerProducts(seller : Principal) : async [Product] {
    // Only the seller themselves or admins can view a seller's products
    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own products");
    };

    products.values().toArray().filter(func(p : Product) : Bool {
      p.seller == seller;
    });
  };

  public query ({ caller }) func getPendingProducts() : async [Product] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pending products");
    };

    products.values().toArray().filter(func(p : Product) : Bool {
      p.status == #pendingApproval;
    });
  };

  // --- Cart Management -------------------------------------
  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can manage cart");
    };

    // Verify product exists and is approved
    switch (products.get(item.productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        if (product.status != #approved) {
          Runtime.trap("Product is not available for purchase");
        };
        if (item.variantIndex >= product.variants.size()) {
          Runtime.trap("Invalid variant index");
        };
      };
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    // Find index where both productId and variantIndex match
    func findMatchingItemIndex(cart : [CartItem], productId : Nat, variantIndex : Nat) : Nat {
      let cartSize = cart.size();
      var i = 0;
      while (i < cartSize) {
        if (cart[i].productId == productId and cart[i].variantIndex == variantIndex) {
          return i;
        };
        i += 1;
      };
      cartSize; // Return cartSize if not found
    };

    let matchingIndex : Nat = findMatchingItemIndex(currentCart, item.productId, item.variantIndex);

    let updatedCart = if (matchingIndex < currentCart.size()) {
      Array.tabulate(
        currentCart.size(),
        func(i : Nat) : CartItem {
          if (i == matchingIndex) {
            let existing = currentCart[i];
            { existing with quantity = existing.quantity + item.quantity };
          } else {
            currentCart[i];
          };
        }
      );
    } else {
      currentCart.concat([item]);
    };

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, variantIndex : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can manage cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    // Manually map and filter items in currentCart to create updatedCart
    let mappedCart = currentCart.map(
      func(item : CartItem) : ?CartItem {
        if (item.productId == productId and item.variantIndex == variantIndex) {
          if (quantity == 0) {
            null; // Remove item
          } else {
            ?{ item with quantity = quantity };
          };
        } else {
          ?item;
        };
      }
    );

    // Flatten the ?CartItem array into a final [CartItem] array, filtering out nulls
    let updatedCart = mappedCart.filter(
      func(item : ?CartItem) : Bool {
        switch (item) {
          case (null) { false };
          case (_) { true };
        };
      }
    ).map(
      func(item : ?CartItem) : CartItem {
        switch (item) {
          case (null) {
            Runtime.trap("Internal error: should not have null in filter");
          };
          case (?item) { item };
        };
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat, variantIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can manage cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let updatedCart = currentCart.filter(
      func(item : CartItem) : Bool {
        not (item.productId == productId and item.variantIndex == variantIndex);
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can manage cart");
    };

    carts.add(caller, []);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  // --- Order Management ------------------------------------
  public shared ({ caller }) func placeOrder(shippingInfo : ShippingInfo, paymentMethod : PaymentMethod) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    let cartItems = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) {
        if (cart.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        cart;
      };
    };

    // Convert cart items to order items and calculate total
    var orderItems : [OrderItem] = [];
    var totalAmount : Nat = 0;

    for (cartItem in cartItems.vals()) {
      switch (products.get(cartItem.productId)) {
        case (null) {
          Runtime.trap("Product not found: " # debug_show(cartItem.productId));
        };
        case (?product) {
          if (product.status != #approved) {
            Runtime.trap("Product is not available: " # product.name);
          };
          if (cartItem.variantIndex >= product.variants.size()) {
            Runtime.trap("Invalid variant for product: " # product.name);
          };
          let variant = product.variants[cartItem.variantIndex];
          if (variant.stock < cartItem.quantity) {
            Runtime.trap("Insufficient stock for product: " # product.name);
          };

          let orderItem : OrderItem = {
            productId = product.id;
            productName = product.name;
            variantIndex = cartItem.variantIndex;
            variantSize = variant.size;
            variantColor = variant.color;
            price = variant.price;
            quantity = cartItem.quantity;
            seller = product.seller;
          };

          orderItems := orderItems.concat([orderItem]);
          totalAmount += variant.price * cartItem.quantity;
        };
      };
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      id = orderId;
      buyer = caller;
      items = orderItems;
      shippingInfo = shippingInfo;
      paymentMethod = paymentMethod;
      totalAmount = totalAmount;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    orders.add(orderId, newOrder);

    // Clear the cart after successful order
    carts.add(caller, []);

    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        let isBuyer = order.buyer == caller;

        // Check if caller is a seller of any item in the order
        let isSeller = order.items.find(
          func(item : OrderItem) : Bool {
            item.seller == caller;
          }
        ) != null;

        if (isAdmin or isBuyer or isSeller) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: You don't have permission to view this order");
        };
      };
    };
  };

  public query ({ caller }) func getBuyerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    orders.values().toArray().filter(func(order : Order) : Bool {
      order.buyer == caller;
    });
  };

  public query ({ caller }) func getSellerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    // Return orders that contain at least one item from this seller
    orders.values().toArray().filter(func(order : Order) : Bool {
      order.items.find(
        func(item : OrderItem) : Bool {
          item.seller == caller;
        }
      ) != null;
    });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = { order with status = status; updatedAt = Time.now() };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};

