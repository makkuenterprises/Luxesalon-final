
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertCircle, ArrowDown, ArrowUp, MoreVertical, Package } from 'lucide-react';
import { InventoryProduct } from '../types';
import { api } from '../services/api';
import Modal from '../components/Modal';

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProduct, setNewProduct] = useState({
     name: '',
     price: '',
     category: 'Retail',
     stock: '',
     sku: '',
     supplier: '',
     lowStockThreshold: '10',
     costPrice: ''
  });

  const fetchInventory = async () => {
    try {
      const data = await api.products.listInventory();
      setInventory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        await api.products.createInventory({
           name: newProduct.name,
           price: Number(newProduct.price),
           category: newProduct.category,
           stock: Number(newProduct.stock),
           sku: newProduct.sku,
           supplier: newProduct.supplier,
           lowStockThreshold: Number(newProduct.lowStockThreshold),
           costPrice: Number(newProduct.costPrice)
        });
        setIsModalOpen(false);
        fetchInventory();
        setNewProduct({ name: '', price: '', category: 'Retail', stock: '', sku: '', supplier: '', lowStockThreshold: '10', costPrice: '' });
     } catch (e) {
        alert("Failed to add product");
     }
  };

  const handleUpdateStock = async (id: number, delta: number) => {
     try {
        await api.products.updateStock(id, delta);
        fetchInventory();
     } catch (e) {
        console.error("Failed to update stock");
     }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.stock <= i.lowStockThreshold).length;
  const totalValue = inventory.reduce((acc, item) => acc + (item.stock * item.costPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
           <p className="text-slate-500 text-sm">Track products, stock levels, and suppliers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-xs font-bold uppercase">Total Inventory Value</p>
             <h3 className="text-xl font-bold text-slate-800">₹{totalValue.toLocaleString()}</h3>
           </div>
           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Filter size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-xs font-bold uppercase">Low Stock Alerts</p>
             <h3 className={`text-xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount} Items</h3>
           </div>
           <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><AlertCircle size={20}/></div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search by name or SKU..." 
                 className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-primary text-sm" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <select className="p-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none bg-white">
               <option>All Categories</option>
               <option>Retail</option>
               <option>Internal Use</option>
               <option>Consumable</option>
            </select>
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
               <tr>
                 <th className="p-4">Product Name</th>
                 <th className="p-4">SKU</th>
                 <th className="p-4">Category</th>
                 <th className="p-4">Stock Level</th>
                 <th className="p-4">Price</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredInventory.map(item => (
                 <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="p-4 font-medium text-slate-800">{item.name}</td>
                   <td className="p-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                   <td className="p-4">
                     <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{item.category}</span>
                   </td>
                   <td className="p-4">
                     <div className="flex items-center gap-2">
                       <span className={`font-bold ${item.stock <= item.lowStockThreshold ? 'text-red-600' : 'text-slate-700'}`}>
                         {item.stock} Units
                       </span>
                       {item.stock <= item.lowStockThreshold && <AlertCircle size={14} className="text-red-500" />}
                     </div>
                   </td>
                   <td className="p-4 text-slate-600">₹{item.price}</td>
                   <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                     </span>
                   </td>
                   <td className="p-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleUpdateStock(item.id, 1)} className="p-1 hover:bg-green-50 text-green-600 rounded" title="Add Stock"><ArrowUp size={16} /></button>
                        <button onClick={() => handleUpdateStock(item.id, -1)} className="p-1 hover:bg-red-50 text-red-600 rounded" title="Reduce Stock"><ArrowDown size={16} /></button>
                        <button className="p-1 hover:bg-slate-100 text-slate-400 rounded"><MoreVertical size={16} /></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
          <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input type="text" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Barcode</label>
                     <input type="text" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                     <select className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        <option>Retail</option>
                        <option>Internal Use</option>
                        <option>Consumable</option>
                     </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                     <input type="number" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                     <input type="number" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                     <input type="number" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert at</label>
                     <input type="number" required className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.lowStockThreshold} onChange={e => setNewProduct({...newProduct, lowStockThreshold: e.target.value})} />
                 </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input type="text" className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" value={newProduct.supplier} onChange={e => setNewProduct({...newProduct, supplier: e.target.value})} />
              </div>
              <div className="pt-2">
                 <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                     <Package size={18} /> Add to Inventory
                 </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Inventory;
