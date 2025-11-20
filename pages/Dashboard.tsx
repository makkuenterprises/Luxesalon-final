
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, Users, CalendarCheck, TrendingUp, AlertCircle, ArrowUpRight, Star, Crown, Download } from 'lucide-react';
import { REVENUE_DATA, STAFF_MEMBERS, MOCK_APPOINTMENTS, CUSTOMERS } from '../constants';

const StatCard = ({ title, value, icon, trend, color, bgClass }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string, bgClass: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-glass border border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 ${bgClass} -translate-y-1/2 translate-x-1/2`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-slate-200`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-medium relative z-10">
      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center border border-emerald-100">
        <TrendingUp size={12} className="mr-1" /> {trend}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  // Sort staff by sales
  const topStaff = [...STAFF_MEMBERS].sort((a, b) => b.totalSales - a.totalSales);

  const handleExportReport = () => {
    // 1. Prepare Data
    const revenueHeader = "Date,Revenue,Appointments";
    const revenueRows = REVENUE_DATA.map(row => `${row.name},${row.revenue},${row.appointments}`);

    const staffHeader = "Staff Name,Role,Total Sales,Commission Rate";
    const staffRows = STAFF_MEMBERS.map(s => `${s.name},${s.role},${s.totalSales},${s.commissionRate}%`);

    const appointmentHeader = "Time,Customer ID,Service ID,Staff ID,Status";
    const appointmentRows = MOCK_APPOINTMENTS.map(a => 
      `${new Date(a.startTime).toLocaleTimeString()},${a.customerId},${a.serviceId},${a.staffId},${a.status}`
    );

    // 2. Construct CSV Content
    const csvContent = [
      "LUXESALON DASHBOARD REPORT",
      `Generated on: ${new Date().toLocaleDateString()}`,
      "",
      "REVENUE ANALYTICS",
      revenueHeader,
      ...revenueRows,
      "",
      "STAFF PERFORMANCE",
      staffHeader,
      ...staffRows,
      "",
      "TODAY'S APPOINTMENTS",
      appointmentHeader,
      ...appointmentRows
    ].join("\n");

    // 3. Create and Download Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `LuxeSalon_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Performance analytics for <span className="font-semibold text-secondary">LuxeSalon & Spa</span></p>
        </div>
        <div className="flex items-center space-x-3">
           <button className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <CalendarCheck size={16} /> Today: {new Date().toLocaleDateString()}
           </button>
           <button 
             onClick={handleExportReport}
             className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-colors flex items-center gap-2"
           >
              <Download size={16} /> Export Report
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="₹4,25,000" 
          icon={<IndianRupee size={24} />} 
          trend="+12.5%" 
          color="bg-primary"
          bgClass="bg-primary"
        />
        <StatCard 
          title="Appointments" 
          value="342" 
          icon={<CalendarCheck size={24} />} 
          trend="+5.2%" 
          color="bg-secondary"
          bgClass="bg-secondary"
        />
        <StatCard 
          title="Active Customers" 
          value={CUSTOMERS.length.toString()} 
          icon={<Users size={24} />} 
          trend="+18%" 
          color="bg-pink-500"
          bgClass="bg-pink-500"
        />
        <StatCard 
          title="Avg Order Value" 
          value="₹1,240" 
          icon={<Crown size={24} />} 
          trend="+2.4%" 
          color="bg-orange-500"
          bgClass="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-glass border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Revenue Analytics</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
               <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-slate-800">Weekly</button>
               <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800">Monthly</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-glass border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Top Staff</h3>
             <button className="text-secondary text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {topStaff.map((staff, index) => (
              <div key={staff.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${index === 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    {index === 0 ? <Crown size={14} /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                    <p className="text-xs text-slate-500">{staff.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">₹{staff.totalSales.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-medium">98% Rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-glass border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Today's Appointments</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                   <th className="py-3 px-4">Time</th>
                   <th className="py-3 px-4">Customer</th>
                   <th className="py-3 px-4">Service</th>
                   <th className="py-3 px-4">Staff</th>
                   <th className="py-3 px-4">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {MOCK_APPOINTMENTS.map((app) => (
                   <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                     <td className="py-4 px-4 font-medium text-slate-700">
                       {new Date(app.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </td>
                     <td className="py-4 px-4">
                       <div className="font-bold text-slate-800">Customer #{app.customerId}</div>
                       <div className="text-xs text-secondary flex items-center gap-1"><Star size={10} fill="currentColor"/> Gold Member</div>
                     </td>
                     <td className="py-4 px-4 text-slate-600">Service #{app.serviceId}</td>
                     <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                              {STAFF_MEMBERS.find(s => s.id === app.staffId)?.name.charAt(0)}
                           </div>
                           <span className="text-slate-600 text-xs">{STAFF_MEMBERS.find(s => s.id === app.staffId)?.name}</span>
                        </div>
                     </td>
                     <td className="py-4 px-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                         app.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                       }`}>
                         {app.status.toUpperCase()}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-glass border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Action Items</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-red-800">Low Stock Warning</p>
                  <p className="text-xs text-red-600 mt-1">Loreal Hair Spa Cream (2 units left)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-800">Expiring Soon</p>
                  <p className="text-xs text-amber-600 mt-1">Facial Kit Gold (Exp: 5 Days)</p>
                </div>
              </div>
            </div>
            
            {/* Ad for PRO */}
            <div className="mt-6 bg-gradient-to-br from-primary to-slate-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
             <div className="absolute -right-6 -top-6 text-white opacity-5 rotate-12">
                <Crown size={120} />
             </div>
             <h3 className="text-lg font-bold mb-2 relative z-10">Upgrade to Business PRO</h3>
             <p className="text-slate-300 text-xs mb-4 relative z-10 leading-relaxed">Unlock AI Marketing, Multi-Branch support, and Advanced POS features.</p>
             <button className="bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold w-full hover:bg-yellow-600 transition-colors shadow-lg shadow-secondary/20 relative z-10">
               Upgrade Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
