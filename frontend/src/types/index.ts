export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string | null;
  shippingFullName?: string;
  shippingPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  imageName?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  imageName?: string;
  imageUrl?: string | null;
  images?: ProductImage[];
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  subtotal: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  items: CartItem[];
  cartTotal: number;
  totalItemsCount: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  name?: string; // snapshot name
  productSlug?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    imageName?: string;
    imageUrl?: string | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: Partial<User>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface AuditSummary {
  totalLogs: number;
  loginSuccessCount: number;
  loginFailedCount: number;
  unauthorizedAccessCount: number;
  orderCreatedCount: number;
}

export interface AppSettings {
  swaggerEnabled: boolean;
  nodeEnv: string;
  swaggerAvailable: boolean;
}
