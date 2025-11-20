

import React, { useState, useEffect } from 'react';
import { LOYALTY_TRANSACTIONS, CUSTOMERS } from '../constants';
import { Award, Gift, TrendingUp, Settings, Crown, ShieldCheck, Star, Check, Plus, Edit, Save } from 'lucide-react';
import { api } from '../services/api';
import { LoyaltyRule, LoyaltyTier } from '../types';
import Modal from '../components/Modal';

const Loyalty = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config'>('dashboard');
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Rule Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<{name: string, type: 'PointsPerSpend'|'VisitBonus', value: string, threshold: string}>({
    name: '',
    type: 'PointsPerSpend',
    value: '1',
    threshold: '100'
  });

  // Tier Modal State
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [tierForm, setTierForm] = useState({ minSpend: '0', pointMultiplier: '1.0', benefits: '' });

  // Mock calculations
  const totalPoints = CUSTOMERS.reduce((acc, c) => acc + c.loyaltyPoints, 0);
  const totalRedeemed = Math.abs(LOYALTY_TRANSACTIONS.filter(t => t.type === 'Redeemed').reduce((acc, t) => acc + t.points, 0));
  const activeCustomers = CUSTOMERS.filter(c => c.loyaltyPoints > 0).length;

  const loadData = async () => {
    try {
      const [rulesData, tiersData] = await Promise.all([
        api.loyalty.listRules(),
        api.loyalty.listTiers()
      ]);
      setRules(rulesData);
      setTiers(tiersData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.loyalty.createRule({
        name: newRule.name,
        type: newRule.type,
        value: Number(newRule.value),
        threshold: newRule.type === 'PointsPerSpend' ? Number(newRule.threshold) : undefined,
      });
      setIsRuleModalOpen(false);
      loadData();
      setNewRule({ name: '', type: 'PointsPerSpend', value: '1', threshold: '100' });
    } catch (e) {
      alert('Failed to create rule');
    }
  };

  const toggleRule = async (id: number, currentState: boolean) => {
    try {
      await api.loyalty.updateRule(id, { isActive: !currentState });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditTierModal = (tier: LoyaltyTier) => {
    setEditingTier(tier);
    setTierForm({
      minSpend: tier.minSpend.toString(),
      pointMultiplier: (tier.pointMultiplier || 1.0).toString(),
      benefits: tier.benefits.join('\n')
    });
    setIsTierModalOpen(true);
  };

  const handleUpdateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    try {
      await api.loyalty.updateTier(editingTier.id, {
        minSpend: Number(tierForm.minSpend),
        pointMultiplier: Number(tierForm.pointMultiplier),
        benefits: tierForm.benefits.split('\n').filter(b => b.trim() !== '')
      });
      setIsTierModalOpen(false);
      loadData();
    } catch (e) {
      alert('Failed to update tier');
    }
  };

  // Helper for Tier Colors
  const getTierStyle = (theme: string) => {
    switch (theme) {
      case 'silver': return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-400' };
      case 'gold': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' };
      case 'platinum': return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-white', icon: 'text-slate-400' };
      default: return { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-400' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-primary" /> Loyalty Program
          </h2>
          <p className="text-slate-500 text-sm">Manage reward points, tiers, and redemptions.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Dashboard
          </button>
          <button 
             onClick={() => setActiveTab('config')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Configuration
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Points in Circulation</p>
                  <h3 className="text-3xl font-bold mt-2">{totalPoints.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Star size={24} />
                </div>
              </div>
              <div className="mt-4 text-indigo-100 text-sm">
                Across {activeCustomers} active customers
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Points Redeemed (This Month)</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-800">{totalRedeemed}</h3>
                </div>
                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                  <Gift size={24} />
                </div>
              </div>
              <div className="mt-4 text-emerald-600 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" /> +12% vs last month
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Loyalty Participation Rate</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-800">85%</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Crown size={24} />
                </div>
              </div>
              <div className="mt-4 text-slate-400 text-sm">
                Of total unique walk-ins
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Recent Loyalty Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Points</th>
                    <th className="p-4 text-right">Bill Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LOYALTY_TRANSACTIONS.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-500">{tx.date}</td>
                      <td className="p-4 font-medium text-slate-800">{tx.customerName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          tx.type === 'Earned' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${tx.type === 'Earned' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'Earned' ? '+' : ''}{tx.points}
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        {tx.amount ? `₹${tx.amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Settings size={18}/></div>
             <div>
                <h4 className="font-bold text-blue-800 text-sm">Loyalty Configuration</h4>
                <p className="text-xs text-blue-600 mt-1">Define earning rates for each tier and global rules. Points are calculated as: <span className="font-mono bg-blue-100 px-1 rounded">(Bill Amount / 100) * Tier Multiplier</span>.</p>
             </div>
          </div>

          {/* Tiers Section - Dynamic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(tier => {
              const style = getTierStyle(tier.colorTheme);
              return (
                <div key={tier.id} className={`${style.bg} p-6 rounded-2xl border ${style.border} relative overflow-hidden transition-all hover:shadow-md group`}>
                  <div className={`absolute top-0 right-0 p-4 opacity-10 ${style.icon} group-hover:scale-110 transition-transform`}><ShieldCheck size={100}/></div>
                  
                  <div className="relative z-10">
                     <h3 className={`text-xl font-bold mb-1 ${style.text}`}>{tier.name}</h3>
                     <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 border border-white/20 backdrop-blur-sm ${style.text}`}>
                           {tier.pointMultiplier || 1}x Points
                        </span>
                     </div>
                     
                     <p className={`text-sm mb-4 opacity-70 ${tier.colorTheme === 'platinum' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Spend &gt; ₹{tier.minSpend.toLocaleString()} / Year
                     </p>
                     
                     <ul className={`space-y-2 text-sm mb-6 ${tier.colorTheme === 'platinum' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {tier.benefits.map((benefit, idx) => (
                           <li key={idx} className="flex items-center gap-2">
                              <Check size={14} className={tier.colorTheme === 'platinum' ? 'text-emerald-400' : 'text-green-500'}/> {benefit}
                           </li>
                        ))}
                     </ul>
                  </div>
                  
                  <button 
                    onClick={() => openEditTierModal(tier)}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border relative z-10 ${
                      tier.colorTheme === 'platinum' 
                        ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' 
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Edit size={14} /> Edit Tier
                  </button>
                </div>
              );
            })}
          </div>

          {/* Earning Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings size={18} className="text-slate-400"/> Additional Rules
            </h3>
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-primary/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Gift size={20} />
                     </div>
                     <div>
                        <h4 className="font-semibold text-slate-800">{rule.name}</h4>
                        <p className="text-xs text-slate-500">
                          {rule.type === 'PointsPerSpend' ? `Earn ${rule.value} Point(s) for every ₹${rule.threshold || 100} spent` : `Fixed ${rule.value} Points per visit`}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                     <div className="text-sm font-bold text-slate-700">
                       {rule.type === 'PointsPerSpend' ? `${rule.value} Pt / ₹${rule.threshold}` : `${rule.value} Pts`}
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={rule.isActive} 
                          onChange={() => toggleRule(rule.id, rule.isActive)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                     </label>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsRuleModalOpen(true)}
              className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add New Earning Rule
            </button>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="Create Loyalty Rule">
          <form onSubmit={handleAddRule} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                <input 
                   type="text" required placeholder="e.g. Weekend Special"
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                   value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Type</label>
                <select 
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                   value={newRule.type} onChange={e => setNewRule({...newRule, type: e.target.value as any})}
                >
                   <option value="PointsPerSpend">Points per Spend (e.g. 1pt / ₹100)</option>
                   <option value="VisitBonus">Flat Bonus per Visit</option>
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Points Value</label>
                   <input 
                      type="number" required
                      className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})}
                   />
                </div>
                {newRule.type === 'PointsPerSpend' && (
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Per Amount (₹)</label>
                      <input 
                         type="number" required
                         className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                         value={newRule.threshold} onChange={e => setNewRule({...newRule, threshold: e.target.value})}
                      />
                   </div>
                )}
             </div>
             <div className="pt-4">
                 <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                     <Check size={18} /> Create Rule
                 </button>
             </div>
          </form>
      </Modal>

      {/* Edit Tier Modal */}
      <Modal isOpen={isTierModalOpen} onClose={() => setIsTierModalOpen(false)} title={`Edit ${editingTier?.name || 'Tier'}`}>
          <form onSubmit={handleUpdateTier} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Annual Spend (₹)</label>
                <input 
                   type="number" required
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                   value={tierForm.minSpend} onChange={e => setTierForm({...tierForm, minSpend: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Point Multiplier</label>
                <div className="relative">
                   <input 
                      type="number" step="0.1" required
                      className="w-full p-2 pl-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                      value={tierForm.pointMultiplier} onChange={e => setTierForm({...tierForm, pointMultiplier: e.target.value})}
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">x</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">E.g. 1.5x means they earn 1.5 points for every normal point.</p>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benefits (One per line)</label>
                <textarea 
                   required
                   rows={5}
                   className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                   value={tierForm.benefits} onChange={e => setTierForm({...tierForm, benefits: e.target.value})}
                   placeholder="e.g. Free Coffee&#10;Priority Booking"
                />
             </div>
             <div className="pt-4">
                 <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                     <Save size={18} /> Update Tier
                 </button>
             </div>
          </form>
      </Modal>
    </div>
  );
};

export default Loyalty;