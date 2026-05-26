import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "rentwaale-customer-cart";

const CustomerCartContext = createContext(null);

const parseStoredCart = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawCart = window.localStorage.getItem(STORAGE_KEY);
    return rawCart ? JSON.parse(rawCart) : [];
  } catch (error) {
    console.error("Unable to read customer cart", error);
    return [];
  }
};

const sanitizeItem = (item) => {
  const minDays = Math.max(Number(item.minDays ?? 1), 1);
  const quantity = Math.max(Number(item.quantity ?? 1), 1);

  return {
    ...item,
    quantity,
    rentalDays: Math.max(Number(item.rentalDays ?? minDays), minDays),
    minDays,
    chargePerDay: Number(item.chargePerDay ?? 0),
    depositCharges: Number(item.depositCharges ?? 0),
    loadingCharges: Number(item.loadingCharges ?? 0),
    unloadingCharges: Number(item.unloadingCharges ?? 0),
    availableQty: Number(item.availableQty ?? item.totalQty ?? 0),
    totalQty: Number(item.totalQty ?? item.availableQty ?? 0),
  };
};

export function CustomerCartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() =>
    parseStoredCart().map(sanitizeItem),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? sanitizeItem({
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  item.availableQty || item.quantity + 1,
                ),
              })
            : item,
        );
      }

      return [
        ...currentItems,
        sanitizeItem({
          ...product,
          quantity: 1,
          rentalDays: Math.max(Number(product.minDays ?? 1), 1),
        }),
      ];
    });
  };

  const updateCartItem = (id, updates) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? sanitizeItem({
              ...item,
              ...updates,
              quantity:
                updates.quantity !== undefined
                  ? Math.min(
                      Number(updates.quantity),
                      item.availableQty || Number(updates.quantity),
                    )
                  : item.quantity,
            })
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const summary = useMemo(() => {
    const totals = cartItems.reduce(
      (accumulator, item) => {
        const effectiveDays = Math.max(
          Number(item.rentalDays),
          Number(item.minDays || 1),
        );
        const rentTotal = item.quantity * effectiveDays * item.chargePerDay;
        const depositTotal = item.quantity * item.depositCharges;
        const loadingTotal = item.quantity * item.loadingCharges;
        const unloadingTotal = item.quantity * item.unloadingCharges;

        return {
          itemCount: accumulator.itemCount + item.quantity,
          lineCount: accumulator.lineCount + 1,
          rentalSubtotal: accumulator.rentalSubtotal + rentTotal,
          depositSubtotal: accumulator.depositSubtotal + depositTotal,
          logisticsSubtotal:
            accumulator.logisticsSubtotal + loadingTotal + unloadingTotal,
        };
      },
      {
        itemCount: 0,
        lineCount: 0,
        rentalSubtotal: 0,
        depositSubtotal: 0,
        logisticsSubtotal: 0,
      },
    );

    return {
      ...totals,
      grandTotal:
        totals.rentalSubtotal +
        totals.depositSubtotal +
        totals.logisticsSubtotal,
    };
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    summary,
  };

  return (
    <CustomerCartContext.Provider value={value}>
      {children}
    </CustomerCartContext.Provider>
  );
}

export function useCustomerCart() {
  const context = useContext(CustomerCartContext);

  if (!context) {
    throw new Error("useCustomerCart must be used within CustomerCartProvider");
  }

  return context;
}
