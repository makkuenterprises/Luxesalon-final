
import { 
  Customer, 
  Appointment, 
  Staff, 
  InventoryProduct, 
  ServiceItem, 
  LoyaltyTransaction,
  RoleDefinition,
  LoyaltyTier,
  LoyaltyRule,
  ItemType,
  Tenant,
  SubscriptionPlan,
  PlanDefinition,
  SearchResultItem,
  Notification,
  UserType,
  AuthUser,
  AppSettings,
  Bill
} from '../types';
import { 
  CUSTOMERS, 
  MOCK_APPOINTMENTS, 
  STAFF_MEMBERS, 
  INVENTORY, 
  SERVICES, 
  LOYALTY_TRANSACTIONS,
  LOYALTY_RULES,
  INITIAL_PLANS,
  INITIAL_SETTINGS
} from '../constants';

// --- CONFIGURATION ---

// 1. Set to TRUE to use your Laravel Backend, FALSE for Vercel Demo (Mock Data)
const USE_REAL_API = false; 

// 2. Your Laravel API URL
const API_BASE_URL = 'https://salon.adzquare.in/api/v1'; 

// --- LOCAL STORAGE KEYS (Mock DB) ---
const DB_KEYS = {
  CUSTOMERS: 'ls_customers',
  APPOINTMENTS: 'ls_appointments',
  STAFF: 'ls_staff',
  INVENTORY: 'ls_inventory',
  SERVICES: 'ls_services',
  TRANSACTIONS: 'ls_transactions', // Loyalty Logs
  BILLS: 'ls_bills', // Invoice History
  LOYALTY_RULES: 'ls_loyalty_rules',
  LOYALTY_TIERS: 'ls_loyalty_tiers',
  ROLES: 'ls_roles',
  TENANTS: 'ls_tenants', 
  PLANS: 'ls_plans',
  SETTINGS: 'ls_settings'
};

// --- INITIAL MOCK DATA ---
const INITIAL_ROLES: RoleDefinition[] = [
  { id: 1, name: 'Admin', description: 'Full system access', permissions: ['all'], isSystem: true },
  { id: 2, name: 'Manager', description: 'Can manage staff and inventory', permissions: ['view_dashboard', 'manage_staff', 'manage_inventory', 'manage_pos'], isSystem: true },
  { id: 3, name: 'Receptionist', description: 'Front desk operations', permissions: ['view_dashboard', 'manage_appointments', 'manage_pos', 'view_customers'], isSystem: true },
];

const INITIAL_TIERS: LoyaltyTier[] = [
  { id: 'Silver', name: 'Silver Tier', minSpend: 0, pointMultiplier: 1.0, colorTheme: 'silver', benefits: ['Standard Earning Rate', 'Birthday Bonus'] },
  { id: 'Gold', name: 'Gold Tier', minSpend: 10000, pointMultiplier: 1.5, colorTheme: 'gold', benefits: ['1.5x Points per Spend', '5% Off Products', 'Priority Booking'] },
  { id: 'Platinum', name: 'Platinum Tier', minSpend: 50000, pointMultiplier: 2.0, colorTheme: 'platinum', benefits: ['2x Points per Spend', '10% Off Products', 'Free Monthly Spa'] },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: 'tenant_1', businessName: 'LuxeSalon & Spa', ownerName: 'Sarah Jenkins', email: 'sarah@luxe.com', phone: '9876543210', subscriptionPlan: SubscriptionPlan.PRO, subscriptionStatus: 'active', features: ['pos', 'marketing'], createdAt: '2023-01-15', revenue: 450000, password: 'password' },
  { id: 'tenant_2', businessName: 'Glow Bar', ownerName: 'Mike Ross', email: 'mike@glow.com', phone: '9876543211', subscriptionPlan: SubscriptionPlan.FREE, subscriptionStatus: 'active', features: [], createdAt: '2023-02-20', revenue: 120000, password: 'password' },
  { id: 'tenant_3', businessName: 'Urban Cuts', ownerName: 'Jessica Li', email: 'jess@urban.com', phone: '9876543212', subscriptionPlan: SubscriptionPlan.ENTERPRISE, subscriptionStatus: 'active', features: ['multi-branch'], createdAt: '2023-03-10', revenue: 890000, password: 'password' },
];

