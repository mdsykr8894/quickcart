import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import { ShoppingCart, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logo } from '../assets';
import AccountDropdown from '../components/AccountDropdown';
import { resolveProfileImageUrl } from '../utils/resolveProfileImageUrl';

const PublicLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-semibold transition-all duration-200 relative py-1',
      isActive
        ? 'text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-600 after:rounded-full'
        : 'text-gray-600 hover:text-orange-600'
    );

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop', end: false },
    { to: '/about', label: 'About Us', end: false },
    { to: '/contact', label: 'Contact', end: false },
  ];

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="QuickCart Logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">

            {isAuthenticated ? (
              <>
                {/* ADMIN links */}
                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="font-semibold text-orange-600 border-orange-100 hover:bg-orange-50 hover:text-orange-700">
                      Admin Panel
                    </Button>
                  </Link>
                ) : (
                  /* USER links */
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-full text-gray-500 hover:text-orange-600 hover:bg-gray-50 transition-colors"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                )}

                {/* Shared User Profile AccountDropdown */}
                <AccountDropdown />
              </>
            ) : (
              /* GUEST links */
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-gray-700 hover:text-orange-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm shadow-orange-500/10 rounded-lg">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                  )
                }
              >
                {link.label}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-50"
                    >
                      <span>Admin Panel</span>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/cart"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <span>Cart</span>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <span>Orders</span>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </Link>
                    </>
                  )}
                  <Link
                    to={isAdmin ? '/admin' : '/profile'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-650 hover:bg-gray-50 border-t border-gray-100 pt-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {user?.profileImageUrl && !avatarError ? (
                        <img 
                          src={resolveProfileImageUrl(user.profileImageUrl)} 
                          alt={user.username} 
                          className="w-full h-full object-cover" 
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span>{user?.username}</span>
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full font-semibold">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">Create Account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── Page Content ─── */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-2">
                <img src={logo} alt="QuickCart Logo" className="h-6 w-auto object-contain" />
              </Link>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed mt-2">
                A clean, secure marketplace offering robust account features, catalog browsing, and transaction flows.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} QuickCart. All rights reserved.
            </p>
            <p className="text-xs text-gray-300">Safe Checkout &middot; Audit-Backed Admin Console</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
