import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);

const EMPTY = { items: [], total_items: 0, subtotal: 0 };

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(EMPTY);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user || user === false) {
            setCart(EMPTY);
            return;
        }
        try {
            const { data } = await api.get("/cart");
            setCart(data);
        } catch {
            setCart(EMPTY);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function addItem(productId, quantity = 1, opts = {}) {
        if (!user || user === false) {
            toast.error("Please sign in to add items to your cart.");
            return false;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/cart/items", { product_id: productId, quantity });
            setCart(data);
            if (opts.openDrawer) setDrawerOpen(true);
            toast.success("Added to cart");
            return true;
        } catch (e) {
            toast.error("Could not add to cart");
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function updateQty(productId, quantity) {
        setLoading(true);
        try {
            const { data } = await api.put(`/cart/items/${productId}`, { product_id: productId, quantity });
            setCart(data);
        } finally {
            setLoading(false);
        }
    }

    async function removeItem(productId) {
        setLoading(true);
        try {
            const { data } = await api.delete(`/cart/items/${productId}`);
            setCart(data);
            toast.success("Removed");
        } finally {
            setLoading(false);
        }
    }

    async function clearCart() {
        const { data } = await api.delete("/cart");
        setCart(data);
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                drawerOpen,
                setDrawerOpen,
                addItem,
                updateQty,
                removeItem,
                clearCart,
                refresh,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
