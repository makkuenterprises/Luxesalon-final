
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  CheckCircle, 
  Zap, 
  BarChart3, 
  Smartphone, 
  Shield, 
  ArrowRight, 
  Star, 
  LayoutDashboard,
  Sparkles,
  Users,
  Clock,
  Calendar,
  Gift,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const LandingPage = () => {
  const testimonials = [
    {
      name: "Anjali Kapoor",
      role: "Owner, Glow Studios",
      text: "LuxeSalon changed how I manage my business. The AI marketing tool alone increased our bookings by 30% in the first month!",
      rating: 5
    },
    {
      name: "Rajesh Verma",
      role: "Manager, The Men's Den",
      text: "Finally, a POS that actually works for Indian salons. GST billing is seamless, and inventory alerts save us so much hassle.",
      rating: 5
    },
    {
      name: "Sarah Jenkins",
      role: "Founder, Urban Cuts",
      text: "The multi-branch support in the Enterprise plan is a game changer. I can see all my 5 outlets' revenue in one dashboard.",
      rating: 5
    }
  ];

  const faqs = [
    { q: "Is there a free trial?", a: "Yes! You can start with our Free Tier forever, or try the Pro/VIP plans risk-free." },
    { q: "Can I change plans later?", a: "Absolutely. You can upgrade or downgrade your subscription at any time from the dashboard." },
    { q: "Is my data secure?", a: "We use enterprise-grade encryption and daily backups to ensure your business data is always safe." },
    { q: "Do you support WhatsApp?", a: "Yes, our AI Marketing tool integrates to help you send campaign messages easily." }
  ];

  // Helper to handle smooth scrolling without breaking HashRouter
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl shadow-lg shadow-secondary/20">
                <Scissors className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">LuxeSalon</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How it Works</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Log In
              </Link>
              <Link 
                to="/login" 
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide mb-6 border border-amber-100">
            <Sparkles size={14} />
            <span>New: AI Marketing Assistant Included</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
            The Operating System for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-500">Modern Salons & Spas</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            Streamline appointments, manage staff, automate inventory, and grow your revenue with the most elegant SaaS platform built for the Indian beauty industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-white rounded-xl font-bold text-lg shadow-xl shadow-secondary/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <a 
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Explore Features
            </a>
          </div>

          {/* App Mockup */}
          <div className="relative max-w-6xl mx-auto">
            <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl shadow-slate-900/30 border border-slate-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-800 rounded-b-lg"></div>
              <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[16/9] border border-slate-800 relative group">
                {/* Simulated Dashboard UI */}
                <div className="absolute inset-0 bg-slate-900 flex">
                   {/* Sidebar */}
                   <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block text-left">
                      <div className="flex items-center gap-3 mb-8 opacity-50">
                         <div className="w-8 h-8 bg-secondary rounded-lg"></div>
                         <div className="w-24 h-4 bg-slate-700 rounded"></div>
                      </div>
                      <div className="space-y-4 opacity-30">
                         {[1,2,3,4,5].map(i => <div key={i} className="w-full h-8 bg-slate-800 rounded-lg"></div>)}
                      </div>
                   </div>
                   {/* Content */}
                   <div className="flex-1 p-8 bg-slate-950/50">
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-48 h-8 bg-slate-800 rounded-lg opacity-50"></div>
                         <div className="w-32 h-10 bg-secondary rounded-lg opacity-80"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                         {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl border border-slate-700 opacity-40"></div>)}
                      </div>
                      <div className="h-64 bg-slate-800 rounded-xl border border-slate-700 opacity-40"></div>
                   </div>
                </div>
                
                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all">
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 animate-fade-in">
                      <LayoutDashboard size={18} /> Interactive Dashboard
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Complete Control Over Your Business</h2>
            <p className="text-lg text-slate-600">Stop juggling multiple tools. LuxeSalon brings POS, Booking, Inventory, and Marketing into one unified OS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="text-violet-600" size={28} />,
                title: 'Smart POS & Billing',
                desc: 'Process transactions, split payments, and generate GST-compliant invoices in seconds. Supports Cash, Card, and UPI.',
                bg: 'bg-violet-50'
              },
              {
                icon: <Sparkles className="text-amber-600" size={28} />,
                title: 'AI Marketing Assistant',
                desc: 'Use our built-in Gemini AI to generate high-converting SMS and WhatsApp campaigns for birthdays, offers, and lapsed clients.',
                bg: 'bg-amber-50'
              },
              {
                icon: <Calendar className="text-emerald-600" size={28} />,
                title: 'Booking & Scheduling',
                desc: 'Drag-and-drop calendar to manage staff schedules, avoid double bookings, and send automated reminders.',
                bg: 'bg-emerald-50'
              },
              {
                icon: <BarChart3 className="text-blue-600" size={28} />,
                title: 'Inventory Control',
                desc: 'Track retail and consumable stock levels. Get low-stock alerts before you run out of critical supplies.',
                bg: 'bg-blue-50'
              },
              {
                icon: <Star className="text-pink-600" size={28} />,
                title: 'Loyalty Program',
                desc: 'Retain customers with a points-based reward system. Create Silver, Gold, and Platinum tiers automatically.',
                bg: 'bg-pink-50'
              },
              {
                icon: <Shield className="text-slate-600" size={28} />,
                title: 'Staff Management',
                desc: 'Calculate commissions automatically based on services performed. Track attendance and performance.',
                bg: 'bg-slate-100'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl border border-slate-200 hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/5 transition-all bg-white group">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-100 scroll-mt-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">Run your salon like a Fortune 500 company</h2>
                  <div className="space-y-8">
                     {[
                        { title: 'Quick Onboarding', desc: 'Import your customer list and service menu in minutes. No technical skills required.', icon: <Zap /> },
                        { title: 'Automated Operations', desc: 'Let the system handle commission calculations, inventory deduction, and appointment reminders.', icon: <Clock /> },
                        { title: 'Data-Driven Growth', desc: 'See exactly which stylist brings the most revenue and which products sell the fastest.', icon: <BarChart3 /> }
                     ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 border border-slate-200">
                              {step.icon}
                           </div>
                           <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                              <p className="text-slate-600">{step.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-secondary to-amber-500 opacity-20 blur-2xl rounded-[3rem]"></div>
                  <div className="relative bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <p className="text-slate-400 text-sm font-bold uppercase">Total Revenue</p>
                           <h3 className="text-3xl font-bold">₹4,25,000</h3>
                        </div>
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                           <BarChart3 className="text-secondary"/>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-3/4 bg-secondary rounded-full"></div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-5/6 bg-emerald-500 rounded-full"></div>
                        </div>
                     </div>
                     <div className="mt-8 flex gap-4">
                        <div className="flex-1 bg-slate-800 p-4 rounded-xl">
                           <p className="text-slate-400 text-xs">Bookings</p>
                           <p className="text-xl font-bold">+128</p>
                        </div>
                        <div className="flex-1 bg-slate-800 p-4 rounded-xl">
                           <p className="text-slate-400 text-xs">New Clients</p>
                           <p className="text-xl font-bold text-green-400">+42</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="testimonials" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Trusted by 500+ Salons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex text-amber-400 mb-4">
                   {[...Array(t.rating)].map((_, r) => <Star key={r} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {t.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-400">Start for free. Upgrade as you grow. Prices tailored for the Indian market.</p>
          </div>

          {/* Pricing Grid - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* FREE PLAN */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">₹0</span>
                <span className="text-slate-400 text-sm">/forever</span>
              </div>
              <p className="text-slate-400 text-xs mb-6 h-8">Perfect for independent stylists and home studios.</p>
              <ul className="space-y-3 mb-8 text-xs text-slate-300 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> Basic Appointments</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> Client Database</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> 1 Staff Member</li>
              </ul>
              <Link to="/login" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-center font-bold transition-colors text-sm">
                Start Free
              </Link>
            </div>

            {/* PRO PLAN */}
            <div className="bg-white text-slate-900 p-6 rounded-3xl border-2 border-secondary shadow-xl relative transform hover:-translate-y-1 transition-transform flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-b-lg text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">Business Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-secondary">₹499</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <p className="text-slate-500 text-xs mb-6 h-8">Smart solution for growing salons.</p>
              <ul className="space-y-3 mb-8 text-xs text-slate-600 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-secondary"/> POS & GST Billing</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-secondary"/> Inventory Tracking</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-secondary"/> AI Marketing Assistant</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-secondary"/> Unlimited Staff</li>
              </ul>
              <Link to="/login" className="block w-full py-3 bg-secondary text-white hover:bg-amber-600 rounded-xl text-center font-bold transition-colors shadow-lg text-sm">
                Get Started
              </Link>
            </div>

            {/* VIP PLAN (NEW) */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 flex flex-col">
              <h3 className="text-xl font-bold text-amber-400 mb-2">VIP Plan</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">₹799</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-slate-400 text-xs mb-6 h-8">Premium features for established brands.</p>
              <ul className="space-y-3 mb-8 text-xs text-slate-300 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-400"/> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-400"/> Loyalty Rewards</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-400"/> Advanced Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-amber-400"/> Priority Support</li>
              </ul>
              <Link to="/login" className="block w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:to-amber-600 text-white rounded-xl text-center font-bold transition-colors text-sm">
                Go VIP
              </Link>
            </div>

            {/* ENTERPRISE PLAN */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">₹999</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-slate-400 text-xs mb-6 h-8">Ultimate power for multi-chain brands.</p>
              <ul className="space-y-3 mb-8 text-xs text-slate-300 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> Multi-Branch Dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> White-label App</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> Dedicated API Access</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-500"/> 24/7 Dedicated Support</li>
              </ul>
              <Link to="/login" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-center font-bold transition-colors text-sm">
                Contact Sales
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
               {faqs.map((faq, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <h3 className="font-bold text-slate-800 flex items-center gap-3 mb-2">
                        <HelpCircle size={20} className="text-secondary" /> {faq.q}
                     </h3>
                     <p className="text-slate-600 text-sm pl-8">{faq.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
             <div>
               <div className="flex items-center gap-2 mb-4">
                 <div className="p-2 bg-slate-800 rounded-lg">
                   <Scissors className="text-white h-5 w-5" />
                 </div>
                 <span className="text-lg font-bold text-white">LuxeSalon</span>
               </div>
               <p className="text-xs leading-relaxed">Empowering salon owners with next-gen technology. Built for scale, designed for simplicity.</p>
             </div>
             <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                   <li><a href="#" className="hover:text-white">Features</a></li>
                   <li><a href="#" className="hover:text-white">Pricing</a></li>
                   <li><a href="#" className="hover:text-white">Integrations</a></li>
                </ul>
             </div>
             <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                   <li><a href="#" className="hover:text-white">About Us</a></li>
                   <li><a href="#" className="hover:text-white">Careers</a></li>
                   <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
             </div>
             <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                   <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                </ul>
             </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            &copy; 2024 LuxeSalon SaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
