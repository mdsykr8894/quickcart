import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { logo } from '../assets';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck, end: false },
  { to: '/admin/settings', label: 'Dev Settings', icon: Settings, end: false },
];

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
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

  const NavItem = ({ to, label, icon: Icon, end }: (typeof NAV_LINKS)[number]) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4.5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-orange-50/80 text-orange-600 font-bold shadow-sm shadow-orange-500/[0.01]'
            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-orange-600' : 'text-gray-400')}
            strokeWidth={isActive ? 2.5 : 1.75}
          />
          <span>{label}</span>
          {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-orange-400" />}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="QuickCart Logo" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 pt-4">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-3 pb-4 mt-auto space-y-1">
        <Separator className="mb-3" />
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-550 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ShoppingBag className="w-4 h-4 shrink-0 text-gray-450" strokeWidth={1.75} />
          View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-550 hover:bg-red-50 hover:text-red-650 transition-colors"
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
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-md flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-gray-900">
            Quick<span className="text-orange-600">Cart</span>{' '}
            <span className="font-bold text-gray-400">Admin</span>
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
        <main className="flex-1 px-4 sm:px-8 pt-5 pb-8 mt-14 md:mt-0 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
