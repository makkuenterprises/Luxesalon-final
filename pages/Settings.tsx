

import React, { useState, useEffect } from 'react';
import { INITIAL_SETTINGS } from '../constants';
import { Store, Clock, Users, Save, Briefcase, CheckCircle, Plus, Shield, Edit, CreditCard, Mail, Eye, EyeOff, Server, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { RoleDefinition, AppSettings } from '../types';
import Modal from '../components/Modal';

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  
  // Role Management State
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({ id: 0, name: '', description: '', permissions: [] as string[] });
  const [isEditingRole, setIsEditingRole] = useState(false);

  const ALL_PERMISSIONS = [
    { id: 'view_dashboard', label: 'View Dashboard Stats' },
    { id: 'manage_pos', label: 'Access POS & Billing' },
    { id: 'manage_appointments', label: 'Manage Appointments' },
    { id: 'view_customers', label: 'View Customer Data' },
    { id: 'manage_inventory', label: 'Manage Inventory & Stock' },
    { id: 'manage_staff', label: 'Manage Staff & HR' },
    { id: 'manage_settings', label: 'Configure System Settings' },
  ];

  useEffect(() => {
    fetchRoles();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
     try {
        const data = await api.settings.get();
        if (data) {
           // Merge with initial settings to ensure new fields (email/razorpay) exist if old data lacks them
           setSettings({ ...INITIAL_SETTINGS, ...data });
        }
     } catch (e) { console.error(e); }
  }

  const fetchRoles = async () => {
    try {
      const data = await api.settings.listRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: 'razorpay' | 'email' | 'sms', field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
     setSaving(true);
     try {
        await api.settings.save(settings);
        alert("System settings saved successfully!");
     } catch (e) {
        alert("Failed to save settings");
     } finally {
        setSaving(false);
     }
  };

  const openCreateRoleModal = () => {
    setRoleForm({ id: 0, name: '', description: '', permissions: [] });
    setIsEditingRole(false);
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: RoleDefinition) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsEditingRole(true);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingRole) {
        await api.settings.updateRole(roleForm.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
      } else {
        await api.settings.createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
      }
      
      setIsRoleModalOpen(false);
      fetchRoles();
    } catch (e) {
      alert('Failed to save role');
    }
  };

  const togglePermission = (permId: string) => {
    setRoleForm(prev => {
      const exists = prev.permissions.includes(permId);
      if (exists) return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      return { ...prev, permissions: [...prev.permissions, permId] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
           <p className="text-slate-500 text-sm">Configure your salon profile, booking slots, integrations, and roles.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
          {[
            { id: 'general', label: 'General Profile', icon: <Store size={18} /> },
            { id: 'booking', label: 'Booking & Slots', icon: <Clock size={18} /> },
            { id: 'payment', label: 'Payment Gateway', icon: <CreditCard size={18} /> },
            { id: 'sms', label: 'SMS Gateway', icon: <MessageSquare size={18} /> },
            { id: 'email', label: 'Email Server', icon: <Mail size={18} /> },
            { id: 'roles', label: 'Roles & Permissions', icon: <Users size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm border border-slate-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
          
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Business Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Salon Name</label>
                  <input 
                    type="text" 
                    value={settings.salonName}
                    onChange={(e) => handleChange('salonName', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency Symbol</label>
                  <select 
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Tax Rate (GST %)</label>
                  <input 
                    type="number" 
                    value={settings.taxRate}
                    onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Slot Configuration (Dineout Style)</h3>
              <p className="text-sm text-slate-500">Manage your operating hours and booking slot intervals.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Opening Time</label>
                  <input 
                    type="time" 
                    value={settings.openingTime}
                    onChange={(e) => handleChange('openingTime', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Closing Time</label>
                  <input 
                    type="time" 
                    value={settings.closingTime}
                    onChange={(e) => handleChange('closingTime', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Slot Duration (Minutes)</label>
                  <select 
                    value={settings.slotDuration}
                    onChange={(e) => handleChange('slotDuration', Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mt-4">
                <h4 className="font-bold text-amber-800 text-sm mb-2">Booking Rules</h4>
                <div className="space-y-2">
                   <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                      <span className="text-sm text-amber-900">Allow Walk-in bookings to override slots</span>
                   </label>
                   <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                      <span className="text-sm text-amber-900">Auto-confirm online bookings</span>
                   </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Razorpay Integration</h3>
                    <p className="text-sm text-slate-500">Configure payment gateway for online booking.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Enable</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.razorpay?.enabled || false} 
                          onChange={(e) => handleNestedChange('razorpay', 'enabled', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                     </label>
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Key ID</label>
                     <input 
                        type="text" 
                        placeholder="rzp_test_..."
                        value={settings.razorpay?.keyId || ''}
                        onChange={(e) => handleNestedChange('razorpay', 'keyId', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Key Secret</label>
                     <div className="relative">
                        <input 
                           type={showSecrets ? "text" : "password"} 
                           placeholder="Enter secret key"
                           value={settings.razorpay?.keySecret || ''}
                           onChange={(e) => handleNestedChange('razorpay', 'keySecret', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                        />
                        <button 
                           onClick={() => setShowSecrets(!showSecrets)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                           {showSecrets ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Webhook Secret (Optional)</label>
                     <input 
                        type="text" 
                        placeholder="Enter webhook signing secret"
                        value={settings.razorpay?.webhookSecret || ''}
                        onChange={(e) => handleNestedChange('razorpay', 'webhookSecret', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                     />
                  </div>
               </div>
               
               <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3">
                  <Shield size={20} className="flex-shrink-0 mt-0.5"/>
                  <div className="text-sm">
                     <strong>Security Note:</strong> Your keys are encrypted before storage. Ensure you are using Test Mode keys for development and Live Mode keys for production.
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'sms' && (
             <div className="space-y-6 animate-fade-in">
               <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Fast2SMS Gateway</h3>
                    <p className="text-sm text-slate-500">Configure SMS provider for OTPs and appointment reminders.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Enable</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.sms?.enabled || false} 
                          onChange={(e) => handleNestedChange('sms', 'enabled', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                     </label>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                     <div className="relative">
                        <input 
                           type={showSecrets ? "text" : "password"}
                           placeholder="Enter Fast2SMS API Key"
                           value={settings.sms?.apiKey || ''}
                           onChange={(e) => handleNestedChange('sms', 'apiKey', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                        />
                        <button 
                           onClick={() => setShowSecrets(!showSecrets)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                           {showSecrets ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sender ID</label>
                        <input 
                           type="text" 
                           placeholder="FSTSMS"
                           maxLength={6}
                           value={settings.sms?.senderId || ''}
                           onChange={(e) => handleNestedChange('sms', 'senderId', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Route</label>
                        <select 
                           value={settings.sms?.route || 'p'}
                           onChange={(e) => handleNestedChange('sms', 'route', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        >
                           <option value="v3">OTP / Transactional (v3)</option>
                           <option value="p">Promotional (p)</option>
                           <option value="dev">Quick Send (dev)</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">DLT Entity ID (Optional)</label>
                     <input 
                        type="text" 
                        placeholder="1234567890..."
                        value={settings.sms?.entityId || ''}
                        onChange={(e) => handleNestedChange('sms', 'entityId', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                     <p className="text-xs text-slate-500 mt-1">Required for sending SMS in India via DLT approved headers.</p>
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'email' && (
             <div className="space-y-6 animate-fade-in">
               <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Email Server Settings (SMTP)</h3>
               <p className="text-sm text-slate-500">Configure how system emails (invoices, reminders) are sent.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Mail Driver</label>
                     <select 
                        value={settings.email?.driver || 'smtp'}
                        onChange={(e) => handleNestedChange('email', 'driver', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                     >
                        <option value="smtp">SMTP</option>
                        <option value="mailgun">Mailgun</option>
                        <option value="ses">Amazon SES</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Host</label>
                     <input 
                        type="text" 
                        placeholder="smtp.gmail.com"
                        value={settings.email?.host || ''}
                        onChange={(e) => handleNestedChange('email', 'host', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Port</label>
                     <input 
                        type="number" 
                        placeholder="587"
                        value={settings.email?.port || ''}
                        onChange={(e) => handleNestedChange('email', 'port', Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Encryption</label>
                     <select 
                        value={settings.email?.encryption || 'tls'}
                        onChange={(e) => handleNestedChange('email', 'encryption', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                     >
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">None</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Username / Email</label>
                     <input 
                        type="text" 
                        value={settings.email?.username || ''}
                        onChange={(e) => handleNestedChange('email', 'username', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                     <div className="relative">
                        <input 
                           type={showSecrets ? "text" : "password"}
                           value={settings.email?.password || ''}
                           onChange={(e) => handleNestedChange('email', 'password', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button 
                           onClick={() => setShowSecrets(!showSecrets)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                           {showSecrets ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                     </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4 mt-2">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                        <input 
                           type="text" 
                           placeholder="LuxeSalon Notifications"
                           value={settings.email?.fromName || ''}
                           onChange={(e) => handleNestedChange('email', 'fromName', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">From Email</label>
                        <input 
                           type="email" 
                           placeholder="noreply@luxesalon.com"
                           value={settings.email?.fromEmail || ''}
                           onChange={(e) => handleNestedChange('email', 'fromEmail', e.target.value)}
                           className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                     </div>
                  </div>
               </div>
               
               <div className="pt-4">
                  <button className="text-sm font-bold text-primary border border-primary/30 bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2">
                     <Server size={16} /> Send Test Email
                  </button>
               </div>
             </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Roles & Permissions</h3>
              
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}`}>
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                           {role.name} 
                           {role.isSystem && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">System</span>}
                        </h4>
                        <p className="text-xs text-slate-500">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                         {role.permissions.length} Permissions
                       </div>
                       <button 
                         onClick={() => openEditRoleModal(role)}
                         className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-primary transition-colors"
                         title="Edit Role"
                       >
                         <Edit size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                 onClick={openCreateRoleModal}
                 className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                 <Plus size={18} /> Create Custom Role
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Modal for Create & Edit */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={isEditingRole ? "Edit Role" : "Create New Role"}>
          <form onSubmit={handleSaveRole} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                <input 
                   type="text" required placeholder="e.g. Senior Stylist"
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                   value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input 
                   type="text" required placeholder="Short description of responsibilities"
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                   value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                   <Shield size={16}/> Access Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                   {ALL_PERMISSIONS.map(perm => (
                      <div 
                         key={perm.id}
                         onClick={() => togglePermission(perm.id)}
                         className={`p-2 rounded-lg border cursor-pointer text-sm flex items-center justify-between transition-all ${
                            roleForm.permissions.includes(perm.id) 
                            ? 'bg-primary/5 border-primary text-primary font-medium' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                         }`}
                      >
                         {perm.label}
                         {roleForm.permissions.includes(perm.id) && <CheckCircle size={14} />}
                      </div>
                   ))}
                </div>
             </div>
             <div className="pt-4">
                 <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                     <Users size={18} /> {isEditingRole ? "Save Changes" : "Create Role"}
                 </button>
             </div>
          </form>
      </Modal>
    </div>
  );
};

export default Settings;