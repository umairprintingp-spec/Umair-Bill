import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Crown, Zap, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TemplateGallery() {
  const [filter, setFilter] = useState('pro');

  const templates = [
    // Pro Templates
    { id: 1, title: "Royal Indigo", desc: "Corporate & elegant", type: "pro", bg: "#1e1b4b", accent: "#6366f1", text: "white", layout: "split" },
    { id: 2, title: "Sunset Fire", desc: "Bold & striking", type: "pro", bg: "#451a03", accent: "#f97316", text: "white", layout: "modern" },
    { id: 3, title: "Sky Corporate", desc: "Clean professional", type: "pro", bg: "#f8fafc", accent: "#0ea5e9", text: "black", layout: "classic" },
    { id: 4, title: "Gold Luxe", desc: "Premium & luxurious", type: "pro", bg: "#0a0a0a", accent: "#eab308", text: "white", layout: "minimal" },
    { id: 5, title: "Dev Terminal", desc: "Tech & code style", type: "pro", bg: "#020617", accent: "#22c55e", text: "white", isMono: true, layout: "grid" },
    { id: 6, title: "Rose Boutique", desc: "Feminine & stylish", type: "pro", bg: "#fff1f2", accent: "#e11d48", text: "black", layout: "split" },
    { id: 7, title: "Ocean Teal", desc: "Calm & trustworthy", type: "pro", bg: "#042f2e", accent: "#14b8a6", text: "white", layout: "modern" },
    { id: 8, title: "Zinc Classic", desc: "Monochrome & sharp", type: "pro", bg: "#ffffff", accent: "#18181b", text: "black", layout: "classic" },
    { id: 9, title: "Amber Warm", desc: "Friendly & approachable", type: "pro", bg: "#fffbeb", accent: "#d97706", text: "black", layout: "minimal" },
    { id: 10, title: "Catppuccin", desc: "Pastel & dreamy", type: "pro", bg: "#1e1e2e", accent: "#cba6f7", text: "white", layout: "grid" },
    { id: 11, title: "Cyber Neon", desc: "Futuristic & edgy", type: "pro", bg: "#050505", accent: "#f0abfc", text: "white", layout: "split" },
    { id: 12, title: "Emerald Fresh", desc: "Growth & prosperity", type: "pro", bg: "#ecfdf5", accent: "#10b981", text: "black", layout: "modern" },
    { id: 13, title: "Slate Grey", desc: "Sophisticated & modern", type: "pro", bg: "#1e293b", accent: "#94a3b8", text: "white", layout: "classic" },
    { id: 14, title: "Violet Dream", desc: "Creative & artistic", type: "pro", bg: "#2e1065", accent: "#a855f7", text: "white", layout: "minimal" },
    { id: 15, title: "Tangerine Zest", desc: "Vibrant & energetic", type: "pro", bg: "#fff7ed", accent: "#f97316", text: "black", layout: "grid" },
    { id: 16, title: "Neon Pink", desc: "Fun & fashionable", type: "pro", bg: "#1a1a1a", accent: "#ec4899", text: "white", layout: "split" },
    { id: 17, title: "Ice Blue", desc: "Cool & clinical", type: "pro", bg: "#f0f9ff", accent: "#0ea5e9", text: "black", layout: "modern" },
    { id: 18, title: "Golden Hour", desc: "Wealthy & refined", type: "pro", bg: "#ffffff", accent: "#854d0e", text: "black", layout: "classic" },
    { id: 19, title: "Mint Breeze", desc: "Light & airy", type: "pro", bg: "#f0fdf4", accent: "#22c55e", text: "black", layout: "minimal" },
    { id: 20, title: "Navy Blueprint", desc: "Structured & formal", type: "pro", bg: "#0f172a", accent: "#3b82f6", text: "white", layout: "grid" },
    { id: 21, title: "Magenta Pop", desc: "Vivid & expressive", type: "pro", bg: "#2d0617", accent: "#d946ef", text: "white", layout: "split" },
    { id: 22, title: "Vintage Parchment", desc: "Classic & nostalgic", type: "pro", bg: "#fefce8", accent: "#713f12", text: "black", layout: "modern" },
    { id: 23, title: "Matrix Green", desc: "Hacker & minimal", type: "pro", bg: "#000000", accent: "#00ff41", text: "white", isMono: true, layout: "classic" },
    { id: 24, title: "Purple Reign", desc: "Regal & powerful", type: "pro", bg: "#4c1d95", accent: "#c084fc", text: "white", layout: "minimal" },
    { id: 25, title: "Ruby Red", desc: "Bold & passionate", type: "pro", bg: "#ffffff", accent: "#dc2626", text: "black", layout: "grid" },
    
    // Free Templates
    { id: 101, title: "Classic Orange", desc: "The original signature", type: "free", bg: "#ffffff", accent: "#f5a623", text: "black", layout: "classic" },
    { id: 102, title: "Simple Black", desc: "Minimal & clean", type: "free", bg: "#ffffff", accent: "#000000", text: "black", layout: "minimal" },
    { id: 103, title: "Fresh Green", desc: "Kirana & grocery", type: "free", bg: "#ffffff", accent: "#22c55e", text: "black", layout: "modern" },
    { id: 104, title: "Blue Simple", desc: "Versatile & clear", type: "free", bg: "#ffffff", accent: "#3b82f6", text: "black", layout: "split" },
    { id: 105, title: "Saffron India", desc: "Indian tricolor theme", type: "free", bg: "#ffffff", accent: "#ff6b00", text: "black", layout: "grid" },
  ];

  const filtered = templates.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-[#0a0c12] text-[#f0f2f8]">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-[rgba(10,12,18,0.95)] backdrop-blur-[20px] border-b border-white/5 px-[5%] h-[68px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 bg-linear-to-br from-[#f5a623] to-[#e8824a] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32">
              <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
              <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
              <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
            </svg>
          </div>
          <span className="font-display text-[18px] font-[800]">Umair<b className="text-[#f5a623]">Bills</b></span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/pricing" className="text-[13px] text-[#8b95b0] no-underline hover:text-white transition-colors">Pricing</Link>
          <Link to="/" className="text-[13px] text-[#8b95b0] no-underline hover:text-white transition-colors">Wapas</Link>
        </div>
        <Link to="/app" className="bg-[#f5a623] text-white px-4 py-2 rounded-lg text-[13px] font-bold no-underline flex items-center gap-2 shadow-lg shadow-[#f5a623]/20">
          <Sparkles size={14} /> App Kholo
        </Link>
      </nav>

      {/* Header */}
      <div className="pt-20 pb-12 px-[5%] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(245,166,35,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#f5a623] mb-6 relative">
          <Sparkles size={12} className="animate-pulse" /> Invoice Templates
        </div>
        
        <h1 className="text-[clamp(32px,5vw,52px)] font-[900] tracking-tight mb-4 relative">
          Alag Alag Design — <span className="bg-linear-to-br from-[#f5a623] to-[#e8824a] bg-clip-text text-transparent">Aapki Marzi</span>
        </h1>
        <p className="text-[15px] text-[#8b95b0] max-w-[580px] mx-auto leading-relaxed relative font-medium">
          Har template unique color, style aur layout — koi bhi ek doosre se match nahi karta.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex justify-center mb-16 relative z-10">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-1.5">
          <button
            onClick={() => setFilter('free')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer border-none",
              filter === 'free' 
                ? "bg-white/10 text-white shadow-xl" 
                : "bg-transparent text-[#4a5270] hover:text-[#8b95b0]"
            )}
          >
            <CheckCircle2 size={14} /> Free Templates (5)
          </button>
          <button
            onClick={() => setFilter('pro')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer border-none",
              filter === 'pro' 
                ? "bg-[#f5a623] text-white shadow-xl shadow-[#f5a623]/20" 
                : "bg-transparent text-[#4a5270] hover:text-[#8b95b0]"
            )}
          >
            <Crown size={14} /> Pro Templates (25)
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-5 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((tpl) => (
            <div key={tpl.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] bg-[#161920] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                {/* Pro Badge */}
                {tpl.type === 'pro' && (
                  <div className="absolute top-3 right-3 z-20 bg-[#f5a623] text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
                    <Crown size={8} /> PRO
                  </div>
                )}

                {/* Template Preview Content */}
                <div className={cn(
                  "absolute inset-0 p-3 flex gap-2",
                  tpl.layout === 'split' ? "flex-row" : "flex-col"
                )}>
                  {/* Header / Sidebar */}
                  <div 
                    className={cn(
                      "rounded-lg p-2 flex justify-between",
                      tpl.layout === 'split' ? "w-1/3 flex-col h-full" : "h-10 w-full items-start"
                    )}
                    style={{ backgroundColor: tpl.bg, border: tpl.text === 'black' ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className={cn("text-[5px] font-black uppercase", tpl.text === 'black' ? "text-black/40" : "text-white/40")}>Invoice</div>
                      <div className={cn("text-[6px] font-black", tpl.text === 'black' ? "text-black" : "text-white")}>UMAIRBILLS</div>
                    </div>
                    <div className={cn("text-[6px] font-black", tpl.text === 'black' ? "text-black/60" : "text-white/60")}>#001</div>
                  </div>

                  {/* Body */}
                  <div className={cn(
                    "flex-1 bg-white/2 rounded-lg p-2 flex flex-col gap-2",
                    tpl.layout === 'grid' ? "grid grid-cols-2" : ""
                  )}>
                    <div className={cn(
                      "flex justify-between items-center",
                      tpl.layout === 'modern' ? "flex-row-reverse" : ""
                    )}>
                      <div className="h-1.5 w-12 bg-white/5 rounded" />
                      <div className="h-2 w-8 bg-[#f5a623]/20 rounded" />
                    </div>
                    
                    {tpl.layout === 'minimal' ? (
                      <div className="mt-4 space-y-2">
                        <div className="h-0.5 w-full bg-white/5 rounded" />
                        <div className="h-0.5 w-full bg-white/5 rounded" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-white/5 rounded" />
                        <div className="h-1 w-3/4 bg-white/5 rounded" />
                      </div>
                    )}

                    <div className={cn(
                      "mt-auto pt-2 border-t border-white/5 flex justify-between items-center",
                      tpl.layout === 'grid' ? "col-span-2" : ""
                    )}>
                      <div className="h-1.5 w-10 bg-white/5 rounded" />
                      <div className={cn("text-[10px] font-black", tpl.isMono ? "font-mono" : "")} style={{ color: tpl.accent }}>₹8,400</div>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 bg-[#f5a623] rounded-full flex items-center justify-center mb-3 shadow-xl shadow-[#f5a623]/30">
                    <Zap size={20} className="text-white" />
                  </div>
                  <span className="text-[12px] font-bold text-white mb-1">Use Template</span>
                  <span className="text-[10px] text-white/60">Click to apply style</span>
                </div>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[13px] font-bold text-white truncate">{tpl.title}</h3>
                </div>
                <p className="text-[11px] text-[#4a5270] truncate">{tpl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0d0f14] border-t border-white/5 py-12 px-[5%] text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 bg-linear-to-br from-[#f5a623] to-[#e8824a] rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 32 32">
              <rect x="3" y="13" width="26" height="13" rx="4" fill="rgba(255,255,255,0.9)" />
              <rect x="9" y="5" width="14" height="11" rx="2.5" fill="rgba(255,255,255,0.6)" />
              <rect x="6" y="19" width="20" height="2.5" rx="1.2" fill="#f5a623" />
            </svg>
          </div>
          <span className="font-display text-[15px] font-[800]">Umair<b className="text-[#f5a623]">Bills</b></span>
        </div>
        <p className="text-[12px] text-[#4a5270] mb-2">© 2026 Umair Bills by Mohd. Shadab. Made with ❤️ in India.</p>
        <div className="flex justify-center gap-4 text-[11px] text-[#4a5270]">
          <a href="#" className="hover:text-[#f5a623] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#f5a623] transition-colors">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
