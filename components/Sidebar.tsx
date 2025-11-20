
import React from 'react';
import { LayoutDashboard, Calculator, Calendar, Megaphone, Users, Settings, LogOut, Scissors, Package, Sparkles, Award, X, Crown, ChevronDown, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Tenant, SubscriptionPlan, UserType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTenant?: Tenant;
  userType?: UserType;
  onLogout: () => void;
}

const Sidebar = ({ isOpen, onClose, currentTenant, userType, onLogout }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-lg shadow-secondary/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white';
  };

  // Define menus based on User Type
  const tenantNavItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', locked: false },
    { path: '/pos', icon: <Calculator size={20} />, label: 'POS & Billing', locked: currentTenant?.subscriptionPlan === SubscriptionPlan.FREE },
    { path: '/appointments', icon: <Calendar size={20} />, label: 'Appointments', locked: false },
    { path: '/customers', icon: <Users size={20} />, label: 'Customers', locked: false },
    { path: '/loyalty', icon: <Award size={20} />, label: 'Loyalty', locked: false },
    { path: '/inventory', icon: <Package size={20} />, label: 'Inventory', locked: false },
    { path: '/staff', icon: <Users size={20} />, label: 'Staff & HR', locked: false },
    { path: '/services', icon: <Sparkles size={20} />, label: 'Services', locked: false },
    { path: '/marketing', icon: <Megaphone size={20} />, label: 'AI Marketing', locked: currentTenant?.subscriptionPlan === SubscriptionPlan.FREE },
  ];

  const adminNavItems = [
    { path: '/', icon: <Shield size={20} />, label: 'Super Admin', locked: false },
    { path: '/plans', icon: <Crown size={20} />, label: 'Subscription Plans', locked: false },
    { path: '/settings', icon: <Settings size={20} />, label: 'Platform Settings', locked: false },
  ];

  const navItems = userType === UserType.SUPER_ADMIN ? adminNavItems : tenantNavItems;
  const isSuperAdmin = userType === UserType.SUPER_ADMIN;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 bg-primary text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo & Tenant Selector */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-2 rounded-xl shadow-lg ${isSuperAdmin ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-gradient-to-br from-secondary to-accent shadow-secondary/20'}`}>
              {isSuperAdmin ? <Shield className="text-white h-6 w-6"/> : <Scissors className="text-white h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">LuxeSalon</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{isSuperAdmin ? 'Super Admin' : 'SaaS Platform'}</p>
            </div>
          </div>

          {/* Tenant/Admin Card */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
             <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSuperAdmin ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-700 text-secondary'}`}>
                   {isSuperAdmin ? 'SA' : currentTenant?.businessName.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                   <p className="text-sm font-semibold truncate w-24 text-slate-200">
                      {isSuperAdmin ? 'Super Admin' : currentTenant?.businessName}
                   </p>
                   <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      {!isSuperAdmin && currentTenant?.subscriptionPlan === SubscriptionPlan.PRO ? (
                        <span className="text-secondary flex items-center gap-0.5"><Crown size={8} /> PRO</span>
                      ) : !isSuperAdmin ? (
                        <span>Free Plan</span>
                      ) : (
                        <span className="text-indigo-400">System Admin</span>
                      )}
                   </p>
                </div>
             </div>
             {!isSuperAdmin && <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose()} 
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${isActive(item.path)}`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.locked && <Crown size={14} className="text-slate-600 group-hover:text-secondary" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {!isSuperAdmin && currentTenant?.subscriptionPlan === SubscriptionPlan.FREE && (
             <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 relative overflow-hidden group cursor-pointer hover:border-secondary/50 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Crown size={60} className="text-secondary" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Upgrade to PRO</h4>
                <p className="text-xs text-slate-400 mb-3">Unlock POS & AI Marketing</p>
                <Link 
                  to="/plans"
                  onClick={() => onClose()}
                  className="block w-full py-1.5 text-xs font-bold bg-secondary text-white rounded-lg shadow-lg shadow-secondary/20 text-center"
                >
                   View Plans
                </Link>
             </div>
          )}

          {!isSuperAdmin && (
            <Link 
              to="/settings" 
              onClick={() => onClose()}
              className={`flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-all font-medium ${isActive('/settings')}`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          )}
          
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
