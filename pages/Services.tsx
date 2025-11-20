

import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { api } from '../services/api';
import { Scissors, Clock, Edit, Plus, Sparkles } from 'lucide-react';
import Modal from '../components/Modal';

const Services = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [serviceForm, setServiceForm] = useState({
      name: '',
      price: '',
      duration: '30',
      category: 'Hair'
  });

  const fetchServices = async () => {
      try {
          const data = await api.products.listServices();
          setServices(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchServices();
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingId) {
              // Update existing service
              await api.products.updateService(editingId, {
                  name: serviceForm.name,
                  price: Number(serviceForm.price),
                  duration: Number(serviceForm.duration),
                  category: serviceForm.category
              });
          } else {
              // Create new service
              await api.products.createService({
                  name: serviceForm.name,
                  price: Number(serviceForm.price),
                  duration: Number(serviceForm.duration),
                  category: serviceForm.category
              });
          }
          
          setIsModalOpen(false);
          fetchServices();
          resetForm();
      } catch (e) {
          alert('Failed to save service');
      }
  };

  const resetForm = () => {
      setServiceForm({ name: '', price: '', duration: '30', category: 'Hair' });
      setEditingId(null);
  };

  const openEditModal = (service: ServiceItem) => {
      setEditingId(service.id);
      setServiceForm({
          name: service.name,
          price: service.price.toString(),
          duration: (service.duration || 30).toString(),
          category: service.category
      });
      setIsModalOpen(true);
  };

  const openAddModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
     try {
        await api.products.updateService(id, { active: !currentStatus });
        fetchServices();
     } catch (e) {
        console.error("Failed to toggle service status");
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Services Menu</h2>
           <p className="text-slate-500 text-sm">Manage service offerings, pricing, and duration.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
            <Plus size={18} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 transition-colors">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                   <Scissors size={24} />
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => openEditModal(service)}
                     className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                   >
                      <Edit size={16} />
                   </button>
                </div>
             </div>
             
             <h3 className="text-lg font-bold text-slate-800 mb-1">{service.name}</h3>
             <p className="text-sm text-slate-500 mb-4">{service.category}</p>
             
             <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-1">
                   <Clock size={14} /> {service.duration} min
                </div>
                <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                <div className="font-bold text-slate-800">₹{service.price}</div>
             </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${service.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                   {service.active ? 'Active' : 'Inactive'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                     type="checkbox" 
                     checked={service.active} 
                     onChange={() => handleToggleActive(service.id, service.active)}
                     className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Service" : "Add New Service"}>
          <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                  <input 
                    type="text" required 
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={serviceForm.name} 
                    onChange={e => setServiceForm({...serviceForm, name: e.target.value})} 
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white" 
                    value={serviceForm.category} 
                    onChange={e => setServiceForm({...serviceForm, category: e.target.value})}
                  >
                      <option>Hair</option>
                      <option>Nails</option>
                      <option>Body</option>
                      <option>Makeup</option>
                      <option>Facial</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                      <input 
                        type="number" required 
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
                        value={serviceForm.price} 
                        onChange={e => setServiceForm({...serviceForm, price: e.target.value})} 
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                      <input 
                        type="number" required 
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
                        value={serviceForm.duration} 
                        onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} 
                      />
                  </div>
              </div>
              <div className="pt-2">
                  <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <Sparkles size={18} /> {editingId ? 'Update Service' : 'Add Service'}
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Services;