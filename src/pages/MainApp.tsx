import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Monitor, 
  Users, 
  Wrench, 
  ClipboardList, 
  DollarSign, 
  Building2, 
  ShoppingCart, 
  Box, 
  TrendingUp, 
  UserSquare2, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Database,
  LogOut,
  Menu,
  X,
  Zap,
  Copy,
  AlertCircle,
  Search,
  Moon,
  Sun,
  Plus,
  Trash2,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Key,
  Palette,
  Upload,
  Image as ImageIcon,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  Clock,
  Bot,
  Send,
  Sparkles,
  ShoppingBag,
  UserCircle,
  IndianRupee,
  Wallet
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { cn } from '../lib/utils';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  handleFirestoreError,
  OperationType,
  User
} from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

// --- Types ---
interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  type: 'Regular' | 'VIP';
  email?: string;
  notes?: string;
  created: string;
  ownerUid: string;
}

interface Service {
  id: string;
  name: string;
  cat: string;
  price: number;
  unit: string;
  notes?: string;
  ownerUid: string;
}

interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  qty: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  docId?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  gst: number;
  gstPct: number;
  total: number;
  payMode: string;
  status: 'Paid' | 'Pending';
  created: string;
  ownerUid: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  ownerUid: string;
}

interface ShopSettings {
  name: string;
  owner: string;
  phone: string;
  address: string;
  upi: string;
  gst: string;
  accNo: string;
  ifsc: string;
  bank: string;
  accName: string;
  logo: string;
  invPrefix: string;
  ownerUid: string;
  autoWhatsApp: boolean;
  autoWhatsAppShare: boolean;
  socialWhatsapp: string;
  socialInstagram: string;
  socialFacebook: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  waLink?: string;
  businessCategory: string;
  invoiceTerms: string;
  currency: string;
  theme: 'amber' | 'blue' | 'rose' | 'emerald' | 'slate';
}

