import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Key, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Zap, 
  Settings as SettingsIcon, 
  Globe, 
  Printer,
  LogOut,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Types ---
interface Order {
  id: string;
  date: string;
  name: string;
  phone: string;
  shop?: string;
  plan: string;
  amount: string;
  utr?: string;
  status: 'Paid' | 'Pending';
  license?: string;
  duration?: string;
}

interface License {
  key: string;
  plan: string;
  expires: string;
  phone: string;
  name: string;
  shop?: string;
  created: string;
  used?: boolean;
  usedAt?: string;
}

export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('owner_session'));
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  
  useEffect(() => {
    if (isLoggedIn) {
      setOrders(JSON.parse(localStorage.getItem('umairbills_orders') || '[]'));
      setLicenses(JSON.parse(localStorage.getItem('umairbills_licenses') || '[]'));
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    const savedPin = localStorage.getItem('owner_pin') || '9140';
    if (pin === savedPin) {
      localStorage.setItem('owner_session', Date.now().toString());
      setIsLoggedIn(true);
    } else {
      alert('❌ Galat PIN!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('owner_session');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center p-4">
        <div className="bg-[#111420] border border-white/10 rounded-3xl p-10 w-full max-w-[360px] text-center shadow-2xl">
          <div className="w-16 h-16 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-2xl inline-flex items-center justify-center mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 32 32">
              <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
              <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
              <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-1">Owner Panel</h2>
          <p className="text-[13px] text-[#6b7394] mb-8">Sirf Mohammad Shadab ke liye</p>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Owner PIN daalo" 
            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-widest outline-none focus:border-[var(--orange)] mb-4"
          />
          <button 
            onClick={handleLogin}
            className="w-full p-3.5 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-bold rounded-xl shadow-lg hover:-translate-y-px transition-all cursor-pointer"
          >
            🔐 Enter Owner Panel
          </button>
          <p className="mt-6 text-[11px] text-[#2e3450]">Default PIN: <strong className="text-[#6b7394]">9140</strong></p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'All Orders', icon: <Package size={18} />, badge: orders.filter(o => o.status === 'Pending').length },
    { id: 'licenses', label: 'Licenses', icon: <Key size={18} /> },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign size={18} /> },
    { id: 'users', label: 'Active Users', icon: <Users size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'generate', label: 'License Generate', icon: <Zap size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#060810] text-[#eef0f8]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-[#0e1018] border-r border-white/10 flex flex-col z-[100]">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-lg flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 32 32">
                <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
                <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
                <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
              </svg>
            </div>
            <span className="font-display text-[15px] font-[800]">Umair <b className="text-[var(--orange)]">Bills</b></span>
          </div>
          <p className="text-[10px] text-[#6b7394] pl-11">Owner Dashboard</p>
        </div>

        <nav className="p-2.5 flex-1 overflow-y-auto">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[#2e3450] p-3 pt-4">Main</div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 p-2.5 rounded-lg text-[13px] font-medium transition-all mb-0.5 cursor-pointer",
                activeTab === item.id ? "bg-[rgba(245,166,35,0.12)] text-[var(--orange)]" : "text-[#6b7394] hover:bg-[#141720] hover:text-[#eef0f8]"
              )}
            >
              <span className="w-5 text-center shrink-0">{item.icon}</span>
              {item.label}
              {item.badge ? <span className="ml-auto bg-[var(--orange)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-lg mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] flex items-center justify-center text-sm font-bold text-white shrink-0">M</div>
            <div>
              <div className="text-[12px] font-semibold">Mohammad Shadab</div>
              <div className="text-[10px] text-[#6b7394]">Owner · Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-[13px] font-medium text-[var(--red)] hover:bg-[#141720] transition-all cursor-pointer">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <header className="h-[58px] bg-[#0e1018] border-b border-white/10 flex items-center px-6 sticky top-0 z-50">
          <h2 className="font-display text-[17px] font-bold flex-1">{navItems.find(i => i.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            <div className="text-[12px] text-[#6b7394]">{new Date().toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            <button onClick={() => setActiveTab('generate')} className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg hover:-translate-y-px transition-all cursor-pointer">⚡ New License</button>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'dashboard' && <OwnerDashboard orders={orders} licenses={licenses} />}
          {activeTab === 'orders' && <OwnerOrders orders={orders} setOrders={setOrders} />}
          {/* Add other owner components */}
          {!['dashboard', 'orders'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-[#6b7394]">
              <AlertCircle size={48} className="mb-3 opacity-20" />
              <h3 className="text-lg font-bold">{navItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="mt-2">Owner panel feature development mein hai.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function OwnerDashboard({ orders, licenses }: { orders: Order[], licenses: License[] }) {
  const paid = orders.filter(o => o.status === 'Paid');
  const pending = orders.filter(o => o.status === 'Pending');
  const totalEarning = paid.reduce((a, o) => a + (parseInt(o.amount.replace(/\D/g, '')) || 0), 0);
  const activeLicenses = licenses.filter(l => new Date(l.expires) > new Date());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OwnerStat color="orange" icon="💰" val={`₹${totalEarning.toLocaleString('en-IN')}`} label="Total Earnings" change="↑ This month" />
        <OwnerStat color="green" icon="✅" val={String(paid.length)} label="Paid Orders" change="Total subscribers" />
        <OwnerStat color="blue" icon="👥" val={String(activeLicenses.length)} label="Active Licenses" change="Currently active" />
        <OwnerStat color="purple" icon="⏳" val={String(pending.length)} label="Pending Verify" change="Need attention" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111420] border border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-[15px] font-bold mb-4 flex items-center gap-2">🆕 Recent Orders</h3>
          <div className="divide-y divide-white/5">
            {orders.slice(-5).reverse().map((o, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-[13px] font-semibold">{o.name}</div>
                  <div className="text-[11px] text-[#6b7394]">{o.plan} · {o.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-[var(--orange)]">{o.amount}</div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", o.status === 'Paid' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500")}>{o.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="py-10 text-center text-[#2e3450]">Koi orders nahi abhi</p>}
          </div>
        </div>
        <div className="bg-[#111420] border border-white/10 rounded-2xl p-5">
          <h3 className="font-display text-[15px] font-bold mb-4 flex items-center gap-2">⏰ Expiring Soon (7 days)</h3>
          <div className="flex flex-col items-center justify-center py-10 text-green-500/60">
            <CheckCircle2 size={32} className="mb-2 opacity-40" />
            <p className="text-[13px]">✅ Koi expiry nahi 7 din mein!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerStat({ color, icon, val, label, change }: { color: string, icon: string, val: string, label: string, change: string }) {
  const colors: any = {
    orange: "before:bg-linear-to-r before:from-[var(--orange)] before:to-[var(--orange2)]",
    green: "before:bg-linear-to-r before:from-[var(--green)] before:to-[#4ade80]",
    blue: "before:bg-linear-to-r before:from-[var(--blue)] before:to-[#60a5fa]",
    purple: "before:bg-linear-to-r before:from-[var(--purple)] before:to-[#c084fc]"
  };
  return (
    <div className={cn(
      "bg-[#111420] border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-transform hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px]",
      colors[color]
    )}>
      <div className="text-[22px] mb-2.5">{icon}</div>
      <div className="font-display text-[28px] font-black tracking-tight leading-none">{val}</div>
      <div className="text-[12px] text-[#6b7394] mt-1">{label}</div>
      <div className="text-[11px] mt-1.5 font-semibold text-[#6b7394]">{change}</div>
    </div>
  );
}

function OwnerOrders({ orders, setOrders }: { orders: Order[], setOrders: any }) {
  const [filter, setFilter] = useState('all');
  
  const filtered = orders.filter(o => {
    if (filter === 'pending') return o.status === 'Pending';
    if (filter === 'paid') return o.status === 'Paid';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">📦 All Orders</h2>
          <p className="text-[13px] text-[#6b7394]">Saare payments aur orders yahan</p>
        </div>
        <div className="flex gap-2.5">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#111420] border border-white/10 rounded-lg p-2 text-[13px] outline-none text-[#eef0f8]"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-lg hover:-translate-y-px transition-all cursor-pointer">📊 Export CSV</button>
        </div>
      </div>

      <div className="bg-[#111420] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/2">
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Date</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Customer</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Phone</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Plan</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Amount</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Status</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-[#6b7394] p-3.5 text-left border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice().reverse().map((o, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="p-3.5 text-[13px] whitespace-nowrap">{o.date}</td>
                  <td className="p-3.5 text-[13px]"><strong>{o.name}</strong></td>
                  <td className="p-3.5 text-[13px]">
                    <a href={`https://wa.me/91${o.phone.replace(/\D/g,'')}`} target="_blank" className="text-[var(--orange)] no-underline hover:underline">📞 {o.phone}</a>
                  </td>
                  <td className="p-3.5 text-[13px]">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", o.plan.toLowerCase().includes('business') ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500")}>{o.plan}</span>
                  </td>
                  <td className="p-3.5 text-[13px] font-bold text-[var(--orange)]">{o.amount}</td>
                  <td className="p-3.5 text-[13px]">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", o.status === 'Paid' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500")}>{o.status}</span>
                  </td>
                  <td className="p-3.5 text-[13px]">
                    <div className="flex gap-2">
                      {o.status === 'Pending' && <button className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all cursor-pointer"><CheckCircle2 size={16} /></button>}
                      <button className="p-1.5 rounded-md bg-red-500/10 text-[var(--red)] hover:bg-red-500/20 transition-all cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#6b7394]">Koi orders nahi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
