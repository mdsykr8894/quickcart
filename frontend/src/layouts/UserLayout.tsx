import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  ReceiptText,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/shop', label: 'Shop', icon: ShoppingBag, end: false },
  { to: '/cart', label: 'Cart', icon: ShoppingCart, end: false },
  { to: '/orders', label: 'My Orders', icon: ReceiptText, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
];

const UserLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const avatarInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  const NavItem = ({ to, label, icon: Icon, end }: (typeof NAV_LINKS)[number]) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-orange-50 text-orange-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn('w-4 h-4 shrink-0', isActive ? 'text-orange-600' : 'text-gray-400')}
            strokeWidth={isActive ? 2.25 : 1.75}
          />
          <span>{label}</span>
          {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-orange-400" />}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm shadow-orange-500/20">
            <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            Quick<span className="text-orange-600">Cart</span>
          </span>
        </Link>
      </div>

      <Separator />

      {/* User info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
            {avatarInitial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'Customer'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 mt-auto">
        <Separator className="mb-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-md flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            Quick<span className="text-orange-600">Cart</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-14 left-0 bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto z-30">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col md:ml-60">
        <main className="flex-1 px-4 sm:px-8 py-6 mt-14 md:mt-0 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
