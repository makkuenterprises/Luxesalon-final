

// Core Entities

export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  STAFF = 'Staff',
  RECEPTIONIST = 'Receptionist'
}

// --- SAAS MULTI-TENANCY TYPES ---
export enum SubscriptionPlan {
  FREE = 'Free Tier',
  PRO = 'Professional',
  VIP = 'VIP',
  ENTERPRISE = 'Enterprise'
}

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  missing: string[];
  color: 'slate' | 'gold' | 'platinum'; // Added platinum for VIP
  isPopular?: boolean;
}

export enum UserType {
  SUPER_ADMIN = 'SuperAdmin', // The SaaS Owner
  TENANT_ADMIN = 'TenantAdmin' // The Salon Owner
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  tenantId?: string; // Null if Super Admin
}

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'suspended';
  features: string[]; // e.g., ['pos', 'marketing', 'inventory']
  logo?: string;
  createdAt: string;
  revenue: number; // For Super Admin Analytics
  password?: string; // For Mock DB Auth only
}

// -------------------------------

export interface RoleDefinition {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean; // Cannot delete system roles
}

export interface User {
  id: number;
  name: string;
  role: Role;
  email: string;
  avatar: string;
  tenantId: string; // Multi-tenant link
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  lastVisit: string;
  totalSpend: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
  notes?: string;
  created_at?: string;
}

export enum ItemType {
  SERVICE = 'Service',
  PRODUCT = 'Product'
}

export interface Item {
  id: number;
  name: string;
  price: number;
  duration?: number; // in minutes, for services
  type: ItemType;
  category: string;
}

export interface InventoryProduct extends Item {
  stock: number;
  sku: string;
  supplier: string;
  lowStockThreshold: number;
  costPrice: number;
}

export interface ServiceItem extends Item {
  description?: string;
  active: boolean;
}

export interface CartItem extends Item {
  quantity: number;
  staffId?: number; // Assigned staff for commission
  discount?: number; // Percentage
}

export interface Appointment {
  id: number;
  customerId: number;
  staffId: number;
  serviceId: number;
  startTime: string; // ISO string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Staff {
  id: number;
  name: string;
  role: Role;
  specialties: string[];
  status: 'active' | 'break' | 'off';
  phone: string;
  email: string;
  commissionRate: number; // Percentage
  totalSales: number; // For analytics
  attendance: 'Present' | 'Absent' | 'Leave';
}

export interface Membership {
  id: number;
  name: string;
  price: number;
  validityDays: number;
  discountPercentage: number;
  benefits: string[];
}

// Marketing Types
export enum CampaignSegment {
  ALL = 'All Customers',
  HIGH_SPENDERS = 'High Spenders',
  LAPSED = 'Lapsed Customers (30+ days)',
  NEW = 'New Customers',
  BIRTHDAY = 'Upcoming Birthdays'
}

// Loyalty Types
export interface LoyaltyRule {
  id: number;
  name: string;
  type: 'PointsPerSpend' | 'VisitBonus';
  value: number; // e.g., 1 point per ₹100
  threshold?: number; // e.g., min spend 500
  isActive: boolean;
}

export interface LoyaltyTransaction {
  id: number;
  customerId: number;
  customerName: string;
  type: 'Earned' | 'Redeemed';
  points: number;
  date: string;
  amount?: number;
}

export interface LoyaltyTier {
  id: string; // 'Silver' | 'Gold' | 'Platinum'
  name: string;
  minSpend: number;
  pointMultiplier: number; // e.g. 1.0, 1.5, 2.0
  benefits: string[];
  colorTheme: string; // e.g., 'bg-slate-100'
}

// POS & Billing Types
export interface Bill {
  id: string;
  date: string;
  customerId: number | null;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  redeemedPoints: number;
}

// System Settings

export interface RazorpayConfig {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface EmailConfig {
  driver: 'smtp' | 'mailgun' | 'ses';
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
  fromName: string;
  fromEmail: string;
}

export interface Fast2SMSConfig {
  enabled: boolean;
  apiKey: string;
  senderId: string;
  entityId?: string; // DLT Entity ID
  route: 'v3' | 'dev' | 'p';
}

export interface AppSettings {
  salonName: string;
  currency: string;
  taxRate: number; // GST
  openingTime: string;
  closingTime: string;
  slotDuration: number; // minutes
  razorpay: RazorpayConfig;
  email: EmailConfig;
  sms: Fast2SMSConfig;
}

// API Responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// UI/UX Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  time: string;
  read: boolean;
}

export interface SearchResultItem {
  id: string | number;
  title: string;
  subtitle: string;
  type: 'Customer' | 'Product' | 'Service' | 'Tenant' | 'Appointment';
  link: string;
}