// --- MOCK DB INITIALIZER ---
export const initializeMockDatabase = () => {
  if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(CUSTOMERS));
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
    localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(STAFF_MEMBERS));
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(INVENTORY));
    localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify(SERVICES));
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(LOYALTY_TRANSACTIONS));
    localStorage.setItem(DB_KEYS.LOYALTY_RULES, JSON.stringify(LOYALTY_RULES));
    localStorage.setItem(DB_KEYS.LOYALTY_TIERS, JSON.stringify(INITIAL_TIERS));
    localStorage.setItem(DB_KEYS.ROLES, JSON.stringify(INITIAL_ROLES));
    localStorage.setItem(DB_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(DB_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
    // Note: Settings are initialized per-tenant on access
    console.log('Mock Database Initialized');
  }
};

// --- HTTP CLIENT ---
async function request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  if (USE_REAL_API) {
    try {
      const tokenData = localStorage.getItem('active_user');
      const token = tokenData ? JSON.parse(tokenData).token : null; 
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add Authorization if token exists
      if (token) {
           headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Handle trailing slash issues
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${baseUrl}${path}`;

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 404) {
           throw new Error(`404 Not Found: ${url}. Check Backend URL and API Routes.`);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data || json; 
    } catch (error: any) {
      console.error('API Connection Error:', error);
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.warn('Network Error: Backend unreachable. Check CORS and URL.');
      }
      
      throw error;
    }
  } else {
    // --- MOCK IMPLEMENTATION ---
    await new Promise(resolve => setTimeout(resolve, 300)); 

    // Super Admin: Tenants
    if (endpoint.startsWith('/admin/tenants')) {
       let tenants: Tenant[] = [];
       try {
          tenants = JSON.parse(localStorage.getItem(DB_KEYS.TENANTS) || '[]');
          if (!Array.isArray(tenants)) tenants = [];
       } catch(e) { tenants = []; }
       
       if (method === 'GET') return tenants as T;
       
       if (method === 'POST') { // Create Tenant
           const { password, ...tenantData } = body;
           const newTenant = { ...tenantData, id: `tenant_${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], revenue: 0, password: password };
           tenants.push(newTenant);
           localStorage.setItem(DB_KEYS.TENANTS, JSON.stringify(tenants));
           return newTenant as T;
       }
       
       if (method === 'PUT') { // Update Tenant
          const { id, ...updates } = body;
          const targetId = String(id);
          
          let found = false;
          const updatedTenantsList = tenants.map(t => {
             if (String(t.id) === targetId) {
                found = true;
                let features = t.features;
                if (updates.subscriptionPlan) {
                   const plan = updates.subscriptionPlan;
                   if (plan === SubscriptionPlan.FREE) {
                      features = [];
                   } else if (plan === SubscriptionPlan.PRO) {
                      features = ['pos', 'marketing', 'inventory'];
                   } else if (plan === SubscriptionPlan.VIP) {
                      features = ['pos', 'marketing', 'inventory', 'loyalty', 'analytics'];
                   } else if (plan === SubscriptionPlan.ENTERPRISE) {
                      features = ['pos', 'marketing', 'inventory', 'loyalty', 'analytics', 'multi-branch'];
                   }
                }
                return { ...t, ...updates, features };
             }
             return t;
          });
          
          if (!found) throw new Error("Tenant not found");
          
          localStorage.setItem(DB_KEYS.TENANTS, JSON.stringify(updatedTenantsList));
          const updatedObj = updatedTenantsList.find(t => String(t.id) === targetId);
          return updatedObj as T;
       }
    }

    // Super Admin: Plans
    if (endpoint.startsWith('/admin/plans')) {
      const plans = JSON.parse(localStorage.getItem(DB_KEYS.PLANS) || '[]');
      if (method === 'GET') return plans as T;
      if (method === 'PUT') {
        const { id, ...updates } = body;
        const updatedPlans = plans.map((p: PlanDefinition) => p.id === id ? { ...p, ...updates } : p);
        localStorage.setItem(DB_KEYS.PLANS, JSON.stringify(updatedPlans));
        return updatedPlans.find((p: PlanDefinition) => p.id === id) as T;
      }
    }

    // 1. Customers
    if (endpoint.startsWith('/customers')) {
      const customers = JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS) || '[]');
      if (method === 'GET') return customers as T;
      if (method === 'POST') {
        const newCustomer = { ...body, id: Date.now(), loyaltyPoints: 0, totalSpend: 0, tier: 'Silver', lastVisit: new Date().toISOString().split('T')[0] };
        customers.push(newCustomer);
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
        return newCustomer as T;
      }
    }

    // 2. Appointments
    if (endpoint.startsWith('/appointments')) {
      const appointments = JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS) || '[]');
      if (method === 'GET') return appointments as T;
      if (method === 'POST') {
        const newAppt = { ...body, id: Date.now(), status: 'confirmed' };
        appointments.push(newAppt);
        localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        return newAppt as T;
      }
    }

    // 3. Staff
    if (endpoint.startsWith('/staff')) {
       const staff = JSON.parse(localStorage.getItem(DB_KEYS.STAFF) || '[]');
       if (method === 'GET') return staff as T;
       if (method === 'POST') {
          const newStaff = { ...body, id: Date.now(), totalSales: 0, attendance: 'Absent', status: 'active' };
          staff.push(newStaff);
          localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(staff));
          return newStaff as T;
       }
       if (method === 'PUT') {
         const { id, ...updates } = body;
         const updatedStaff = staff.map((s: Staff) => s.id === id ? { ...s, ...updates } : s);
         localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(updatedStaff));
         return updatedStaff.find((s: Staff) => s.id === id) as T;
       }
    }

    // 4. Services
    if (endpoint.startsWith('/services')) {
       const services = JSON.parse(localStorage.getItem(DB_KEYS.SERVICES) || '[]');
       if (method === 'GET') return services as T;
       if (method === 'POST') {
          const newService = { ...body, id: Date.now(), type: ItemType.SERVICE, active: true };
          services.push(newService);
          localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify(services));
          return newService as T;
       }
       if (method === 'PUT') {
          const { id, ...updates } = body;
          const updatedServices = services.map((s: ServiceItem) => s.id === id ? { ...s, ...updates } : s);
          localStorage.setItem(DB_KEYS.SERVICES, JSON.stringify(updatedServices));
          return updatedServices.find((s: ServiceItem) => s.id === id) as T;
       }
    }

    // 5. Inventory
    if (endpoint.startsWith('/inventory')) {
       const inventory = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]');
       if (method === 'GET') return inventory as T;
       if (method === 'POST') {
          const newProduct = { ...body, id: Date.now(), type: ItemType.PRODUCT };
          inventory.push(newProduct);
          localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
          return newProduct as T;
       }
       // Update Stock
       if (method === 'PUT') { // Use PUT for generic update or stock specific
          const { id, stockDelta } = body;
          const updatedInventory = inventory.map((i: InventoryProduct) => 
              i.id === id ? { ...i, stock: Math.max(0, i.stock + (stockDelta || 0)) } : i
          );
          localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(updatedInventory));
          return updatedInventory.find((i: InventoryProduct) => i.id === id) as T;
       }
    }

    // 6. Loyalty Rules
    if (endpoint.startsWith('/loyalty/rules')) {
      const rules = JSON.parse(localStorage.getItem(DB_KEYS.LOYALTY_RULES) || '[]');
      if (method === 'GET') return rules as T;
      if (method === 'POST') {
        const newRule = { ...body, id: Date.now(), isActive: true };
        rules.push(newRule);
        localStorage.setItem(DB_KEYS.LOYALTY_RULES, JSON.stringify(rules));
        return newRule as T;
      }
      if (method === 'PUT') {
        const { id, ...updates } = body;
        const updatedRules = rules.map((r: LoyaltyRule) => r.id === id ? { ...r, ...updates } : r);
        localStorage.setItem(DB_KEYS.LOYALTY_RULES, JSON.stringify(updatedRules));
        return updatedRules.find((r: LoyaltyRule) => r.id === id) as T;
      }
    }

    // 7. Loyalty Tiers
    if (endpoint.startsWith('/loyalty/tiers')) {
      const tiers = JSON.parse(localStorage.getItem(DB_KEYS.LOYALTY_TIERS) || '[]');
      if (method === 'GET') return tiers as T;
      if (method === 'PUT') {
        const { id, ...updates } = body;
        const updatedTiers = tiers.map((t: LoyaltyTier) => t.id === id ? { ...t, ...updates } : t);
        localStorage.setItem(DB_KEYS.LOYALTY_TIERS, JSON.stringify(updatedTiers));
        return updatedTiers.find((t: LoyaltyTier) => t.id === id) as T;
      }
    }

    // 8. Settings & Roles (PER TENANT ISOLATION)
    if (endpoint.startsWith('/settings')) {
       const activeUserStr = localStorage.getItem('active_user');
       let tenantId = 'default';
       if (activeUserStr) {
          const user = JSON.parse(activeUserStr);
          if (user.tenantId) tenantId = user.tenantId;
       }

       if (endpoint.includes('/roles')) {
          // Store Roles per tenant
          const rolesKey = `${DB_KEYS.ROLES}_${tenantId}`;
          // Fallback to global init roles if empty
          const globalRoles = JSON.parse(localStorage.getItem(DB_KEYS.ROLES) || JSON.stringify(INITIAL_ROLES));
          const roles = JSON.parse(localStorage.getItem(rolesKey) || JSON.stringify(globalRoles));
          
          if (method === 'GET') return roles as T;
          if (method === 'POST') {
             const newRole = { ...body, id: Date.now(), isSystem: false };
             roles.push(newRole);
             localStorage.setItem(rolesKey, JSON.stringify(roles));
             return newRole as T;
          }
          if (method === 'PUT') {
             const { id, ...updates } = body;
             const updatedRoles = roles.map((r: RoleDefinition) => r.id === id ? { ...r, ...updates } : r);
             localStorage.setItem(rolesKey, JSON.stringify(updatedRoles));
             return updatedRoles.find((r: RoleDefinition) => r.id === id) as T;
          }
       } else {
          // General Settings (PER TENANT)
          const settingsKey = `${DB_KEYS.SETTINGS}_${tenantId}`;
          const settings = JSON.parse(localStorage.getItem(settingsKey) || JSON.stringify(INITIAL_SETTINGS));
          
          if (method === 'GET') return settings as T;
          if (method === 'POST') {
             const newSettings = { ...settings, ...body };
             localStorage.setItem(settingsKey, JSON.stringify(newSettings));
             return newSettings as T;
          }
       }
    }
    
    // 9. POS Transaction History (Get Bills)
    if (endpoint.startsWith('/pos/history')) {
       const bills = JSON.parse(localStorage.getItem(DB_KEYS.BILLS) || '[]');
       return bills.reverse() as T; // Newest first
    }

    // 10. POS Transaction Process
    if (endpoint.startsWith('/pos/transaction')) {
       const { customerId, items, total, discount, redeemedPoints, paymentMethod } = body;
       const billDate = new Date().toISOString().split('T')[0];
       let customerName = 'Walk-in Customer';

       // 1. Update Customer (Points & Spend)
       if (customerId) {
         const customers = JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS) || '[]');
         const customerIdx = customers.findIndex((c: Customer) => c.id === customerId);
         
         if (customerIdx > -1) {
           const customer = customers[customerIdx];
           customerName = customer.name;
           
           // Calculate earned points based on Tier Multiplier
           const tiers = JSON.parse(localStorage.getItem(DB_KEYS.LOYALTY_TIERS) || '[]');
           const currentTier = tiers.find((t: LoyaltyTier) => t.id === customer.tier);
           const multiplier = currentTier?.pointMultiplier || 1.0;
           
           const pointsEarned = Math.floor((total / 100) * multiplier);
           const pointsRedeemed = Number(redeemedPoints) || 0;
           
           // Update Customer Stats
           customer.totalSpend += total;
           customer.loyaltyPoints = (customer.loyalty_points - pointsRedeemed) + pointsEarned;
           customer.lastVisit = billDate;
           
           // Tier Upgrade Logic
           const goldThreshold = tiers.find((t: LoyaltyTier) => t.id === 'Gold')?.minSpend || 10000;
           const platThreshold = tiers.find((t: LoyaltyTier) => t.id === 'Platinum')?.minSpend || 50000;
           
           if (customer.totalSpend > platThreshold) customer.tier = 'Platinum';
           else if (customer.totalSpend > goldThreshold) customer.tier = 'Gold';
           
           // Save updated customer list to DB
           customers[customerIdx] = customer;
           localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
           
           // Log Loyalty Transactions
           const transactions = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || '[]');
           if (pointsRedeemed > 0) {
              transactions.unshift({ id: Date.now(), customerId: customer.id, customerName: customer.name, type: 'Redeemed', points: -pointsRedeemed, date: billDate });
           }
           if (pointsEarned > 0) {
              transactions.unshift({ id: Date.now() + 1, customerId: customer.id, customerName: customer.name, type: 'Earned', points: pointsEarned, date: billDate, amount: total });
           }
           localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
         }
       }

       // 2. Update Inventory Stock
       const inventory = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]');
       items.forEach((cartItem: any) => {
          if (cartItem.type === ItemType.PRODUCT) {
             const prodIdx = inventory.findIndex((p: InventoryProduct) => p.id === cartItem.id);
             if (prodIdx > -1) {
                inventory[prodIdx].stock = Math.max(0, inventory[prodIdx].stock - cartItem.quantity);
             }
          }
       });
       localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
       
       // 3. Save Bill Record
       const bills = JSON.parse(localStorage.getItem(DB_KEYS.BILLS) || '[]');
       const newBill: Bill = {
          id: Date.now().toString().slice(-6),
          date: new Date().toLocaleString(),
          customerId: customerId || null,
          customerName,
          items,
          subtotal: items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0),
          discount,
          tax: (total - (total / 1.18)), // Approx tax calc
          total,
          paymentMethod,
          redeemedPoints: redeemedPoints || 0
       };
       bills.push(newBill);
       localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(bills));

       return { success: true, message: 'Transaction Processed Successfully', transactionId: newBill.id } as T;
    }

    throw new Error(`Mock Endpoint not implemented: ${endpoint}`);
  }
}

