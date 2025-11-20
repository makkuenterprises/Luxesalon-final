
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Scissors, Plus, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Appointment, Staff, ServiceItem, Customer } from '../types';
import Modal from '../components/Modal';

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerId: '',
    serviceId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00'
  });

  const hours = Array.from({ length: 10 }, (_, i) => i + 10); // 10 AM to 7 PM

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptData, staffData, serviceData, customerData] = await Promise.all([
        api.appointments.list(),
        api.staff.list(),
        api.products.listServices(),
        api.customers.list()
      ]);
      setAppointments(apptData);
      setStaffMembers(staffData);
      setServices(serviceData);
      setCustomers(customerData);
    } catch (e) {
      console.error("Failed to load calendar", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${newBooking.date}T${newBooking.time}`).toISOString();
      await api.appointments.create({
        customerId: Number(newBooking.customerId),
        staffId: Number(newBooking.staffId),
        serviceId: Number(newBooking.serviceId),
        startTime,
        status: 'confirmed'
      });
      setIsModalOpen(false);
      loadData();
      // Reset form
      setNewBooking(prev => ({ ...prev, customerId: '', serviceId: '', staffId: '' }));
    } catch (error) {
      alert('Failed to create booking');
    }
  };

  const getAppointmentForSlot = (staffId: number, hour: number) => {
    return appointments.find(app => {
      const appHour = new Date(app.startTime).getHours();
      return app.staffId === staffId && appHour === hour;
    });
  };

  const getServiceName = (id: number) => services.find(s => s.id === id)?.name || 'Unknown Service';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Calendar...</div>;

  return (
    <div className="h-full lg:h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-primary" /> Appointments
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> New Booking
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        
        {/* Scrollable Grid Wrapper */}
        <div className="flex-1 overflow-auto relative">
          <div className="min-w-[800px]"> 
            {/* Header Row: Staff Names */}
            <div className="flex border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
              <div className="w-20 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-4 font-bold text-slate-500 text-center text-sm sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Time
              </div>
              {staffMembers.map(staff => (
                <div key={staff.id} className="flex-1 min-w-[150px] p-4 text-center font-bold text-slate-700 border-r border-slate-100 bg-slate-50">
                  {staff.name}
                  <span className="block text-xs text-slate-400 font-normal mt-1">{staff.specialties.join(', ')}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div>
              {hours.map(hour => (
                <div key={hour} className="flex border-b border-slate-100 min-h-[120px]">
                  {/* Time Column */}
                  <div className="w-20 flex-shrink-0 border-r border-slate-200 bg-white p-4 text-xs font-semibold text-slate-500 text-center flex flex-col justify-center sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>

                  {/* Staff Columns */}
                  {staffMembers.map(staff => {
                    const apt = getAppointmentForSlot(staff.id, hour);
                    return (
                      <div key={staff.id} className="flex-1 min-w-[150px] border-r border-slate-100 relative p-1 group hover:bg-slate-50 transition-colors">
                        {apt ? (
                          <div className={`h-full w-full rounded-lg p-2 text-xs shadow-sm border-l-4 cursor-pointer transition-transform hover:scale-[1.02] ${
                            apt.status === 'confirmed' ? 'bg-violet-50 border-violet-500 text-violet-700' : 'bg-amber-50 border-amber-500 text-amber-700'
                          }`}>
                            <div className="font-bold mb-1 flex items-center gap-1">
                              <Clock size={10} /> {hour}:00
                            </div>
                            <div className="font-semibold truncate">{getServiceName(apt.serviceId)}</div>
                            <div className="mt-1 flex items-center gap-1 opacity-80">
                               <User size={10} /> Cust #{apt.customerId}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <button 
                                onClick={() => {
                                    setNewBooking(prev => ({
                                        ...prev, 
                                        staffId: staff.id.toString(), 
                                        time: `${hour}:00`.padStart(5, '0')
                                    }));
                                    setIsModalOpen(true);
                                }}
                                className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
                             >
                                <Plus size={16} />
                             </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Appointment">
        <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input 
                        type="date"
                        required
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        value={newBooking.date}
                        onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input 
                        type="time"
                        required
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                        value={newBooking.time}
                        onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select 
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    value={newBooking.customerId}
                    onChange={e => setNewBooking({...newBooking, customerId: e.target.value})}
                >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                <select 
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    value={newBooking.serviceId}
                    onChange={e => setNewBooking({...newBooking, serviceId: e.target.value})}
                >
                    <option value="">Select Service</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ₹{s.price} ({s.duration}m)</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                <select 
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    value={newBooking.staffId}
                    onChange={e => setNewBooking({...newBooking, staffId: e.target.value})}
                >
                    <option value="">Any Available Staff</option>
                    {staffMembers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.specialties.join(', ')})</option>
                    ))}
                </select>
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> Confirm Booking
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