const fmt = (n: number, symbol: string = '₹') => (symbol || '₹') + ' ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d || '';
  }
};

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') !== 'light');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // App State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    name: 'Umair Bills',
    owner: 'Mohammad Shadab',
    phone: '9140090305',
    address: 'Naya Nagar 2nd, Manjhanpur, Kaushambi, UP',
    upi: '9140090305@kotak811',
    gst: '',
    accNo: '',
    ifsc: '',
    bank: '',
    accName: '',
    logo: '',
    invPrefix: 'INV',
    ownerUid: '',
    autoWhatsApp: false,
    autoWhatsAppShare: false,
    socialWhatsapp: '',
    socialInstagram: '',
    socialFacebook: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    waLink: '',
    businessCategory: 'Retail',
    invoiceTerms: 'Thank you for your business!',
    currency: '₹',
    theme: 'amber'
  });

  // Modal State
  const [modal, setModal] = useState<{ open: boolean; title: string; content: React.ReactNode; footer?: React.ReactNode }>({
    open: false,
    title: '',
    content: null
  });

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'ok' | 'err' | 'info' }>({
    show: false,
    msg: '',
    type: 'ok'
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isAuthReady && user) {
      // Fetch Shop Settings
      const settingsRef = doc(db, 'settings', user.uid);
      getDoc(settingsRef).then(snap => {
        if (snap.exists()) {
          setShopSettings(snap.data() as ShopSettings);
        } else {
          const initialSettings = { ...shopSettings, ownerUid: user.uid, owner: user.displayName || 'Owner' };
          setDoc(settingsRef, initialSettings);
          setShopSettings(initialSettings);
        }
      });

      // Fetch Customers
      const qCustomers = query(collection(db, 'customers'), where('ownerUid', '==', user.uid));
      const unsubCustomers = onSnapshot(qCustomers, (snap) => {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Customer));
        setCustomers(list);
        
        // Seed if empty
        if (list.length === 0) {
          const seed = [
            { id: 'C001', name: 'Ramesh Kumar', mobile: '9876543210', address: 'Manjhanpur, UP', type: 'VIP', created: today(), ownerUid: user.uid },
            { id: 'C002', name: 'Suresh Yadav', mobile: '9823456789', address: 'Kaushambi, UP', type: 'Regular', created: today(), ownerUid: user.uid },
          ];
          seed.forEach(c => setDoc(doc(db, 'customers', c.id), c));
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'customers'));

      // Fetch Services
      const qServices = query(collection(db, 'services'), where('ownerUid', '==', user.uid));
      const unsubServices = onSnapshot(qServices, (snap) => {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Service));
        setServices(list);

        // Seed if empty
        if (list.length === 0) {
          const seed = [
            { id: 'S001', name: 'A4 B&W Print', cat: 'Printing', price: 2, unit: 'pcs', ownerUid: user.uid },
            { id: 'S002', name: 'A4 Color Print', cat: 'Printing', price: 8, unit: 'pcs', ownerUid: user.uid },
            { id: 'S003', name: 'Visiting Card (500)', cat: 'Printing', price: 250, unit: 'set', ownerUid: user.uid },
          ];
          seed.forEach(s => setDoc(doc(db, 'services', s.id), s));
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'services'));

      // Fetch Invoices
      const qInvoices = query(collection(db, 'invoices'), where('ownerUid', '==', user.uid));
      const unsubInvoices = onSnapshot(qInvoices, (snap) => {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Invoice));
        setInvoices(list.sort((a, b) => b.created.localeCompare(a.created)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'invoices'));

      // Fetch Expenses
      const qExpenses = query(collection(db, 'expenses'), where('ownerUid', '==', user.uid));
      const unsubExpenses = onSnapshot(qExpenses, (snap) => {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Expense));
        setExpenses(list.sort((a, b) => b.date.localeCompare(a.date)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

      return () => {
        unsubCustomers();
        unsubServices();
        unsubInvoices();
        unsubExpenses();
      };
    }
  }, [isAuthReady, user]);

  useEffect(() => {
    document.body.classList.toggle('light', !isDarkMode);
    localStorage.setItem('darkMode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const showToast = (msg: string, type: 'ok' | 'err' | 'info' = 'ok') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  const closeModal = () => setModal(prev => ({ ...prev, open: false }));

  const openShareModal = (inv: Invoice) => {
    setModal({
      open: true,
      title: `✅ Bill Ready — ${inv.id}`,
      content: <ShareModalContent inv={inv} shopSettings={shopSettings} showToast={showToast} closeModal={closeModal} />
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--orange)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={loginWithGoogle} showToast={showToast} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'Main' },
    { id: 'shop-more', label: 'Shop More', icon: <ShoppingBag size={18} />, section: 'Main' },
    { id: 'pos', label: 'POS Billing', icon: <Zap size={18} />, section: 'Billing' },
    { id: 'billing', label: 'Smart Billing', icon: <FileText size={18} />, section: 'Billing' },
    { id: 'customers', label: 'Customers', icon: <Users size={18} />, section: 'Business' },
    { id: 'services', label: 'Services', icon: <Wrench size={18} />, section: 'Business' },
    { id: 'expenses', label: 'Expenses', icon: <CreditCard size={18} />, section: 'Finance' },
    { id: 'reports', label: 'Reports', icon: <TrendingUp size={18} />, section: 'Reports & Tools' },
    { id: 'profile', label: 'My Profile', icon: <UserCircle size={18} />, section: 'Account' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} />, section: 'Account' },
  ];

  const sections = [...new Set(navItems.map(item => item.section))];

  const themeMap = {
    amber: { orange: '#f59e0b', orange2: '#f59e0b', glow: 'rgba(245, 158, 11, 0.1)' },
    blue: { orange: '#3b82f6', orange2: '#3b82f6', glow: 'rgba(59, 130, 246, 0.1)' },
    rose: { orange: '#f43f5e', orange2: '#f43f5e', glow: 'rgba(244, 63, 94, 0.1)' },
    emerald: { orange: '#10b981', orange2: '#10b981', glow: 'rgba(16, 185, 129, 0.1)' },
    slate: { orange: '#475569', orange2: '#475569', glow: 'rgba(71, 85, 105, 0.1)' },
  };

  const currentTheme = themeMap[shopSettings.theme] || themeMap.amber;

  return (
    <div 
      className={cn("flex min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300", isDarkMode ? "" : "light")}
      style={{
        '--orange': currentTheme.orange,
        '--orange2': currentTheme.orange2,
        '--glow': currentTheme.glow,
      } as any}
    >
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-[150] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-[248px] bg-[var(--bg2)] border-r border-[var(--border)] z-[200] flex flex-col md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white font-black text-lg">
              {shopSettings.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-tight uppercase truncate max-w-[120px]">{shopSettings.name}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Premium Partner</div>
            </div>
          </div>
          
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:border-orange-500 transition-all text-white"
            />
          </div>
        </div>

        <nav className="p-[10px_8px] flex-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              <div className="text-[9px] font-[700] uppercase tracking-[0.1em] text-[var(--text3)] p-[14px_12px_5px] first:pt-1.5">{section}</div>
              {navItems.filter(item => item.section === section).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg cursor-pointer text-[13px] font-[500] mb-px border border-transparent",
                    activeTab === item.id 
                      ? "bg-[rgba(245,166,35,0.1)] text-[var(--orange)] border-[rgba(245,166,35,0.18)]" 
                      : "text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
                  )}
                >
                  <span className="w-5 text-center shrink-0">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 p-[10px_12px] bg-white/5 rounded-xl mb-1.5">
            <div className="w-[34px] h-[34px] rounded-lg bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] flex items-center justify-center text-[14px] font-[800] text-white font-display shrink-0">
              {shopSettings.owner.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[12px] font-[600]">{shopSettings.owner}</div>
              <div className="text-[10px] text-[var(--text2)]">Free Plan</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 p-[9px_12px] rounded-lg cursor-pointer text-[13px] font-[500] text-[var(--red)] hover:bg-[var(--bg3)]"
          >
            <LogOut size={18} className="shrink-0" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[248px] min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-[100] h-[60px] bg-[var(--bg2)] border-b border-[var(--border)] px-6 flex items-center gap-3.5">
          <button className="md:hidden p-1 text-[var(--text)] cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="font-display text-[17px] font-[700] flex-1">{navItems.find(i => i.id === activeTab)?.label}</div>
          
          <div className="hidden sm:flex items-center bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[7px_13px] gap-2 w-[210px]">
            <Search size={14} className="text-[var(--text2)]" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-[13px] text-[var(--text)] w-full font-sans" />
          </div>

          <div className="flex gap-2">
            <button 
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:border-white/20 hover:text-[var(--text)] transition-all cursor-pointer"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:border-white/20 hover:text-[var(--text)] transition-all cursor-pointer"
              onClick={() => setActiveTab('billing')}
              title="Quick Bill"
            >
              <FileText size={18} />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 flex-1 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <Dashboard setTab={setActiveTab} invoices={invoices} shopSettings={shopSettings} />}
            {activeTab === 'billing' && <Billing invoices={invoices} customers={customers} services={services} shopSettings={shopSettings} showToast={showToast} openShareModal={openShareModal} user={user} />}
            {activeTab === 'pos' && <POS services={services} customers={customers} shopSettings={shopSettings} showToast={showToast} openShareModal={openShareModal} user={user} />}
            {activeTab === 'customers' && <Customers customers={customers} invoices={invoices} showToast={showToast} user={user} openAddModal={() => setModal({ open: true, title: 'Add New Customer', content: <AddCustomerModal showToast={showToast} user={user} closeModal={closeModal} /> })} />}
            {activeTab === 'services' && <Services services={services} showToast={showToast} user={user} shopSettings={shopSettings} openAddModal={() => setModal({ open: true, title: 'Add New Service', content: <AddServiceModal showToast={showToast} user={user} closeModal={closeModal} /> })} />}
            {activeTab === 'settings' && <Settings shopSettings={shopSettings} showToast={showToast} user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} customers={customers} services={services} invoices={invoices} />}
            {activeTab === 'reports' && <Reports invoices={invoices} shopSettings={shopSettings} />}
            {activeTab === 'expenses' && <Expenses expenses={expenses} showToast={showToast} user={user} shopSettings={shopSettings} openAddModal={() => setModal({ open: true, title: 'Add New Expense', content: <AddExpenseModal showToast={showToast} user={user} closeModal={closeModal} /> })} />}
            
            {!['dashboard', 'billing', 'customers', 'services', 'settings', 'reports', 'expenses'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text2)]">
                <AlertCircle size={48} className="mb-3 opacity-20" />
                <h3 className="text-lg font-bold">{navItems.find(i => i.id === activeTab)?.label}</h3>
                <p className="mt-2">Jaldi aa raha hai! Yeh feature abhi development mein hai.</p>
              </div>
            )}
          </div>

          {/* Right Side Panel - Only for Dashboard */}
          {activeTab === 'dashboard' && (
            <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <h3 className="font-display text-[15px] font-[700] mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-[var(--orange)]" /> Quick Actions
                </h3>
                <div className="flex flex-col gap-2.5">
                  <button onClick={() => setActiveTab('billing')} className="w-full p-3 rounded-xl bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-[600] text-[13px] cursor-pointer shadow-md hover:scale-[1.02] transition-all">🧾 New Invoice Banao</button>
                  <button onClick={() => setActiveTab('customers')} className="w-full p-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text)] font-[600] text-[13px] cursor-pointer hover:bg-white/10 transition-all">👥 Customer Add Karo</button>
                  <button onClick={() => setActiveTab('reports')} className="w-full p-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text)] font-[600] text-[13px] cursor-pointer hover:bg-white/10 transition-all">📈 Reports Dekho</button>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <h3 className="font-display text-[15px] font-[700] mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-[var(--blue)]" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {invoices.slice(0, 4).map((inv, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => openShareModal(inv)}>
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--orange)] group-hover:bg-[var(--orange)] group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold truncate">{inv.customerName}</div>
                        <div className="text-[10px] text-[var(--text3)]">{fmtDate(inv.created)}</div>
                      </div>
                      <div className="text-[12px] font-bold text-[var(--orange)]">{fmt(inv.total, shopSettings.currency)}</div>
                    </div>
                  ))}
                  {invoices.length === 0 && <p className="text-[11px] text-[var(--text3)] text-center py-4">Koi activity nahi</p>}
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <h3 className="font-display text-[15px] font-[700] mb-4 flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-[var(--orange)]" /> Reference View
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="aspect-video bg-white/5 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text3)] p-4 text-center">
                    <p className="text-[10px] font-bold">Screenshot 1</p>
                    <p className="text-[9px] opacity-50">Upload your old bill layout here</p>
                  </div>
                  <div className="aspect-video bg-white/5 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text3)] p-4 text-center">
                    <p className="text-[10px] font-bold">Screenshot 2</p>
                    <p className="text-[9px] opacity-50">Reference for POS screen</p>
                  </div>
                  <div className="aspect-video bg-white/5 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text3)] p-4 text-center">
                    <p className="text-[10px] font-bold">Screenshot 3</p>
                    <p className="text-[9px] opacity-50">Report layout reference</p>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-[rgba(245,166,35,0.1)] to-transparent border border-[rgba(245,166,35,0.2)] rounded-[var(--radius)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-[var(--orange)]" />
                  <span className="text-[12px] font-bold">Pro Tip</span>
                </div>
                <p className="text-[11px] text-[var(--text2)] leading-relaxed">
                  Har bill mein automatic UPI QR code aata hai. Customer se payment lena ab aur bhi aasaan!
                </p>
              </div>

              {shopSettings.waLink && (
                <div className="bg-white/5 border border-[var(--border)] rounded-[var(--radius)] p-5">
                  <h3 className="font-display text-[15px] font-[700] mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#25d366]" /> Shop WhatsApp
                  </h3>
                  <a 
                    href={`https://${shopSettings.waLink.replace(/^https?:\/\//, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#25d366]/10 text-[#25d366] text-xs font-bold hover:bg-[#25d366]/20 transition-all border border-[#25d366]/20"
                  >
                    <span>Click to Chat</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </aside>
          )}
        </main>
      </div>

      {/* AI Chatbot Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-24 w-14 h-14 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[9998] cursor-pointer group"
      >
        <Bot size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--green)] rounded-full border-2 border-[var(--bg)] animate-pulse" />
      </button>

      {/* AI Chatbot Window */}
      {isChatOpen && (
        <AIChatBot 
          onClose={() => setIsChatOpen(false)} 
          shopSettings={shopSettings}
          customers={customers}
          services={services}
          invoices={invoices}
          expenses={expenses}
        />
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className={cn(
            "fixed bottom-6 right-6 p-[11px_18px] rounded-lg text-[13px] font-[600] z-[9999] shadow-2xl flex items-center gap-2",
            toast.type === 'ok' ? "bg-[var(--green)] text-white" : toast.type === 'err' ? "bg-[var(--red)] text-white" : "bg-[var(--orange)] text-white"
          )}
        >
          {toast.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            onClick={closeModal}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative bg-[var(--card)] border border-[var(--border)] rounded-[18px] w-full max-w-[580px] max-h-[90vh] overflow-hidden shadow-[0_24_80px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="p-[18px_22px] border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-display text-[17px] font-[700]">{modal.title}</h3>
              <button onClick={closeModal} className="p-1 text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg3)] rounded-md cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-[22px] overflow-y-auto flex-1">
              {modal.content}
            </div>
            {modal.footer && (
              <div className="p-[14px_22px] border-t border-[var(--border)] flex gap-2.5 justify-end">
                {modal.footer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Add Customer Modal ---
function AddCustomerModal({ showToast, user, closeModal }: { showToast: any, user: User, closeModal: any }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'Regular' | 'VIP'>('Regular');

  const save = async () => {
    if (!name || !mobile) return showToast('Name aur Mobile zaroori hain!', 'err');
    try {
      const id = 'C' + Date.now().toString().slice(-6);
      await setDoc(doc(db, 'customers', id), { 
        id, 
        name, 
        mobile, 
        email,
        address, 
        notes,
        type,
        ownerUid: user.uid,
        created: new Date().toISOString()
      });
      showToast('Customer added successfully', 'ok');
      closeModal();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customers');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Mobile *</label>
          <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Customer Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'Regular' | 'VIP')} className="w-full p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]">
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-16" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Internal Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instruction or details..." className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-16" />
      </div>
      <button onClick={save} className="w-full bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white py-4 rounded-xl font-bold text-[15px] shadow-lg mt-2 cursor-pointer">Add Customer</button>
    </div>
  );
}

// --- Add Service Modal ---
function AddServiceModal({ showToast, user, closeModal }: { showToast: any, user: User, closeModal: any }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState('Service');
  const [unit, setUnit] = useState('Unit');
  const [notes, setNotes] = useState('');

  const save = async () => {
    if (!name || !price) return showToast('Name aur Price zaroori hain!', 'err');
    try {
      const id = 'S' + Date.now().toString().slice(-6);
      await setDoc(doc(db, 'services', id), { 
        id, 
        name, 
        price: parseFloat(price), 
        cat, 
        unit,
        notes,
        ownerUid: user.uid 
      });
      showToast('Service added successfully', 'ok');
      closeModal();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'services');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Service Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Price (₹) *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. Visit, Hr, Qty" className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Category</label>
        <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Description or additional info..." className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-20" />
      </div>
      <button onClick={save} className="w-full bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white py-4 rounded-xl font-bold text-[15px] shadow-lg mt-4 cursor-pointer">Add Service</button>
    </div>
  );
}
function ShareModalContent({ inv, shopSettings, showToast, closeModal }: { inv: Invoice, shopSettings: ShopSettings, showToast: any, closeModal: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [whatsappCardUrl, setWhatsappCardUrl] = useState<string | null>(null);
  const [view, setView] = useState<'ready' | 'preview'>('ready');
  const [waNumber, setWaNumber] = useState(inv.customerMobile);

  const getPortalLink = () => {
    const base = window.location.origin;
    return `${base}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`;
  };

  const portalLink = getPortalLink();

  const generatePreview = async () => {
    if (!cardRef.current || !previewRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      // 1. Full Invoice capture for PDF/Download
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);

      // 2. WhatsApp special card capture
      const wsCanvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      setWhatsappCardUrl(wsCanvas.toDataURL('image/png'));
    } catch (e) {
      console.error('Preview generation failed:', e);
      showToast('Preview generate karne mein error!', 'err');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(generatePreview, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (view === 'preview' && !previewUrl) {
      generatePreview();
    }
  }, [view]);

  const shareWA = async () => {
    const portalLink = getPortalLink();
    const msg = `🚀 *Invoice Ready!* 🚀\n\nHey *${inv.customerName}*,\n\nThank you for choosing *${shopSettings.name}*! Your invoice #*${inv.id}* is ready.\n\n💰 *Total Amount:* ${fmt(inv.total, shopSettings.currency)}\n📅 *Invoice Date:* ${fmtDate(inv.created)}\n⏳ *Status:* ${inv.status}\n\n👉 *View & Pay Online:* ${portalLink}\n\n${shopSettings.waLink ? `💬 Chat with us: ${shopSettings.waLink}\n` : ''}\nHappy to serve you!\n*${shopSettings.name}*`;
    
    // Attempt to share with image if supported (mainly mobile)
    const activeUrl = whatsappCardUrl || previewUrl;
    if (navigator.share && activeUrl) {
      try {
        const response = await fetch(activeUrl);
        const blob = await response.blob();
        const file = new File([blob], `Invoice_${inv.id}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice #${inv.id}`,
            text: msg,
          });
          return;
        }
      } catch (e) {
        console.error('Sharing failed', e);
      }
    }

    window.open(`https://wa.me/91${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(portalLink);
    showToast('✅ Link copied!', 'ok');
  };

  const downloadPDF = async () => {
    if (!previewUrl) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(previewUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(previewUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${inv.id}.pdf`);
  };

  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `Invoice_${inv.id}.png`;
    link.click();
  };

  const printInvoice = () => {
    if (!previewUrl) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;"><img src="${previewUrl}" style="width:100%;max-width:800px;"/></body></html>`);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 500);
    }
  };

  return (
    <div className="relative">
      {/* Hidden Invoice Card for Capture - ALWAYS RENDERED */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none opacity-0">
        <div ref={cardRef} className="w-[800px] bg-white p-10 text-black border border-gray-200">
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                {shopSettings.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-slate-900 uppercase tracking-tight">{shopSettings.name}</div>
                <div className="text-sm font-bold text-gray-500">{shopSettings.owner}</div>
                <div className="text-xs text-gray-400 mt-1">📞 {shopSettings.phone}</div>
                <div className="text-xs text-gray-400">📍 {shopSettings.address}</div>
                {shopSettings.gst && <div className="text-xs text-gray-400">GSTIN: {shopSettings.gst}</div>}
              </div>
            </div>
            <div className="text-right">
              <div className="flex flex-col items-end gap-1 mb-4">
                <div className="text-[28px] font-black text-slate-900 uppercase tracking-tighter leading-none">Bill of Supply</div>
                <div className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded uppercase tracking-wider">Original for Recipient</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice No.</div>
                <div className="text-xl font-black text-slate-900">{inv.id}</div>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#ea580c] text-[10px] font-black uppercase tracking-wider border border-orange-100">
                <Clock size={12} /> {inv.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Bill To</div>
              <div className="text-lg font-bold">{inv.customerName}</div>
              <div className="text-sm text-gray-500 mt-1">📞 {inv.customerMobile}</div>
              <div className="text-sm text-gray-500">📍 {inv.customerAddress}</div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-right">
              <div className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Invoice Info</div>
              <div className="text-sm font-bold">Date: <span className="text-gray-500">{fmtDate(inv.created)}</span></div>
              <div className="text-sm font-bold">Mode: <span className="text-gray-500">{inv.payMode}</span></div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="bg-[#f5a623] text-white">
                <th className="p-3 text-left text-xs font-bold rounded-l-lg">#</th>
                <th className="p-3 text-left text-xs font-bold">SERVICE / ITEM</th>
                <th className="p-3 text-center text-xs font-bold">QTY</th>
                <th className="p-3 text-right text-xs font-bold">RATE</th>
                <th className="p-3 text-right text-xs font-bold rounded-r-lg">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inv.items.map((it, i) => (
                <tr key={i}>
                  <td className="p-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="p-3 text-sm font-bold">{it.serviceName}</td>
                  <td className="p-3 text-sm text-center">{it.qty}</td>
                  <td className="p-3 text-sm text-right text-gray-500">{fmt(it.rate, shopSettings.currency)}</td>
                  <td className="p-3 text-sm text-right font-bold">{fmt(it.amount, shopSettings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{fmt(inv.subtotal, shopSettings.currency)}</span>
              </div>
              {inv.discount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Discount</span>
                  <span>-{fmt(inv.discount, shopSettings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black border-t-2 border-gray-100 pt-2">
                <span>Grand Total</span>
                <span style={{ color: '#f5a623' }}>{fmt(inv.total, shopSettings.currency)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-dashed border-gray-100">
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 border-2 border-[#f5a623] p-1 rounded-xl bg-white">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${shopSettings.upi}&pn=${encodeURIComponent(shopSettings.name)}&am=${inv.total}&cu=INR`)}`} 
                  alt="UPI QR" 
                  className="w-full h-full"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Payment Details</div>
                <div className="text-xs font-bold">Mode: <span className="text-gray-500">{inv.payMode}</span></div>
                <div className="text-xs font-bold">UPI ID: <span style={{ color: '#f5a623' }}>{shopSettings.upi}</span></div>
                <div className="text-xs font-bold">Amount: <span style={{ color: '#f5a623' }}>{fmt(inv.total, shopSettings.currency)}</span></div>
                <div className="text-xs font-bold">Status: <span className="text-orange-500">⏳ {inv.status}</span></div>
              </div>
            </div>
            <div className="text-right flex flex-col justify-center">
              <div className="text-[10px] text-gray-400 font-bold mb-2">🙏 Thank you! | {shopSettings.name} | 📞 {shopSettings.phone} | UPI: {shopSettings.upi}</div>
              <div className="text-[10px] text-gray-300">Generated by Umair Bills</div>
            </div>
          </div>
        </div>

        {/* SPECIAL WHATSAPP PREVIEW CARD (Matching Screenshot) */}
        <div ref={previewRef} className="w-[800px] h-[500px] p-8 flex items-center justify-center font-sans" style={{ backgroundColor: '#f87171' }}>
          <div className="w-full h-full rounded-[40px] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl" style={{ background: 'radial-gradient(circle at 20% 30%, #f87171 0%, #ef4444 50%, #dc2626 100%)' }}>
            {/* Patterns */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
            
            <div className="w-full bg-white rounded-[32px] p-12 flex flex-col items-center text-center shadow-2xl relative z-10 border" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              {/* Decorative line */}
              <div className="w-32 h-1 rounded-full mb-8" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)' }}></div>
              
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8">
                {shopSettings.name}
              </h2>
              
              <div className="flex flex-col items-center gap-2 mb-8">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Due Amount</span>
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  {fmt(inv.total, shopSettings.currency)}
                </span>
              </div>
              
              <div className={cn(
                "px-10 py-2.5 rounded-full text-sm font-black uppercase tracking-widest shadow-md mb-12 text-white",
                inv.status === 'Paid' ? "bg-green-500" : "bg-red-500"
              )} style={{ backgroundColor: inv.status === 'Paid' ? '#22c55e' : '#ef4444' }}>
                {inv.status}
              </div>
              
              <div className="text-sm font-bold text-slate-400 mb-8 space-x-2">
                <span>Invoice Date :</span>
                <span className="text-slate-700">{fmtDate(inv.created)}</span>
              </div>
              
              <div className="pt-8 border-t border-slate-100 w-full flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-slate-300">Created by</span>
                <div className="flex items-center gap-1 opacity-40">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white font-black text-[6px]">UB</div>
                  <span className="font-black text-[10px] text-slate-900 leading-none tracking-tighter">my<span className="text-orange-500 italic">BillBook</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {view === 'preview' ? (
        <div className="space-y-5">
          {/* Visible Preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-[360px] aspect-[4/5] bg-[var(--bg3)] rounded-xl border border-[var(--border)] overflow-hidden flex items-center justify-center relative shadow-2xl">
            {previewUrl ? (
              <img src={previewUrl} alt="Invoice Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text3)]">
                <RefreshCw size={32} className={cn("animate-spin", isGenerating ? "opacity-100" : "opacity-50")} />
                <span className="text-xs">{isGenerating ? 'Generating Preview...' : 'Waiting for preview...'}</span>
                {!isGenerating && (
                  <button onClick={generatePreview} className="mt-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold hover:bg-white/20">
                    Retry Preview
                  </button>
                )}
              </div>
            )}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <button onClick={() => setView('ready')} className="p-3 bg-white/5 border border-white/10 text-[var(--text2)] rounded-xl font-bold text-[13px] flex items-center justify-center cursor-pointer">
              <X size={18} />
            </button>
            <button onClick={downloadPDF} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer" title="Download PDF">
              <Download size={18} />
            </button>
            <button onClick={downloadImage} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer" title="Download Image">
              <ImageIcon size={18} />
            </button>
            <button onClick={printInvoice} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer" title="Print Invoice">
              <Printer size={18} />
            </button>
            <button onClick={shareWA} className="col-span-1 p-3 bg-[#25d366] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer">
              <MessageSquare size={18} fill="white" /> WA
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[13px] font-bold">
              <CheckCircle2 size={16} /> Bill Ready — {inv.id}
            </div>
            
            <div className="flex justify-center">
              <div className="w-48 aspect-[4/3] bg-white rounded-xl border-4 border-orange-100 shadow-xl overflow-hidden p-2 relative group cursor-pointer" onClick={() => setView('preview')}>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  <Eye size={20} className="mb-1" /> View Full Bill
                </div>
                <div className="h-full w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-[10px] font-black text-gray-400 uppercase mb-1">{shopSettings.name}</div>
                  <div className="text-[8px] text-gray-400 mb-2">Due Amount</div>
                  <div className="text-2xl font-black text-orange-500">{fmt(inv.total, shopSettings.currency)}</div>
                  <div className="mt-2 px-3 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold uppercase">Unpaid</div>
                  <div className="mt-4 text-[6px] text-gray-300">Invoice Date: {fmtDate(inv.created)}</div>
                  <div className="text-[6px] text-gray-300">Invoice No: {inv.id}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider flex items-center gap-2">
                <ExternalLink size={12} /> Customer View Link
              </p>
              <div className="flex gap-2">
                <input readOnly value={portalLink} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-[var(--orange)] outline-none" />
                <button onClick={copyLink} className="p-3 bg-[var(--orange)] text-white rounded-xl cursor-pointer hover:scale-105 transition-transform">
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={12} /> Customer WhatsApp Number:
              </p>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-black/20 border border-white/10 rounded-xl text-[13px] font-bold text-[var(--text2)]">+91</div>
                <input 
                  type="text" 
                  value={waNumber} 
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-[14px] font-bold text-[var(--text)] outline-none focus:border-[var(--orange)]" 
                />
              </div>
            </div>

            <button onClick={shareWA} className="w-full p-4 bg-linear-to-br from-[#25d366] to-[#128c7e] text-white font-black rounded-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <MessageSquare size={22} fill="white" /> Send Invoice on WhatsApp
            </button>

            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setView('preview')} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <Eye size={16} /> View
              </button>
              <button onClick={downloadPDF} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <Download size={16} /> PDF
              </button>
              <button onClick={downloadImage} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <ImageIcon size={16} /> IMG
              </button>
              <button onClick={printInvoice} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Customers Component ---
function Customers({ customers, invoices, showToast, user, openAddModal }: { customers: Customer[], invoices: Invoice[], showToast: any, user: User, openAddModal: any }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Regular' | 'VIP'>('All');

  const filtered = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.mobile.includes(search) || 
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const deleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteDoc(doc(db, 'customers', id));
        showToast('Customer deleted', 'ok');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Customers</h2>
          <p className="text-[13px] text-[var(--text2)]">Manage your customer database and history.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--orange)] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-white/5 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] gap-2 flex-1 max-w-md">
            <Search size={16} className="text-[var(--text2)]" />
            <input 
              type="text" 
              placeholder="Search by name, mobile, or email..." 
              className="bg-transparent border-none outline-none text-[14px] text-[var(--text)] w-full font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--text3)] uppercase">Show:</span>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] text-[13px] outline-none text-[var(--text)]"
            >
              <option value="All">All Customers</option>
              <option value="Regular">Regular Only</option>
              <option value="VIP">VIP Only</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Type</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Total Bills</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(c => (
                <tr key={c.id} className="text-[13px] hover:bg-white/5">
                  <td className="p-4 pl-6">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-[11px] text-[var(--text3)]">{c.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-[var(--text2)]">{c.mobile}</div>
                    <div className="text-[11px] text-[var(--text3)]">{c.email || 'No email'}</div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      c.type === 'VIP' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                    )}>{c.type}</span>
                  </td>
                  <td className="p-4 max-w-[200px] truncate text-[var(--text3)] italic">
                    {c.notes || '-'}
                  </td>
                  <td className="p-4 font-bold">{invoices.filter(inv => inv.customerMobile === c.mobile).length}</td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => deleteCustomer(c.id)} className="p-2 text-[var(--text2)] hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Services Component ---
function Services({ services, showToast, user, openAddModal, shopSettings }: { services: Service[], showToast: any, user: User, openAddModal: any, shopSettings: ShopSettings }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(services.map(s => s.cat)))];

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.cat.toLowerCase().includes(search.toLowerCase()) ||
                         (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCat = catFilter === 'All' || s.cat === catFilter;
    
    return matchesSearch && matchesCat;
  });

  const deleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        showToast('Service deleted', 'ok');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Services & Inventory</h2>
          <p className="text-[13px] text-[var(--text2)]">Manage your products, services and pricing.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--orange)] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Add Service
        </button>
      </div>

      <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-white/5 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] gap-2 flex-1 max-w-md">
            <Search size={16} className="text-[var(--text2)]" />
            <input 
              type="text" 
              placeholder="Search services or notes..." 
              className="bg-transparent border-none outline-none text-[14px] text-[var(--text)] w-full font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--text3)] uppercase">Category:</span>
            <select 
              value={catFilter} 
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] text-[13px] outline-none text-[var(--text)]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="p-4 pl-6">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Price</th>
                <th className="p-4">Unit</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(s => (
                <tr key={s.id} className="text-[13px] hover:bg-white/5">
                  <td className="p-4 pl-6 font-bold">{s.name}</td>
                  <td className="p-4">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[11px] text-[var(--text2)]">{s.cat}</span>
                  </td>
                  <td className="p-4 text-[var(--text3)] italic max-w-[200px] truncate">
                    {s.notes || '-'}
                  </td>
                  <td className="p-4 font-bold text-[var(--orange)]">{fmt(s.price, shopSettings.currency)}</td>
                  <td className="p-4 text-[var(--text3)] uppercase text-[11px] font-bold">{s.unit}</td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => deleteService(s.id)} className="p-2 text-[var(--text2)] hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, showToast }: { onLogin: () => void, showToast: (m: string, t?: any) => void }) {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleGetOTP = () => {
    if (mobile.length < 10) return showToast('Valid Mobile Number enter karein!', 'err');
    setOtpSent(true);
    showToast('Demo OTP: 1234 se login karein', 'ok');
  };

  const handleVerifyOTP = () => {
    if (otp === '1234') {
      onLogin(); // In a real app we'd verify with Firebase, here we use demo logic
    } else {
      showToast('Galat OTP! Demo OTP "1234" use karein.', 'err');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-black text-xs">UB</div>
              <span className="font-black text-xl text-slate-900 leading-none">my<span className="text-orange-500 italic">BillBook</span></span>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {!otpSent ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-slate-900">Enter Your Mobile Number</h2>
                <p className="text-xs font-bold text-slate-400 leading-relaxed px-4">
                  To access your invoices and ledgers, enter your mobile number. We'll send you a verification code.
                </p>
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <div className="p-4 bg-slate-50 border-r border-slate-100 text-sm font-bold text-slate-500">+91</div>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Mobile Number" 
                  className="w-full p-4 text-sm font-bold outline-none"
                />
              </div>

              <button 
                onClick={handleGetOTP}
                className="w-full py-4 bg-slate-50 text-slate-300 font-black rounded-xl text-sm cursor-pointer hover:bg-slate-100 hover:text-slate-500 transition-all"
                style={{ backgroundColor: mobile.length === 10 ? '#f5a623' : '', color: mobile.length === 10 ? 'white' : '' }}
              >
                Get OTP
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-slate-900">Verify OTP</h2>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  We've sent a code to <span className="text-slate-800">+91 {mobile}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <input 
                  type="text" 
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-40 p-4 border border-slate-200 rounded-xl text-center text-2xl font-black tracking-[1rem] outline-none focus:border-orange-500 transition-all"
                  placeholder="----"
                />
              </div>

              <button 
                onClick={handleVerifyOTP}
                className="w-full py-4 bg-orange-500 text-white font-black rounded-xl text-sm shadow-lg shadow-orange-100 cursor-pointer"
              >
                Verify & Login
              </button>

              <button onClick={() => setOtpSent(false)} className="w-full text-xs font-bold text-slate-400 hover:text-orange-500 cursor-pointer">
                Change Mobile Number?
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-400">
              By continuing you agree to the <span className="text-slate-800 underline">myBillBook</span> <span className="text-orange-500 underline cursor-pointer">Terms & Conditions</span>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Login with</p>
             <button onClick={onLogin} className="flex items-center gap-3 px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
               <span className="text-xs font-black text-slate-800">Google Login</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Dashboard({ setTab, invoices, shopSettings }: { setTab: (t: string) => void, invoices: Invoice[], shopSettings: ShopSettings }) {
  const todayStr = today();
  const month = todayStr.slice(0, 7);
  
  const todaySales = invoices.filter(i => i.created === todayStr).reduce((a, b) => a + b.total, 0);
  const monthSales = invoices.filter(i => i.created?.startsWith(month)).reduce((a, b) => a + b.total, 0);
  const unpaidAmt = invoices.filter(i => i.status === 'Pending').reduce((a, b) => a + b.total, 0);
  const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.total, 0);

  // Chart Data
  const monthlyData = invoices.reduce((acc: any, inv) => {
    const m = new Date(inv.created).toLocaleString('default', { month: 'short' });
    if (!acc[m]) acc[m] = { name: m, revenue: 0 };
    acc[m].revenue += inv.total;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData);

  const serviceStats = invoices.flatMap(inv => inv.items).reduce((acc: any, item) => {
    if (!acc[item.serviceName]) acc[item.serviceName] = 0;
    acc[item.serviceName] += item.qty;
    return acc;
  }, {});
  const topServices = Object.entries(serviceStats)
    .map(([name, qty]) => ({ name, qty: qty as number }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-[900] tracking-tight">Namaste {shopSettings.owner}! 👋</h2>
          <p className="text-[11px] font-black uppercase text-[var(--text3)] tracking-widest mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Aaj ki Sales', val: todaySales, icon: IndianRupee, color: 'amber' },
          { label: 'Monthly Sales', val: monthSales, icon: TrendingUp, color: 'blue' },
          { label: 'Unpaid Udhaar', val: unpaidAmt, icon: Clock, color: 'rose' },
          { label: 'Total Paid', val: paidRevenue, icon: Wallet, color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[var(--radius)] hover:translate-y-[-2px] transition-all group">
            <div className={cn(
              "p-2 rounded-lg w-fit mb-3 transition-colors",
              s.color === 'amber' ? "bg-amber-500/10 text-amber-500" : 
              s.color === 'blue' ? "bg-blue-500/10 text-blue-500" : 
              s.color === 'rose' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              <s.icon size={18} />
            </div>
            <div className="text-[var(--text3)] text-[10px] font-black uppercase tracking-widest">{s.label}</div>
            <div className="text-[22px] font-black mt-1 leading-none">{fmt(s.val, shopSettings.currency)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <h3 className="font-display text-[15px] font-[700] mb-6">📈 Revenue History</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--orange)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--orange)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <h3 className="font-display text-[15px] font-[700] mb-6">🔥 Top Items Sold</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text2)" fontSize={10} width={80} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="qty" fill="var(--orange)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[15px] font-[700]">🧾 Recent Invoices</h3>
          <button onClick={() => setTab('billing')} className="text-[10px] font-black uppercase text-[var(--orange)] hover:underline tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="pb-3 text-center w-12">#</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.slice(0, 5).map((inv, i) => (
                <tr key={i} className="text-[13px] group hover:bg-white/5 transition-colors">
                  <td className="py-4 text-center font-bold text-[var(--text3)]">#{inv.id}</td>
                  <td className="py-4 font-bold">{inv.customerName}</td>
                  <td className="py-4 text-[var(--text3)]">{fmtDate(inv.created)}</td>
                  <td className="py-4 font-black">{fmt(inv.total, shopSettings.currency)}</td>
                  <td className="py-4 text-right">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                      inv.status === 'Paid' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                    )}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- POS Component ---
function POS({ services, customers, shopSettings, showToast, openShareModal, user }: { services: Service[], customers: Customer[], shopSettings: ShopSettings, showToast: any, openShareModal: any, user: User }) {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCust, setSelectedCust] = useState<string>('');
  const [search, setSearch] = useState('');

  const addToCart = (s: Service) => {
    const existing = cart.find(i => i.id === s.id);
    if (existing) {
      setCart(cart.map(i => i.id === s.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...s, qty: 1 }]);
    }
  };

  const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return showToast('Cart khali hai!', 'error');
    const invId = 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const cust = customers.find(c => c.id === selectedCust);
    const newInv: Invoice = {
      id: invId,
      customerId: selectedCust || 'walk-in',
      customerName: cust?.name || 'Walk-in Customer',
      customerMobile: cust?.mobile || '',
      customerAddress: cust?.address || '',
      customerEmail: cust?.email || '',
      items: cart.map(i => ({ serviceId: i.id, serviceName: i.name, qty: i.qty, rate: i.price, amount: i.price * i.qty })),
      subtotal: total,
      discount: 0,
      discountAmount: 0,
      gst: 0,
      gstPct: 0,
      total: total,
      payMode: 'Cash',
      status: 'Paid',
      created: today(),
      ownerUid: user.uid
    };

    try {
      await setDoc(doc(db, 'invoices', invId), newInv);
      showToast('POS Bill Generated!', 'success');
      setCart([]);
      openShareModal(newInv);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'invoices');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col">
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pr-2">
          {services.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
            <button key={i} onClick={() => addToCart(s)} className="p-4 bg-white/5 border border-[var(--border)] rounded-xl text-left hover:border-[var(--orange)] transition-all group cursor-pointer">
              <div className="text-[13px] font-bold mb-1 truncate">{s.name}</div>
              <div className="text-[14px] font-black text-[var(--orange)]">{fmt(s.price, shopSettings.currency)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[380px] bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col shadow-xl">
        <h3 className="font-display text-[17px] font-black mb-6">🛒 Current Order</h3>
        <div className="mb-6">
          <label className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest mb-2 block">Customer Selection</label>
          <select 
            value={selectedCust} 
            onChange={(e) => setSelectedCust(e.target.value)}
            className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold truncate">{item.name}</div>
                <div className="text-[10px] text-[var(--text3)]">{item.qty} x {fmt(item.price, shopSettings.currency)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[13px] font-black">{fmt(item.price * item.qty, shopSettings.currency)}</div>
                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-[var(--red)] p-1 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center py-10 text-[var(--text3)] opacity-50">Cart khali hai</div>}
        </div>
        <div className="pt-6 border-t border-[var(--border)] space-y-3">
          <div className="flex justify-between text-[14px] font-bold text-[var(--text2)]">
            <span>Subtotal</span>
            <span>{fmt(total, shopSettings.currency)}</span>
          </div>
          <div className="flex justify-between text-[20px] font-black text-[var(--orange)]">
            <span>Total</span>
            <span>{fmt(total, shopSettings.currency)}</span>
          </div>
          <button onClick={handleCheckout} className="w-full py-4 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-black rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer mt-4">
            CHECKOUT — {fmt(total, shopSettings.currency)}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Reports Component ---
function Reports({ invoices, shopSettings }: { invoices: Invoice[], shopSettings: ShopSettings }) {
  const salesByDate = invoices.reduce((acc: any, inv) => {
    const date = inv.created;
    acc[date] = (acc[date] || 0) + inv.total;
    return acc;
  }, {});

  const chartData = Object.keys(salesByDate).sort().map(date => ({
    date: fmtDate(date),
    amount: salesByDate[date]
  })).slice(-7);

  const serviceStats = invoices.reduce((acc: any, inv) => {
    inv.items.forEach(it => {
      acc[it.serviceName] = (acc[it.serviceName] || 0) + it.qty;
    });
    return acc;
  }, {});

  const pieData = Object.keys(serviceStats).map(name => ({
    name,
    value: serviceStats[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#f5a623', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black tracking-tight">Reports & Analytics</h2>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--orange)]" /> Last 7 Days Sales
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f5a623" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--orange)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f5a623" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--blue)]" /> Top Services
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[var(--text2)] truncate max-w-[120px]">{d.name}</span>
                </div>
                <span className="font-bold">{d.value} sales</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Expenses Component ---
function Expenses({ expenses, showToast, user, shopSettings, openAddModal }: { expenses: Expense[], showToast: any, user: User, shopSettings: ShopSettings, openAddModal: any }) {
  const deleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
        showToast('Expense deleted', 'ok');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
      }
    }
  };

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Expenses</h2>
          <p className="text-[13px] text-[var(--text2)]">Track your business spending.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[var(--red)] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[11px] font-black uppercase tracking-widest text-[var(--text3)]">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {expenses.map((ex, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 text-[13px] font-bold">{ex.title}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{ex.category}</span>
                  </td>
                  <td className="p-4 text-[12px] text-[var(--text3)]">{fmtDate(ex.date)}</td>
                  <td className="p-4 text-right font-black text-[var(--red)]">{fmt(ex.amount, shopSettings.currency)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteExpense(ex.id)} className="text-[var(--text3)] hover:text-[var(--red)] transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[var(--text3)] opacity-50">Koi expenses nahi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-[var(--red)] to-[#f87171] rounded-2xl p-6 text-white shadow-xl shadow-red-500/20">
            <div className="text-[12px] font-bold uppercase opacity-80 mb-1">Total Expenses</div>
            <div className="text-3xl font-black">{fmt(totalExpenses, shopSettings.currency)}</div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-[14px]">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[var(--text2)]">This Month</span>
                <span className="font-bold">{fmt(totalExpenses, shopSettings.currency)}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--red)] w-[40%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ showToast, user, closeModal }: { showToast: any, user: User, closeModal: any }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'General', date: today() });

  const save = async () => {
    if (!form.title || !form.amount) return showToast('Sabhi fields bharein!', 'err');
    setLoading(true);
    try {
      const id = 'EXP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await setDoc(doc(db, 'expenses', id), {
        ...form,
        id,
        amount: parseFloat(form.amount),
        ownerUid: user.uid
      });
      showToast('Expense added successfully', 'ok');
      closeModal();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'expenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[var(--text3)] uppercase">Title *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)]" placeholder="Rent, Electricity, etc." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--text3)] uppercase">Amount *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)]" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--text3)] uppercase">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)]">
            <option>General</option>
            <option>Rent</option>
            <option>Salary</option>
            <option>Inventory</option>
            <option>Marketing</option>
            <option>Utilities</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[var(--text3)] uppercase">Date</label>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--orange)]" />
      </div>
      <button onClick={save} disabled={loading} className="w-full py-3.5 bg-[var(--red)] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer mt-4">
        {loading ? '⏳ Saving...' : 'Add Expense'}
      </button>
    </div>
  );
}

function StatCard({ color, icon, val, label }: { color: string, icon: string, val: string, label: string }) {
  const colors: any = {
    orange: "after:bg-linear-to-r after:from-[var(--orange)] after:to-[var(--orange2)]",
    green: "after:bg-linear-to-r after:from-[var(--green)] after:to-[#4ade80]",
    blue: "after:bg-linear-to-r after:from-[var(--blue)] after:to-[#60a5fa]",
    red: "after:bg-linear-to-r after:from-[var(--red)] after:to-[#f87171]"
  };
  return (
    <div className={cn(
      "bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 relative overflow-hidden after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[2.5px]",
      colors[color]
    )}>
      <div className="text-[24px] mb-3">{icon}</div>
      <div className="font-display text-[24px] md:text-[28px] font-[900] tracking-tight leading-none">{val}</div>
      <div className="text-[12px] text-[var(--text2)] mt-1.5">{label}</div>
    </div>
  );
}

function Billing({ invoices, customers, services, shopSettings, showToast, openShareModal, user }: { invoices: Invoice[], customers: Customer[], services: Service[], shopSettings: ShopSettings, showToast: any, openShareModal: any, user: User }) {
  const [items, setItems] = useState<InvoiceItem[]>([{ serviceId: '', serviceName: '', qty: 1, rate: 0, amount: 0 }]);
  const [selectedCust, setSelectedCust] = useState(customers[0]?.id || '');
  const [discount, setDiscount] = useState(0);
  const [gstPct, setGstPct] = useState(0);
  const [payMode, setPayMode] = useState('Cash');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [date, setDate] = useState(today());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);

  const [previewFormat, setPreviewFormat] = useState<'PDF' | 'IMG'>('PDF');
  const previewRef = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((a, b) => a + b.amount, 0);
  const gstAmt = (subtotal - discount) * (gstPct / 100);
  const total = subtotal - discount + gstAmt;

  const downloadAsPDF = async () => {
    if (!previewRef.current || !selectedInvoice) return;
    showToast('⏳ Generating PDF...', 'info');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${selectedInvoice.id}.pdf`);
      showToast('✅ PDF Downloaded', 'ok');
    } catch (e) {
      showToast('❌ PDF Download failed', 'err');
    }
  };

  const downloadAsImage = async () => {
    if (!previewRef.current || !selectedInvoice) return;
    showToast('⏳ Generating Image...', 'info');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Invoice_${selectedInvoice.id}.png`;
      link.click();
      showToast('✅ Image Downloaded', 'ok');
    } catch (e) {
      showToast('❌ Image Download failed', 'err');
    }
  };

  const addItem = () => setItems([...items, { serviceId: '', serviceName: '', qty: 1, rate: 0, amount: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof InvoiceItem, val: any) => {
    const newItems = [...items];
    const item = { ...newItems[idx] };
    
    if (field === 'serviceId') {
      const svc = services.find(s => s.id === val);
      item.serviceId = val;
      item.serviceName = svc?.name || '';
      item.rate = svc?.price || 0;
    } else if (field === 'qty') {
      item.qty = parseFloat(val) || 0;
    } else if (field === 'rate') {
      item.rate = parseFloat(val) || 0;
    }
    
    item.amount = item.qty * item.rate;
    newItems[idx] = item;
    setItems(newItems);
  };

  const generateInvoice = async () => {
    if (!selectedCust) return showToast('Customer select karo!', 'err');
    const validItems = items.filter(it => it.serviceId);
    if (validItems.length === 0) return showToast('Ek service add karo!', 'err');

    setIsGenerating(true);
    const cust = customers.find(c => c.id === selectedCust)!;
    
    try {
      const counterRef = doc(db, 'counters', user.uid);
      const counterSnap = await getDoc(counterRef);
      let nextNum = 1;
      if (counterSnap.exists()) {
        nextNum = (counterSnap.data().INV || 0) + 1;
      }
      await setDoc(counterRef, { INV: nextNum, ownerUid: user.uid }, { merge: true });

      const invId = `${shopSettings.invPrefix || 'INV'}${String(nextNum).padStart(3, '0')}`;
      const docId = `${user.uid}_${invId.replace(/[\/]/g, '_')}_${Date.now()}`;
      const newInv: Invoice = {
        id: invId,
        docId,
        customerId: selectedCust,
        customerName: cust.name,
        customerMobile: cust.mobile,
        customerAddress: cust.address,
        customerEmail: cust.email || '',
        items: validItems,
        subtotal,
        discount,
        discountAmount: discount,
        gst: gstAmt,
        gstPct,
        total,
        payMode,
        status,
        created: date,
        ownerUid: user.uid
      };

      await setDoc(doc(db, 'invoices', docId), newInv);
      
      setItems([{ serviceId: '', serviceName: '', qty: 1, rate: 0, amount: 0 }]);
      showToast(`✅ Invoice ban gayi: ${newInv.id}`, 'ok');
      setIsGenerating(false);

      // Smart Share Logic
      openShareModal(newInv);
      setSelectedInvoice(newInv);
    } catch (err) {
      setIsGenerating(false);
      handleFirestoreError(err, OperationType.WRITE, 'invoices');
    }
  };

  const deleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        const inv = invoices.find(i => i.id === id);
        const targetId = inv?.docId || id;
        await deleteDoc(doc(db, 'invoices', targetId));
        showToast('Invoice deleted', 'ok');
        if (selectedInvoice?.id === id) setSelectedInvoice(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
      }
    }
  };

  const shareWA = (inv: Invoice) => {
    const portalLink = `${window.location.origin}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`;
    const msg = `🚀 *Invoice Ready!* 🚀\n\nHey *${inv.customerName}*,\n\nThank you for choosing *${shopSettings.name}*! Your invoice #*${inv.id}* is ready.\n\n💰 *Total Amount:* ${fmt(inv.total, shopSettings.currency)}\n📅 *Invoice Date:* ${fmtDate(inv.created)}\n⏳ *Status:* ${inv.status}\n\n👉 *View & Pay Online:* ${portalLink}\n\n${shopSettings.waLink ? `💬 Chat with us: ${shopSettings.waLink}\n` : ''}\nHappy to serve you!\n*${shopSettings.name}*`;
    window.open(`https://wa.me/91${inv.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyPaymentLink = (inv: Invoice) => {
    const portalLink = `${window.location.origin}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`;
    navigator.clipboard.writeText(portalLink);
    showToast('Payment link copied to clipboard!', 'ok');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full overflow-hidden">
      <div className="space-y-6 overflow-y-auto pr-2">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <h3 className="font-display text-[15px] font-[700] mb-5 flex items-center gap-2">
            <Plus size={18} className="text-[var(--orange)]" /> New Invoice
          </h3>
          
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Customer *</label>
              <select 
                value={selectedCust} 
                onChange={(e) => setSelectedCust(e.target.value)}
                className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]"
              >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider block">Items / Services</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1 flex flex-col gap-1">
                    {idx === 0 && <span className="text-[10px] text-[var(--text3)]">Service</span>}
                    <select 
                      value={item.serviceId} 
                      onChange={(e) => updateItem(idx, 'serviceId', e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-[13px] outline-none focus:border-[var(--orange)]"
                    >
                      <option value="">Select Service</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="w-16 flex flex-col gap-1">
                    {idx === 0 && <span className="text-[10px] text-[var(--text3)]">Qty</span>}
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-[13px] outline-none focus:border-[var(--orange)]"
                    />
                  </div>
                  <div className="w-20 flex flex-col gap-1">
                    {idx === 0 && <span className="text-[10px] text-[var(--text3)]">Rate</span>}
                    <input 
                      type="number" 
                      value={item.rate} 
                      onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-[13px] outline-none focus:border-[var(--orange)]"
                    />
                  </div>
                  <div className="w-24 flex flex-col gap-1">
                    {idx === 0 && <span className="text-[10px] text-[var(--text3)]">Amount</span>}
                    <div className="w-full p-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-[13px] opacity-50">{fmt(item.amount, shopSettings.currency)}</div>
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="p-2.5 text-[var(--red)] rounded-lg cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addItem} className="text-[13px] font-[600] text-[var(--orange)] flex items-center gap-1.5 cursor-pointer">
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="h-px bg-[var(--border)]" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Discount (₹)</label>
                <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">GST %</label>
                <select value={gstPct} onChange={(e) => setGstPct(parseFloat(e.target.value))} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]">
                  <option value="0">No GST</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Payment Mode</label>
                <select value={payMode} onChange={(e) => setPayMode(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]">
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="bg-[var(--bg3)] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--text2)]">Subtotal:</span>
                <span>{fmt(subtotal, shopSettings.currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[13px] text-[var(--red)]">
                  <span>Discount:</span>
                  <span>-{fmt(discount, shopSettings.currency)}</span>
                </div>
              )}
              {gstAmt > 0 && (
                <div className="flex justify-between text-[13px] text-[var(--blue)]">
                  <span>GST ({gstPct}%):</span>
                  <span>+{fmt(gstAmt, shopSettings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-[16px] font-[800] border-t border-[var(--border)] pt-2.5 mt-2">
                <span>Grand Total:</span>
                <span className="text-[var(--orange)]">{fmt(total, shopSettings.currency)}</span>
              </div>
            </div>

            <button 
              onClick={generateInvoice}
              disabled={isGenerating}
              className="w-full h-12 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-[700] rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? "⏳ Generating..." : "🧾 Invoice Generate Karo"}
            </button>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <h3 className="font-display text-[15px] font-[700] mb-5">📋 Recent Invoices</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {invoices.map((inv, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-[var(--bg3)] border rounded-xl p-4 space-y-3 transition-all cursor-pointer",
                  selectedInvoice?.id === inv.id ? "border-[var(--orange)] shadow-md shadow-orange-500/10" : "border-[var(--border)] hover:border-white/20"
                )}
                onClick={() => setSelectedInvoice(inv)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-[700]">{inv.id}</div>
                    <div className="text-[11px] text-[var(--text2)]">{inv.customerName} · {fmtDate(inv.created)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-[800] text-[var(--orange)]">{fmt(inv.total, shopSettings.currency)}</div>
                    <span className={cn(
                      "text-[10px] font-[700] px-2 py-0.5 rounded-full",
                      inv.status === 'Paid' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                    )}>{inv.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); shareWA(inv); }}
                    className="p-2 px-3 rounded-lg bg-[#25d366] text-white text-[10px] font-[700] flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                  >
                    <MessageSquare size={14} fill="white" /> WhatsApp
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyPaymentLink(inv); }}
                    className="p-2 px-3 rounded-lg bg-white/5 border border-[var(--border)] text-[10px] font-[700] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/10"
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                  <div className="p-1 bg-white rounded-lg cursor-pointer hover:scale-110 transition-all shadow-sm" onClick={(e) => { e.stopPropagation(); copyPaymentLink(inv); }} title="QR for Payment">
                    <QRCodeSVG 
                      value={`${window.location.origin}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`} 
                      size={24}
                    />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}
                    className="p-2 rounded-lg bg-red-500/10 text-[var(--red)] border border-red-500/20 cursor-pointer hover:bg-red-500/20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text3)]">
                <FileText size={48} className="mb-3 opacity-20" />
                <p>Koi invoice nahi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-xl sticky top-0 h-[calc(100vh-140px)]">
        {selectedInvoice ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-[15px]">{selectedInvoice.id} Preview</h3>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setPreviewFormat('PDF')}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border transition-all",
                      previewFormat === 'PDF' ? "bg-[var(--orange)] border-[var(--orange)] text-white" : "text-[var(--text2)] border-[var(--border)] hover:bg-white/5"
                    )}
                  >
                    PDF Style
                  </button>
                  <button 
                    onClick={() => setPreviewFormat('IMG')}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border transition-all",
                      previewFormat === 'IMG' ? "bg-[var(--orange)] border-[var(--orange)] text-white" : "text-[var(--text2)] border-[var(--border)] hover:bg-white/5"
                    )}
                  >
                    Image Style
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadAsPDF} className="p-2.5 bg-[var(--orange)] text-white rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2" title="Download PDF">
                  <Download size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">PDF</span>
                </button>
                <button onClick={downloadAsImage} className="p-2.5 bg-white/5 border border-[var(--border)] rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center gap-2" title="Download Image">
                  <ImageIcon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">IMG</span>
                </button>
                <button onClick={() => window.print()} className="p-2.5 bg-white/5 border border-[var(--border)] rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                  <Printer size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/5 flex justify-center">
              <div ref={previewRef} className="w-full max-w-[450px] shadow-2xl">
                 {previewFormat === 'PDF' ? (
                   <InvoicePreviewSmall inv={selectedInvoice} shopSettings={shopSettings} />
                 ) : (
                   <InvoicePreviewImageStyle inv={selectedInvoice} shopSettings={shopSettings} />
                 )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => openShareModal(selectedInvoice)}
                  className="p-3 rounded-xl bg-white/5 border border-[var(--border)] text-[13px] font-[700] flex items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer text-[var(--text2)]"
                >
                  <Eye size={16} /> View Full
                </button>
                <button 
                  onClick={() => shareWA(selectedInvoice)}
                  className="p-3 rounded-xl bg-[#25d366] text-white text-[13px] font-[700] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-green-500/10"
                >
                  <MessageSquare size={16} fill="white" /> WhatsApp Share
                </button>
              </div>
              
              <div className="p-4 bg-white/5 border border-dashed border-[var(--border)] rounded-xl space-y-3">
                <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest">Payment Link & QR</p>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 text-[11px] font-mono text-[var(--orange)] truncate">
                      <div className="flex-1 truncate">{window.location.origin}/portal?id={selectedInvoice.docId || selectedInvoice.id}&owner={selectedInvoice.ownerUid}</div>
                      <button onClick={() => copyPaymentLink(selectedInvoice)} className="text-[var(--text2)] hover:text-white"><Copy size={14} /></button>
                    </div>
                    <p className="text-[10px] text-[var(--text3)] leading-tight">Customer can scan the QR to pay directly via the payment portal.</p>
                  </div>
                  <div className="w-20 h-20 bg-white p-1 rounded-lg shrink-0 border border-white/10 shadow-lg">
                    <QRCodeSVG 
                      value={`${window.location.origin}/portal?id=${selectedInvoice.docId || selectedInvoice.id}&owner=${selectedInvoice.ownerUid}`} 
                      size={72}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--text3)]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <FileText size={40} className="opacity-20" />
            </div>
            <h3 className="text-lg font-black text-[var(--text)]">No Invoice Selected</h3>
            <p className="max-w-[200px] mt-2 leading-relaxed">Ek invoice select karo right side se uski details dekhne ke liye.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoicePreviewImageStyle({ inv, shopSettings }: { inv: Invoice, shopSettings: ShopSettings }) {
  return (
    <div className="w-full aspect-[4/5] p-5 flex items-center justify-center font-sans bg-[#f87171] rounded-2xl overflow-hidden shadow-2xl">
      <div className="w-full h-full rounded-[30px] p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[28px] p-8 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative z-10 border border-white/40">
          <div className="w-12 h-1 rounded-full mb-8 bg-slate-100"></div>
          
          <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tight mb-8 truncate w-full">
            {shopSettings.name}
          </h2>
          
          <div className="flex flex-col items-center gap-1 mb-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable Amount</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
              {fmt(inv.total, shopSettings.currency)}
            </span>
          </div>
          
          <div className={cn(
            "px-8 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg mb-8 text-white",
            inv.status === 'Paid' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
          )}>
            {inv.status}
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="text-left border-r pr-4 border-slate-100">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Invoice #</div>
              <div className="text-[11px] font-bold text-slate-700">{inv.id}</div>
            </div>
            <div className="flex-1 flex justify-center">
               <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                 <QRCodeSVG 
                    value={`${window.location.host}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`} 
                    size={40}
                 />
               </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</div>
              <div className="text-[11px] font-bold text-slate-700">{fmtDate(inv.created)}</div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 w-full flex items-center justify-center gap-2">
            <span className="text-[9px] font-bold text-slate-300">Powered by</span>
            <div className="flex items-center gap-1 opacity-60">
              <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center text-white font-black text-[6px]">UB</div>
              <span className="font-black text-[10px] text-slate-900 leading-none tracking-tighter">my<span className="text-orange-500 italic">BillBook</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicePreviewSmall({ inv, shopSettings }: { inv: Invoice, shopSettings: ShopSettings }) {
  return (
    <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl w-full font-sans border border-slate-100 relative overflow-hidden">
      {/* Premium Header Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 to-amber-400"></div>
      
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{shopSettings.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-orange-500 px-1.5 py-0.5 bg-orange-50 rounded uppercase tracking-widest border border-orange-100">Business Invoice</span>
            <span className="text-[10px] font-bold text-slate-400">{shopSettings.owner}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice ID</div>
          <div className="text-[18px] font-black text-slate-900">#{inv.id}</div>
          <div className={cn(
            "mt-1 text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase",
            inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          )}>{inv.status}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Billed To</div>
          <div className="text-[15px] font-black text-slate-900">{inv.customerName}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">{inv.customerMobile}</div>
          <div className="text-[10px] text-slate-400 leading-relaxed mt-1 max-w-[150px]">{inv.customerAddress}</div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1 w-full">Order Details</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-[11px] font-bold">
              <span className="text-slate-400">Date</span>
              <span className="text-slate-800">{fmtDate(inv.created)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[11px] font-bold">
              <span className="text-slate-400">Due</span>
              <span className="text-slate-800">{fmtDate(inv.created)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
          <div className="col-span-2">Description</div>
          <div className="text-center">Qty / Rate</div>
          <div className="text-right">Total</div>
        </div>
        <div className="space-y-3">
          {inv.items.map((it, i) => (
            <div key={i} className="grid grid-cols-4 items-center bg-slate-50 rounded-lg p-3 group border border-transparent hover:border-slate-100 hover:bg-white transition-all">
              <div className="col-span-2">
                <div className="text-[13px] font-black text-slate-800 group-hover:text-orange-500 transition-colors">{it.serviceName}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Service Item</div>
              </div>
              <div className="text-center">
                <div className="text-[11px] font-bold text-slate-700">{it.qty}</div>
                <div className="text-[9px] text-slate-400">{fmt(it.rate, shopSettings.currency)}</div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-black text-slate-900">{fmt(it.amount, shopSettings.currency)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100 mb-8">
        <div className="w-48 space-y-2">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-slate-800">{fmt(inv.subtotal, shopSettings.currency)}</span>
          </div>
          {inv.discount > 0 && (
            <div className="flex justify-between text-[11px] font-bold text-rose-500">
              <span>Discount</span>
              <span>-{fmt(inv.discount, shopSettings.currency)}</span>
            </div>
          )}
          {inv.gst > 0 && (
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>GST ({inv.gstPct}%)</span>
              <span>+{fmt(inv.gst, shopSettings.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2 border-t border-slate-50">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">Total Payable</span>
            <span className="text-[20px] font-black text-orange-500 leading-none">{fmt(inv.total, shopSettings.currency)}</span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
            <QRCodeSVG 
              value={`${window.location.origin}/portal?id=${inv.docId || inv.id}&owner=${inv.ownerUid}`} 
              size={44}
            />
          </div>
          <div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pay Securely via UPI</div>
            <div className="text-[10px] font-bold text-slate-700">{shopSettings.upi}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">デジタル領収書</div>
          <div className="flex items-center justify-end gap-1 opacity-20">
            <div className="w-3 h-3 bg-orange-500 rounded-sm flex items-center justify-center text-white font-black text-[5px]">UB</div>
            <span className="font-black text-[8px] text-slate-900 leading-none tracking-tighter">my<span className="text-orange-500 italic">BillBook</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Settings Component ---
function Settings({ shopSettings, showToast, user, isDarkMode, setIsDarkMode, customers, services, invoices }: { shopSettings: ShopSettings, showToast: any, user: User, isDarkMode: boolean, setIsDarkMode: any, customers: Customer[], services: Service[], invoices: Invoice[] }) {
  const [formData, setFormData] = useState<ShopSettings>(shopSettings);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    setFormData(shopSettings);
  }, [shopSettings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) return showToast('Logo size 200KB se kam honi chahiye!', 'err');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', user.uid), { ...formData, ownerUid: user.uid });
      showToast('Settings saved successfully', 'ok');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `settings/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) return showToast('Sabhi fields bharein!', 'err');
    if (passwords.new !== passwords.confirm) return showToast('Password match nahi kar rahe!', 'err');
    if (passwords.new.length < 6) return showToast('Password kam se kam 6 characters ka hona chahiye!', 'err');

    setIsUpdatingPass(true);
    try {
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwords.current);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwords.new);
        showToast('Password updated successfully', 'ok');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        showToast('Email not found for this account', 'err');
      }
    } catch (err: any) {
      showToast(err.message || 'Password update failed', 'err');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const resetData = async () => {
    if (confirm('⚠️ KYA AAP SURE HAIN? Sabhi customers, services aur invoices delete ho jayenge! Yeh action wapas nahi liya ja sakta.')) {
      try {
        const collections = ['customers', 'services', 'invoices'];
        for (const col of collections) {
          const q = query(collection(db, col), where('ownerUid', '==', user.uid));
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            await deleteDoc(doc(db, col, d.id));
          }
        }
        showToast('Sabhi data delete ho gaya!', 'ok');
        window.location.reload();
      } catch (err) {
        showToast('Reset failed!', 'err');
      }
    }
  };

  const downloadBackup = () => {
    const data = {
      customers,
      services,
      invoices,
      shopSettings,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UmairBills_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup downloaded!', 'ok');
  };

  const showStats = () => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const pendingInvoices = invoices.length - paidInvoices;
    
    alert(`📊 Data Stats:\n\nTotal Customers: ${customers.length}\nTotal Services: ${services.length}\nTotal Invoices: ${invoices.length}\nTotal Sales: ${fmt(totalSales, shopSettings.currency)}\nPaid Invoices: ${paidInvoices}\nPending Invoices: ${pendingInvoices}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[var(--bg2)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex gap-3">
          <button onClick={downloadBackup} className="flex items-center gap-2 p-[10px_18px] bg-[var(--orange)] text-white rounded-xl font-bold text-[13px] shadow-lg cursor-pointer">
            <Database size={16} /> Backup Now
          </button>
          <button onClick={showStats} className="flex items-center gap-2 p-[10px_18px] bg-white/5 border border-[var(--border)] rounded-xl font-bold text-[13px] cursor-pointer">
            <TrendingUp size={16} /> Data Stats
          </button>
        </div>
        <div className="text-[11px] font-bold text-[var(--text3)] bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
          Private - No internet needed - Works offline - Only you can see it
        </div>
      </div>

      {/* Auto WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cn(
          "p-5 rounded-2xl border flex items-center justify-between",
          formData.autoWhatsApp ? "bg-[rgba(37,211,102,0.05)] border-[rgba(37,211,102,0.2)]" : "bg-white/5 border-[var(--border)]"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              formData.autoWhatsApp ? "bg-[#25d366] text-white" : "bg-white/10 text-[var(--text3)]"
            )}>
              <MessageSquare size={24} fill={formData.autoWhatsApp ? "white" : "none"} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px]">Auto WhatsApp —</h3>
                <span className={cn("text-[13px] font-black uppercase", formData.autoWhatsApp ? "text-[#25d366]" : "text-[var(--text3)]")}>
                  {formData.autoWhatsApp ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text2)] mt-0.5">
                Automatic WhatsApp message trigger.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setFormData({ ...formData, autoWhatsApp: !formData.autoWhatsApp })}
            className={cn(
              "w-14 h-7 rounded-full relative cursor-pointer",
              formData.autoWhatsApp ? "bg-[#25d366]" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 bg-white rounded-full",
              formData.autoWhatsApp ? "left-8" : "left-1"
            )} />
          </button>
        </div>

        <div className={cn(
          "p-5 rounded-2xl border flex items-center justify-between",
          formData.autoWhatsAppShare ? "bg-[rgba(245,166,35,0.05)] border-[rgba(245,166,35,0.2)]" : "bg-white/5 border-[var(--border)]"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              formData.autoWhatsAppShare ? "bg-[var(--orange)] text-white" : "bg-white/10 text-[var(--text3)]"
            )}>
              <Share2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px]">Auto Share —</h3>
                <span className={cn("text-[13px] font-black uppercase", formData.autoWhatsAppShare ? "text-[var(--orange)]" : "text-[var(--text3)]")}>
                  {formData.autoWhatsAppShare ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-[12px] text-[var(--text2)] mt-0.5">
                Automatic WhatsApp Share Dialog.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setFormData({ ...formData, autoWhatsAppShare: !formData.autoWhatsAppShare })}
            className={cn(
              "w-14 h-7 rounded-full relative cursor-pointer",
              formData.autoWhatsAppShare ? "bg-[var(--orange)]" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 bg-white rounded-full",
              formData.autoWhatsAppShare ? "left-8" : "left-1"
            )} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop Information */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-2 font-bold text-[15px]">
              <ImageIcon size={18} className="text-[var(--orange)]" /> Shop Information
            </div>
            <div className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Shop Logo</label>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] bg-white/5 flex items-center justify-center overflow-hidden relative group">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon size={32} className="text-[var(--text3)]" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 p-[8px_16px] bg-[var(--orange)] text-white rounded-lg font-bold text-[12px] cursor-pointer">
                        <Upload size={14} /> Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      {formData.logo && (
                        <button onClick={() => setFormData({ ...formData, logo: '' })} className="p-[8px_16px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold text-[12px] cursor-pointer">
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text3)]">PNG, JPG — Max 200KB — Shows on invoices</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Shop/Brand Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Owner Name</label>
                  <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">UPI ID</label>
                  <input type="text" value={formData.upi} onChange={(e) => setFormData({ ...formData, upi: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Address</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">GST Number</label>
                  <input type="text" placeholder="Optional" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Invoice Prefix</label>
                  <input type="text" value={formData.invPrefix} onChange={(e) => setFormData({ ...formData, invPrefix: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Business Category</label>
                  <select value={formData.businessCategory} onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]">
                    <option>Retail</option>
                    <option>Service</option>
                    <option>Wholesale</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Currency Symbol</label>
                  <input type="text" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Default Invoice Terms/Notes</label>
                  <textarea value={formData.invoiceTerms} onChange={(e) => setFormData({ ...formData, invoiceTerms: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-2 font-bold text-[15px]">
              <Share2 size={18} className="text-[var(--orange)]" /> Social Media Links
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">WhatsApp Number</label>
                <input type="text" placeholder="e.g. 919876543210" value={formData.whatsapp || ''} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Instagram Username</label>
                <input type="text" placeholder="e.g. umair_bills" value={formData.instagram || ''} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Facebook Page</label>
                <input type="text" placeholder="e.g. umairbills" value={formData.facebook || ''} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">WhatsApp Short Link</label>
                <input type="text" placeholder="e.g. wa.me/919140090305" value={formData.waLink || ''} onChange={(e) => setFormData({ ...formData, waLink: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider text-[var(--orange)]">App Theme (Shubh Rang)</label>
                <div className="flex gap-2 flex-wrap">
                  {(['amber', 'blue', 'rose', 'emerald', 'slate'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setFormData({ ...formData, theme: t })}
                      className={cn(
                        "flex-1 min-w-[80px] p-2.5 rounded-xl border-2 transition-all capitalize text-[11px] font-black flex items-center justify-center gap-2",
                        formData.theme === t ? "border-[var(--orange)] bg-[var(--orange)]/10 text-white" : "border-white/5 bg-white/5 text-[var(--text2)]"
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        t === 'amber' ? "bg-amber-500" : t === 'blue' ? "bg-blue-500" : t === 'rose' ? "bg-rose-500" : t === 'emerald' ? "bg-emerald-500" : "bg-slate-500"
                      )} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-2 font-bold text-[15px]">
              <Building2 size={18} className="text-[var(--orange)]" /> Bank Details
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Account Holder</label>
                <input type="text" value={formData.accName} onChange={(e) => setFormData({ ...formData, accName: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Account Number</label>
                <input type="text" value={formData.accNo} onChange={(e) => setFormData({ ...formData, accNo: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">IFSC Code</label>
                <input type="text" value={formData.ifsc} onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Bank Name</label>
                <input type="text" value={formData.bank} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
            </div>
            <div className="p-4 bg-white/5 border-t border-[var(--border)]">
              <button 
                disabled={isSaving}
                onClick={saveSettings} 
                className="w-full sm:w-auto p-[12px_32px] bg-[var(--orange)] text-white rounded-xl font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? <RefreshCw size={16} /> : <CheckCircle2 size={16} />} Save All Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-2 font-bold text-[15px]">
              <Lock size={18} className="text-[var(--orange)]" /> Change Password
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Current Password</label>
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">New Password</label>
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Confirm Password</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <button 
                disabled={isUpdatingPass}
                onClick={changePassword}
                className="w-full p-3 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white rounded-xl font-bold text-[13px] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingPass ? <RefreshCw size={16} /> : <Key size={16} />} Update Password
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-2 font-bold text-[15px]">
              <Palette size={18} className="text-[var(--orange)]" /> Appearance
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold">Theme</div>
                  <div className="text-[11px] text-[var(--text3)]">Dark / Light mode</div>
                </div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-2 p-[6px_14px] bg-white/5 border border-[var(--border)] rounded-lg text-[12px] font-bold cursor-pointer">
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} Toggle
                </button>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-red-500">Reset Data</div>
                  <div className="text-[11px] text-[var(--text3)]">Sab data delete</div>
                </div>
                <button onClick={resetData} className="flex items-center gap-2 p-[6px_14px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[12px] font-bold cursor-pointer">
                  <AlertCircle size={14} /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-5 bg-linear-to-br from-[rgba(245,166,35,0.1)] to-transparent border border-[rgba(245,166,35,0.1)] rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[var(--orange)] rounded-xl flex items-center justify-center text-white">
                <Info size={20} />
              </div>
              <h4 className="font-bold text-[14px]">Need Help?</h4>
            </div>
            <p className="text-[12px] text-[var(--text2)] leading-relaxed">
              Agar aapko app use karne mein koi dikkat aa rahi hai toh humein WhatsApp par contact karein.
            </p>
            <button 
              onClick={() => window.open(`https://wa.me/919140090305?text=${encodeURIComponent('Hello, I need help with Umair Bills app.')}`, '_blank')}
              className="mt-4 w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI Chatbot Component ---
function AIChatBot({ onClose, shopSettings, customers, services, invoices, expenses }: { onClose: () => void, shopSettings: ShopSettings, customers: Customer[], services: Service[], invoices: Invoice[], expenses: Expense[] }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: `Hello! Main Umair Bills AI Assistant hoon. Aap apne business ke baare mein kuch bhi pooch sakte hain.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = 'gemini-3-flash-preview';
      
      const context = `
        You are "Umair Bills AI", a helpful assistant for a business owner named ${shopSettings.owner}.
        Business Name: ${shopSettings.name}
        Category: ${shopSettings.businessCategory}
        WhatsApp Support: ${shopSettings.waLink || 'Not set'}
        
        Business Data Summary:
        - Total Customers: ${customers.length}
        - Total Services: ${services.length}
        - Total Invoices: ${invoices.length}
        - Total Expenses: ${expenses.length}
        - Total Revenue: ${shopSettings.currency} ${invoices.reduce((a, b) => a + b.total, 0)}
        - Total Spending: ${shopSettings.currency} ${expenses.reduce((a, b) => a + b.amount, 0)}
        
        Top Services: ${services.slice(0, 3).map(s => s.name).join(', ')}
        Recent Invoices: ${invoices.slice(0, 3).map(i => `${i.customerName} (${shopSettings.currency}${i.total})`).join(', ')}
        
        Answer questions in a mix of Hindi and English (Hinglish) as the user is from India.
        Be professional, concise, and helpful. If asked about data you don't have, politely say you don't know.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      });

      const botText = response.text || "Maaf kijiye, main samajh nahi paaya. Phir se koshish karein.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: "Network error! Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <div className="font-bold text-[14px]">Umair Bills AI</div>
            <div className="text-[10px] opacity-80 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg)]">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl text-[13px] leading-relaxed",
              m.role === 'user' 
                ? "bg-[var(--orange)] text-white rounded-tr-none" 
                : "bg-white/5 border border-[var(--border)] text-[var(--text)] rounded-tl-none"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-[var(--border)] p-3 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="relative flex items-center gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Kuch bhi poochein..."
            className="flex-1 bg-white/5 border border-[var(--border)] rounded-xl p-3 pr-12 text-[13px] outline-none focus:border-[var(--orange)] transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-[var(--orange)] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-[9px] text-[var(--text3)] text-center flex items-center justify-center gap-1">
          <Sparkles size={10} /> Powered by Gemini AI
        </div>
      </div>
    </div>
  );
}
