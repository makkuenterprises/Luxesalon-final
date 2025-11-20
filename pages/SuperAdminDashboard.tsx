
import React, { useState, useEffect } from 'react';
import { Tenant, SubscriptionPlan, PlanDefinition } from '../types';
import { api } from '../services/api';
import { Users, DollarSign, TrendingUp, Shield, Briefcase, Crown, Plus, Settings, Edit, Save, Trash2, AlertCircle, Loader2, Lock, Star } from 'lucide-react';
import Modal from '../components/Modal';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans'>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track specific action loading state (store ID of item being processed)
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Tenant Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      plan: SubscriptionPlan.FREE
  });

  // Plan Edit Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null);
  const [planForm, setPlanForm] = useState<{price: string, description: string, features: string}>({
    price: '',
    description: '',
    features: ''
  });

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tenantData, planData] = await Promise.all([
        api.admin.listTenants(),
        api.admin.listPlans()
      ]);
      // Force state update logic
      setTenants([]); // Clear first to force re-render if needed
      setTimeout(() => setTenants(tenantData), 10);
      setPlans(planData);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- TENANT ACTIONS ---

  const handleCreateTenant = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.admin.createTenant({
              businessName: newTenant.businessName,
              ownerName: newTenant.ownerName,
              email: newTenant.email,
              phone: newTenant.phone,
              password: newTenant.password,
              subscriptionPlan: newTenant.plan,
              subscriptionStatus: 'active',
              features: newTenant.plan === SubscriptionPlan.FREE ? [] : ['pos', 'marketing']
          });
          setIsModalOpen(false);
          setNewTenant({ businessName: '', ownerName: '', email: '', phone: '', password: '', plan: SubscriptionPlan.FREE });
          alert("New salon onboarded successfully!");
          loadData(true);
      } catch (e) {
          alert('Failed to create tenant');
      }
  };

  const handleUpgrade = async (tenantId: string, newPlan: SubscriptionPlan) => {
     setActionLoading(tenantId);
     try {
        console.log(`Upgrading tenant ${tenantId} to ${newPlan}`);
        await api.admin.updateTenantPlan(tenantId, newPlan);
        
        // Small delay to ensure visual feedback
        await new Promise(r => setTimeout(r, 500));
        
        await loadData(true); 
     } catch (e) {
        console.error("Upgrade Error", e);
        alert("Failed to update plan. Please check console for details.");
     } finally {
        setActionLoading(null);
     }
  };

  const handleSuspend = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(tenantId);
    try {
        await api.admin.suspendTenant(tenantId, newStatus);
        await new Promise(r => setTimeout(r, 500));
        await loadData(true);
    } catch (e) {
        console.error("Status Update Error", e);
        alert("Failed to update status");
    } finally {
        setActionLoading(null);
    }
  };

  // --- PLAN ACTIONS ---

  const openEditPlan = (plan: PlanDefinition) => {
    setEditingPlan(plan);
    setPlanForm({
      price: plan.price,
      description: plan.description,
      features: plan.features.join('\n')
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await api.admin.updatePlan(editingPlan.id, {
        price: planForm.price,
        description: planForm.description,
        features: planForm.features.split('\n').filter(f => f.trim() !== '')
      });
      setIsPlanModalOpen(false);
      alert("Plan configuration updated!");
      loadData(true);
    } catch (e) {
      alert("Failed to update plan");
    }
  };


  const totalRevenue = tenants.reduce((acc, t) => acc + t.revenue, 0);
  const proUsers = tenants.filter(t => t.subscriptionPlan !== SubscriptionPlan.FREE).length;

  if (loading) return <div className="p-8 text-center flex items-center justify-center h-96"><Loader2 className="animate-spin mr-2 text-indigo-600" /> Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-indigo-600" /> Super Admin Console
           </h2>
           <p className="text-slate-500 text-sm">Manage your SaaS customers, revenue, and configuration.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setActiveTab('tenants')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
           >
              Manage Tenants
           </button>
           <button 
             onClick={() => setActiveTab('plans')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
           >
              Config Plans
           </button>
        </div>
      </div>

      {activeTab === 'tenants' && (
        <>
          {/* SaaS Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-slate-500 text-sm font-bold uppercase">Total Active Salons</p>
                     <h3 className="text-3xl font-bold text-slate-800 mt-2">{tenants.length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={24}/></div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-slate-500 text-sm font-bold uppercase">Total Platform Revenue</p>
                     <h3 className="text-3xl font-bold text-emerald-600 mt-2">₹{totalRevenue.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-slate-500 text-sm font-bold uppercase">Pro/Enterprise Users</p>
                     <h3 className="text-3xl font-bold text-indigo-600 mt-2">{proUsers}</h3>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Crown size={24}/></div>
               </div>
            </div>
          </div>

          {/* Tenant List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Registered Businesses</h3>
                <button 
                   onClick={() => setIsModalOpen(true)}
                   className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                   <Plus size={16} /> Onboard New Salon
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                         <th className="p-4">Business Name</th>
                         <th className="p-4">Owner</th>
                         <th className="p-4">Contact</th>
                         <th className="p-4">Plan</th>
                         <th className="p-4">Status</th>
                         <th className="p-4">Revenue (Est.)</th>
                         <th className="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {tenants.map(tenant => (
                         <tr key={tenant.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{tenant.businessName}</td>
                            <td className="p-4 text-slate-600">{tenant.ownerName}</td>
                            <td className="p-4 text-slate-500 text-xs">
                               <div>{tenant.email}</div>
                               <div>{tenant.phone}</div>
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                  tenant.subscriptionPlan === SubscriptionPlan.ENTERPRISE ? 'bg-slate-800 text-white border-slate-800' :
                                  tenant.subscriptionPlan === SubscriptionPlan.VIP ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  tenant.subscriptionPlan === SubscriptionPlan.PRO ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  'bg-slate-50 text-slate-600 border-slate-200'
                               }`}>
                                  {tenant.subscriptionPlan}
                               </span>
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${tenant.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {tenant.subscriptionStatus.toUpperCase()}
                               </span>
                            </td>
                            <td className="p-4 font-mono">₹{tenant.revenue.toLocaleString()}</td>
                            <td className="p-4 text-right">
                               <div className="flex justify-end gap-2 items-center min-w-[180px]">
                                  {actionLoading === tenant.id ? (
                                     <span className="flex items-center text-xs text-indigo-600 font-bold gap-1"><Loader2 size={14} className="animate-spin"/> Updating...</span>
                                  ) : (
                                     <>
                                        {/* FREE TIER ACTIONS */}
                                        {tenant.subscriptionPlan === SubscriptionPlan.FREE && (
                                           <>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.PRO)} 
                                                className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-100 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to Pro
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.VIP)} 
                                                className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded hover:bg-amber-100 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to VIP
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.ENTERPRISE)} 
                                                className="text-[10px] bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to Ent
                                              </button>
                                           </>
                                        )}

                                        {/* PRO TIER ACTIONS */}
                                        {tenant.subscriptionPlan === SubscriptionPlan.PRO && (
                                           <>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.VIP)} 
                                                className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded hover:bg-amber-100 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to VIP
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.ENTERPRISE)} 
                                                className="text-[10px] bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to Ent
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.FREE)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to Free
                                              </button>
                                           </>
                                        )}

                                        {/* VIP TIER ACTIONS */}
                                        {tenant.subscriptionPlan === SubscriptionPlan.VIP && (
                                           <>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.ENTERPRISE)} 
                                                className="text-[10px] bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 font-semibold transition-colors whitespace-nowrap"
                                              >
                                                 Up to Ent
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.PRO)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to Pro
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.FREE)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to Free
                                              </button>
                                           </>
                                        )}

                                        {/* ENTERPRISE TIER ACTIONS */}
                                        {tenant.subscriptionPlan === SubscriptionPlan.ENTERPRISE && (
                                           <>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.VIP)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to VIP
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.PRO)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to Pro
                                              </button>
                                              <button 
                                                onClick={() => handleUpgrade(tenant.id, SubscriptionPlan.FREE)} 
                                                className="text-[10px] border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
                                              >
                                                 Down to Free
                                              </button>
                                           </>
                                        )}

                                        <button 
                                          onClick={() => handleSuspend(tenant.id, tenant.subscriptionStatus)}
                                          title={tenant.subscriptionStatus === 'active' ? "Suspend Account" : "Activate Account"}
                                          className={`p-1.5 rounded transition-colors ${tenant.subscriptionStatus === 'active' ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                        >
                                           {tenant.subscriptionStatus === 'active' ? <Trash2 size={16} /> : <Shield size={16} />}
                                        </button>
                                     </>
                                  )}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {activeTab === 'plans' && (
         <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
               <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-xl ${plan.color === 'gold' ? 'bg-slate-800 text-yellow-400' : plan.color === 'platinum' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {plan.color === 'gold' ? <Star size={24} /> : plan.color === 'platinum' ? <Crown size={24} /> : <Briefcase size={24} />}
                     </div>
                     <button onClick={() => openEditPlan(plan)} className="text-slate-400 hover:text-indigo-600">
                        <Edit size={18} />
                     </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                     <span className="text-3xl font-bold text-indigo-600">{plan.price}</span>
                     <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="mt-auto">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Included Features</p>
                     <ul className="space-y-2">
                        {plan.features.slice(0, 5).map((f, i) => (
                           <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {f}
                           </li>
                        ))}
                        {plan.features.length > 5 && <li className="text-xs text-slate-400 italic">+ {plan.features.length - 5} more</li>}
                     </ul>
                  </div>
               </div>
            ))}
         </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Salon">
          <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salon/Business Name</label>
                  <input type="text" required className="w-full p-2 rounded-lg border border-slate-200 outline-none" value={newTenant.businessName} onChange={e => setNewTenant({...newTenant, businessName: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <input type="text" required className="w-full p-2 rounded-lg border border-slate-200 outline-none" value={newTenant.ownerName} onChange={e => setNewTenant({...newTenant, ownerName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" required className="w-full p-2 rounded-lg border border-slate-200 outline-none" value={newTenant.email} onChange={e => setNewTenant({...newTenant, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input type="tel" required className="w-full p-2 rounded-lg border border-slate-200 outline-none" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} />
                 </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="password" 
                        required 
                        placeholder="Create initial password"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-600" 
                        value={newTenant.password} 
                        onChange={e => setNewTenant({...newTenant, password: e.target.value})} 
                    />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Plan</label>
                  <select className="w-full p-2 rounded-lg border border-slate-200 outline-none bg-white" value={newTenant.plan} onChange={e => setNewTenant({...newTenant, plan: e.target.value as SubscriptionPlan})}>
                      {Object.values(SubscriptionPlan).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
              </div>
              <div className="pt-2">
                 <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Create Account</button>
              </div>
          </form>
      </Modal>

      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={`Edit Plan: ${editingPlan?.name}`}>
         <form onSubmit={handleSavePlan} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Display Price (e.g. ₹1999)</label>
               <input 
                  type="text" required 
                  className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" 
                  value={planForm.price} 
                  onChange={e => setPlanForm({...planForm, price: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
               <input 
                  type="text" required 
                  className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" 
                  value={planForm.description} 
                  onChange={e => setPlanForm({...planForm, description: e.target.value})} 
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Features (One per line)</label>
               <textarea 
                  rows={6}
                  required 
                  className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" 
                  value={planForm.features} 
                  onChange={e => setPlanForm({...planForm, features: e.target.value})} 
               />
            </div>
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex items-start gap-2">
               <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
               Changes to plan features will be reflected on the pricing page immediately.
            </div>
            <div className="pt-2">
                 <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                     <Save size={18} /> Update Plan
                 </button>
              </div>
         </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
