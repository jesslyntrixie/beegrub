import React, { createContext, useState, useCallback } from 'react';

// Cart Context for managing student's shopping cart
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [], // Array of { menu_item_id, name, price, quantity }
    vendor_id: null,
    vendor_name: null,
  });

  // Add item to cart (or increase quantity if already exists)
  const addToCart = useCallback((menuItem, vendor_id, vendor_name) => {
    setCart((prevCart) => {
      // If different vendor, clear cart first
      if (prevCart.vendor_id && prevCart.vendor_id !== vendor_id) {
        return {
          items: [
            {
              menu_item_id: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity: 1,
            },
          ],
          vendor_id,
          vendor_name,
        };
      }

      // Check if item already in cart
      const existingItem = prevCart.items.find((item) => item.menu_item_id === menuItem.id);

      if (existingItem) {
        // Increase quantity
        return {
          ...prevCart,
          items: prevCart.items.map((item) =>
            item.menu_item_id === menuItem.id
              ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
              : item
          ),
        };
      }

      // Add new item
      return {
        ...prevCart,
        items: [
          ...prevCart.items,
          {
            menu_item_id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ],
        vendor_id,
        vendor_name,
      };
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((menu_item_id) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter((item) => item.menu_item_id !== menu_item_id),
    }));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((menu_item_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menu_item_id);
      return;
    }

    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.menu_item_id === menu_item_id
          ? { ...item, quantity: Math.min(quantity, 10) }
          : item
      ),
    }));
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart({
      items: [],
      vendor_id: null,
      vendor_name: null,
    });
  }, []);

  // Get cart totals
  const getCartTotals = useCallback(() => {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceFee = 0
    const total = subtotal + serviceFee;

    return {
      itemCount,
      subtotal,
      serviceFee,
      total,
    };
  }, [cart.items]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
