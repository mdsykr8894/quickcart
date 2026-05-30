import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/useAuth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  User,
  ReceiptText,
  ShoppingCart,
  LayoutDashboard,
  Package,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { formatUsername } from '../utils/formatUsername';
import { resolveProfileImageUrl } from '../utils/resolveProfileImageUrl';

const AccountDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const avatarInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-150 transition-all focus:outline-none select-none">
          <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-orange-500/10 shrink-0 overflow-hidden">
            {user?.profileImageUrl && !avatarError ? (
              <img 
                src={resolveProfileImageUrl(user.profileImageUrl)} 
                alt={user.username} 
                className="w-full h-full object-cover" 
                onError={() => setAvatarError(true)}
              />
            ) : (
              avatarInitial
            )}
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-gray-700 max-w-[100px] truncate pr-1">
            {formatUsername(user?.username)}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden mt-1.5 p-1.5"
      >
        {/* User Details info */}
        <DropdownMenuLabel className="normal-case font-normal p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-orange-55 border border-orange-105 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm shrink-0 overflow-hidden">
              {user?.profileImageUrl && !avatarError ? (
                <img 
                  src={resolveProfileImageUrl(user.profileImageUrl)} 
                  alt={user.username} 
                  className="w-full h-full object-cover" 
                  onError={() => setAvatarError(true)}
                />
              ) : (
                avatarInitial
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-base font-semibold text-slate-950 truncate leading-snug">
                {user?.firstName || user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : formatUsername(user?.username)}
              </p>
              <p className="text-sm text-slate-500 truncate leading-none">
                {formatUsername(user?.username)}
              </p>
              <p className="text-xs text-slate-400 truncate leading-none pt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        <div className="space-y-1">
          {isAdmin ? (
            /* ADMIN MENU ITEMS */
            <>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/admin" className="flex items-center gap-3 w-full">
                  <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/admin/products" className="flex items-center gap-3 w-full">
                  <Package className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Products</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/admin/orders" className="flex items-center gap-3 w-full">
                  <ReceiptText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/admin/audit" className="flex items-center gap-3 w-full">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Audit Logs</span>
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            /* USER MENU ITEMS */
            <>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/profile" className="flex items-center gap-3 w-full">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/orders" className="flex items-center gap-3 w-full">
                  <ReceiptText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>My Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-950 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium text-slate-700 outline-none">
                <Link to="/cart" className="flex items-center gap-3 w-full">
                  <ShoppingCart className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Cart</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 rounded-xl h-10 px-3 cursor-pointer transition-colors text-sm font-medium outline-none"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