// --- HELPER: GLOBAL SEARCH ---
export const globalSearch = async (query: string, userType: UserType): Promise<SearchResultItem[]> => {
  if (!query) return [];
  const q = query.toLowerCase();
  let results: SearchResultItem[] = [];

  if (userType === UserType.SUPER_ADMIN) {
     if (USE_REAL_API) {
        const res = await request<SearchResultItem[]>('/search?q=' + query);
        return res;
     }
     const tenants: Tenant[] = JSON.parse(localStorage.getItem(DB_KEYS.TENANTS) || '[]');
     tenants.forEach(t => {
        if (t.businessName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) {
           results.push({ id: t.id, title: t.businessName, subtitle: t.email, type: 'Tenant', link: '/' });
        }
     });
  } else {
     if (USE_REAL_API) {
        const res = await request<SearchResultItem[]>('/search?q=' + query);
        return res;
     }
     const customers: Customer[] = JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS) || '[]');
     customers.forEach(c => {
        if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) {
           results.push({ id: c.id, title: c.name, subtitle: c.phone, type: 'Customer', link: '/customers' });
        }
     });

     const inventory: InventoryProduct[] = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]');
     inventory.forEach(i => {
        if (i.name.toLowerCase().includes(q)) {
           results.push({ id: i.id, title: i.name, subtitle: `Stock: ${i.stock}`, type: 'Product', link: '/inventory' });
        }
     });

     const services: ServiceItem[] = JSON.parse(localStorage.getItem(DB_KEYS.SERVICES) || '[]');
     services.forEach(s => {
        if (s.name.toLowerCase().includes(q)) {
           results.push({ id: s.id, title: s.name, subtitle: `₹${s.price}`, type: 'Service', link: '/services' });
        }
     });
  }
  
  return results;
};

