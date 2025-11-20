

import React, { useEffect, useState } from 'react';
import { Check, X, Crown, Shield, Zap, Star } from 'lucide-react';
import { Tenant, SubscriptionPlan, PlanDefinition } from '../types';
import { api } from '../services/api';

interface SubscriptionPlansProps {
  currentPlan?: SubscriptionPlan;
  onUpgrade?: (plan: SubscriptionPlan) => void;
}

const SubscriptionPlans = ({ currentPlan = SubscriptionPlan.FREE, onUpgrade }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await api.admin.listPlans();
        setPlans(data);
      } catch (e) {
        console.error("Failed to load plans", e);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (onUpgrade) {
      onUpgrade(plan);
    } else {
      alert(`Redirecting to payment gateway for ${plan}...`);
    }
  };

  const getIcon = (id: SubscriptionPlan) => {
     switch(id) {
        case SubscriptionPlan.PRO: return <Crown size={24} />;
        case SubscriptionPlan.VIP: return <Star size={24} />;
        case SubscriptionPlan.ENTERPRISE: return <Zap size={24} />;
        default: return <Shield size={24} />;
     }
  };

  if (loading) return <div className="p-8 text-center">Loading Plans...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Choose the Perfect Plan</h2>
        <p className="text-slate-500">
          Scale your salon business with our premium tools. Upgrade anytime as you grow.
        </p>
      </div>

      {/* Grid adjusted for 4 plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isGold = plan.color === 'gold';
          const isPlatinum = plan.color === 'platinum';
          const isPro = isGold || isPlatinum; // Highlight styling logic
          
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col h-full ${
                isGold 
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 border-2 border-secondary scale-105 z-10' 
                  : isPlatinum
                  ? 'bg-slate-800 text-white shadow-xl border border-slate-700'
                  : 'bg-white text-slate-800 shadow-lg border border-slate-100 hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${isPro ? 'bg-slate-800 text-secondary' : 'bg-slate-100 text-slate-600'}`}>
                  {getIcon(plan.id)}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <p className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className={`text-3xl font-bold ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                <span className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <Check size={14} className={`flex-shrink-0 mt-0.5 ${isPro ? 'text-secondary' : 'text-green-500'}`} />
                    <span className={isPro ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                  </div>
                ))}
                {plan.missing.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs opacity-50">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentPlan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
                  currentPlan === plan.id
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : isGold 
                      ? 'bg-secondary text-white hover:bg-yellow-600 shadow-lg shadow-secondary/20' 
                      : isPlatinum
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
