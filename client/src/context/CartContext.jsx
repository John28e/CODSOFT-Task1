import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CartContext = createContext(null);

// Safely extract the ID from a product reference (whether populated object or string ID)
const getProductId = (product) => {
  if (!product) return null;
  return typeof product === "string" ? product : product._id || null;
};

// Check if a cart item has a valid product reference
const isValidCartItem = (item) => {
  return !!(item && item.product && getProductId(item.product));
};

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage in sync with local state
  useEffect(() => {
    const validItems = cartItems.filter(isValidCartItem);
    localStorage.setItem("cart", JSON.stringify(validItems));
  }, [cartItems]);

  // Sync cart with backend database when user is authenticated
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!isAuthenticated) return;
      try {
        const validItems = cartItems.filter(isValidCartItem);
        const payload = validItems
          .map((item) => {
            const pId = getProductId(item.product);
            return pId ? { product: pId, size: item.size, quantity: item.quantity } : null;
          })
          .filter(Boolean);

        await api.put("/users/cart", { cart: payload });
      } catch (err) {
        console.error("Failed to sync cart with backend:", err);
      }
    };

    const timer = setTimeout(() => {
      syncWithBackend();
    }, 500); // Debounce database updates

    return () => clearTimeout(timer);
  }, [cartItems, isAuthenticated]);

  // Fetch server cart on login and merge/overwrite
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get("/users/cart");
        if (response.data.success && response.data.cart.length > 0) {
          const validItems = response.data.cart.filter(isValidCartItem);
          setCartItems(validItems);
        }
      } catch (err) {
        console.error("Failed to fetch cart from backend:", err);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  // Self-heal cart by filtering out invalid items
  useEffect(() => {
    const validItems = cartItems.filter(isValidCartItem);
    if (validItems.length !== cartItems.length) {
      console.warn("CartContext: Filtered out invalid/null product items from cart.");
      setCartItems(validItems);
    }
  }, [cartItems]);

  const addToCart = (product, size, quantity = 1) => {
    const targetId = getProductId(product);
    if (!targetId) return;

    setCartItems((prevItems) => {
      const cleanItems = prevItems.filter(isValidCartItem);
      const existingIndex = cleanItems.findIndex(
        (item) => getProductId(item.product) === targetId && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...cleanItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...cleanItems, { product, size, quantity }];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    const targetId = getProductId(productId);
    if (!targetId) return;

    setCartItems((prevItems) =>
      prevItems
        .filter(isValidCartItem)
        .filter(
          (item) =>
            !(getProductId(item.product) === targetId && item.size === size)
        )
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    const targetId = getProductId(productId);
    if (!targetId) return;

    if (quantity <= 0) {
      removeFromCart(targetId, size);
      return;
    }

    setCartItems((prevItems) =>
      prevItems
        .filter(isValidCartItem)
        .map((item) => {
          const isMatch = getProductId(item.product) === targetId && item.size === size;
          return isMatch ? { ...item, quantity } : item;
        })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Total quantity of all valid items in cart
  const cartCount = cartItems
    .filter(isValidCartItem)
    .reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems: cartItems.filter(isValidCartItem),
    setCartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
