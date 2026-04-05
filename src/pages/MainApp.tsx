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
  Clock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gst: number;
  gstPct: number;
  total: number;
  payMode: string;
  status: 'Paid' | 'Pending';
  created: string;
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
  socialWhatsapp: string;
  socialInstagram: string;
  socialFacebook: string;
  businessCategory: string;
  invoiceTerms: string;
  currency: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // App State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
    socialWhatsapp: '',
    socialInstagram: '',
    socialFacebook: '',
    businessCategory: 'Retail',
    invoiceTerms: 'Thank you for your business!',
    currency: '₹'
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

      return () => {
        unsubCustomers();
        unsubServices();
        unsubInvoices();
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
    { id: 'billing', label: 'Billing / Invoice', icon: <FileText size={18} />, section: 'Billing' },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} />, section: 'Billing' },
    { id: 'pos', label: 'POS Billing', icon: <Monitor size={18} />, section: 'Billing' },
    { id: 'customers', label: 'Customers', icon: <Users size={18} />, section: 'Business' },
    { id: 'services', label: 'Services', icon: <Wrench size={18} />, section: 'Business' },
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={18} />, section: 'Business' },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign size={18} />, section: 'Finance' },
    { id: 'cashbank', label: 'Cash & Bank', icon: <Building2 size={18} />, section: 'Finance' },
    { id: 'purchases', label: 'Purchases', icon: <ShoppingCart size={18} />, section: 'Finance' },
    { id: 'inventory', label: 'Inventory', icon: <Box size={18} />, section: 'Finance' },
    { id: 'reports', label: 'Reports', icon: <TrendingUp size={18} />, section: 'Reports & Tools' },
    { id: 'staff', label: 'Staff & Payroll', icon: <UserSquare2 size={18} />, section: 'Reports & Tools' },
    { id: 'sms', label: 'WhatsApp / SMS', icon: <MessageSquare size={18} />, section: 'Reports & Tools' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} />, section: 'Account' },
    { id: 'backup', label: 'Backup', icon: <Database size={18} />, section: 'Account' },
  ];

  const sections = [...new Set(navItems.map(item => item.section))];

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
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
        <div className="p-[16px_14px_14px] border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-lg flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(245,166,35,0.3)]">
              <svg width="20" height="20" viewBox="0 0 32 32">
                <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
                <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
                <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
              </svg>
            </div>
            <div>
              <div className="font-display text-[15px] font-[800]">Umair <b className="text-[var(--orange)]">Bills</b></div>
              <div className="text-[10px] text-[var(--text2)] mt-px">Billing App</div>
            </div>
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
        <main className="p-6 flex-1">
          <div>
            {activeTab === 'dashboard' && <Dashboard setTab={setActiveTab} invoices={invoices} customers={customers} shopSettings={shopSettings} openShareModal={openShareModal} />}
            {activeTab === 'billing' && <Billing invoices={invoices} customers={customers} services={services} shopSettings={shopSettings} showToast={showToast} openShareModal={openShareModal} user={user} />}
            {activeTab === 'customers' && <Customers customers={customers} invoices={invoices} showToast={showToast} user={user} openAddModal={() => setModal({ open: true, title: 'Add New Customer', content: <AddCustomerModal showToast={showToast} user={user} closeModal={closeModal} /> })} />}
            {activeTab === 'services' && <Services services={services} showToast={showToast} user={user} shopSettings={shopSettings} openAddModal={() => setModal({ open: true, title: 'Add New Service', content: <AddServiceModal showToast={showToast} user={user} closeModal={closeModal} /> })} />}
            {activeTab === 'settings' && <Settings shopSettings={shopSettings} showToast={showToast} user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} customers={customers} services={services} invoices={invoices} />}
            
            {!['dashboard', 'billing', 'customers', 'services', 'settings'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text2)]">
                <AlertCircle size={48} className="mb-3 opacity-20" />
                <h3 className="text-lg font-bold">{navItems.find(i => i.id === activeTab)?.label}</h3>
                <p className="mt-2">Jaldi aa raha hai! Yeh feature abhi development mein hai.</p>
              </div>
            )}
          </div>
        </main>
      </div>

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
  const [address, setAddress] = useState('');

  const save = async () => {
    if (!name || !mobile) return showToast('Name aur Mobile zaroori hain!', 'err');
    try {
      const id = 'C' + Date.now().toString().slice(-6);
      await setDoc(doc(db, 'customers', id), { id, name, mobile, address, ownerUid: user.uid });
      showToast('Customer added successfully', 'ok');
      closeModal();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customers');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Mobile *</label>
        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)] h-20" />
      </div>
      <button onClick={save} className="w-full bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white py-4 rounded-xl font-bold text-[15px] shadow-lg mt-4 cursor-pointer">Add Customer</button>
    </div>
  );
}

