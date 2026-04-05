import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Star, MessageSquare, Zap, Building2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | '6month' | 'yearly' | 'lifetime'>('monthly');

  const pricing = {
    monthly:  { pro: 99,   biz: 299,  proOrig: null, bizOrig: null,  label: '/month',    days: 30    },
    '6month': { pro: 475,  biz: 1435, proOrig: 594,  bizOrig: 1794,  label: '/6 months', days: 180   },
    yearly:   { pro: 770,  biz: 2330, proOrig: 1188, bizOrig: 3588,  label: '/year',      days: 365   },
    lifetime: { pro: 1499, biz: 3999, proOrig: null, bizOrig: null,  label: ' lifetime',  days: 36500 }
  };

  const current = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-[var(--dark)] text-[var(--text)] pt-16">
      <nav className="fixed top-0 left-0 right-0 z-[10000] bg-[rgba(10,12,18,0.98)] backdrop-blur-[20px] border-b border-[var(--border)] px-[5%] h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32">
              <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
              <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
              <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
            </svg>
          </div>
          <span className="font-display text-[18px] font-[800]">Umair<b className="text-[var(--orange)]">Bills</b></span>
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/app" className="text-[13px] font-[600] bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white px-4 py-2 rounded-lg no-underline shadow-lg hover:-translate-y-0.5 transition-all">🚀 App Kholo</Link>
        </div>
      </nav>

      <div className="p-[56px_5%_32px] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(245,166,35,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.25)] rounded-full px-4 py-1.5 text-[12px] font-[600] text-[var(--orange)] mb-5 relative">
          💰 Plans & Pricing
        </div>
        <h1 className="text-[clamp(28px,4vw,50px)] font-[900] tracking-tight mb-3 relative">
          Apna Plan <span className="bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] bg-clip-text text-transparent">Choose Karo</span>
        </h1>
        <p className="text-[16px] text-[var(--text2)] max-w-[500px] mx-auto mb-5 relative">
          Free se shuru karo — jab business badhe tab Pro lelo. Seedha UPI se payment, turant activate.
        </p>
      </div>

      <div className="flex justify-center mb-9 px-5">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5 inline-flex gap-1 flex-wrap justify-center">
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: '6month', label: '6 Months', save: '20%' },
            { id: 'yearly', label: '1 Year', save: '35%' },
            { id: 'lifetime', label: 'Lifetime', save: 'Best' }
          ].map(cycle => (
            <button
              key={cycle.id}
              onClick={() => setBillingCycle(cycle.id as any)}
              className={cn(
                "px-[18px] py-2 rounded-xl text-[13px] font-[600] cursor-pointer transition-all whitespace-nowrap border-none",
                billingCycle === cycle.id ? "bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white shadow-lg" : "bg-transparent text-[var(--text2)] hover:text-[var(--text)]"
              )}
            >
              {cycle.label} {cycle.save && <span className="ml-1 bg-green-500/20 text-green-500 text-[10px] px-1.5 py-0.5 rounded-md">{cycle.save}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {/* Free */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-7 transition-all hover:-translate-y-1 hover:border-white/15">
            <div className="text-[11px] font-[700] uppercase tracking-widest text-[var(--text2)] mb-2.5">Free Forever</div>
            <div className="font-display text-[46px] font-[900] tracking-tight leading-none mb-1"><sup>₹</sup>0<span className="text-[15px] font-[400] text-[var(--text2)]">/month</span></div>
            <div className="h-5 mb-1.5" />
            <p className="text-[13px] text-[var(--text2)] mb-5 leading-relaxed">Chhoti dukaan ke liye perfect. Shuru karo aaj hi.</p>
            <ul className="list-none flex flex-col gap-2.5 mb-6">
              {["Unlimited Invoices", "WhatsApp Share", "UPI QR Code", "PDF Download", "Customer Management", "5 Invoice Templates"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
              ))}
              {["Auto WhatsApp Send", "Premium Templates", "Staff & Payroll"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--text3)]"><Plus size={16} className="rotate-45 shrink-0 mt-0.5" /> {f}</li>
              ))}
            </ul>
            <Link to="/app" className="inline-flex items-center justify-center w-full p-3.5 rounded-xl text-[15px] font-[700] text-[var(--orange)] border-[1.5px] border-[var(--orange)] hover:bg-[rgba(245,166,35,0.1)] transition-all no-underline">🚀 Free Shuru Karo</Link>
          </div>

          {/* Pro */}
          <div className="bg-linear-to-br from-[rgba(245,166,35,0.12)] to-[rgba(232,130,74,0.06)] border border-[rgba(245,166,35,0.45)] rounded-[20px] p-7 transition-all scale-105 relative z-10 hover:-translate-y-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white text-[11px] font-[700] px-4 py-1 rounded-full whitespace-nowrap font-display shadow-lg">🔥 Sabse Popular</div>
            <div className="text-[11px] font-[700] uppercase tracking-widest text-[var(--text2)] mb-2.5">Pro Plan</div>
            <div className="font-display text-[46px] font-[900] tracking-tight leading-none mb-1"><sup>₹</sup>{current.pro}<span className="text-[15px] font-[400] text-[var(--text2)]">{current.label}</span></div>
            <div className="text-[13px] text-[var(--text3)] h-5 mb-1.5">{current.proOrig ? <><span className="line-through">₹{current.proOrig}</span> <span className="text-green-500 font-bold ml-1">Save ₹{current.proOrig - current.pro}</span></> : ''}</div>
            <p className="text-[13px] text-[var(--text2)] mb-5 leading-relaxed">Growing businesses ke liye — sab kuch unlock.</p>
            <ul className="list-none flex flex-col gap-2.5 mb-6">
              {["Sab Free Features +", "Auto WhatsApp Send", "30 Premium Templates", "Staff & Payroll", "Advanced Analytics", "GST Reports", "Bulk Message"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
              ))}
            </ul>
            <button className="w-full p-3.5 bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] text-white font-[700] rounded-xl shadow-[0_6px_20px_rgba(245,166,35,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(245,166,35,0.5)] transition-all cursor-pointer">⭐ Pro Buy Karo</button>
          </div>

          {/* Business */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-7 transition-all hover:-translate-y-1 hover:border-white/15">
            <div className="text-[11px] font-[700] uppercase tracking-widest text-[var(--text2)] mb-2.5">Business</div>
            <div className="font-display text-[46px] font-[900] tracking-tight leading-none mb-1"><sup>₹</sup>{current.biz}<span className="text-[15px] font-[400] text-[var(--text2)]">{current.label}</span></div>
            <div className="text-[13px] text-[var(--text3)] h-5 mb-1.5">{current.bizOrig ? <><span className="line-through">₹{current.bizOrig}</span> <span className="text-green-500 font-bold ml-1">Save ₹{current.bizOrig - current.biz}</span></> : ''}</div>
            <p className="text-[13px] text-[var(--text2)] mb-5 leading-relaxed">Multiple shops, teams aur full analytics.</p>
            <ul className="list-none flex flex-col gap-2.5 mb-6">
              {["Sab Pro Features +", "3 Shop Profiles", "5 User Accounts", "White Label", "SMS Marketing", "API Access", "Dedicated Support"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]"><CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" /> {f}</li>
              ))}
            </ul>
            <button className="w-full p-3.5 bg-linear-to-br from-[#3b82f6] to-[#1d4ed8] text-white font-[700] rounded-xl shadow-[0_6px_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer">🏢 Business Buy Karo</button>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.25)] rounded-full px-4 py-1.5 text-[12px] font-[600] text-[var(--orange)] mb-4">⚡ Kaise Kaam Karta Hai</div>
          <h2 className="text-[28px] font-[800] mb-2">3 Steps mein Pro Activate</h2>
          <p className="text-[var(--text2)] text-[14px]">No signup needed — ek baar pay karo, turant activate</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-[800px] mx-auto mb-12">
          {[
            { num: 1, title: "Plan Choose Karo", desc: "Pro ya Business plan select karo. Billing duration choose karo." },
            { num: 2, title: "UPI Payment Karo", desc: "QR scan karo ya UPI app open karo. Amount auto-fill hoga." },
            { num: 3, title: "License Activate Karo", desc: "Payment ke baad form fill karo. License key milegi — activate!" }
          ].map(step => (
            <div key={step.num} className="text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[var(--orange)] to-[var(--orange2)] flex items-center justify-center font-display text-[20px] font-[800] text-white mx-auto mb-3.5 shadow-lg">{step.num}</div>
              <h4 className="text-[15px] font-[700] mb-2">{step.title}</h4>
              <p className="text-[13px] text-[var(--text2)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-[var(--dark2)] border-t border-[var(--border)] p-8 text-center">
        <p className="text-[13px] text-[var(--text3)]">
          © 2026 <Link to="/" className="text-[var(--orange)] no-underline">Umair Bills</Link> by Mohammad Shadab | 📞 +91 9140090305
        </p>
      </footer>
    </div>
  );
}
