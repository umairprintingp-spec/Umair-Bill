import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MessageSquare, 
  QrCode, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  ShieldCheck,
  ChevronRight,
  Play,
  Star,
  Plus,
  Minus
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dark)] text-[var(--text)] overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] px-[5%] h-[68px] flex items-center justify-between transition-all duration-300 ${isScrolled ? 'bg-[rgba(13,15,20,0.95)] backdrop-blur-[20px] border-b border-[var(--border)]' : ''}`}>
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[38px] h-[38px] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-[10px] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 32 32">
              <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
              <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
              <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
              <rect x="6" y="23" width="13" height="2.5" rx="1.2" fill="#f5a623" opacity="0.5" />
            </svg>
          </div>
          <span className="font-display text-[20px] font-[800] text-[var(--text)]">Umair<b className="text-[var(--orange)]">Bills</b></span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <a href="#features" className="text-[var(--text2)] no-underline text-[14px] font-[500] px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)] transition-all">Features</a>
          <a href="#how" className="text-[var(--text2)] no-underline text-[14px] font-[500] px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)] transition-all">Kaise Kaam Karta Hai</a>
          <Link to="/templates" className="text-[var(--text2)] no-underline text-[14px] font-[500] px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)] transition-all">Templates</Link>
          <Link to="/pricing" className="text-[var(--text2)] no-underline text-[14px] font-[500] px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.06)] transition-all">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <Link to="/app" className="inline-flex items-center gap-2 px-[22px] py-[10px] rounded-[10px] text-[14px] font-[600] text-[var(--text2)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] transition-all no-underline">Login</Link>
          <Link to="/app" className="inline-flex items-center gap-2 px-[22px] py-[10px] rounded-[10px] text-[14px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,166,35,0.45)] transition-all no-underline">🚀 Free Start Karo</Link>
        </div>

        <button className="md:hidden flex flex-col gap-[5px] p-1 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`w-6 h-[2px] bg-[var(--text)] rounded-[2px] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
          <span className={`w-6 h-[2px] bg-[var(--text)] rounded-[2px] transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-[2px] bg-[var(--text)] rounded-[2px] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[68px] left-0 right-0 bg-[rgba(13,15,20,0.98)] backdrop-blur-[20px] border-b border-[var(--border)] p-[20px_5%] z-[999] flex flex-col gap-2">
          <a href="#features" className="text-[var(--text2)] no-underline text-[15px] font-[500] py-2.5 border-b border-[var(--border)]" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how" className="text-[var(--text2)] no-underline text-[15px] font-[500] py-2.5 border-b border-[var(--border)]" onClick={() => setMobileMenuOpen(false)}>Kaise Kaam Karta Hai</a>
          <Link to="/templates" className="text-[var(--text2)] no-underline text-[15px] font-[500] py-2.5 border-b border-[var(--border)]" onClick={() => setMobileMenuOpen(false)}>Templates</Link>
          <Link to="/pricing" className="text-[var(--text2)] no-underline text-[15px] font-[500] py-2.5 border-b border-[var(--border)]" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link to="/app" className="inline-flex items-center justify-center gap-2 px-[22px] py-[10px] rounded-[10px] text-[14px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white mt-2 no-underline" onClick={() => setMobileMenuOpen(false)}>🚀 Free Start Karo</Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-[5%] pt-[100px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(245,166,35,0.12)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto w-full grid md:grid-cols-2 gap-[60px] items-center relative z-1">
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] rounded-full px-4 py-1.5 text-[12px] font-[600] text-[var(--orange)] mb-6">
              <span className="w-1.5 h-1.5 bg-[var(--orange)] rounded-full animate-pulse"></span> India ka #1 Free Billing Software
            </div>
            <h1 className="text-[clamp(36px,5vw,62px)] font-[900] leading-[1.1] tracking-[-1.5px] mb-5">
              Bill Banao,<br />
              <span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">WhatsApp</span> par<br />
              Bhejo, Paid Pao
            </h1>
            <p className="text-[17px] text-[var(--text2)] leading-[1.7] mb-8 max-w-[480px]">
              Choti dukaan se badi company tak — invoice banao sirf 8 second mein. UPI QR automatic, bank details included, customer ke WhatsApp par direct.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/app" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,166,35,0.45)] transition-all no-underline">🚀 Abhi Free Shuru Karo</Link>
              <a href="#how" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-[600] text-[var(--orange)] border-[1.5px] border-[var(--orange)] hover:bg-[rgba(245,166,35,0.1)] transition-all no-underline">
                <Play size={18} fill="currentColor" /> Dekho Kaise Kaam Karta Hai
              </a>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <div className="font-display text-[26px] font-[800] text-[var(--text)]">10,000<span className="text-[var(--orange)]">+</span></div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">Business Use Karte Hain</div>
              </div>
              <div className="flex flex-col">
                <div className="font-display text-[26px] font-[800] text-[var(--text)]">50,000<span className="text-[var(--orange)]">+</span></div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">Invoices Generate Hue</div>
              </div>
              <div className="flex flex-col">
                <div className="font-display text-[26px] font-[800] text-[var(--text)]"><span className="text-[var(--orange)]">100</span>%</div>
                <div className="text-[12px] text-[var(--text2)] mt-0.5">Free Forever</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            {/* Live Animated Invoice Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(245,166,35,0.1)] animate-float">
              <div className="bg-[var(--dark3)] p-[14px_16px] flex items-center gap-2 border-b border-[var(--border)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                <div className="flex-1 h-7 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-md flex items-center justify-center text-[11px] font-[700] text-white font-display">Umair Bills — Invoice</div>
              </div>
              <div className="p-5">
                <div className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-t-[10px] p-[14px_16px] flex justify-between items-center">
                  <div className="font-display text-[14px] font-[800] text-white">🖨️ Umair Bills</div>
                  <div className="font-display text-[16px] font-[800] text-white opacity-90">#INV042</div>
                </div>
                <div className="bg-[#1a1a2e] p-[8px_16px]">
                  <p className="text-[9px] text-[#aaa]">📞 9140090305 &nbsp;|&nbsp; 📍 Manjhanpur, Kaushambi</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] rounded-b-[10px] p-3">
                  <table className="w-full border-collapse mb-2.5">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-[8px] font-[700] uppercase text-[var(--text2)] p-[4px_6px] text-left">#</th>
                        <th className="text-[8px] font-[700] uppercase text-[var(--text2)] p-[4px_6px] text-left">Item</th>
                        <th className="text-[8px] font-[700] uppercase text-[var(--text2)] p-[4px_6px] text-left">Qty</th>
                        <th className="text-[8px] font-[700] uppercase text-[var(--text2)] p-[4px_6px] text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[rgba(255,255,255,0.04)]">
                        <td className="text-[10px] p-[5px_6px]">1</td>
                        <td className="text-[10px] p-[5px_6px]">Flex Banner Print</td>
                        <td className="text-[10px] p-[5px_6px]">20</td>
                        <td className="text-[10px] p-[5px_6px] text-right text-[var(--orange)] font-[600]">₹600</td>
                      </tr>
                      <tr className="border-b border-[rgba(255,255,255,0.04)]">
                        <td className="text-[10px] p-[5px_6px]">2</td>
                        <td className="text-[10px] p-[5px_6px]">Visiting Card</td>
                        <td className="text-[10px] p-[5px_6px]">500</td>
                        <td className="text-[10px] p-[5px_6px] text-right text-[var(--orange)] font-[600]">₹250</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center bg-[rgba(245,166,35,0.08)] border border-[rgba(245,166,35,0.2)] rounded-lg p-[8px_12px] mt-2">
                    <span className="text-[10px] text-[var(--text2)]">Grand Total</span>
                    <span className="font-display text-[15px] font-[800] text-[var(--orange)]">₹1,650.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -bottom-5 -left-8 bg-[var(--card)] border border-[var(--border)] rounded-xl p-[10px_14px] flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-float [animation-delay:0.5s]">
              <div className="text-[22px]">✅</div>
              <div className="flex flex-col">
                <div className="font-display text-[13px] font-[700] text-[var(--green)]">Payment Received!</div>
                <div className="text-[11px] text-[var(--text2)]">UPI • ₹1,650 • Just now</div>
              </div>
            </div>
            <div className="absolute top-5 -right-8 bg-[var(--card)] border border-[var(--border)] rounded-xl p-[10px_14px] flex items-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-float [animation-delay:1s]">
              <div className="text-[22px]">💬</div>
              <div className="flex flex-col">
                <div className="font-display text-[13px] font-[700] text-[var(--green)]">WhatsApp Sent!</div>
                <div className="text-[11px] text-[var(--text2)]">To: Ramesh Kumar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Bar */}
      <div className="p-[28px_5%] border-y border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
        <div className="max-w-[1200px] mx-auto flex items-center gap-10 flex-wrap">
          <div className="text-[12px] font-[600] text-[var(--text3)] uppercase tracking-[0.1em] whitespace-nowrap">Trusted by</div>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="font-display text-[14px] font-[700] text-[var(--text3)] flex items-center gap-1.5">🖨️ Printing Shops</div>
            <div className="font-display text-[14px] font-[700] text-[var(--text3)] flex items-center gap-1.5">📦 Retailers</div>
            <div className="font-display text-[14px] font-[700] text-[var(--text3)] flex items-center gap-1.5">🏪 Kirana Stores</div>
            <div className="font-display text-[14px] font-[700] text-[var(--text3)] flex items-center gap-1.5">🎨 Design Studios</div>
            <div className="font-display text-[14px] font-[700] text-[var(--text3)] flex items-center gap-1.5">📋 Service Providers</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-3.5 py-1 text-[12px] font-[600] text-[var(--orange)] mb-4">✨ Features</div>
            <h2 className="text-[clamp(28px,4vw,46px)] font-[800] leading-[1.15] tracking-[-1px] mb-4">
              Sab Kuch Ek Jagah<br /><span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Free Mein</span>
            </h2>
            <p className="text-[16px] text-[var(--text2)] leading-[1.7] max-w-[560px] mx-auto">
              Billing se lekar inventory tak, payments se lekar reports tak — poora business ek hi app mein manage karo.
            </p>
          </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: <FileText />, title: "Smart Billing & Invoicing", desc: "8 second mein professional invoice banao. GST auto-calculate, discount add karo, multi-item bill — sab ek click mein." },
                { icon: <MessageSquare />, title: "Direct WhatsApp Share", desc: "Bill banao aur turant customer ke WhatsApp par bhejo. Number auto-fill hota hai. Formatted message ready hoti hai." },
                { icon: <QrCode />, title: "UPI QR Code Auto", desc: "Har invoice mein automatically scannable UPI QR code generate hota hai. PhonePe, GPay, Paytm — sab se kaam kare." },
                { icon: <ShieldCheck />, title: "Bank Details Invoice Mein", desc: "Account number, IFSC, bank naam — sab invoice mein automatically aata hai. Customer asaani se transfer kar sake." },
                { icon: <CheckCircle2 />, title: "PDF Download", desc: "Professional PDF bill download karo aur email ya WhatsApp par attach karke bhejo. Clean, print-ready format." },
                { icon: <Users />, title: "Customer Management", desc: "Saare customers ek jagah. Order history, total spending, VIP customers — sab track karo easily." },
                { icon: <Package />, title: "Inventory Tracking", desc: "Paper, ink, material stock track karo. Low stock alert aata hai. Kabhi out-of-stock nahi honge." },
                { icon: <BarChart3 />, title: "Reports & Analytics", desc: "Daily, monthly sales report. Service-wise income, top customers, pending payments — sab chart mein dekhо." },
                { icon: <ShieldCheck />, title: "Data Backup & Restore", desc: "JSON backup download karo anytime. Ek click mein restore karo. Data kabhi nahin jaata." }
              ].map((feat, i) => (
                <div 
                  key={i}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-7 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[var(--orange)] to-[var(--orange2)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  <div className="w-[52px] h-[52px] bg-[rgba(245,166,35,0.1)] rounded-xl flex items-center justify-center text-[24px] mb-4 text-[var(--orange)]">
                    {feat.icon}
                  </div>
                  <h3 className="text-[17px] font-[700] mb-2">{feat.title}</h3>
                  <p className="text-[13.5px] text-[var(--text2)] leading-[1.6]">{feat.desc}</p>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-[5%] bg-[rgba(255,255,255,0.02)] border-y border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-[60px] items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-3.5 py-1 text-[12px] font-[600] text-[var(--orange)] mb-4">⚡ Kaise Kaam Karta Hai</div>
            <h2 className="text-[clamp(28px,4vw,46px)] font-[800] leading-[1.15] tracking-[-1px] mb-8">
              3 Step Mein<br /><span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Bill Bhejo</span>
            </h2>
            <div className="flex flex-col">
              {[
                { num: 1, title: "Customer & Service Select Karo", desc: "Customer choose karo, service/item add karo, quantity aur rate bhar do. Subtotal automatically calculate hoga." },
                { num: 2, title: "Invoice Generate Karo", desc: "\"Generate Invoice\" dabao — professional bill ready! GST, discount, grand total sab automatically." },
                { num: 3, title: "WhatsApp par Bhejo", desc: "Green \"WhatsApp par Bhejo\" button dabao — customer ka number auto-fill, detailed message ready, ek tap mein sent!" }
              ].map((step, i) => (
                <div key={i} className="flex gap-5 py-6 border-b border-[var(--border)] last:border-none">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] flex items-center justify-center font-display text-[16px] font-[800] text-white shrink-0 shadow-[0_4px_16px_rgba(245,166,35,0.3)]">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-[700] mb-1.5">{step.title}</h4>
                    <p className="text-[13.5px] text-[var(--text2)] leading-[1.6]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-[var(--dark3)] rounded-[36px] p-4 border-2 border-[var(--border)] shadow-[0_40px_80px_rgba(0,0,0,0.5)] max-w-[280px] w-full">
              <div className="bg-[var(--card)] rounded-[24px] overflow-hidden">
                <div className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] p-[14px_16px] text-center">
                  <p className="font-display text-[13px] font-[800] text-white">🖨️ Umair Bills</p>
                  <small className="text-[10px] text-[rgba(255,255,255,0.7)]">Invoice Ready! #INV042</small>
                </div>
                <div className="p-3.5">
                  {[
                    { label: "Customer", val: "Ramesh Kumar" },
                    { label: "Items", val: "3 items" },
                    { label: "Subtotal", val: "₹1,650.00" },
                    { label: "GST (18%)", val: "₹297.00" },
                    { label: "Grand Total", val: "₹1,947.00", color: "text-[var(--orange)]" },
                    { label: "Status", val: "✓ Paid", color: "text-[var(--green)]" }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-none text-[12px]">
                      <span className="text-[var(--text2)]">{row.label}</span>
                      <span className={`font-[600] ${row.color || 'text-[var(--text)]'}`}>{row.val}</span>
                    </div>
                  ))}
                  <button className="mt-3 bg-linear-to-br from-[#25d366] to-[#128c7e] text-white border-none w-full p-3 rounded-[10px] font-display text-[13px] font-[700] cursor-pointer flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> WhatsApp par Bhejo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-3.5 py-1 text-[12px] font-[600] text-[var(--orange)] mb-4">🎨 Invoice Design</div>
            <h2 className="text-[clamp(22px,3vw,32px)] font-[800] leading-[1.15] tracking-[-1px] mb-4">
              Professional <span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Invoice Templates</span>
            </h2>
            <p className="text-[14px] text-[var(--text2)] max-w-[500px] mx-auto">
              Brand ke saath match karne wala, clean aur print-ready invoice. UPI QR + bank details included.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "Classic Orange", desc: "Printing press ke liye perfect. Orange gradient header with dark contact bar.", badge: "Most Popular", badgeType: "pop", bg: "linear-gradient(135deg,#f5a623,#e8824a)" },
              { title: "Professional Blue", desc: "Corporate feel. Blue gradient header — ideal for design & professional services.", badge: "Free", badgeType: "free", bg: "linear-gradient(135deg,#1e3a5f,#2d5a8e)" },
              { title: "Forest Green", desc: "Fresh & clean look. Green theme — great for eco-friendly or health businesses.", badge: "Free", badgeType: "free", bg: "linear-gradient(135deg,#065f46,#047857)" }
            ].map((tpl, i) => (
              <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)] hover:border-[rgba(245,166,35,0.4)] cursor-pointer group">
                <div className="p-4 bg-[var(--dark3)] h-[130px] flex items-center justify-center overflow-hidden relative">
                  <div className="w-[85%] bg-white rounded-t-lg p-2.5 flex flex-col gap-1 shadow-lg translate-y-4 group-hover:translate-y-2 transition-transform">
                    <div className="flex justify-between items-center p-2 rounded-t-md" style={{ background: tpl.bg }}>
                      <span className="text-[8px] font-[800] text-white">🖨️ Umair Bills</span>
                      <span className="text-[8px] font-[800] text-white">#INV001</span>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <div className="flex justify-between text-[7px] text-[#555] border-b border-[#f0f0f0] pb-1"><span>Flex Banner 20sqft</span><span>₹600</span></div>
                      <div className="flex justify-between text-[7px] text-[#555] border-b border-[#f0f0f0] pb-1"><span>Visiting Card 500</span><span>₹250</span></div>
                      <div className="flex justify-between text-[8px] font-[700] text-[var(--orange)] pt-1"><span>Grand Total</span><span>₹850</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-[15px] font-[700] mb-1">{tpl.title}</h4>
                  <p className="text-[12px] text-[var(--text2)]">{tpl.desc}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-[600] mt-2 ${tpl.badgeType === 'pop' ? 'bg-[rgba(245,166,35,0.15)] text-[var(--orange)]' : 'bg-[rgba(34,197,94,0.15)] text-[var(--green)]'}`}>
                    {tpl.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/templates" className="inline-flex items-center gap-2 text-[var(--orange)] font-[600] hover:gap-3 transition-all">
              Saare 25 Templates Dekho <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-[5%] bg-[rgba(255,255,255,0.02)] border-y border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-3.5 py-1 text-[12px] font-[600] text-[var(--orange)] mb-4">💰 Pricing</div>
            <h2 className="text-[clamp(28px,4vw,46px)] font-[800] leading-[1.15] tracking-[-1px] mb-4">
              Simple, <span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-[16px] text-[var(--text2)] leading-[1.7] max-w-[560px] mx-auto">
              Koi hidden charges nahi. Shuru karo free mein, badhо apni zaroorat ke saath.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 transition-all hover:border-[rgba(255,255,255,0.15)]">
              <div className="text-[12px] font-[700] uppercase tracking-[0.1em] text-[var(--text2)] mb-2">Free</div>
              <div className="font-display text-[42px] font-[900] tracking-[-2px] mb-1"><sup>₹</sup>0<span className="text-[16px] font-[400] text-[var(--text2)] tracking-normal">/month</span></div>
              <p className="text-[13px] text-[var(--text2)] mb-6 leading-[1.5]">Chhoti dukaan ke liye perfect. Basic features ke saath shuru karo.</p>
              <ul className="list-none flex flex-col gap-2.5 mb-7">
                {["Unlimited Invoices", "WhatsApp Share", "UPI QR Code", "PDF Download", "Customer Management"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
                ))}
                {["Multiple Devices", "Cloud Backup"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-[var(--text3)]"><Plus size={16} className="rotate-45 shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Link to="/app" className="inline-flex items-center justify-center gap-2 w-full p-3 rounded-xl text-[14px] font-[600] text-[var(--orange)] border-[1.5px] border-[var(--orange)] hover:bg-[rgba(245,166,35,0.1)] transition-all no-underline">Free Shuru Karo</Link>
            </div>

            <div className="bg-linear-to-br from-[rgba(245,166,35,0.12)] to-[rgba(232,130,74,0.06)] border border-[rgba(245,166,35,0.4)] rounded-[20px] p-8 transition-all scale-105 relative z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white text-[11px] font-[700] px-4 py-1 rounded-full whitespace-nowrap font-display">🔥 Sabse Popular</div>
              <div className="text-[12px] font-[700] uppercase tracking-[0.1em] text-[var(--text2)] mb-2">Pro</div>
              <div className="font-display text-[42px] font-[900] tracking-[-2px] mb-1"><sup>₹</sup>99<span className="text-[16px] font-[400] text-[var(--text2)] tracking-normal">/month</span></div>
              <p className="text-[13px] text-[var(--text2)] mb-6 leading-[1.5]">Growing businesses ke liye — sab kuch unlimited, cloud included.</p>
              <ul className="list-none flex flex-col gap-2.5 mb-7">
                {["Sab Free Features +", "Multiple Devices", "Cloud Auto Backup", "Custom Invoice Theme", "Priority Support", "GST Reports", "Bulk WhatsApp Send"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Link to="/app" className="inline-flex items-center justify-center gap-2 w-full p-3 rounded-xl text-[14px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white shadow-[0_6px_20px_rgba(245,166,35,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(245,166,35,0.5)] transition-all no-underline">Pro Start Karo</Link>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 transition-all hover:border-[rgba(255,255,255,0.15)]">
              <div className="text-[12px] font-[700] uppercase tracking-[0.1em] text-[var(--text2)] mb-2">Business</div>
              <div className="font-display text-[42px] font-[900] tracking-[-2px] mb-1"><sup>₹</sup>299<span className="text-[16px] font-[400] text-[var(--text2)] tracking-normal">/month</span></div>
              <p className="text-[13px] text-[var(--text2)] mb-6 leading-[1.5]">Multiple shops, teams aur advanced analytics ke liye.</p>
              <ul className="list-none flex flex-col gap-2.5 mb-7">
                {["Sab Pro Features +", "5 User Accounts", "3 Shop Profiles", "Advanced Analytics", "API Access", "Dedicated Support", "Custom Domain"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Link to="/app" className="inline-flex items-center justify-center gap-2 w-full p-3 rounded-xl text-[14px] font-[600] text-[var(--text2)] border border-[var(--border)] hover:text-[var(--text)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] transition-all no-underline">Contact Karo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-[5%] border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] rounded-full px-3.5 py-1 text-[12px] font-[600] text-[var(--orange)] mb-4">❓ FAQ</div>
            <h2 className="text-[clamp(28px,4vw,46px)] font-[800] leading-[1.15] tracking-[-1px] mb-4">
              Aksar Pooche Jaane <span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Wale Sawaal</span>
            </h2>
          </div>

          <div className="max-w-[720px] mx-auto flex flex-col gap-3">
            {[
              { q: "Kya Umair Bills bilkul free hai?", a: "Haan! Basic plan 100% free hai hamesha ke liye. Unlimited invoices, WhatsApp share, UPI QR, PDF download — sab free mein milta hai. Koi credit card nahi chahiye." },
              { q: "Mera data kahan save hota hai?", a: "Free plan mein data aapke browser ke LocalStorage mein save hota hai — matlab sirf aapke computer par. Backup feature se JSON file download karke safe rakh sakte ho. Pro plan mein cloud backup milta hai." },
              { q: "WhatsApp pe invoice kaise bhejein?", a: "Invoice generate karo → Green \"WhatsApp par Bhejo\" button dabao → Customer ka number already filled hoga → Ek click mein WhatsApp Web/App khulega with complete invoice details in message. Bilkul aasaan!" },
              { q: "UPI QR code kaise kaam karta hai?", a: "Har invoice mein automatically ek QR code generate hota hai. Customer PhonePe, Google Pay, Paytm ya kisi bhi UPI app se scan kare — aapka UPI ID aur exact amount automatically fill ho jaata hai. Customer ko sirf confirm karna hota hai." }
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-[5%] bg-linear-to-br from-[rgba(245,166,35,0.12)] to-[rgba(232,130,74,0.06)] border-y border-[rgba(245,166,35,0.2)]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-[clamp(28px,4vw,46px)] font-[900] leading-[1.2] tracking-[-1px] mb-4">
            Aaj Hi Shuru Karo,<br /><span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Bilkul Free</span> Mein
          </h2>
          <p className="text-[16px] text-[var(--text2)] mb-8">
            10,000+ businesses pehle se use kar rahe hain. Koi setup nahi, koi download nahi — bas browser mein kholo aur shuru karo.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link to="/app" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white shadow-[0_4px_20px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,166,35,0.45)] transition-all no-underline">🚀 Free Mein Shuru Karo</Link>
            <Link to="/app" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-[600] text-[var(--orange)] border-[1.5px] border-[var(--orange)] hover:bg-[rgba(245,166,35,0.1)] transition-all no-underline">📋 Demo Dekho</Link>
          </div>
          <p className="text-[12px] text-[var(--text3)] mt-4">No credit card • No signup required • 100% Free Forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--dark2)] border-t border-[var(--border)] p-[60px_5%_30px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 no-underline mb-4">
                <div className="w-[36px] h-[36px] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-[9px] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 32 32">
                    <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
                    <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
                    <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
                  </svg>
                </div>
                <span className="font-display text-[17px] font-[800] text-[var(--text)]">Umair<b>Bills</b></span>
              </Link>
              <p className="text-[14px] text-[var(--text2)] leading-[1.7] max-w-[260px]">
                India ka sabse aasan billing software. Printing shops, retailers, kirana stores — sab ke liye free.
              </p>
              <div className="flex gap-2.5 mt-5">
                {['💬', '▶️', '📘', '📸'].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-[10px] bg-[var(--dark3)] border border-[var(--border)] flex items-center justify-center text-[16px] hover:bg-[rgba(245,166,35,0.15)] hover:border-[rgba(245,166,35,0.3)] transition-all no-underline">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display text-[13px] font-[700] uppercase tracking-[0.08em] text-[var(--text2)] mb-4">Product</h4>
              <ul className="list-none flex flex-col gap-2.5">
                <li><a href="#features" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Features</a></li>
                <li><Link to="/templates" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Invoice Templates</Link></li>
                <li><Link to="/pricing" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Pricing</Link></li>
                <li><Link to="/app" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-[13px] font-[700] uppercase tracking-[0.08em] text-[var(--text2)] mb-4">Resources</h4>
              <ul className="list-none flex flex-col gap-2.5">
                <li><a href="#faq" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">FAQ</a></li>
                <li><a href="#how" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Kaise Use Karein</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">Blog</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">GST Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-[13px] font-[700] uppercase tracking-[0.08em] text-[var(--text2)] mb-4">Contact</h4>
              <ul className="list-none flex flex-col gap-2.5">
                <li><a href="tel:9140090305" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">📞 9140090305</a></li>
                <li><a href="https://wa.me/919140090305" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">💬 WhatsApp</a></li>
                <li><span className="text-[13.5px] text-[var(--text3)]">📍 Manjhanpur, UP</span></li>
                <li><a href="#" className="text-[13.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)] transition-colors">✉️ Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-wrap justify-between items-center gap-4">
            <p className="text-[12.5px] text-[var(--text3)]">© 2026 Umair Bills by Mohd. Shadab. Made with ❤️ in India.</p>
            <div className="flex gap-4">
              <a href="#" className="text-[12.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)]">Privacy Policy</a>
              <a href="#" className="text-[12.5px] text-[var(--text3)] no-underline hover:text-[var(--orange)]">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/919140090305" className="fixed bottom-7 right-7 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center text-[26px] shadow-[0_8px_24px_rgba(37,211,102,0.4)] cursor-pointer z-[500] animate-pulse-wa no-underline" title="WhatsApp par Baat Karo" target="_blank">
        <MessageSquare size={28} fill="white" className="text-white" />
      </a>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string, key?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div 
        className="p-[18px_22px] flex justify-between items-center cursor-pointer font-[600] transition-all hover:bg-[rgba(255,255,255,0.03)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <div className={`w-7 h-7 rounded-lg bg-[rgba(245,166,35,0.1)] flex items-center justify-center text-[16px] transition-all text-[var(--orange)] ${isOpen ? 'rotate-45 bg-[rgba(245,166,35,0.2)]' : ''}`}>
          <Plus size={18} />
        </div>
      </div>
      {isOpen && (
        <div className="overflow-hidden">
          <div className="p-[0_22px_18px] text-[14px] text-[var(--text2)] leading-[1.7] border-t border-[var(--border)] pt-4">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}
