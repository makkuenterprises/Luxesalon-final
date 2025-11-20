

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Scissors, Package, Calculator, Tag, UserPlus, ShoppingCart, Gift, X, Check, Printer, Loader2, History, ArrowRight } from 'lucide-react';
import { Item, CartItem, ItemType, Customer, Staff, AppSettings, Bill } from '../types';
import { api } from '../services/api';
import { INITIAL_SETTINGS } from '../constants';
import Modal from '../components/Modal';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Payment & Settings State
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // Redemption UI State
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemInput, setRedeemInput] = useState('');

  // History UI State
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<Bill[]>([]);

  // Data state
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [services, inventory, custList, staffList, settingsData] = await Promise.all([
          api.products.listServices(),
          api.products.listInventory(),
          api.customers.list(),
          api.staff.list(),
          api.settings.get()
        ]);
        setAllItems([...services, ...inventory]);
        setCustomers(custList);
        setStaffMembers(staffList);
        if (settingsData) setSettings({ ...INITIAL_SETTINGS, ...settingsData });
        setLoading(false);
      } catch (e) {
        console.error("Failed to load POS data", e);
      }
    };
    fetchData();
  }, []);

  const fetchHistory = async () => {
      try {
          const history = await api.pos.getHistory();
          setTransactions(history);
          setShowHistory(true);
      } catch (e) {
          console.error("Failed to load history");
      }
  };

  const categories = ['All', 'Hair', 'Nails', 'Body', 'Makeup', 'Retail', 'Consumable'];

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, allItems]);

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.type === item.type) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, staffId: staffMembers[0]?.id || 0, discount: 0 }];
    });
  };

  const updateQuantity = (id: number, type: ItemType, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.type === type) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const updateItemStaff = (id: number, type: ItemType, staffId: number) => {
    setCart(prev => prev.map(item => {
       if (item.id === id && item.type === type) {
         return { ...item, staffId };
       }
       return item;
    }));
  };

  const removeFromCart = (id: number, type: ItemType) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const handleCustomerChange = (customerId: number) => {
    setSelectedCustomer(customerId || null);
    setRedeemedPoints(0); // Reset redemption when customer changes
    setIsRedeeming(false);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  
  // Safety: Ensure redeemed points don't exceed bill
  useEffect(() => {
    const currentBill = Math.max(0, subtotal - discountAmount);
    if (redeemedPoints > currentBill) {
        setRedeemedPoints(Math.floor(currentBill));
    }
  }, [subtotal, discountAmount, redeemedPoints]);

  const loyaltyRedemptionVal = redeemedPoints * 1; // 1 Point = ₹1
  const taxableAmount = Math.max(0, subtotal - discountAmount - loyaltyRedemptionVal);
  const tax = taxableAmount * (settings.taxRate / 100); 
  const total = taxableAmount + tax;

  const customer = customers.find(c => c.id === selectedCustomer);

  const initiateRedemption = () => {
    if (!customer) return;
    
    const billAfterDiscount = Math.max(0, subtotal - discountAmount);
    if (billAfterDiscount <= 0) {
        alert("Please add items to the cart first.");
        return;
    }

    const maxRedeemable = Math.min(customer.loyaltyPoints, Math.floor(billAfterDiscount));
    if (maxRedeemable <= 0) {
        alert("Customer has insufficient points or bill amount is too low.");
        return;
    }

    setRedeemInput(maxRedeemable.toString());
    setIsRedeeming(true);
  };

  const applyRedemption = () => {
    const points = parseInt(redeemInput);
    if (isNaN(points) || points <= 0) {
        setIsRedeeming(false);
        return;
    }

    const billAfterDiscount = Math.max(0, subtotal - discountAmount);
    const maxUsable = Math.min(customer?.loyaltyPoints || 0, Math.floor(billAfterDiscount));
    
    if (points > maxUsable) {
        setRedeemedPoints(maxUsable);
    } else {
        setRedeemedPoints(points);
    }
    setIsRedeeming(false);
  };

  const cancelRedemption = () => {
    setIsRedeeming(false);
    setRedeemedPoints(0);
  }

  // --- INVOICE GENERATION ---
  const printInvoice = (billData: Partial<Bill>) => {
    const invoiceWindow = window.open('', 'PRINT', 'height=600,width=400');
    if (!invoiceWindow) return;

    const date = billData.date || new Date().toLocaleString();
    const itemsHtml = (billData.items || []).map(item => `
      <tr>
        <td style="padding: 4px 0;">${item.name} <br/> <span style="font-size: 10px; color: #666;">x${item.quantity}</span></td>
        <td style="text-align: right;">${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    
    // Recalculate totals for reprint if not provided
    const pSub = billData.subtotal || 0;
    const pDisc = billData.discount ? (pSub * billData.discount / 100) : 0;
    const pLoyalty = (billData.redeemedPoints || 0);
    const pTax = billData.tax || 0;
    const pTotal = billData.total || 0;

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${billData.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10px; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .shop-name { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .meta { font-size: 10px; color: #333; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .totals { border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .grand-total { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="shop-name">${settings.salonName}</p>
            <p class="meta">${date}</p>
            <p class="meta">Bill No: #${billData.id}</p>
            ${billData.customerName ? `<p class="meta">Cust: ${billData.customerName}</p>` : ''}
          </div>

          <table>
            ${itemsHtml}
          </table>

          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>${pSub.toFixed(2)}</span></div>
            ${pDisc > 0 ? `<div class="row"><span>Discount:</span> <span>-${pDisc.toFixed(2)}</span></div>` : ''}
            ${pLoyalty > 0 ? `<div class="row"><span>Loyalty:</span> <span>-${pLoyalty.toFixed(2)}</span></div>` : ''}
            <div class="row"><span>Tax:</span> <span>${pTax.toFixed(2)}</span></div>
            <div class="row grand-total"><span>TOTAL:</span> <span>${settings.currency} ${pTotal.toFixed(2)}</span></div>
            <div class="row" style="margin-top:5px; font-size:10px;"><span>Mode:</span> <span>${billData.paymentMethod}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for visiting!</p>
            <p>For appointments call ${settings.razorpay?.keyId ? 'us' : '9876543210'}</p>
          </div>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
    invoiceWindow.focus();
    setTimeout(() => {
      invoiceWindow.print();
      invoiceWindow.close();
    }, 500);
  };

  // --- CHECKOUT LOGIC ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      // 1. Handle Payment Gateway Logic
      if (paymentMethod !== 'Cash') {
        if (settings.razorpay?.enabled) {
           const confirmed = window.confirm(`Redirecting to Razorpay for ${settings.currency} ${total.toFixed(2)} payment...\n\n(Click OK to simulate successful payment)`);
           if (!confirmed) {
              setProcessing(false);
              return;
           }
        } else {
           const confirmed = window.confirm(`Please collect ${settings.currency} ${total.toFixed(2)} on your ${paymentMethod} terminal.\n\nConfirm payment received?`);
           if (!confirmed) {
              setProcessing(false);
              return;
           }
        }
      }

      // 2. Process Backend Transaction
      const response = await api.pos.processTransaction({
        customerId: selectedCustomer,
        items: cart,
        discount: discountPercent,
        redeemedPoints: redeemedPoints,
        total: total,
        paymentMethod: paymentMethod
      });

      // 3. Print Invoice
      printInvoice({
         id: response.transactionId,
         date: new Date().toLocaleString(),
         items: cart,
         subtotal: subtotal,
         discount: discountPercent,
         tax: tax,
         total: total,
         paymentMethod: paymentMethod,
         customerName: customer?.name,
         redeemedPoints: redeemedPoints
      });
      
      alert(`Transaction Successful!`);
      
      // 4. Reset State
      setCart([]);
      setSelectedCustomer(null);
      setDiscountPercent(0);
      setRedeemedPoints(0);
      setIsRedeeming(false);
      setPaymentMethod('Cash');
      
      // Refresh data
      const custList = await api.customers.list();
      setCustomers(custList);
      api.products.listInventory().then(setAllItems);

    } catch (e) {
      console.error(e);
      alert('Transaction Failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading POS System...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-6rem)] gap-6 relative">
      
      {/* Mobile Cart Toggle */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl z-20 flex items-center justify-center"
        onClick={() => setShowMobileCart(!showMobileCart)}
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>
      </button>

      {/* Left Side: Item Selection */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${showMobileCart ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header & Search */}
        <div className="p-4 lg:p-6 border-b border-slate-100 space-y-4">
          <div className="flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search services or products..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={fetchHistory}
               className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl flex items-center gap-2 font-medium transition-colors"
               title="Transaction History"
             >
                <History size={20} />
             </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div 
                key={`${item.type}-${item.id}`}
                onClick={() => addToCart(item)}
                className="group p-4 rounded-xl border border-slate-100 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${item.type === ItemType.SERVICE ? 'bg-violet-100 text-violet-600' : 'bg-pink-100 text-pink-600'}`}>
                    {item.type === ItemType.SERVICE ? <Scissors size={18} /> : <Package size={18} />}
                  </div>
                  <span className="font-bold text-slate-800">₹{item.price}</span>
                </div>
                <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.category} • {item.duration ? `${item.duration} min` : 'In Stock'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className={`lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col ${showMobileCart ? 'flex fixed inset-0 z-30 m-4' : 'hidden lg:flex'}`}>
        
        {/* Mobile Close Button */}
        <div className="lg:hidden p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart size={18}/> Cart</h2>
          <button onClick={() => setShowMobileCart(false)} className="text-slate-500 hover:text-red-500">Close</button>
        </div>

        {/* Customer Selection */}
        <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer</label>
            <button className="text-primary text-xs font-bold flex items-center hover:underline"><UserPlus size={12} className="mr-1"/> New</button>
          </div>
          <select 
            className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            onChange={(e) => handleCustomerChange(Number(e.target.value))}
            value={selectedCustomer || ''}
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {customer && (
             <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-white">
               <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.tier} Member</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-semibold text-slate-400">Available Points</p>
                     <p className="text-sm font-bold text-primary flex items-center justify-end gap-1">
                        <Gift size={12} /> {customer.loyaltyPoints}
                     </p>
                  </div>
               </div>
               
               {/* Inline Redemption UI */}
               {isRedeeming ? (
                 <div className="flex items-center gap-2 mt-2 animate-fade-in">
                    <input 
                      type="number" 
                      autoFocus
                      className="w-full p-1.5 text-sm border border-primary rounded bg-white outline-none text-center font-bold text-primary"
                      value={redeemInput}
                      onChange={e => setRedeemInput(e.target.value)}
                      placeholder="Pts"
                    />
                    <button onClick={applyRedemption} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Apply"><Check size={16}/></button>
                    <button onClick={() => setIsRedeeming(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors" title="Cancel"><X size={16}/></button>
                 </div>
               ) : (
                 <div className="flex items-center justify-between mt-2">
                    {redeemedPoints > 0 ? (
                        <div className="flex items-center gap-2 w-full">
                             <div className="flex-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1.5 rounded border border-green-200 flex items-center justify-center gap-1">
                                <Check size={12}/> {redeemedPoints} Points Applied
                             </div>
                             <button onClick={cancelRedemption} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Remove"><Trash2 size={14}/></button>
                        </div>
                    ) : (
                        <button 
                            onClick={initiateRedemption}
                            disabled={customer.loyaltyPoints === 0}
                            className="w-full py-1.5 text-xs font-bold text-primary border border-primary/30 rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Redeem Points
                        </button>
                    )}
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Calculator size={32} />
              </div>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.type}-${item.id}`} className="p-3 rounded-lg border border-slate-100 bg-white space-y-2">
                <div className="flex justify-between items-start">
                   <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-500">₹{item.price} x {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.type)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Controls Row */}
                <div className="flex items-center justify-between">
                   {/* Staff Assignment */}
                   {item.type === ItemType.SERVICE && (
                     <select 
                      className="text-xs border border-slate-200 rounded px-1 py-1 max-w-[100px] outline-none text-slate-600"
                      value={item.staffId}
                      onChange={(e) => updateItemStaff(item.id, item.type, Number(e.target.value))}
                     >
                       {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                   )}
                   
                   {/* Quantity */}
                    <div className="flex items-center bg-slate-100 rounded-lg ml-auto">
                      <button onClick={() => updateQuantity(item.id, item.type, -1)} className="p-1 hover:text-red-500"><Minus size={14} /></button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.type, 1)} className="p-1 hover:text-green-500"><Plus size={14} /></button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Section */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 lg:rounded-b-2xl">
          {/* Discount Input */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="number" 
                placeholder="Discount %" 
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-primary"
                value={discountPercent > 0 ? discountPercent : ''}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {redeemedPoints > 0 && (
              <div className="flex justify-between text-sm text-primary font-bold bg-primary/5 p-2 rounded-lg border border-primary/10">
                <span className="flex items-center gap-1"><Gift size={12}/> Loyalty Discount</span>
                <span>-₹{loyaltyRedemptionVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-600">
              <span>GST ({settings.taxRate}%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Total Pay</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Modes */}
          <div className="grid grid-cols-3 gap-2 mb-4">
             <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${paymentMethod === 'Cash' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'}`}
             >
               <Banknote size={16} className="mb-1"/> Cash
             </button>
             <button 
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${paymentMethod === 'Card' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'}`}
             >
               <CreditCard size={16} className="mb-1"/> Card
             </button>
             <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${paymentMethod === 'UPI' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'}`}
             >
               <Smartphone size={16} className="mb-1"/> UPI
             </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20"
          >
            {processing ? (
               <>
                 <Loader2 size={20} className="animate-spin"/> Processing...
               </>
            ) : (
               <>
                 <Printer size={20} /> 
                 <span>{paymentMethod === 'Cash' ? 'Print Invoice & Pay' : `Pay via ${paymentMethod}`}</span>
               </>
            )}
          </button>
        </div>
      </div>

      {/* Transaction History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Transaction History" maxWidth="lg">
        <div className="overflow-x-auto">
           {transactions.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No transactions found.</div>
           ) : (
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                 <tr>
                   <th className="p-4">Bill #</th>
                   <th className="p-4">Date</th>
                   <th className="p-4">Customer</th>
                   <th className="p-4">Mode</th>
                   <th className="p-4">Amount</th>
                   <th className="p-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {transactions.map(tx => (
                   <tr key={tx.id} className="hover:bg-slate-50">
                     <td className="p-4 font-mono text-slate-600">#{tx.id}</td>
                     <td className="p-4">{tx.date}</td>
                     <td className="p-4 font-medium">{tx.customerName || 'Walk-in'}</td>
                     <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{tx.paymentMethod}</span>
                     </td>
                     <td className="p-4 font-bold">₹{tx.total.toLocaleString()}</td>
                     <td className="p-4 text-right">
                        <button 
                           onClick={() => printInvoice(tx)}
                           className="text-primary hover:bg-primary/10 px-3 py-1 rounded-lg font-medium transition-colors text-xs border border-primary/20"
                        >
                           Reprint
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </Modal>
    </div>
  );
};

export default POS;