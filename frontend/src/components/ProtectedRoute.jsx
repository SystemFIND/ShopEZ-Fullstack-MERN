import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
    const { user } = useAuth();
    const location = useLocation();

    if (user === null) {
        return (
            <div className="ez-container py-24" data-testid="protected-loading">
                <div className="h-6 w-40 ez-skel mb-3" />
                <div className="h-4 w-64 ez-skel" />
            </div>
        );
    }
    if (user === false) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    if (roles && roles.length && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}
