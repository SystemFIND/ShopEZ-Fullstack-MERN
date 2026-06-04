import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // user states: null = unknown/loading, false = anonymous, object = authenticated
    const [user, setUser] = useState(null);

    const fetchMe = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
            return data;
        } catch {
            setUser(false);
            return null;
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    async function login(email, password) {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data);
            return { ok: true, user: data };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    }

    async function register(payload) {
        try {
            const { data } = await api.post("/auth/register", payload);
            setUser(data);
            return { ok: true, user: data };
        } catch (e) {
            return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
        }
    }

    async function logout() {
        try {
            await api.post("/auth/logout");
        } catch (_) {
            /* ignore */
        }
        setUser(false);
    }

    async function updateProfile(payload) {
        const { data } = await api.put("/users/me", payload);
        setUser(data);
        return data;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, fetchMe, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