export const getNotifications = async (userType: UserType): Promise<Notification[]> => {
   if (USE_REAL_API) {
      return request<Notification[]>('/notifications');
   }
   const notifications: Notification[] = [];
   
   if (userType === UserType.SUPER_ADMIN) {
      notifications.push({
         id: '1', title: 'New Subscription', message: 'Urban Cuts upgraded to Enterprise', type: 'success', time: '2h ago', read: false
      });
   } else {
      const inventory: InventoryProduct[] = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]');
      const lowStock = inventory.filter(i => i.stock <= i.lowStockThreshold);
      if (lowStock.length > 0) {
         notifications.push({
            id: 'stock_1', title: 'Low Stock Alert', message: `${lowStock[0].name} is running low.`, type: 'warning', time: '1h ago', read: false
         });
      }
      notifications.push({
         id: 'booking_1', title: 'New Appointment', message: 'Priya Sharma booked a Hair Spa.', type: 'info', time: '30m ago', read: false
      });
   }
   return notifications;
}


// --- API EXPORTS ---
export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthUser> => {
      if (USE_REAL_API) {
         const user = await request<AuthUser>('/login', 'POST', { email, password });
         // If API login is successful, store token if returned (Laravel Sanctum)
         // Here we assume the backend sets the cookie or returns a token.
         // We create a local session object.
         const sessionUser = { ...user, token: 'mock_token_for_demo' }; // Replace with actual token logic if using Bearer
         return sessionUser;
      }
      await new Promise(r => setTimeout(r, 800));
      if (email === 'admin@saas.com' && password === 'admin123') {
        return { id: 'user_admin_1', name: 'System Administrator', email: 'admin@saas.com', type: UserType.SUPER_ADMIN };
      }
      const tenants = JSON.parse(localStorage.getItem(DB_KEYS.TENANTS) || '[]');
      const tenant = tenants.find((t: Tenant) => t.email === email && (t.password === password || (!t.password && password === 'password')));
      if (tenant) {
        return { id: `user_${tenant.id}`, name: tenant.ownerName, email: tenant.email, type: UserType.TENANT_ADMIN, tenantId: tenant.id };
      }
      throw new Error('Invalid email or password');
    }
  },
  admin: {
     listTenants: () => request<Tenant[]>('/admin/tenants'),
     createTenant: (data: Partial<Tenant> & {password: string}) => request<Tenant>('/admin/tenants', 'POST', data),
     updateTenantPlan: (id: string, plan: SubscriptionPlan) => request<Tenant>('/admin/tenants', 'PUT', { id, subscriptionPlan: plan }),
     suspendTenant: (id: string, status: string) => request<Tenant>('/admin/tenants', 'PUT', { id, subscriptionStatus: status }),
     listPlans: () => request<PlanDefinition[]>('/admin/plans'),
     updatePlan: (id: SubscriptionPlan, data: Partial<PlanDefinition>) => request<PlanDefinition>('/admin/plans', 'PUT', { id, ...data })
  },
  customers: {
    list: () => request<Customer[]>('/customers'),
    create: (data: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend' | 'tier'>) => request<Customer>('/customers', 'POST', data),
  },
  appointments: {
    list: () => request<Appointment[]>('/appointments'),
    create: (data: Partial<Appointment>) => request<Appointment>('/appointments', 'POST', data),
  },
  staff: {
    list: () => request<Staff[]>('/staff'),
    create: (data: Partial<Staff>) => request<Staff>('/staff', 'POST', data),
    update: (id: number, data: Partial<Staff>) => request<Staff>('/staff', 'PUT', { id, ...data }),
  },
  products: {
    listServices: () => request<ServiceItem[]>('/services'),
    createService: (data: Partial<ServiceItem>) => request<ServiceItem>('/services', 'POST', data),
    updateService: (id: number, data: Partial<ServiceItem>) => request<ServiceItem>('/services', 'PUT', { id, ...data }),
    listInventory: () => request<InventoryProduct[]>('/inventory'),
    createInventory: (data: Partial<InventoryProduct>) => request<InventoryProduct>('/inventory', 'POST', data),
    updateStock: (id: number, delta: number) => request<InventoryProduct>('/inventory', 'PUT', { id, delta }),
  },
  loyalty: {
    listRules: () => request<LoyaltyRule[]>('/loyalty/rules'),
    createRule: (data: Partial<LoyaltyRule>) => request<LoyaltyRule>('/loyalty/rules', 'POST', data),
    updateRule: (id: number, data: Partial<LoyaltyRule>) => request<LoyaltyRule>('/loyalty/rules', 'PUT', { id, ...data }),
    listTiers: () => request<LoyaltyTier[]>('/loyalty/tiers'),
    updateTier: (id: string, data: Partial<LoyaltyTier>) => request<LoyaltyTier>('/loyalty/tiers', 'PUT', { id, ...data }),
  },
  settings: {
    get: () => request<AppSettings>('/settings'),
    save: (data: AppSettings) => request<AppSettings>('/settings', 'POST', data),
    listRoles: () => request<RoleDefinition[]>('/settings/roles'),
    createRole: (data: Partial<RoleDefinition>) => request<RoleDefinition>('/settings/roles', 'POST', data),
    updateRole: (id: number, data: Partial<RoleDefinition>) => request<RoleDefinition>('/settings/roles', 'PUT', { id, ...data }),
  },
  pos: {
    processTransaction: (data: any) => request<any>('/pos/transaction', 'POST', data),
    getHistory: () => request<Bill[]>('/pos/history'),
  },
  globalSearch,
  getNotifications
};