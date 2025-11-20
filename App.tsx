
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu, Bell, Search, Shield, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Marketing from './pages/Marketing';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Loyalty from './pages/Loyalty';
import Settings from './pages/Settings';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { initializeMockDatabase, api, globalSearch, getNotifications } from './services/api';
import { Tenant, SubscriptionPlan, AuthUser, UserType, SearchResultItem, Notification } from './types';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Header States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeMockDatabase();
    // Check for session (mock)
    const savedUser = localStorage.getItem('active_user');
    if (savedUser) {
       const parsedUser = JSON.parse(savedUser);
       handleLoginSuccess(parsedUser);
    } else {
       setLoading(false);
    }
    
    // Click Outside Handler
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = async (authUser: AuthUser) => {
     setUser(authUser);
     localStorage.setItem('active_user', JSON.stringify(authUser));
     
     if (authUser.type === UserType.TENANT_ADMIN && authUser.tenantId) {
        // Fetch tenant details
        try {
           const tenants = await api.admin.listTenants(); // Using mock admin API to get tenant list
           const current = tenants.find(t => t.id === authUser.tenantId);
           if (current) setTenant(current);
        } catch (e) {
           console.error("Failed to load tenant info", e);
        }
     }
     
     // Load Notifications
     getNotifications(authUser.type).then(setNotifications);
     
     setLoading(false);
  };

  const handleLogout = () => {
     setUser(null);
     setTenant(null);
     localStorage.removeItem('active_user');
     // Redirect handling is done by conditional rendering in return
  };

  const handleUpgrade = () => {
    if (tenant) {
       const updatedTenant = { ...tenant, subscriptionPlan: SubscriptionPlan.PRO };
       setTenant(updatedTenant);
       alert("Successfully upgraded to PRO Plan! POS and Marketing features are now unlocked.");
    }
  };

  // Search Handler
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length > 1 && user) {
         const results = await globalSearch(searchQuery, user.type);
         setSearchResults(results);
         setIsSearchOpen(true);
      } else {
         setSearchResults([]);
         setIsSearchOpen(false);
      }
    };
    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

  // --- UNAUTHENTICATED ROUTING ---
  if (!user) {
     return (
        <HashRouter>
           <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
           </Routes>
        </HashRouter>
     );
  }

  // --- AUTHENTICATED APP ---
  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar 
           isOpen={isSidebarOpen} 
           onClose={() => setIsSidebarOpen(false)} 
           currentTenant={tenant || undefined}
           userType={user.type}
           onLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 md:px-8 h-20 flex items-center justify-between flex-shrink-0 z-30 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
              >
                <Menu size={24} />
              </button>
              
              {/* Global Search */}
              <div className="hidden md:block relative w-full max-w-md" ref={searchRef}>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder={user.type === UserType.SUPER_ADMIN ? "Search Tenants by Name/Email..." : "Search Customers, Services, Inventory..."}
                      className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
                    />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                 </div>

                 {/* Search Results Dropdown */}
                 {isSearchOpen && (
                   <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      {searchResults.length > 0 ? (
                        <ul className="py-2">
                          {searchResults.map((result) => (
                             <li key={`${result.type}-${result.id}`}>
                               <Link 
                                  to={result.link} 
                                  className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                               >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mr-3 ${
                                     result.type === 'Customer' ? 'bg-blue-100 text-blue-600' :
                                     result.type === 'Product' ? 'bg-amber-100 text-amber-600' :
                                     result.type === 'Tenant' ? 'bg-indigo-100 text-indigo-600' :
                                     'bg-slate-100 text-slate-600'
                                  }`}>
                                     {result.type.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-medium text-slate-800">{result.title}</p>
                                     <p className="text-xs text-slate-500">{result.type} • {result.subtitle}</p>
                                  </div>
                               </Link>
                             </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">No results found for "{searchQuery}"</div>
                      )}
                   </div>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Notifications */}
               <div className="relative" ref={notificationRef}>
                  <button 
                     className="p-2 text-slate-400 hover:text-primary relative rounded-xl hover:bg-slate-100 transition-colors"
                     onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                     <Bell size={20} />
                     {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                     <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                           <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                           <span className="text-xs text-slate-500">{unreadCount} New</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                           {notifications.length > 0 ? (
                              notifications.map(notification => (
                                 <div key={notification.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                                    <div className="flex items-start gap-3">
                                       <div className={`mt-0.5 p-1.5 rounded-full ${
                                          notification.type === 'warning' ? 'bg-red-100 text-red-500' :
                                          notification.type === 'success' ? 'bg-green-100 text-green-500' :
                                          'bg-blue-100 text-blue-500'
                                       }`}>
                                          {notification.type === 'warning' ? <AlertTriangle size={12}/> : 
                                           notification.type === 'success' ? <CheckCircle size={12}/> : 
                                           <Info size={12}/>}
                                       </div>
                                       <div className="flex-1">
                                          <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                                          <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
                                          <p className="text-[10px] text-slate-400 mt-1">{notification.time}</p>
                                       </div>
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <div className="p-8 text-center text-sm text-slate-500">No notifications yet.</div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
               
               <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                     <p className="text-xs text-slate-500 mt-1">{user.type === UserType.SUPER_ADMIN ? 'Administrator' : 'Owner'}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-lg ${user.type === UserType.SUPER_ADMIN ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gradient-to-br from-primary to-slate-800 shadow-primary/20'}`}>
                     {user.type === UserType.SUPER_ADMIN ? <Shield size={18}/> : user.name.charAt(0)}
                  </div>
               </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
            <div className="max-w-7xl mx-auto pb-20 lg:pb-12">
              <Routes>
                {/* ROUTING LOGIC BASED ON USER TYPE */}
                
                {user.type === UserType.SUPER_ADMIN ? (
                   // SUPER ADMIN ROUTES
                   <>
                      <Route path="/" element={<SuperAdminDashboard />} />
                      <Route path="/plans" element={<SubscriptionPlans />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                   </>
                ) : (
                   // TENANT ROUTES
                   <>
                      <Route path="/" element={<Dashboard />} />
                      
                      {/* Subscription Gated Routes */}
                      <Route 
                         path="/pos" 
                         element={
                            tenant?.subscriptionPlan !== SubscriptionPlan.FREE 
                            ? <POS /> 
                            : <SubscriptionGate featureName="POS & Billing" onUpgrade={handleUpgrade} />
                         } 
                      />
                      <Route 
                         path="/marketing" 
                         element={
                            tenant?.subscriptionPlan !== SubscriptionPlan.FREE 
                            ? <Marketing /> 
                            : <SubscriptionGate featureName="AI Marketing" onUpgrade={handleUpgrade} />
                         } 
                      />

                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/staff" element={<Staff />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/loyalty" element={<Loyalty />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/plans" element={<SubscriptionPlans currentPlan={tenant?.subscriptionPlan} onUpgrade={handleUpgrade} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                   </>
                )}
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

// Component to show when user tries to access Premium features
const SubscriptionGate = ({ featureName, onUpgrade }: { featureName: string, onUpgrade: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
     <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-secondary/30 mb-4">
        <div className="text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
        </div>
     </div>
     <h2 className="text-3xl font-bold text-slate-900">Unlock {featureName}</h2>
     <p className="text-slate-500 max-w-md text-lg">
        Upgrade to the <span className="font-bold text-secondary">PRO Plan</span> to access advanced features like {featureName}, detailed analytics, and priority support.
     </p>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mt-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-50">
           <h3 className="font-bold text-slate-500">Free Plan</h3>
           <p className="text-2xl font-bold text-slate-800 mt-2">₹0</p>
           <ul className="text-left text-sm text-slate-500 mt-4 space-y-2">
              <li>✓ Basic Appointments</li>
              <li>✓ Customer Management</li>
           </ul>
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-secondary shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
           <h3 className="font-bold text-slate-900">PRO Plan</h3>
           <p className="text-2xl font-bold text-secondary mt-2">₹1999<span className="text-sm text-slate-400 font-normal">/mo</span></p>
           <ul className="text-left text-sm text-slate-600 mt-4 space-y-2">
              <li className="flex items-center gap-2">✓ POS & Billing</li>
              <li className="flex items-center gap-2">✓ AI Marketing</li>
              <li className="flex items-center gap-2">✓ Inventory Alerts</li>
           </ul>
           <button 
             onClick={onUpgrade}
             className="w-full mt-6 bg-gradient-to-r from-secondary to-accent text-white py-2 rounded-lg font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-opacity"
           >
              Upgrade Now
           </button>
        </div>
     </div>
  </div>
);

export default App;
