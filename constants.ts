

import { Customer, InventoryProduct, ServiceItem, ItemType, Role, Staff, Appointment, Membership, LoyaltyTransaction, LoyaltyRule, AppSettings, PlanDefinition, SubscriptionPlan } from './types';

export const STAFF_MEMBERS: Staff[] = [
  { id: 1, name: 'Alice Johnson', role: Role.MANAGER, specialties: ['Hair', 'Color'], status: 'active', phone: '9876543210', email: 'alice@luxe.com', commissionRate: 10, totalSales: 150000, attendance: 'Present' },
  { id: 2, name: 'Bob Smith', role: Role.STAFF, specialties: ['Massage', 'Spa'], status: 'active', phone: '9876543211', email: 'bob@luxe.com', commissionRate: 8, totalSales: 85000, attendance: 'Present' },
  { id: 3, name: 'Charlie Davis', role: Role.STAFF, specialties: ['Nails', 'Pedicure'], status: 'break', phone: '9876543212', email: 'charlie@luxe.com', commissionRate: 8, totalSales: 62000, attendance: 'Present' },
  { id: 4, name: 'Diana Prince', role: Role.STAFF, specialties: ['Makeup', 'Facial'], status: 'off', phone: '9876543213', email: 'diana@luxe.com', commissionRate: 12, totalSales: 45000, attendance: 'Leave' },
];

export const SERVICES: ServiceItem[] = [
  { id: 1, name: 'Classic Haircut', price: 500, duration: 45, type: ItemType.SERVICE, category: 'Hair', active: true },
  { id: 2, name: 'Premium Hair Spa', price: 1500, duration: 60, type: ItemType.SERVICE, category: 'Hair', active: true },
  { id: 3, name: 'Gel Manicure', price: 800, duration: 45, type: ItemType.SERVICE, category: 'Nails', active: true },
  { id: 4, name: 'Deep Tissue Massage', price: 2500, duration: 90, type: ItemType.SERVICE, category: 'Body', active: true },
  { id: 5, name: 'Bridal Makeup', price: 15000, duration: 120, type: ItemType.SERVICE, category: 'Makeup', active: true },
];

export const INVENTORY: InventoryProduct[] = [
  { id: 6, name: 'Loreal Shampoo 250ml', price: 450, type: ItemType.PRODUCT, category: 'Retail', stock: 12, sku: 'LOR-SH-250', supplier: 'BeautySupplies Inc', lowStockThreshold: 10, costPrice: 300 },
  { id: 7, name: 'Moroccan Oil Serum', price: 1200, type: ItemType.PRODUCT, category: 'Retail', stock: 5, sku: 'MOR-OIL-100', supplier: 'Global Brands', lowStockThreshold: 5, costPrice: 800 },
  { id: 8, name: 'O3+ Facial Kit', price: 3500, type: ItemType.PRODUCT, category: 'Internal', stock: 3, sku: 'O3-KIT-GOLD', supplier: 'BeautySupplies Inc', lowStockThreshold: 4, costPrice: 2500 },
  { id: 9, name: 'Disposable Towels (Pack)', price: 200, type: ItemType.PRODUCT, category: 'Consumable', stock: 50, sku: 'DISP-TWL', supplier: 'Local Vendor', lowStockThreshold: 20, costPrice: 100 },
];

export const SERVICES_AND_PRODUCTS = [...SERVICES, ...INVENTORY];

export const CUSTOMERS: Customer[] = [
  { id: 101, name: 'Priya Sharma', phone: '9876543210', email: 'priya@example.com', loyaltyPoints: 450, lastVisit: '2023-10-15', totalSpend: 12000, tier: 'Gold' },
  { id: 102, name: 'Rahul Verma', phone: '9898989898', email: 'rahul@example.com', loyaltyPoints: 120, lastVisit: '2023-10-20', totalSpend: 4500, tier: 'Silver' },
  { id: 103, name: 'Simran Kaur', phone: '9123456789', email: 'simran@example.com', loyaltyPoints: 800, lastVisit: '2023-09-01', totalSpend: 25000, tier: 'Platinum' },
  { id: 104, name: 'Vikram Singh', phone: '9000000000', email: 'vikram@example.com', loyaltyPoints: 50, lastVisit: '2023-10-26', totalSpend: 1500, tier: 'Silver' },
  { id: 105, name: 'Anjali Mehta', phone: '9988776655', email: 'anjali@example.com', loyaltyPoints: 0, lastVisit: '2023-10-28', totalSpend: 0, tier: 'Silver' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, customerId: 101, staffId: 1, serviceId: 1, startTime: new Date().toISOString(), status: 'confirmed' },
  { id: 2, customerId: 102, staffId: 2, serviceId: 4, startTime: new Date(Date.now() + 3600000).toISOString(), status: 'pending' },
  { id: 3, customerId: 103, staffId: 3, serviceId: 3, startTime: new Date(Date.now() + 7200000).toISOString(), status: 'confirmed' },
];

