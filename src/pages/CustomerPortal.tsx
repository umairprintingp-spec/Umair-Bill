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
  Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { db, doc, getDoc, handleFirestoreError, OperationType } from '../firebase';
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
            const invData = invSnap.data();
            
            // Fetch Shop Settings
            const settingsRef = doc(db, 'settings', ownerUid);
            const settingsSnap = await getDoc(settingsRef);
            const shopSettings = settingsSnap.exists() ? settingsSnap.data() : {};

            const payload = {
              t: 'v',
              c: [invData.customerName, invData.customerMobile, invData.customerAddress],
              s: [shopSettings.name, shopSettings.phone, shopSettings.address, shopSettings.upi, shopSettings.gst, shopSettings.accNo, shopSettings.ifsc, shopSettings.bank, shopSettings.accName],
              v: invData
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
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-200">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div className="font-black text-slate-800 truncate">{shop.name}</div>
          </div>
          
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 font-bold text-sm">
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-bold text-sm transition-colors">
              <ShoppingBag size={18} /> Shop More
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 font-bold text-sm transition-colors">
              <UserIcon size={18} /> My Profile
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Powered by
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white font-black text-[10px]">UB</div>
            <span className="font-black text-sm text-slate-800">Umair Bills</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <ShieldCheck size={14} className="text-green-500" /> 100% SECURE
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
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
          <button className="p-2 text-slate-500"><UserIcon size={20} /></button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Invoice List - Only shown if view type is 'c' (customer history) */}
          {data.t === 'c' && (
            <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search invoice by ID..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedInv(inv)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:bg-slate-50 flex justify-between items-center",
                        selectedInv?.id === inv.id ? "bg-orange-50/50 border-r-4 border-orange-500" : ""
                      )}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-800">{inv.id}</div>
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
                  <div className="p-8 text-center text-slate-400 text-sm font-bold">
                    No invoices found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice View */}
          <main className={cn(
            "flex-1 bg-slate-50 overflow-y-auto p-4 md:p-8 hidden md:block",
            data.t === 'v' ? "md:flex md:items-center md:justify-center" : ""
          )}>
            {!selectedInv ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Eye size={48} className="mb-4 opacity-20" />
                <p className="font-bold">Select an invoice to view details</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      selectedInv.status === 'Paid' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {selectedInv.status === 'Paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">Invoice {selectedInv.id}</div>
                      <div className="text-xs font-bold text-slate-400">{selectedInv.status}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={printInvoice} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"><Printer size={18} /></button>
                    <button onClick={downloadPDF} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"><Download size={18} /></button>
                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"><Share2 size={18} /></button>
                  </div>
                </div>

                <div id="invoice-card" className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                  {/* Professional Invoice Layout */}
                  <div className="p-8 border-b-8 border-orange-500">
                    <div className="flex justify-between items-start mb-12">
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl">
                          {shop.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h1 className="text-2xl font-black text-slate-900">{shop.name}</h1>
                          <p className="text-sm text-slate-500 font-bold">{shop.address}</p>
                          <p className="text-sm text-slate-500 font-bold">Phone: {shop.phone}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-4xl font-black text-slate-200 uppercase tracking-tighter">Invoice</div>
                        <div className="text-lg font-black text-slate-900">#{selectedInv.id}</div>
                        <div className="text-sm font-bold text-slate-400">Date: {fmtDate(selectedInv.created)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To</div>
                        <div className="text-lg font-black text-slate-900">{customer.name}</div>
                        <p className="text-sm text-slate-500 font-bold">{customer.address}</p>
                        <p className="text-sm text-slate-500 font-bold">Phone: {customer.phone}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Details</div>
                        <div className="text-sm font-bold text-slate-900">Mode: <span className="text-slate-500">{selectedInv.payMode}</span></div>
                        <div className="text-sm font-bold text-slate-900">Status: <span className={selectedInv.status === 'Paid' ? "text-green-600" : "text-red-600"}>{selectedInv.status}</span></div>
                      </div>
                    </div>

                    <table className="w-full mb-12">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                          <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Qty</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Rate</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedInv.items.map((it: any, i: number) => (
                          <tr key={i}>
                            <td className="py-4">
                              <div className="text-sm font-black text-slate-800">{it.name}</div>
                            </td>
                            <td className="py-4 text-center text-sm font-bold text-slate-600">{it.qty}</td>
                            <td className="py-4 text-right text-sm font-bold text-slate-600">{fmt(it.rate)}</td>
                            <td className="py-4 text-right text-sm font-black text-slate-800">{fmt(it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end">
                      <div className="w-72 space-y-3">
                        <div className="flex justify-between text-sm font-bold text-slate-500">
                          <span>Subtotal</span>
                          <span>{fmt(selectedInv.subtotal)}</span>
                        </div>
                        {selectedInv.discount > 0 && (
                          <div className="flex justify-between text-sm font-bold text-red-500">
                            <span>Discount</span>
                            <span>-{fmt(selectedInv.discount)}</span>
                          </div>
                        )}
                        {selectedInv.gst > 0 && (
                          <div className="flex justify-between text-sm font-bold text-blue-500">
                            <span>GST ({selectedInv.gstPct}%)</span>
                            <span>+{fmt(selectedInv.gst)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t-2 border-slate-100">
                          <span className="text-lg font-black text-slate-900">Grand Total</span>
                          <span className="text-2xl font-black text-orange-500">{fmt(selectedInv.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-end">
                      <div className="flex gap-6 items-center">
                        <div className="w-24 h-24 p-1 border-2 border-slate-100 rounded-xl">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${shop.upi}&pn=${encodeURIComponent(shop.name)}&am=${selectedInv.total}&cu=INR`)}`} 
                            alt="UPI QR" 
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scan to Pay</p>
                          <p className="text-sm font-black text-slate-800">{shop.upi}</p>
                          <p className="text-[10px] font-bold text-slate-400">Accepted: GPay, PhonePe, Paytm</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 mb-1">Thank you for your business!</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Generated by Umair Bills</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedInv.status === 'Pending' && (
                  <button 
                    onClick={() => window.location.href = `upi://pay?pa=${shop.upi}&pn=${encodeURIComponent(shop.name)}&am=${selectedInv.total}&cu=INR&tn=${encodeURIComponent(`Invoice ${selectedInv.id}`)}`}
                    className="w-full p-5 bg-orange-500 text-white font-black text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    📲 Pay Now via UPI — {fmt(selectedInv.total)}
                  </button>
                )}
              </div>
            )}
          </main>

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
      </div>
    </div>
  );
}
