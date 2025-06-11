import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../utils/auth';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const isAuthenticated = AuthService.isAuthenticated();
    const isAdmin = AuthService.isAdmin();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute; 