export const MEMBERSHIPS: Membership[] = [
  { id: 1, name: 'Gold Membership', price: 5000, validityDays: 365, discountPercentage: 15, benefits: ['Priority Booking', 'Free Hair Spa'] },
  { id: 2, name: 'Silver Membership', price: 2000, validityDays: 180, discountPercentage: 10, benefits: ['5% off on Products'] },
];

export const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000, appointments: 12 },
  { name: 'Tue', revenue: 3000, appointments: 8 },
  { name: 'Wed', revenue: 2000, appointments: 6 },
  { name: 'Thu', revenue: 2780, appointments: 10 },
  { name: 'Fri', revenue: 1890, appointments: 15 },
  { name: 'Sat', revenue: 8390, appointments: 25 },
  { name: 'Sun', revenue: 6490, appointments: 20 },
];

export const LOYALTY_RULES: LoyaltyRule[] = [
  { id: 1, name: 'Base Spend', type: 'PointsPerSpend', value: 1, threshold: 100, isActive: true }, // 1 pt per 100 rs
  { id: 2, name: 'Visit Bonus', type: 'VisitBonus', value: 50, isActive: true },
];

export const LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  { id: 1, customerId: 101, customerName: 'Priya Sharma', type: 'Earned', points: 120, date: '2023-10-15', amount: 12000 },
  { id: 2, customerId: 102, customerName: 'Rahul Verma', type: 'Earned', points: 45, date: '2023-10-20', amount: 4500 },
  { id: 3, customerId: 103, customerName: 'Simran Kaur', type: 'Redeemed', points: -200, date: '2023-09-01' },
];

export const INITIAL_SETTINGS: AppSettings = {
  salonName: 'LuxeSalon & Spa',
  currency: 'INR',
  taxRate: 18,
  openingTime: '10:00',
  closingTime: '20:00',
  slotDuration: 30,
  razorpay: {
    enabled: false,
    keyId: '',
    keySecret: '',
    webhookSecret: ''
  },
  email: {
    driver: 'smtp',
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    fromName: 'LuxeSalon',
    fromEmail: 'noreply@luxesalon.com'
  },
  sms: {
    enabled: false,
    apiKey: '',
    senderId: 'FSTSMS',
    entityId: '',
    route: 'p'
  }
};

export const INITIAL_PLANS: PlanDefinition[] = [
  {
    id: SubscriptionPlan.FREE,
    name: 'Starter',
    price: '₹0',
    period: '/forever',
    description: 'Perfect for solo beauticians and small home studios.',
    features: [
      'Basic Appointment Scheduling',
      'Customer Management (CRM)',
      'Staff Attendance',
      'Basic Dashboard',
      'Limit 1 Staff Member'
    ],
    missing: [
      'POS & Billing',
      'Inventory Management',
      'AI Marketing Campaigns',
      'Loyalty Program',
      'Multi-Branch Support'
    ],
    color: 'slate'
  },
  {
    id: SubscriptionPlan.PRO,
    name: 'Business Pro',
    price: '₹499',
    period: '/month',
    description: 'Smart solution for growing salons.',
    features: [
      'Advanced POS & GST Billing',
      'Inventory Tracking',
      'AI Marketing Assistant',
      'Unlimited Staff',
      'WhatsApp Notifications'
    ],
    missing: [
      'Loyalty Program',
      'Dedicated Account Manager',
      'White-label Mobile App'
    ],
    color: 'slate',
    isPopular: true
  },
  {
    id: SubscriptionPlan.VIP,
    name: 'VIP Plan',
    price: '₹799',
    period: '/month',
    description: 'Premium features for established brands.',
    features: [
      'Everything in Pro',
      'Loyalty Rewards Program',
      'Advanced Analytics',
      'Staff Commission Automation',
      'Priority Email Support',
      'Custom Roles & Permissions'
    ],
    missing: [
      'Multi-Branch Management',
      'White-label Mobile App'
    ],
    color: 'gold'
  },
  {
    id: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    price: '₹999',
    period: '/month',
    description: 'Ultimate power for multi-chain brands.',
    features: [
      'Everything in VIP',
      'Multi-Branch Management',
      'Head Office Dashboard',
      'White-label Customer App',
      'Dedicated API Access',
      '24/7 Dedicated Support'
    ],
    missing: [],
    color: 'platinum'
  }
];