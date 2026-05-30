import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { authApi } from '../../services/authApi';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  AtSign,
  BadgeCheck,
  Mail,
  ShieldCheck,
  ReceiptText,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Camera
} from 'lucide-react';

import PageHeader from '../../components/PageHeader';
import { formatUsername } from '../../utils/formatUsername';
import { resolveProfileImageUrl } from '../../utils/resolveProfileImageUrl';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const fromCart = new URLSearchParams(location.search).get('from') === 'cart';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [shippingFullName, setShippingFullName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Malaysia');

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.profileImageUrl]);

  const handleUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      setProfileError('Invalid file type. Only JPG, JPEG, PNG, WEBP are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('File size exceeds the 2MB limit.');
      return;
    }

    setIsUploading(true);
    setProfileError(null);
    setSuccessMsg(null);

    try {
      const res = await authApi.uploadProfileImage(file);
      if (res.success) {
        setSuccessMsg('Profile photo updated successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to upload profile image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(null);
        const res = await authApi.getProfile();
        if (res.success && res.data) {
          setFirstName(res.data.firstName || '');
          setLastName(res.data.lastName || '');
          setEmail(res.data.email || '');
          setShippingFullName(res.data.shippingFullName || '');
          setShippingPhone(res.data.shippingPhone || '');
          setShippingAddressLine1(res.data.shippingAddressLine1 || '');
          setShippingAddressLine2(res.data.shippingAddressLine2 || '');
          setShippingCity(res.data.shippingCity || '');
          setShippingState(res.data.shippingState || '');
          setShippingPostalCode(res.data.shippingPostalCode || '');
          setShippingCountry(res.data.shippingCountry || 'Malaysia');
        }
      } catch (err: any) {
        setProfileError(err?.message || 'Failed to load profile data.');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSuccessMsg(null);

    if (shippingPostalCode && !/^\d{5}$/.test(shippingPostalCode)) {
      setProfileError('Postal code must be exactly 5 digits.');
      return;
    }

    const phoneRegex = /^(\+?6?0[1-9]?[- ]?\d{1,4}[- ]?\d{4,8})$|^0\d{1,2}[- ]?\d{3,4}[- ]?\d{4}$/;
    if (shippingPhone && !phoneRegex.test(shippingPhone)) {
      setProfileError('Invalid Malaysian phone number format.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await authApi.updateProfile({
        firstName,
        lastName,
        email,
        shippingFullName: shippingFullName || null,
        shippingPhone: shippingPhone || null,
        shippingAddressLine1: shippingAddressLine1 || null,
        shippingAddressLine2: shippingAddressLine2 || null,
        shippingCity: shippingCity || null,
        shippingState: shippingState || null,
        shippingPostalCode: shippingPostalCode || null,
        shippingCountry: shippingCountry || 'Malaysia'
      });
      if (res.success) {
        setSuccessMsg('Profile and shipping details updated successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Unable to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return <LoadingState message="Loading profile..." className="py-24" />;
  }

  const avatarInitial = user?.username?.charAt(0).toUpperCase() || 'U';
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.username;

  return (
    <div className="bg-slate-50 pt-14 pb-10">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
        
        {/* ─── Header area with aligned action buttons ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <PageHeader
            label="ACCOUNT"
            title="Profile Settings"
            subtitle="Manage your personal information."
            className="mb-0 flex-grow"
          />
          <div className="flex items-center gap-3 shrink-0 sm:pt-2">
            <Link to={fromCart ? '/cart' : '/shop'}>
              <Button type="button" variant="outline" size="sm" className="gap-1.5 font-semibold text-slate-650 border-slate-200">
                <ArrowLeft className="w-4 h-4" /> {fromCart ? 'Back to Cart' : 'Back to Shop'}
              </Button>
            </Link>
            <Button
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-md shadow-orange-500/25 rounded-xl px-6 h-9 text-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ─── Two Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-10 items-start">
          
          {/* ─── LEFT COLUMN: Overview & Details ─── */}
          <div className="space-y-6">
            
            {/* Account Summary Card */}
            <Card>
              <CardBody className="py-4 px-6 flex flex-col items-center text-center gap-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center font-black text-3xl shadow-inner shrink-0 overflow-hidden relative">
                    {user?.profileImageUrl && !avatarError ? (
                      <img 
                        src={resolveProfileImageUrl(user.profileImageUrl)} 
                        alt={displayName} 
                        className="w-full h-full object-cover" 
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      avatarInitial
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-full">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={handleUploadTrigger}
                    className="mt-1 gap-1.5 text-xs font-semibold rounded-lg border-slate-200"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    Change photo
                  </Button>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">{displayName}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{formatUsername(user?.username)}</p>
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 border border-orange-200 text-orange-700">
                    <ShieldCheck className="w-3 h-3 text-orange-600" />
                    {user?.role} Account
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 border border-green-200 text-green-700">
                    <BadgeCheck className="w-3 h-3 text-green-600" />
                    Active
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Account Details (Read-only) Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400">Account Details</CardTitle>
              </CardHeader>
              <Separator />
              <CardBody className="pt-4 space-y-3">
                {/* Username */}
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <AtSign className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Username</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatUsername(user?.username)}</p>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </div>

                {/* Role */}
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Account Role</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <BadgeCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Account Status</p>
                    <p className="text-xs font-semibold text-green-700 mt-0.5">Active / Verified</p>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </div>
              </CardBody>
            </Card>

            {/* Account Shortcuts Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400">Account Shortcuts</CardTitle>
              </CardHeader>
              <Separator />
              <CardBody className="pt-4 space-y-2">
                <Link to="/orders" className="flex items-center justify-between px-3 py-2 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 rounded-xl transition-all group">
                  <div className="flex items-center gap-2.5">
                    <ReceiptText className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-950 transition-colors">My Orders</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-600 transition-all transform group-hover:translate-x-0.5" />
                </Link>

                <Link to="/cart" className="flex items-center justify-between px-3 py-2 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 rounded-xl transition-all group">
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-950 transition-colors">Shopping Cart</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-600 transition-all transform group-hover:translate-x-0.5" />
                </Link>

                <Link to="/shop" className="flex items-center justify-between px-3 py-2 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-200 rounded-xl transition-all group">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-950 transition-colors">Continue Shopping</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-600 transition-all transform group-hover:translate-x-0.5" />
                </Link>
              </CardBody>
            </Card>

          </div>

          {/* ─── RIGHT COLUMN: Editable Profile Form ─── */}
          <div className="space-y-6">
            
            <form id="profile-form" onSubmit={handleUpdateSubmit} className="space-y-6">
              {/* ─── Success / Error Alerts ─── */}
              {successMsg && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-xs font-bold leading-normal">{successMsg}</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs font-bold leading-normal">{profileError}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">Personal Information</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Update your name and email address.</CardDescription>
                </CardHeader>
                <Separator />
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-firstname" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="profile-firstname"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        required
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-lastname" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="profile-lastname"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        required
                        className="pl-9 bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Used for account notifications and invoice dispatch.</p>
                  </div>
                </CardBody>
              </Card>

              {/* Shipping Address Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">Shipping Address</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Used to pre-fill checkout delivery details.</CardDescription>
                </CardHeader>
                <Separator />
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping-fullname" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Full Name
                      </Label>
                      <Input
                        id="shipping-fullname"
                        value={shippingFullName}
                        onChange={(e) => setShippingFullName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping-phone" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phone
                      </Label>
                      <Input
                        id="shipping-phone"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="012-345 6789"
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="shipping-address1" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Address Line 1
                    </Label>
                    <Input
                      id="shipping-address1"
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      placeholder="No. 12, Jalan Melati 3"
                      className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="shipping-address2" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="shipping-address2"
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                      placeholder="Taman Seri Indah"
                      className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Postcode */}
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping-postcode" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Postcode
                      </Label>
                      <Input
                        id="shipping-postcode"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        placeholder="23000"
                        maxLength={5}
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl font-mono"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping-city" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        City
                      </Label>
                      <Input
                        id="shipping-city"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="Dungun"
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <Label htmlFor="shipping-state" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        State
                      </Label>
                      <select
                        id="shipping-state"
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-500/10"
                      >
                        <option value="">Select State</option>
                        {[
                          'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
                          'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
                          'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
                        ].map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardBody>
              </Card>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
