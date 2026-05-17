import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  MessageSquare, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone,
  ExternalLink,
  ChevronLeft,
  AlertCircle,
  Search,
  LayoutDashboard,
  ShoppingBag,
  User as UserIcon,
  ShieldCheck,
  Award,
  Eye,
  X,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { db, doc, getDoc, handleFirestoreError, OperationType, collection, query, where, getDocs } from '../firebase';
import { jsPDF } from 'jspdf';

interface PortalData {
  t: 'v' | 'c'; // view single or customer history
  c: [string, string, string]; // name, mobile, address
  s: [string, string, string, string, string, string, string, string, string]; // shop name, phone, address, upi, gst, accNo, ifsc, bank, accName
  v?: any; // single invoice
  i?: any[]; // multiple invoices
}

export default function CustomerPortal() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  const [search, setSearch] = useState('');

  useEffect(() => {
    const invId = searchParams.get('id');
    const ownerUid = searchParams.get('owner');
    const encoded = searchParams.get('d');

    const fetchData = async () => {
      setLoading(true);
      try {
        if (invId && ownerUid) {
          // Fetch from Firestore
          const invRef = doc(db, 'invoices', invId);
          const invSnap = await getDoc(invRef);
          
          if (invSnap.exists()) {
            const invData = invSnap.data() as any;
            
            // Fetch Shop Settings
            let shopSettings: any = {
              name: 'Umair Bills',
              owner: '',
              phone: '',
              address: '',
              upi: '',
              gst: '',
              accNo: '',
              ifsc: '',
              bank: '',
              accName: ''
            };
            
            try {
              const settingsRef = doc(db, 'settings', ownerUid);
              const settingsSnap = await getDoc(settingsRef);
              if (settingsSnap.exists()) {
                shopSettings = { ...shopSettings, ...settingsSnap.data() };
              }
            } catch (settErr) {
              console.warn('Could not fetch settings:', settErr);
            }

            // Fetch other invoices for this customer (optional history)
            let history: any[] = [];
            try {
              if (invData.customerMobile) {
                const q = query(
                  collection(db, 'invoices'), 
                  where('ownerUid', '==', ownerUid),
                  where('customerMobile', '==', invData.customerMobile)
                );
                const historySnap = await getDocs(q);
                history = historySnap.docs.map(d => ({ ...d.data(), id: d.id }));
              }
            } catch (histErr) {
              console.warn('Could not fetch customer history:', histErr);
            }

            const payload = {
              t: 'c', // Always treat as customer view to show history
              c: [invData.customerName || 'Customer', invData.customerMobile || '', invData.customerAddress || ''],
              s: [
                shopSettings.name || 'Umair Bills',
                shopSettings.phone || '',
                shopSettings.address || '',
                shopSettings.upi || '',
                shopSettings.gst || '',
                shopSettings.accNo || '',
                shopSettings.ifsc || '',
                shopSettings.bank || '',
                shopSettings.accName || ''
              ],
              v: invData,
              i: history.length > 0 ? history : [invData]
            };
            setData(payload);
            setSelectedInv(invData);
            setLoading(false);
            return;
          }
        }

        if (encoded) {
          const decodeB64Url = (str: string) => {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) str += '=';
            return decodeURIComponent(escape(atob(str)));
          };

          const payload = JSON.parse(decodeB64Url(encoded));
          setData(payload);
          
          if (payload.t === 'v' && payload.v) {
            setSelectedInv(unpackInvoice(payload.v));
          } else if (payload.i && payload.i.length > 0) {
            setSelectedInv(unpackInvoice(payload.i[0]));
          }
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (e) {
        console.error('Fetch error:', e);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const unpackInvoice = (inv: any) => {
    if (Array.isArray(inv)) {
      return {
        id: inv[0],
        items: (inv[1] || []).map((it: any) => ({ name: it[0], qty: it[1], rate: it[2], amount: it[3] })),
        subtotal: inv[2],
        discount: inv[3],
        gst: inv[4],
        gstPct: inv[5],
        total: inv[6],
        payMode: inv[7],
        status: inv[8],
        created: inv[9]
      };
    }
    return inv;
  };

  const fmt = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center">
        <div className="w-14 h-14 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <svg width="26" height="26" viewBox="0 0 32 32">
            <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
            <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
            <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
          </svg>
        </div>
        <p className="text-[14px] font-[600] text-[var(--text2)]">Loading your invoices...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-8 text-center">
        <div className="text-[56px] mb-4">🔒</div>
        <h2 className="text-[22px] font-bold mb-2">Invalid Link</h2>
        <p className="text-[var(--text2)] text-[14px] leading-relaxed mb-5">This link is invalid or expired.<br />Ask the shop to send you a fresh link.</p>
        <Link to="/" className="bg-[var(--orange)] text-white px-7 py-3 rounded-xl font-bold text-[14px] no-underline">Go to Umair Bills →</Link>
      </div>
    );
  }

  const shop = {
    name: data.s[0],
    phone: data.s[1],
    address: data.s[2],
    upi: data.s[3],
    gst: data.s[4],
    accNo: data.s[5],
    ifsc: data.s[6],
    bank: data.s[7],
    accName: data.s[8]
  };

  const customer = {
    name: data.c[0],
    phone: data.c[1],
    address: data.c[2]
  };

  const invoices = data.t === 'c' ? (data.i || []).map(unpackInvoice) : [selectedInv];
  const filteredInvoices = invoices.filter((inv: any) => inv.id.toLowerCase().includes(search.toLowerCase()));

  const downloadPDF = async () => {
    const element = document.getElementById('invoice-card');
    if (!element) return;
    
    // Ensure the element is fully visible for capture
    const originalStyle = element.style.cssText;
    element.style.width = '800px'; // Fixed width for consistent PDF quality
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 3, // Higher scale for better quality
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Invoice_${selectedInv.id}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      element.style.cssText = originalStyle;
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div className="font-black text-sm truncate uppercase tracking-tight">{shop.name}</div>
          </div>
          
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm">
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 font-bold text-sm transition-colors">
              <ShoppingBag size={18} /> Shop More
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 font-bold text-sm transition-colors">
              <UserIcon size={18} /> My Profile
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Powered by
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white font-black text-[10px]">UB</div>
            <span className="font-black text-sm text-white">Umair Bills</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
              <ShieldCheck size={14} className="text-green-500" /> 100% SECURE
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
              <Award size={14} className="text-blue-500" /> ISO CERTIFIED
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-sm">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-black text-slate-800 text-sm truncate max-w-[120px]">{shop.name}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500"><Search size={20} /></button>
            <button className="p-2 text-slate-500"><UserIcon size={20} /></button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Voucher History Sidebar */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search invoice..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              <div className="p-4 flex items-center justify-between bg-slate-50/50">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Voucher History</span>
                <span className="text-[10px] font-bold text-slate-400">Login to view all</span>
              </div>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedInv(inv)}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:bg-slate-50 flex justify-between items-center group",
                      selectedInv?.id === inv.id ? "bg-orange-50 border-r-4 border-orange-500" : ""
                    )}
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors">{inv.id}</div>
                      <div className="text-[11px] text-slate-400 font-bold">{fmtDate(inv.created)}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-black text-slate-800">{fmt(inv.total)}</div>
                      <div className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block",
                        inv.status === 'Paid' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {inv.status === 'Paid' ? 'Paid' : 'Unpaid'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 text-sm font-bold flex flex-col items-center gap-3">
                  <FileText size={32} className="opacity-20" />
                  No invoices found
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 bg-slate-50 overflow-y-auto relative">
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
              {/* Top Bar with Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <button onClick={() => window.history.back()} className="p-2 text-slate-400 hover:text-slate-600 md:hidden">
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-800">Sales Invoice #{selectedInv.id}</h2>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                        selectedInv.status === 'Paid' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {selectedInv.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400">Invoice Amount: <span className="text-slate-800">{fmt(selectedInv.total)}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={printInvoice} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all cursor-pointer">
                    <Printer size={18} /> <span className="hidden sm:inline">Print</span>
                  </button>
                  <button onClick={downloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all cursor-pointer">
                    <Download size={18} /> <span className="hidden sm:inline">Download</span>
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 cursor-pointer">
                    Login
                  </button>
                </div>
              </div>

              {/* Professional Invoice Card */}
              <div id="invoice-card" className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{shop.name}</h1>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-500 font-bold flex items-center gap-2"><MapPin size={14} /> {shop.address}</p>
                          <p className="text-sm text-slate-500 font-bold flex items-center gap-2"><Phone size={14} /> {shop.phone}</p>
                          {shop.gst && <p className="text-sm text-slate-500 font-bold">GSTIN: {shop.gst}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-4 w-full md:w-auto">
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-5xl font-black text-slate-100 uppercase tracking-tighter leading-none">Bill of Supply</div>
                        <div className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded uppercase tracking-wider">Original for Recipient</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Invoice No.</div>
                        <div className="text-xl font-black text-slate-900">{selectedInv.id}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-right">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</div>
                          <div className="text-sm font-bold text-slate-800">{fmtDate(selectedInv.created)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</div>
                          <div className="text-sm font-bold text-slate-800">{fmtDate(selectedInv.created)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To</div>
                      <div className="text-lg font-black text-slate-900">{customer.name}</div>
                      <div className="space-y-1 text-sm text-slate-500 font-bold">
                        <p>{customer.address}</p>
                        <p>Mobile: {customer.phone}</p>
                        {selectedInv.customerEmail && <p>Email: {selectedInv.customerEmail}</p>}
                        <p>Place of Supply: Uttar Pradesh</p>
                      </div>
                    </div>
                    <div className="space-y-3 md:text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ship To</div>
                      <div className="text-lg font-black text-slate-900">{customer.name}</div>
                      <div className="space-y-1 text-sm text-slate-500 font-bold">
                        <p>{customer.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto mb-12">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">No</th>
                          <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                          <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Qty.</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Rate</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedInv.items.map((it: any, i: number) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 text-sm font-bold text-slate-400">{i + 1}</td>
                            <td className="py-5">
                              <div className="text-sm font-black text-slate-800">{it.name}</div>
                            </td>
                            <td className="py-5 text-center text-sm font-bold text-slate-600">{it.qty} PCS</td>
                            <td className="py-5 text-right text-sm font-bold text-slate-600">{it.rate}</td>
                            <td className="py-5 text-right text-sm font-black text-slate-800">{it.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-8 border-t-2 border-slate-100">
                    <div className="flex-1 space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-xs font-bold text-slate-600 italic">1. Goods once sold will not be taken back or exchanged.</p>
                      </div>
                    </div>
                    <div className="w-full md:w-80 space-y-4">
                      <div className="flex justify-between items-center text-sm font-black text-slate-800">
                        <span className="uppercase tracking-widest text-[10px] text-slate-400">Subtotal</span>
                        <span>₹ {selectedInv.subtotal}</span>
                      </div>
                      {((selectedInv.discountAmount || selectedInv.discount) > 0) && (
                        <div className="flex justify-between items-center text-sm font-black text-red-500">
                          <span className="uppercase tracking-widest text-[10px]">Discount</span>
                          <span>- ₹ {selectedInv.discountAmount || selectedInv.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t-2 border-slate-100">
                        <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900">₹ {selectedInv.total}</span>
                          {selectedInv.status === 'Paid' && (
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase rounded shadow-sm">Fully Paid</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Banner */}
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xs">UB</div>
                  <div>
                    <div className="text-sm font-black">Create similar invoices using <span className="text-orange-500">Umair Bills</span></div>
                    <p className="text-[10px] text-slate-400 font-bold">India's #1 Free Billing Software</p>
                  </div>
                </div>
                <Link to="/" className="w-full md:w-auto px-6 py-2 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-all text-center">
                  Try Now
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

          {/* Mobile Detail View (Overlay) */}
          {selectedInv && (
            <div className="fixed inset-0 z-[400] bg-slate-50 md:hidden flex flex-col">
              <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                {data.t === 'c' && (
                  <button onClick={() => setSelectedInv(null)} className="p-2 text-slate-500">
                    <ChevronLeft size={24} />
                  </button>
                )}
                <span className="font-black text-slate-800">Invoice {selectedInv.id}</span>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex gap-2">
                  <button onClick={printInvoice} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
                  <button onClick={downloadPDF} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Download size={18} /> PDF</button>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-400 uppercase">Invoice</div>
                        <div className="text-lg font-black text-slate-800">#{selectedInv.id}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xl font-black text-slate-900">{shop.name}</div>
                      <p className="text-xs text-slate-500 font-bold">{shop.address}</p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Bill To</span>
                        <span className="text-sm font-black text-slate-800">{customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                        <span className="text-sm font-black text-slate-800">{fmtDate(selectedInv.created)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                        <span className={cn("text-sm font-black", selectedInv.status === 'Paid' ? "text-green-600" : "text-red-600")}>{selectedInv.status}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedInv.items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-black text-slate-800">{it.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{it.qty} x {fmt(it.rate)}</div>
                          </div>
                          <div className="text-sm font-black text-slate-800">{fmt(it.amount)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Subtotal</span>
                        <span>{fmt(selectedInv.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-slate-900">
                        <span>Total</span>
                        <span className="text-orange-500">{fmt(selectedInv.total)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 rounded-2xl">
                      <div className="w-32 h-32 p-1 bg-white rounded-xl border border-slate-200">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${shop.upi}&pn=${encodeURIComponent(shop.name)}&am=${selectedInv.total}&cu=INR`)}`} 
                          alt="UPI QR" 
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-800">{shop.upi}</p>
                        <p className="text-[10px] font-bold text-slate-400">Scan to Pay via UPI</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {selectedInv.status === 'Pending' && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <button 
                    onClick={() => window.location.href = `upi://pay?pa=${shop.upi}&pn=${encodeURIComponent(shop.name)}&am=${selectedInv.total}&cu=INR&tn=${encodeURIComponent(`Invoice ${selectedInv.id}`)}`}
                    className="w-full py-4 bg-orange-500 text-white font-black rounded-xl shadow-lg"
                  >
                    📲 Pay Now — {fmt(selectedInv.total)}
                  </button>
                </div>
              )}
            </div>
      )}
    </div>
  );
}
