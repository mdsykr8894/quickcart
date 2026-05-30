import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Imports
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Guard Imports
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { GuestOnlyRoute } from './GuestOnlyRoute';

// Public Page Imports
import HomePage from '../features/public/HomePage';
import AboutPage from '../features/public/AboutPage';
import ContactPage from '../features/public/ContactPage';
import ForbiddenPage from '../features/public/ForbiddenPage';
import NotFoundPage from '../features/public/NotFoundPage';

// Shop Page Imports
import ShopPage from '../features/shop/ShopPage';
import ProductDetailPage from '../features/shop/ProductDetailPage';

// Auth Page Imports
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// Customer Page Imports
import UserDashboardPage from '../features/public/UserDashboardPage';
import ProfilePage from '../features/profile/ProfilePage';
import CartPage from '../features/cart/CartPage';
import MyOrdersPage from '../features/orders/MyOrdersPage';
import OrderDetailPage from '../features/orders/OrderDetailPage';

// Administrative Page Imports
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import AdminProductsPage from '../features/admin/AdminProductsPage';
import AdminOrdersPage from '../features/admin/AdminOrdersPage';
import AdminUsersPage from '../features/admin/AdminUsersPage';
import AuditLogsPage from '../features/audit/AuditLogsPage';
import DevelopmentSettingsPage from '../features/admin/DevelopmentSettingsPage';

import DashboardRedirect from './DashboardRedirect';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      
      {/* 1. Public Shopping Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:idOrSlug" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* 2. Authentication Routes — guest only */}
      <Route element={<GuestOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* 3. Shopper Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route element={<PublicLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 4. Administrative Protected Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/audit" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<DevelopmentSettingsPage />} />
        </Route>
      </Route>

      {/* 5. Error Fallback Routes */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
};

export default AppRoutes;
