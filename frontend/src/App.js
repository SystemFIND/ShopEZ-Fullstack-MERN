import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import OrderHistory from "@/pages/OrderHistory";
import WishlistPage from "@/pages/Wishlist";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCategories from "@/pages/admin/AdminCategories";
import ProductForm from "@/pages/admin/ProductForm";

function Layout({ children }) {
    return (
        <div className="App flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Toaster position="top-right" richColors closeButton />
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/products/:id" element={<ProductDetail />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route
                                    path="/checkout"
                                    element={<ProtectedRoute><Checkout /></ProtectedRoute>}
                                />
                                <Route
                                    path="/order-confirmation/:id"
                                    element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
                                />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route
                                    path="/profile"
                                    element={<ProtectedRoute><Profile /></ProtectedRoute>}
                                />
                                <Route
                                    path="/orders"
                                    element={<ProtectedRoute><OrderHistory /></ProtectedRoute>}
                                />
                                <Route
                                    path="/wishlist"
                                    element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin"
                                    element={<ProtectedRoute roles={["admin", "seller"]}><Dashboard /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/products"
                                    element={<ProtectedRoute roles={["admin", "seller"]}><AdminProducts /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/products/new"
                                    element={<ProtectedRoute roles={["admin", "seller"]}><ProductForm /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/products/:id/edit"
                                    element={<ProtectedRoute roles={["admin", "seller"]}><ProductForm /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/orders"
                                    element={<ProtectedRoute roles={["admin", "seller"]}><AdminOrders /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/users"
                                    element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>}
                                />
                                <Route
                                    path="/admin/categories"
                                    element={<ProtectedRoute roles={["admin"]}><AdminCategories /></ProtectedRoute>}
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Layout>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