// --- Add Service Modal ---
function AddServiceModal({ showToast, user, closeModal }: { showToast: any, user: User, closeModal: any }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState('Service');

  const save = async () => {
    if (!name || !price) return showToast('Name aur Price zaroori hain!', 'err');
    try {
      const id = 'S' + Date.now().toString().slice(-6);
      await setDoc(doc(db, 'services', id), { id, name, price: parseFloat(price), cat, ownerUid: user.uid });
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
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Price (₹) *</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-[600] text-[var(--text2)] uppercase tracking-wider">Category</label>
        <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
      </div>
      <button onClick={save} className="w-full bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white py-4 rounded-xl font-bold text-[15px] shadow-lg mt-4 cursor-pointer">Add Service</button>
    </div>
  );
}
function ShareModalContent({ inv, shopSettings, showToast, closeModal }: { inv: Invoice, shopSettings: ShopSettings, showToast: any, closeModal: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [view, setView] = useState<'ready' | 'preview'>('ready');
  const [waNumber, setWaNumber] = useState(inv.customerMobile);

  const getPortalLink = () => {
    const base = window.location.origin;
    return `${base}/portal?id=${inv.id}&owner=${inv.ownerUid}`;
  };

  const portalLink = getPortalLink();

  const generatePreview = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);
      return url;
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
    const msg = `Hello *${inv.customerName}*\n\nYour invoice is ready.\n\nInvoice Number: *#${inv.id}*\nTotal Amount: *${fmt(inv.total, shopSettings.currency)}*\n\nView Invoice:\n${portalLink}`;
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
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-[#f5a623]">
            <div>
              <div className="text-3xl font-black" style={{ color: '#f5a623' }}>{shopSettings.name}</div>
              <div className="text-sm font-bold text-gray-500">{shopSettings.owner}</div>
              <div className="text-xs text-gray-400 mt-2">📞 {shopSettings.phone}</div>
              <div className="text-xs text-gray-400">📍 {shopSettings.address}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-gray-200 mb-2"># {inv.id}</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-50 text-[#ea580c] text-xs font-bold border border-orange-100">
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

          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setView('ready')} className="p-3 bg-white/5 border border-white/10 text-[var(--text2)] rounded-xl font-bold text-[13px] flex items-center justify-center cursor-pointer">
              <X size={18} />
            </button>
            <button onClick={downloadPDF} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer">
              <Download size={18} /> PDF
            </button>
            <button onClick={printInvoice} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer">
              <Printer size={18} /> Print
            </button>
            <button onClick={shareWA} className="col-span-1 p-3 bg-[#25d366] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer">
              <MessageSquare size={18} fill="white" /> WhatsApp
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

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setView('preview')} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <Eye size={16} /> View
              </button>
              <button onClick={downloadPDF} className="p-3 bg-white/5 border border-white/10 text-[var(--text)] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10">
                <Download size={16} /> PDF
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
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

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
        <div className="p-4 border-b border-[var(--border)] bg-white/5">
          <div className="flex items-center bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] gap-2 max-w-md">
            <Search size={16} className="text-[var(--text2)]" />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              className="bg-transparent border-none outline-none text-[14px] text-[var(--text)] w-full font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Type</th>
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
                  <td className="p-4 font-mono text-[var(--text2)]">{c.mobile}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      c.type === 'VIP' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                    )}>{c.type}</span>
                  </td>
                  <td className="p-4 font-bold">{invoices.filter(inv => inv.customerMobile === c.mobile).length}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className="p-2 text-[var(--text2)] hover:text-[var(--orange)] cursor-pointer"><SettingsIcon size={16} /></button>
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
  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase()));

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
        <div className="p-4 border-b border-[var(--border)] bg-white/5">
          <div className="flex items-center bg-[var(--bg3)] border border-[var(--border)] rounded-lg p-[8px_14px] gap-2 max-w-md">
            <Search size={16} className="text-[var(--text2)]" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="bg-transparent border-none outline-none text-[14px] text-[var(--text)] w-full font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="p-4 pl-6">Service Name</th>
                <th className="p-4">Category</th>
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
                  <td className="p-4 font-bold text-[var(--orange)]">{fmt(s.price, shopSettings.currency)}</td>
                  <td className="p-4 text-[var(--text3)] uppercase text-[11px] font-bold">{s.unit}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className="p-2 text-[var(--text2)] hover:text-[var(--orange)] cursor-pointer"><SettingsIcon size={16} /></button>
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
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[var(--dark)]">
      <div className="hidden md:flex flex-col items-center justify-center p-12 bg-linear-to-br from-[#090b12] via-[#111628] to-[#0d1020] border-r border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-[-150px] right-[-150px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_65%)] pointer-events-none"></div>
        <div className="text-center mb-12 relative">
          <div className="w-20 h-20 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-[22px] inline-flex items-center justify-center mb-5 shadow-[0_16px_48px_rgba(245,166,35,0.35)]">
            <svg width="44" height="44" viewBox="0 0 48 48">
              <rect x="4" y="18" width="40" height="20" rx="5" fill="rgba(255,255,255,0.95)" />
              <rect x="12" y="6" width="24" height="16" rx="3" fill="rgba(255,255,255,0.7)" />
              <rect x="14" y="28" width="20" height="3" rx="1.5" fill="#f5a623" />
              <rect x="14" y="34" width="14" height="3" rx="1.5" fill="#f5a623" opacity="0.6" />
              <circle cx="37" cy="25" r="3" fill="#f5a623" />
            </svg>
          </div>
          <h1 className="text-[38px] font-[900] text-white tracking-[-1.5px] leading-none">Umair <b className="text-[var(--orange)]">Bills</b></h1>
          <p className="text-white/40 text-[14px] mt-2">India ka Smart Billing App</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {[
            { icon: "🧾", title: "Instant Invoice", desc: "8 second mein bill ready" },
            { icon: "💬", title: "WhatsApp Auto Send", desc: "Customer ko turant bhejo" },
            { icon: "📱", title: "UPI QR Code", desc: "Scan karke instant payment" },
            { icon: "📊", title: "Reports & Analytics", desc: "Sales, expenses, profit sab" }
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 p-[13px_16px] bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[22px] shrink-0">{f.icon}</span>
              <div>
                <h4 className="text-[13px] font-[600] text-white">{f.title}</h4>
                <p className="text-[11px] text-white/40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-12 bg-[var(--bg2)]">
        <div className="w-full max-w-[400px] text-center">
          <div className="mb-8">
            <h2 className="text-[32px] font-[900] mb-2">Swagat Hai! 👋</h2>
            <p className="text-[15px] text-[var(--text2)]">Apne account mein login karein shuru karne ke liye.</p>
          </div>
          
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold text-[16px] shadow-xl cursor-pointer"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Continue with Google
          </button>
          
          <p className="mt-8 text-[11px] text-[var(--text3)] max-w-[280px] mx-auto leading-relaxed">
            By continuing, you agree to our <span className="text-[var(--orange)]">Terms of Service</span> and <span className="text-[var(--orange)]">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
function Dashboard({ setTab, invoices, customers, shopSettings, openShareModal }: { setTab: (t: string) => void, invoices: Invoice[], customers: Customer[], shopSettings: ShopSettings, openShareModal: any }) {
  const todayStr = today();
  const month = todayStr.slice(0, 7);
  const todaySales = invoices.filter(i => i.created === todayStr).reduce((a, b) => a + b.total, 0);
  const monthSales = invoices.filter(i => i.created?.startsWith(month)).reduce((a, b) => a + b.total, 0);
  const unpaidAmt = invoices.filter(i => i.status === 'Pending').reduce((a, b) => a + b.total, 0);
  const pendingOrders = 0; // Mock

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-[800]">Namaste {shopSettings.owner}! 👋</h2>
          <p className="text-[13px] text-[var(--text2)]">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => setTab('billing')} className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white px-5 py-2.5 rounded-lg text-[13px] font-[600] shadow-lg cursor-pointer">🧾 New Invoice</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard color="orange" icon="💰" val={fmt(todaySales, shopSettings.currency)} label="Aaj ki Sales" />
        <StatCard color="green" icon="📅" val={fmt(monthSales, shopSettings.currency)} label="Is Mahine ki Sales" />
        <StatCard color="blue" icon="⏳" val={fmt(unpaidAmt, shopSettings.currency)} label="Unpaid Amount" />
        <StatCard color="red" icon="📋" val={String(pendingOrders)} label="Pending Orders" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h3 className="font-display text-[15px] font-[700] mb-4">📊 Sales Overview</h3>
          <div className="h-[200px] flex items-center justify-center text-[var(--text3)]">
            Chart Placeholder (Chart.js integration)
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h3 className="font-display text-[15px] font-[700] mb-4">💡 Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setTab('billing')} className="w-full p-3 rounded-xl bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-[600] text-[13px] cursor-pointer">🧾 New Invoice Banao</button>
            <button onClick={() => setTab('customers')} className="w-full p-3 rounded-xl bg-[rgba(34,197,94,0.12)] text-[var(--green)] border border-[rgba(34,197,94,0.25)] font-[600] text-[13px] cursor-pointer">👥 Customer Add Karo</button>
            <button onClick={() => setTab('orders')} className="w-full p-3 rounded-xl bg-[rgba(59,130,246,0.12)] text-[var(--blue)] border border-[rgba(59,130,246,0.25)] font-[600] text-[13px] cursor-pointer">📋 Orders Dekho</button>
            <button onClick={() => setTab('reports')} className="w-full p-3 rounded-xl bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] font-[600] text-[13px] cursor-pointer">📈 Reports Dekho</button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h3 className="font-display text-[15px] font-[700] mb-4">🧾 Recent Invoices</h3>
          <div className="divide-y divide-[var(--border)]">
            {invoices.slice(-5).reverse().map((inv, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-[13px] font-[600]">{inv.customerName}</div>
                  <div className="text-[11px] text-[var(--text2)]">{inv.id} · {fmtDate(inv.created)}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-[14px] font-[700] text-[var(--orange)]">{fmt(inv.total, shopSettings.currency)}</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-[700] px-2 py-0.5 rounded-full",
                      inv.status === 'Paid' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                    )}>{inv.status}</span>
                    <button onClick={() => openShareModal(inv)} className="p-1 text-[var(--text2)] hover:text-[var(--orange)] cursor-pointer" title="View Invoice">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="py-10 text-center text-[var(--text3)]">Koi invoice nahi</p>}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h3 className="font-display text-[15px] font-[700] mb-4">📦 Pending Orders</h3>
          <div className="flex flex-col items-center justify-center py-10 text-[var(--green)]">
            <CheckCircle2 size={32} className="mb-2 opacity-40" />
            <p className="text-[13px]">✅ Sab kuch deliver ho gaya!</p>
          </div>
        </div>
      </div>
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

  const subtotal = items.reduce((a, b) => a + b.amount, 0);
  const gstAmt = (subtotal - discount) * (gstPct / 100);
  const total = subtotal - discount + gstAmt;

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

      const invId = `${shopSettings.invPrefix}${String(nextNum).padStart(3, '0')}`;
      const newInv: Invoice = {
        id: invId,
        customerId: selectedCust,
        customerName: cust.name,
        customerMobile: cust.mobile,
        customerAddress: cust.address,
        items: validItems,
        subtotal,
        discount,
        gst: gstAmt,
        gstPct,
        total,
        payMode,
        status,
        created: date,
        ownerUid: user.uid
      };

      await setDoc(doc(db, 'invoices', invId), newInv);
      
      setItems([{ serviceId: '', serviceName: '', qty: 1, rate: 0, amount: 0 }]);
      showToast(`✅ Invoice ban gayi: ${newInv.id}`, 'ok');
      setIsGenerating(false);

      // Smart Share Logic
      openShareModal(newInv);
    } catch (err) {
      setIsGenerating(false);
      handleFirestoreError(err, OperationType.WRITE, 'invoices');
    }
  };

  const deleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
        showToast('Invoice deleted', 'ok');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
      }
    }
  };

  const shareWA = (inv: Invoice) => {
    const portalLink = `${window.location.origin}/portal?id=${inv.id}&owner=${inv.ownerUid}`;
    const msg = `Hello *${inv.customerName}*\n\nYour invoice is ready.\n\nInvoice Number: *#${inv.id}*\nTotal Amount: *${fmt(inv.total, shopSettings.currency)}*\n\nView Invoice:\n${portalLink}`;
    window.open(`https://wa.me/91${inv.customerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
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
          {invoices.slice().reverse().slice(0, 15).map((inv, i) => (
            <div key={i} className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 space-y-3">
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
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => openShareModal(inv)}
                  className="flex-1 min-w-[80px] p-2 rounded-lg bg-[rgba(59,130,246,0.12)] text-[var(--blue)] border border-[rgba(59,130,246,0.25)] text-[11px] font-[600] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={14} /> View
                </button>
                <button 
                  onClick={() => openShareModal(inv)}
                  className="flex-1 min-w-[80px] p-2 rounded-lg bg-white/5 border border-[var(--border)] text-[11px] font-[600] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> PDF
                </button>
                <button 
                  onClick={() => openShareModal(inv)}
                  className="flex-1 min-w-[80px] p-2 rounded-lg bg-white/5 border border-[var(--border)] text-[11px] font-[600] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
                <button 
                  onClick={() => shareWA(inv)}
                  className="flex-[2] min-w-[120px] p-2 rounded-lg bg-[#25d366] text-white text-[11px] font-[700] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={14} fill="white" /> WhatsApp
                </button>
                <button 
                  onClick={() => deleteInvoice(inv.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-[var(--red)] border border-red-500/20 cursor-pointer"
                >
                  <Trash2 size={14} />
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
              {formData.autoWhatsApp ? 'Har bill banne ke baad automatic WhatsApp bhej diya jayega.' : 'OFF hai — har baar manually bhejni padegi'}
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
                <input type="text" placeholder="e.g. 919876543210" value={formData.socialWhatsapp} onChange={(e) => setFormData({ ...formData, socialWhatsapp: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Instagram Username</label>
                <input type="text" placeholder="e.g. umair_bills" value={formData.socialInstagram} onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text3)] uppercase tracking-wider">Facebook Page</label>
                <input type="text" placeholder="e.g. umairbills" value={formData.socialFacebook} onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })} className="w-full p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[14px] outline-none focus:border-[var(--orange)]" />
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
