
import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Briefcase, CheckCircle, XCircle, Clock, Plus, UserPlus } from 'lucide-react';
import { Staff as StaffType, Role } from '../types';
import { api } from '../services/api';
import Modal from '../components/Modal';

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
      name: '',
      role: Role.STAFF,
      email: '',
      phone: '',
      commissionRate: '10',
      specialties: ''
  });

  const fetchStaff = async () => {
      try {
          const data = await api.staff.list();
          setStaffMembers(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.staff.create({
              name: newStaff.name,
              role: newStaff.role,
              email: newStaff.email,
              phone: newStaff.phone,
              commissionRate: Number(newStaff.commissionRate),
              specialties: newStaff.specialties.split(',').map(s => s.trim()),
              status: 'active'
          });
          setIsModalOpen(false);
          fetchStaff();
          setNewStaff({ name: '', role: Role.STAFF, email: '', phone: '', commissionRate: '10', specialties: '' });
      } catch (e) {
          alert('Failed to add staff member');
      }
  };

  const handleUpdateAttendance = async (id: number, status: 'Present' | 'Absent' | 'Leave') => {
     try {
        await api.staff.update(id, { attendance: status });
        fetchStaff();
     } catch (e) {
        alert("Failed to update attendance");
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Staff & Management</h2>
           <p className="text-slate-500 text-sm">Manage employees, track attendance, and view commissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
            <Plus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.map(staff => (
          <div key={staff.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                    {staff.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">{staff.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Briefcase size={12}/> {staff.role}</p>
                 </div>
               </div>
               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  staff.status === 'active' ? 'bg-green-100 text-green-700' : 
                  staff.status === 'break' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
               }`}>
                 {staff.status.toUpperCase()}
               </span>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Phone size={14}/> {staff.phone}</div>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><Mail size={14}/> {staff.email}</div>
               </div>
               
               <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-xs text-slate-400 font-semibold uppercase">Commission</p>
                     <p className="text-lg font-bold text-slate-800">{staff.commissionRate}%</p>
                  </div>
                  <div>
                     <p className="text-xs text-slate-400 font-semibold uppercase">Sales (Month)</p>
                     <p className="text-lg font-bold text-green-600">₹{staff.totalSales.toLocaleString()}</p>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase">Today's Attendance</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleUpdateAttendance(staff.id, 'Present')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${staff.attendance === 'Present' ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        <CheckCircle size={14} /> Present
                     </button>
                     <button onClick={() => handleUpdateAttendance(staff.id, 'Absent')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${staff.attendance === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        <XCircle size={14} /> Absent
                     </button>
                     <button onClick={() => handleUpdateAttendance(staff.id, 'Leave')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${staff.attendance === 'Leave' ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        <Clock size={14} /> Leave
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Staff Member">
          <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as Role})}>
                          {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Commission (%)</label>
                      <input type="number" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newStaff.commissionRate} onChange={e => setNewStaff({...newStaff, commissionRate: e.target.value})} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input type="tel" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialties (comma separated)</label>
                  <input type="text" placeholder="e.g. Hair, Color, Spa" className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newStaff.specialties} onChange={e => setNewStaff({...newStaff, specialties: e.target.value})} />
              </div>
              <div className="pt-2">
                  <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <UserPlus size={18} /> Create Profile
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Staff;
