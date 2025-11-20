
import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, Star, Plus, Search, UserPlus, Calendar, Clock, DollarSign, X } from 'lucide-react';
import { api } from '../services/api';
import { Customer, Appointment, LoyaltyTransaction } from '../types';
import { MOCK_APPOINTMENTS, LOYALTY_TRANSACTIONS } from '../constants';
import Modal from '../components/Modal';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Customer Details Modal State
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'loyalty'>('overview');

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.customers.create({
        ...formData,
        lastVisit: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', notes: '' });
      fetchCustomers(); // Refresh list
    } catch (e) {
      alert('Failed to create customer');
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setViewCustomer(customer);
    setActiveTab('overview');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  // Filter Mock Data for the selected customer
  const customerAppointments = MOCK_APPOINTMENTS.filter(a => a.customerId === viewCustomer?.id);
  const customerTransactions = LOYALTY_TRANSACTIONS.filter(t => t.customerId === viewCustomer?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Customer Management</h2>
           <p className="text-slate-500 text-sm">View customer profiles, history, and loyalty points.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by Name or Phone..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
           {loading ? (
             <div className="p-8 text-center text-slate-500">Loading customers...</div>
           ) : (
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                 <tr>
                   <th className="p-4">Customer Info</th>
                   <th className="p-4">Contact</th>
                   <th className="p-4">Loyalty Tier</th>
                   <th className="p-4">Points</th>
                   <th className="p-4">Total Spend</th>
                   <th className="p-4">Last Visit</th>
                   <th className="p-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                   <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                              {customer.name.charAt(0)}
                           </div>
                           <div className="font-medium text-slate-800">{customer.name}</div>
                        </div>
                     </td>
                     <td className="p-4 text-slate-600">
                        <div className="flex flex-col gap-1">
                           <span className="flex items-center gap-2"><Phone size={12}/> {customer.phone}</span>
                           <span className="flex items-center gap-2"><Mail size={12}/> {customer.email}</span>
                        </div>
                     </td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          customer.tier === 'Platinum' ? 'bg-slate-800 text-white border-slate-800' :
                          customer.tier === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {customer.tier}
                        </span>
                     </td>
                     <td className="p-4">
                        <div className="flex items-center gap-1 text-primary font-bold">
                           <Star size={14} /> {customer.loyaltyPoints}
                        </div>
                     </td>
                     <td className="p-4 font-medium text-slate-800">₹{customer.totalSpend.toLocaleString()}</td>
                     <td className="p-4 text-slate-500">{customer.lastVisit}</td>
                     <td className="p-4 text-right">
                        <button 
                          onClick={() => handleViewDetails(customer)}
                          className="text-primary hover:bg-primary/10 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Details
                        </button>
                     </td>
                   </tr>
                 )) : (
                   <tr><td colSpan={7} className="p-8 text-center text-slate-500">No customers found.</td></tr>
                 )}
               </tbody>
             </table>
           )}
        </div>
      </div>

      {/* Create Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
         <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  required
                  type="tel"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                <input 
                  type="email"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <UserPlus size={18} /> Create Customer
                </button>
              </div>
            </form>
      </Modal>

      {/* Customer Details Modal */}
      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Profile" maxWidth="lg">
         {viewCustomer && (
            <div className="space-y-6">
               {/* Profile Header */}
               <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                     {viewCustomer.name.charAt(0)}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                     <h3 className="text-xl font-bold text-slate-900">{viewCustomer.name}</h3>
                     <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Phone size={14}/> {viewCustomer.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={14}/> {viewCustomer.email}</span>
                     </div>
                  </div>
                  <div className="text-center">
                     <p className="text-xs font-bold text-slate-500 uppercase">Current Tier</p>
                     <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${
                       viewCustomer.tier === 'Platinum' ? 'bg-slate-800 text-white' :
                       viewCustomer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                     }`}>
                        {viewCustomer.tier}
                     </span>
                  </div>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-slate-200">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Appointments
                  </button>
                  <button 
                    onClick={() => setActiveTab('loyalty')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'loyalty' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Loyalty History
                  </button>
               </div>

               {/* Tab Content */}
               <div className="min-h-[200px]">
                  {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 border border-slate-100 rounded-xl bg-white text-center">
                           <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
                           <p className="text-sm text-slate-500">Total Spend</p>
                           <p className="text-xl font-bold text-slate-800">₹{viewCustomer.totalSpend.toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-xl bg-white text-center">
                           <Star className="mx-auto text-amber-500 mb-2" size={24} />
                           <p className="text-sm text-slate-500">Loyalty Points</p>
                           <p className="text-xl font-bold text-slate-800">{viewCustomer.loyaltyPoints}</p>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-xl bg-white text-center">
                           <Calendar className="mx-auto text-blue-500 mb-2" size={24} />
                           <p className="text-sm text-slate-500">Last Visit</p>
                           <p className="text-xl font-bold text-slate-800">{viewCustomer.lastVisit}</p>
                        </div>
                        <div className="sm:col-span-3 p-4 border border-slate-100 rounded-xl bg-slate-50">
                           <h4 className="font-bold text-slate-700 mb-2">Notes</h4>
                           <p className="text-sm text-slate-600">{viewCustomer.notes || "No notes added for this customer."}</p>
                        </div>
                     </div>
                  )}

                  {activeTab === 'history' && (
                     <div className="space-y-3">
                        {customerAppointments.length > 0 ? customerAppointments.map(apt => (
                           <div key={apt.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                              <div>
                                 <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Calendar size={14} /> {new Date(apt.startTime).toLocaleDateString()}
                                    <Clock size={14} className="ml-2" /> {new Date(apt.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                 </p>
                                 <p className="text-xs text-slate-500 mt-1">Service ID: #{apt.serviceId}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                 {apt.status.toUpperCase()}
                              </span>
                           </div>
                        )) : (
                           <p className="text-center text-slate-500 py-8">No appointment history found.</p>
                        )}
                     </div>
                  )}

                  {activeTab === 'loyalty' && (
                     <div className="space-y-3">
                        {customerTransactions.length > 0 ? customerTransactions.map(tx => (
                           <div key={tx.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                              <div>
                                 <p className="font-bold text-slate-800 text-sm">{tx.type}</p>
                                 <p className="text-xs text-slate-500">{tx.date}</p>
                              </div>
                              <div className={`font-bold ${tx.type === 'Earned' ? 'text-green-600' : 'text-red-600'}`}>
                                 {tx.type === 'Earned' ? '+' : ''}{tx.points} Pts
                              </div>
                           </div>
                        )) : (
                           <p className="text-center text-slate-500 py-8">No loyalty transactions found.</p>
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default Customers;
