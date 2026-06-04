import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [ids, setIds] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user || user === false) {
            setIds([]);
            setItems([]);
            return;
        }
        try {
            const { data } = await api.get("/wishlist");
            setIds(data.product_ids || []);
            setItems(data.items || []);
        } catch {
            setIds([]);
            setItems([]);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function toggle(productId) {
        if (!user || user === false) {
            toast.error("Please sign in to save items");
            return false;
        }
        setLoading(true);
        try {
            if (ids.includes(productId)) {
                await api.delete(`/wishlist/${productId}`);
                setIds((prev) => prev.filter((p) => p !== productId));
                setItems((prev) => prev.filter((p) => p.id !== productId));
                toast.success("Removed from wishlist");
            } else {
                await api.post(`/wishlist/${productId}`);
                setIds((prev) => [...prev, productId]);
                toast.success("Saved to wishlist");
                refresh();
            }
            return true;
        } finally {
            setLoading(false);
        }
    }

    const has = useCallback((productId) => ids.includes(productId), [ids]);

    return (
        <WishlistContext.Provider value={{ ids, items, toggle, has, refresh, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
