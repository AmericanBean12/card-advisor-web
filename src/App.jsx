import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

const CATEGORY_LABELS = { dining:"Dining",groceries:"Groceries",flights:"Flights",hotels:"Hotels",gas:"Gas",transit:"Transit & Rideshare",streaming:"Streaming",drugstores:"Drugstores",home_improvement:"Home Improvement",car_rental:"Car Rental",entertainment:"Entertainment",phone_plans:"Phone Plans",fitness:"Fitness",shipping:"Shipping",portal_flights:"Portal Flights",portal_hotels:"Portal Hotels",wholesale_clubs:"Wholesale Clubs",general:"Everything Else" };
const CATEGORY_ICONS = { dining:"🍽️",groceries:"🛒",flights:"✈️",hotels:"🏨",gas:"⛽",transit:"🚗",streaming:"📺",drugstores:"💊",home_improvement:"🔨",car_rental:"🚙",entertainment:"🎭",phone_plans:"📱",fitness:"🏋️",shipping:"📦",portal_flights:"✈",portal_hotels:"🏛",wholesale_clubs:"🏪",general:"💳" };

// ============================================
// CONFETTI
// ============================================
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current, ctx = c.getContext("2d");
    c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2);
    const colors = ["#00DC82","#00F0FF","#FFD700","#FF6B6B","#A78BFA","#FFF"];
    const ps = Array.from({ length: 80 }, () => ({
      x: Math.random() * c.offsetWidth, y: -20 - Math.random() * 200,
      w: 4 + Math.random() * 6, h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 1.5 + Math.random() * 3, vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8, op: 1,
    }));
    const go = () => {
      ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
      let alive = false;
      ps.forEach(p => {
        if (p.op <= 0) return; alive = true;
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > c.offsetHeight * 0.7) p.op -= 0.02;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.op); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(go);
    };
    go();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:50,width:"100%",height:"100%" }} />;
}

// ============================================
// ANIMATED NUMBER
// ============================================
function AnimNum({ value, suffix = "x" }) {
  const [d, setD] = useState(0);
  const s = useRef(null);
  useEffect(() => {
    s.current = performance.now();
    const go = (now) => {
      const p = Math.min((now - s.current) / 600, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setD(value * e);
      if (p < 1) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  }, [value]);
  return <span>{d % 1 === 0 ? Math.round(d) : d.toFixed(1)}{suffix}</span>;
}

// ============================================
// CARD CHIP
// ============================================
function Chip({ card, selected, onToggle }) {
  const [h, setH] = useState(false);
  const isDark = card.id !== "apple-card";
  return (
    <button onClick={() => onToggle(card.id)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"12px",
        border: selected ? "2px solid #00DC82" : "2px solid rgba(255,255,255,0.06)",
        backgroundColor: selected ? "rgba(0,220,130,0.08)" : h ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        color: selected ? "#00DC82" : "rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",
        fontSize:"12.5px",fontWeight:600,transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",whiteSpace:"nowrap",
        transform: selected ? "scale(1.02)" : h ? "scale(1.01)" : "scale(1)",
      }}>
      <div style={{ width:"36px",height:"22px",borderRadius:"4px",background:card.gradient,flexShrink:0,
        boxShadow: selected ? "0 0 12px rgba(0,220,130,0.3)" : "0 2px 4px rgba(0,0,0,0.3)",
        border: !isDark ? "1px solid rgba(0,0,0,0.15)" : "none" }} />
      <span style={{ overflow:"hidden",textOverflow:"ellipsis" }}>{card.shortName}</span>
      {selected && <span style={{ width:"16px",height:"16px",borderRadius:"50%",backgroundColor:"#00DC82",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"#0A0F1A",fontWeight:800,flexShrink:0 }}>✓</span>}
    </button>
  );
}

// ============================================
// RESULT ROW
// ============================================
function ResultRow({ card, rate, rank, maxRate, isOnly }) {
  const isTop = rank === 0;
  const pct = maxRate > 0 ? (rate / maxRate) * 100 : 0;
  const isDark = card.id !== "apple-card";
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:"14px",padding: isTop ? "18px 20px" : "14px 20px",borderRadius:"14px",
      backgroundColor: isTop ? "rgba(0,220,130,0.06)" : "rgba(255,255,255,0.02)",
      border: isTop ? "1.5px solid rgba(0,220,130,0.25)" : "1.5px solid rgba(255,255,255,0.04)",
      animation:`rSlide 0.4s cubic-bezier(0.16,1,0.3,1) ${rank*0.08}s both`,overflow:"hidden",
    }}>
      <div style={{ width:"28px",height:"28px",borderRadius:"8px",
        backgroundColor: isTop ? "#00DC82" : "rgba(255,255,255,0.06)",
        color: isTop ? "#0A0F1A" : "rgba(255,255,255,0.3)",
        display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",
        fontSize:"12px",fontWeight:800,flexShrink:0 }}>{rank+1}</div>
      <div style={{ width:"42px",height:"26px",borderRadius:"5px",background:card.gradient,flexShrink:0,
        boxShadow: isTop ? "0 0 16px rgba(0,220,130,0.2)" : "0 2px 6px rgba(0,0,0,0.3)",
        border: !isDark ? "1px solid rgba(0,0,0,0.15)" : "none" }} />
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize: isTop?"14px":"13px",
          color: isTop?"#FFF":"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:"8px" }}>
          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{card.shortName}</span>
          {isTop && !isOnly && <span style={{ fontSize:"9px",fontWeight:800,letterSpacing:"0.1em",
            textTransform:"uppercase",padding:"3px 8px",borderRadius:"4px",
            backgroundColor:"#00DC82",color:"#0A0F1A",flexShrink:0 }}>Best</span>}
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px" }}>
          {card.currency}{card.annualFee > 0 ? ` · ${card.annualFee}/yr` : " · No fee"}
        </div>
        <div style={{ marginTop:"6px",height:"3px",borderRadius:"2px",backgroundColor:"rgba(255,255,255,0.06)",overflow:"hidden",maxWidth:"140px" }}>
          <div style={{ height:"100%",width:`${pct}%`,borderRadius:"2px",
            backgroundColor: isTop?"#00DC82":"rgba(255,255,255,0.15)",
            transition:`width 0.6s cubic-bezier(0.16,1,0.3,1)`,transitionDelay:`${rank*0.08+0.3}s` }} />
        </div>
      </div>
      <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize: isTop?"26px":"20px",
        color: isTop?"#00DC82":"rgba(255,255,255,0.4)",letterSpacing:"-0.02em",flexShrink:0 }}>
        {isTop ? <AnimNum value={rate} /> : `${rate}x`}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function CardAdvisor() {
  const [sel, setSel] = useState([]);
  const [input, setInput] = useState("");
  const [view, setView] = useState("wallet");
  const [confetti, setConfetti] = useState(false);
  const [lastTop, setLastTop] = useState(null);
  const [lookups, setLookups] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [search, setSearch] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);
  const [cardsDB, setCardsDB] = useState([]);
  const [merchantMap, setMerchantMap] = useState({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("cards").select("*"),
      supabase.from("merchant_mappings").select("*"),
    ]).then(([cardsRes, merchRes]) => {
      if (cardsRes.error || merchRes.error) {
        console.error("Supabase data fetch error:", cardsRes.error, merchRes.error);
        setCardsDB([]);
        setMerchantMap({});
      } else {
        setCardsDB(cardsRes.data.map(r => ({
          id: r.id,
          name: r.name,
          issuer: r.issuer,
          shortName: r.short_name,
          annualFee: r.annual_fee,
          currency: r.currency,
          color: r.color,
          gradient: r.gradient,
          categories: r.categories,
          ...(r.note != null && { note: r.note }),
          ...(r.merchant_overrides != null && { merchantOverrides: r.merchant_overrides }),
        })));
        const map = {};
        merchRes.data.forEach(r => { map[r.merchant] = r.category; });
        setMerchantMap(map);
      }
      setDataLoading(false);
    }).catch(err => {
      console.error("Supabase data fetch failed:", err);
      setCardsDB([]);
      setMerchantMap({});
      setDataLoading(false);
    });
  }, []);

  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const walletLoaded = useRef(false);
  const userRef = useRef(null);
  const lookupsRef = useRef(lookups);
  const totalSavedRef = useRef(totalSaved);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Keep refs in sync so save effects can read them without depending on them
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { lookupsRef.current = lookups; }, [lookups]);
  useEffect(() => { totalSavedRef.current = totalSaved; }, [totalSaved]);

  const signIn = () => supabase.auth.signInWithOAuth({ provider: "google" });
  const signOut = () => supabase.auth.signOut();

  // Load wallet + stats: from Supabase if logged in, else localStorage
  useEffect(() => {
    if (authLoading) return;
    walletLoaded.current = false;
    if (user) {
      supabase
        .from("user_wallets")
        .select("card_ids, lookups, total_saved")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error("Wallet load error:", error);
          if (data?.card_ids?.length) {
            setSel(data.card_ids);
            setView("dashboard");
          }
          if (data?.lookups != null) setLookups(data.lookups);
          if (data?.total_saved != null) setTotalSaved(data.total_saved);
          walletLoaded.current = true;
        });
    } else {
      try {
        const s = window.localStorage?.getItem?.("ca_cards");
        if (s) {
          const parsed = JSON.parse(s);
          setSel(parsed);
          if (parsed.length) setView("dashboard");
        }
      } catch {}
      try {
        const l = window.localStorage?.getItem?.("ca_lookups");
        if (l) setLookups(parseInt(l));
        const t = window.localStorage?.getItem?.("ca_saved");
        if (t) setTotalSaved(parseFloat(t));
      } catch {}
      walletLoaded.current = true;
    }
  }, [user, authLoading]);

  // Save wallet: to Supabase if logged in, always to localStorage.
  // Only depends on [sel] — NOT on user/authLoading — so it only fires
  // when the user actually changes their card selection, never on auth changes.
  useEffect(() => {
    if (!walletLoaded.current) return;
    try { window.localStorage?.setItem?.("ca_cards", JSON.stringify(sel)); } catch {}
    if (userRef.current) {
      const payload = { user_id: userRef.current.id, card_ids: sel, lookups: lookupsRef.current, total_saved: totalSavedRef.current, updated_at: new Date().toISOString() };
      supabase
        .from("user_wallets")
        .upsert(payload, { onConflict: "user_id" });
    }
  }, [sel]);

  // Save stats: to Supabase if logged in (debounced), always to localStorage.
  const statsTimer = useRef(null);
  useEffect(() => {
    if (!walletLoaded.current) return;
    try { window.localStorage?.setItem?.("ca_lookups", lookups.toString()); } catch {}
    try { window.localStorage?.setItem?.("ca_saved", totalSaved.toString()); } catch {}
    if (userRef.current) {
      clearTimeout(statsTimer.current);
      statsTimer.current = setTimeout(() => {
        const payload = { user_id: userRef.current.id, lookups, total_saved: totalSaved, updated_at: new Date().toISOString() };
        supabase
          .from("user_wallets")
          .upsert(payload, { onConflict: "user_id" })
          .then(({ data, error }) => {
            if (error) console.error("[SAVE-STATS] error:", error);
          });
      }, 2000);
    }
    return () => clearTimeout(statsTimer.current);
  }, [lookups, totalSaved]);

  const toggle = (id) => setSel(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const resolveCatSync = useCallback((i) => {
    const l = i.toLowerCase().trim();
    if (!l) return null;
    if (merchantMap[l]) return merchantMap[l];
    for (const [m, c] of Object.entries(merchantMap)) { if (l.includes(m) || m.includes(l)) return c; }
    for (const [k, v] of Object.entries(CATEGORY_LABELS)) { if (l === k || l === v.toLowerCase()) return k; }
    return "general";
  }, [merchantMap]);

  const [cat, setCat] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const sync = resolveCatSync(input);
    setCat(sync);
    setAiLoading(false);
  }, [input, resolveCatSync]);

  const handleSearch = useCallback(async () => {
    const sync = resolveCatSync(input);
    if (sync !== "general") { setCat(sync); return; }
    setAiLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize-merchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: input }),
      });
      const data = await res.json();
      let category = data.category || "general";
      if (category === "travel" || category === "online_shopping") category = "general";
      setCat(category);
    } catch {
      setCat("general");
    }
    setAiLoading(false);
  }, [input, resolveCatSync]);

  const ranked = useMemo(() => {
    if (!cat || sel.length === 0) return [];
    const q = input.toLowerCase().trim();
    return sel.map(id => {
      const card = cardsDB.find(c => c.id === id);
      let rate = card.categories[cat] || card.categories.general || 1;
      if (card.merchantOverrides && q) {
        for (const [mk, mv] of Object.entries(card.merchantOverrides)) {
          if (q === mk || q.includes(mk) || mk.includes(q)) {
            rate = mv;
            break;
          }
        }
      }
      return { card, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [cat, sel, cardsDB, input]);

  // Track which merchant searches we've already counted
  const countedSearches = useRef(new Set());

  // Confetti + stats — only count a lookup when the resolved category changes from a real merchant match
  useEffect(() => {
    if (ranked.length === 0 || !input.trim()) return;
    const key = input.toLowerCase().trim();

    // Only count if this is an exact merchant match (not just partial typing)
    const isExactMatch = merchantMap[key] || Object.keys(merchantMap).some(m => m === key);
    // Or if user selected from suggestions / category buttons (input matches a label)
    const isCategoryMatch = Object.values(CATEGORY_LABELS).some(v => v.toLowerCase() === key);

    if (!isExactMatch && !isCategoryMatch) return;

    // Don't double-count the same search
    if (countedSearches.current.has(key)) {
      // Still fire confetti if top card changed
      if (ranked[0].card.id !== lastTop) {
        setLastTop(ranked[0].card.id);
        if (ranked[0].rate >= 3) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
        }
      }
      return;
    }

    countedSearches.current.add(key);
    setLastTop(ranked[0].card.id);
    setLookups(p => p + 1);
    if (ranked.length >= 2 && ranked[0].rate > ranked[ranked.length - 1].rate) {
      const diff = ranked[0].rate - ranked[ranked.length - 1].rate;
      setTotalSaved(p => p + diff * 0.5);
    }
    if (ranked[0].rate >= 3) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
    }
  }, [ranked, lastTop, input, merchantMap]);

  const suggestions = useMemo(() => {
    if (!input.trim() || input.length < 2) return [];
    const l = input.toLowerCase();
    return Object.keys(merchantMap).filter(m => m.includes(l)).slice(0, 6)
      .map(m => m.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  }, [input, merchantMap]);

  const savings = useMemo(() => {
    if (ranked.length < 2) return null;
    const diff = ranked[0].rate - ranked[ranked.length-1].rate;
    if (diff <= 0) return null;
    return ((diff / ranked[ranked.length-1].rate) * 100).toFixed(0);
  }, [ranked]);

  const optScore = useMemo(() => {
    const cats = ["dining","groceries","flights","hotels","gas","transit","streaming","drugstores","home_improvement","wholesale_clubs"];
    if (sel.length === 0) return { score: 0, label: "Needs Work", pct: "Top 80%" };
    let total = 0;
    cats.forEach(cat => {
      let best = 0;
      sel.forEach(id => {
        const card = cardsDB.find(c => c.id === id);
        if (card) best = Math.max(best, card.categories[cat] || card.categories.general || 1);
      });
      if (best >= 5) total += 10;
      else if (best >= 3) total += 8;
      else if (best >= 2) total += 5;
    });
    let label, pct;
    if (total <= 30) { label = "Needs Work"; pct = "Top 80%"; }
    else if (total <= 50) { label = "Building"; pct = "Top 60%"; }
    else if (total <= 70) { label = "Good"; pct = "Top 35%"; }
    else if (total <= 85) { label = "Great"; pct = "Top 15%"; }
    else { label = "Excellent"; pct = "Top 5%"; }
    return { score: total, label, pct };
  }, [sel, cardsDB]);

  const issuers = [...new Set(cardsDB.map(c => c.issuer))];
  const filteredCards = search.trim()
    ? cardsDB.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase()))
    : cardsDB;
  const filteredIssuers = search.trim()
    ? [...new Set(filteredCards.map(c => c.issuer))]
    : issuers;

  if (dataLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0A0F1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          color: "#00DC82",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          Loading CardAdvisor...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0A0F1A",color:"#FFF",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes rSlide { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes searchPulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:rgba(255,255,255,0.25)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @media(max-width:640px){.cat-grid{grid-template-columns:repeat(3,1fr)!important}}
        .wallet-scroll::-webkit-scrollbar{display:none}
        .search-glow{position:absolute;inset:-2px;border-radius:18px;background:linear-gradient(135deg,rgba(0,220,130,0.3),rgba(59,130,246,0.3));filter:blur(20px);opacity:0.5;pointer-events:none;transition:opacity 0.3s ease;z-index:0}
      `}</style>

      {/* BG glow */}
      <div style={{ position:"fixed",top:"-30%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(0,220,130,0.06) 0%,transparent 70%)",pointerEvents:"none",animation:"glow 4s ease-in-out infinite" }} />
      <div style={{ position:"fixed",top:"20%",left:"20%",width:"300px",height:"300px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%)",filter:"blur(100px)",pointerEvents:"none" }} />

      <Confetti active={confetti} />

      {/* Nav Bar */}
      <div style={{ position:"sticky",top:0,zIndex:20,backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",backgroundColor:"rgba(10,15,26,0.8)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding: isMobile ? "10px 12px" : "12px 40px",
          ...(isMobile ? { flexWrap:"wrap" } : {}) }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"0px" }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:700,letterSpacing:"0.15em",color:"#FFF" }}>CARD</span>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:700,letterSpacing:"0.15em",color:"#00DC82" }}>ADVISOR</span>
          </div>
          <div style={{ display:"flex",gap: isMobile ? "24px" : "32px",
            ...(isMobile ? { width:"100%",justifyContent:"center",marginTop:"8px",order:3 } : {}) }}>
            {[{key:"dashboard",label:"Dashboard"},{key:"wallet",label:"Wallet"},{key:"analytics",label:"Analytics"}].map(t => (
              <button key={t.key} onClick={() => { setView(t.key); if(t.key==="dashboard") setTimeout(()=>ref.current?.focus(),150); }}
                style={{ background:"none",border:"none",padding:"4px 0",fontFamily:"'Space Grotesk',sans-serif",fontSize:"11px",fontWeight:700,
                  letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",
                  color: view===t.key?"#FFF":"rgba(255,255,255,0.35)",
                  borderBottom: view===t.key?"2px solid #00DC82":"2px solid transparent",
                  transition:"all 0.3s ease" }}>
                {t.label}
              </button>
            ))}
          </div>
          {!authLoading && (
            user ? (
              <button onClick={signOut} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)",
                backgroundColor:"rgba(255,255,255,0.04)",fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,
                color:"rgba(255,255,255,0.5)",cursor:"pointer",letterSpacing:"0.05em" }}>
                Sign out
              </button>
            ) : (
              <button onClick={signIn} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(0,220,130,0.2)",
                backgroundColor:"rgba(0,220,130,0.06)",fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,
                color:"#00DC82",cursor:"pointer",letterSpacing:"0.05em" }}>
                Sign in
              </button>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? "24px 12px 16px" : "32px 20px 20px",maxWidth:"960px",margin:"0 auto",position:"relative",zIndex:1 }}>

        {/* WALLET */}
        {view === "wallet" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {/* Card search */}
            <div style={{ position:"relative",marginBottom:"16px" }}>
              <div style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"14px",opacity:0.4,pointerEvents:"none" }}>🔍</div>
              <input type="text" placeholder={`Search ${cardsDB.length} cards...`} value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%",padding:"12px 14px 12px 40px",border:"1.5px solid rgba(255,255,255,0.06)",borderRadius:"12px",
                  backgroundColor:"rgba(255,255,255,0.03)",fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#FFF",outline:"none" }} />
            </div>

            {/* Section 1: SELECT A CARD — Horizontal Scroll */}
            <div style={{ marginBottom:"24px" }}>
              <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.25)",marginBottom:"12px",fontFamily:"'Space Grotesk',sans-serif" }}>Select a Card</div>
              <div className="wallet-scroll" style={{ display:"flex",gap:"12px",overflowX:"auto",paddingBottom:"8px" }}>
                {filteredCards.map(card => {
                  const isSelected = sel.includes(card.id);
                  return (
                    <div key={card.id} onClick={() => toggle(card.id)}
                      style={{ minWidth:"200px",height:"120px",borderRadius:"14px",cursor:"pointer",position:"relative",
                        background: card.gradient || card.color || "linear-gradient(135deg,#1a1a2e,#16213e)",
                        border: isSelected ? "2px solid #00DC82" : "2px solid rgba(255,255,255,0.08)",
                        boxShadow: isSelected ? "0 0 16px rgba(0,220,130,0.3)" : "0 2px 8px rgba(0,0,0,0.2)",
                        padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between",
                        transition:"all 0.2s ease",flexShrink:0 }}>
                      {isSelected && (
                        <div style={{ position:"absolute",top:"8px",right:"8px",width:"20px",height:"20px",borderRadius:"50%",
                          background:"#00DC82",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:"#0A0F1A",fontWeight:800 }}>✓</div>
                      )}
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:700,color:"#FFF",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:"24px" }}>{card.shortName}</div>
                      <div>
                        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"12px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.15em",marginBottom:"4px" }}>••••  ••••  ••••  4242</div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <span style={{ fontSize:"9px",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",
                            color:"rgba(255,255,255,0.4)",fontFamily:"'Space Grotesk',sans-serif" }}>{card.currency}</span>
                          <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"'Inter',sans-serif" }}>VISA</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2+3: Detail Panel + Renewal Timeline */}
            {sel.length > 0 && (() => {
              const card = cardsDB.find(c => c.id === sel[0]);
              if (!card) return null;
              const topCats = Object.entries(card.categories || {}).filter(([k]) => k !== "general").sort((a, b) => b[1] - a[1]).slice(0, 3);
              const glassStyle = { backgroundColor:"rgba(255,255,255,0.03)",border:"1.5px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding: isMobile ? "20px" : "24px" };
              return (
                <div style={{ display:"flex",flexDirection: isMobile ? "column" : "row",gap:"16px",marginBottom:"24px" }}>
                  {/* Left: Card Detail Panel */}
                  <div style={{ flex:"0 0 60%",...glassStyle }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"4px" }}>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"20px",fontWeight:800,color:"#FFF" }}>{card.name}</div>
                      <span style={{ fontSize:"18px",color:"rgba(255,255,255,0.3)",cursor:"pointer",lineHeight:1 }}>⋯</span>
                    </div>
                    <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.35)",fontFamily:"'Inter',sans-serif",marginBottom:"20px" }}>
                      {card.currency} · Manually Tracked
                    </div>

                    {/* Earning Rates */}
                    <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                      color:"rgba(255,255,255,0.25)",marginBottom:"10px",fontFamily:"'Space Grotesk',sans-serif" }}>Earning Rates</div>
                    <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",gap:"10px",marginBottom:"20px" }}>
                      {topCats.map(([cat, rate]) => (
                        <div key={cat} style={{ backgroundColor:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"12px",
                          display:"flex",alignItems:"center",gap:"8px" }}>
                          <span style={{ fontSize:"18px" }}>{CATEGORY_ICONS[cat] || "💳"}</span>
                          <div>
                            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"16px",fontWeight:800,color:"#00DC82" }}>{rate}x</div>
                            <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.4)",fontFamily:"'Inter',sans-serif" }}>{CATEGORY_LABELS[cat] || cat}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ backgroundColor:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"12px",
                        display:"flex",alignItems:"center",gap:"8px" }}>
                        <span style={{ fontSize:"18px" }}>💎</span>
                        <div>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"16px",fontWeight:800,color:"#00DC82" }}>1.5¢</div>
                          <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.4)",fontFamily:"'Inter',sans-serif" }}>Points Value</div>
                        </div>
                      </div>
                    </div>

                    {/* Recurring Credits */}
                    <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                      color:"rgba(255,255,255,0.25)",marginBottom:"10px",fontFamily:"'Space Grotesk',sans-serif" }}>Recurring Credits</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
                      <div style={{ backgroundColor:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"12px",
                        display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,color:"#FFF" }}>$300 Annual Travel Credit</div>
                          <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"2px" }}>Used: $270 / $30 left</div>
                        </div>
                      </div>
                      <div style={{ backgroundColor:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"12px",
                        display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,color:"#FFF" }}>DoorDash Monthly Credit</div>
                          <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"2px" }}>Redeemed?</div>
                        </div>
                        <div style={{ width:"36px",height:"20px",borderRadius:"10px",backgroundColor:"rgba(0,220,130,0.2)",position:"relative",cursor:"pointer" }}>
                          <div style={{ width:"16px",height:"16px",borderRadius:"50%",backgroundColor:"#00DC82",position:"absolute",top:"2px",right:"2px" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Renewal Timeline */}
                  <div style={{ flex:"1",...glassStyle }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
                      <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                        color:"rgba(255,255,255,0.25)",fontFamily:"'Space Grotesk',sans-serif" }}>Upcoming Renewals</div>
                      <span style={{ fontSize:"11px",color:"#00DC82",fontFamily:"'Inter',sans-serif",cursor:"pointer" }}>View All</span>
                    </div>
                    {[
                      { label:"Amex Gold Renewal",time:"Renews in 15 days",amount:"-$250",color:"#FF6B6B" },
                      { label:"Venture X Annual Fee",time:"Renews in 2 months",amount:"-$395",color:"#FFA94D" },
                      { label:"Platinum Renewal",time:"Renews in 5 months",amount:"-$695",color:"rgba(255,255,255,0.3)" },
                    ].map((entry, i) => (
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:"12px",padding:"12px 0",
                        borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <div style={{ width:"32px",height:"32px",borderRadius:"50%",backgroundColor: entry.color + "22",
                          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <div style={{ width:"10px",height:"10px",borderRadius:"50%",backgroundColor: entry.color }} />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,color:"#FFF" }}>{entry.label}</div>
                          <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.35)",marginTop:"2px" }}>{entry.time}</div>
                        </div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",fontWeight:700,color: entry.color }}>{entry.amount}</div>
                      </div>
                    ))}
                    <div style={{ textAlign:"center",marginTop:"16px" }}>
                      <span style={{ fontSize:"12px",color:"#00DC82",fontFamily:"'Inter',sans-serif",cursor:"pointer" }}>Analyze Your Value</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Section 4: Active Offers */}
            {sel.length > 0 && (
              <div style={{ backgroundColor:"rgba(255,255,255,0.03)",border:"1.5px solid rgba(255,255,255,0.06)",
                borderRadius:"16px",padding: isMobile ? "20px" : "24px",marginBottom:"24px" }}>
                <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                  color:"rgba(255,255,255,0.25)",marginBottom:"16px",fontFamily:"'Space Grotesk',sans-serif" }}>Active Offers</div>
                <div style={{ backgroundColor:"rgba(255,255,255,0.04)",borderRadius:"12px",padding:"16px" }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",fontWeight:700,color:"#FFF",marginBottom:"4px" }}>Welcome Bonus</div>
                  <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.45)",marginBottom:"14px",fontFamily:"'Inter',sans-serif" }}>
                    Spend $4,000 in first 3 months to earn 60,000 points
                  </div>
                  {/* Progress bar */}
                  <div style={{ position:"relative",height:"8px",borderRadius:"4px",backgroundColor:"rgba(255,255,255,0.06)",marginBottom:"8px" }}>
                    <div style={{ width:"99%",height:"100%",borderRadius:"4px",background:"linear-gradient(90deg,#00DC82,#00C974)",position:"relative" }}>
                      <div style={{ position:"absolute",right:"-6px",top:"-4px",width:"16px",height:"16px",borderRadius:"50%",
                        backgroundColor:"#00DC82",border:"3px solid #0A0F1A" }} />
                    </div>
                  </div>
                  <div style={{ display:"inline-block",backgroundColor:"rgba(0,220,130,0.12)",borderRadius:"6px",padding:"4px 10px",marginBottom:"10px" }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"12px",fontWeight:700,color:"#00DC82" }}>$1 left TO SPEND</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"'Inter',sans-serif" }}>$0 spent</span>
                    <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"'Inter',sans-serif" }}>Expires in 11 mths, 27 days</span>
                    <span style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",fontFamily:"'Inter',sans-serif" }}>$4,000 goal</span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            {sel.length > 0 && (
              <button onClick={() => { setView("dashboard"); setTimeout(()=>ref.current?.focus(),150); }}
                style={{ width:"100%",padding:"16px",background:"linear-gradient(135deg,#00DC82 0%,#00C974 100%)",
                  color:"#0A0F1A",border:"none",borderRadius:"14px",fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",
                  fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",marginTop:"8px",
                  boxShadow:"0 4px 20px rgba(0,220,130,0.3)",transition:"all 0.2s ease" }}>
                Find the best card →
              </button>
            )}
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {sel.length === 0 ? (
              <div style={{ textAlign:"center",padding:"48px 20px" }}>
                <div style={{ fontSize:"40px",marginBottom:"16px" }}>💳</div>
                <div style={{ fontSize:"15px",fontWeight:600,color:"rgba(255,255,255,0.5)",fontFamily:"'Space Grotesk',sans-serif" }}>Add cards first</div>
                <button onClick={() => setView("wallet")}
                  style={{ marginTop:"20px",padding:"12px 28px",background:"linear-gradient(135deg,#00DC82,#00C974)",
                    color:"#0A0F1A",border:"none",borderRadius:"12px",fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer" }}>
                  Set Up Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Section A: Optimization Score + Active Streak */}
                <div style={{ display:"flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent:"space-between",alignItems:"flex-start",
                  gap: isMobile ? "16px" : "20px",
                  paddingBottom:"20px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:"20px" }}>
                  <div style={{ flex:1,minWidth:"200px" }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"8px" }}>Optimization Score</div>
                    <div style={{ display:"flex",alignItems:"baseline",gap:"2px" }}>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"42px",fontWeight:800,color:"#00DC82",lineHeight:1 }}>{optScore.score}</span>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"18px",fontWeight:600,color:"rgba(255,255,255,0.25)" }}>/100</span>
                    </div>
                    <div style={{ marginTop:"4px" }}>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,color:"rgba(255,255,255,0.6)" }}>{optScore.label}</span>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",color:"rgba(255,255,255,0.3)" }}>{" "}· {optScore.pct}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: isMobile ? "left" : "right" }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)",marginBottom:"8px" }}>Active Streak</div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"20px",fontWeight:800,color:"#FFF" }}>0 Days</div>
                    <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.3)",marginTop:"4px" }}>Keep optimizing!</div>
                  </div>
                </div>

                {/* Section C: Search Bar */}
                <div style={{ position:"relative",margin: isMobile ? "20px 0" : "32px 0" }}
                  onMouseEnter={e => { const g = e.currentTarget.querySelector('.search-glow'); if(g) g.style.opacity='0.7'; }}
                  onMouseLeave={e => { const g = e.currentTarget.querySelector('.search-glow'); if(g) g.style.opacity='0.5'; }}>
                  <div className="search-glow" />
                  <div style={{ position:"relative",zIndex:1,padding:"16px",borderRadius:"16px",backgroundColor:"#0F1623",border:"1.5px solid rgba(0,220,130,0.4)" }}>
                    <div style={{ display:"flex",gap:"10px",alignItems:"center" }}>
                      <div style={{ position:"relative",flex:1 }}>
                        <div style={{ position:"absolute",left:"18px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:"#00DC82",opacity:1,pointerEvents:"none",animation:"searchPulse 3s ease-in-out infinite" }}>🔍</div>
                        <input ref={ref} type="text" placeholder="Where are you spending?" value={input}
                          onChange={e => { setInput(e.target.value); setLastTop(null); }}
                          onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                          style={{ width:"100%",padding: isMobile ? "14px 20px 14px 44px" : "20px 24px 20px 52px",border:"2px solid rgba(255,255,255,0.06)",borderRadius:"14px",
                            backgroundColor:"transparent",fontFamily:"'Inter',sans-serif",fontSize: isMobile ? "16px" : "20px",fontWeight:500,color:"#FFF",outline:"none",
                            transition:"all 0.2s ease" }}
                          onFocus={e => { e.target.style.borderColor="rgba(0,220,130,0.4)"; e.target.style.backgroundColor="rgba(0,220,130,0.03)"; }}
                          onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.06)"; e.target.style.backgroundColor="transparent"; }} />
                      </div>
                      {input.length > 0 && (
                        <button onClick={() => { setInput(""); setCat(null); ref.current?.focus(); }}
                          style={{ background:"none",border:"none",fontSize:"20px",color:"rgba(255,255,255,0.35)",
                            cursor:"pointer",padding:"4px 8px",flexShrink:0,lineHeight:1 }}>
                          ✕
                        </button>
                      )}
                      <button onClick={handleSearch} disabled={!input.trim() || aiLoading}
                        style={{ padding: isMobile ? "14px 20px" : "18px 32px",border:"none",borderRadius:"14px",
                          background: !input.trim() || aiLoading ? "rgba(255,255,255,0.06)" : "#00DC82",
                          color: !input.trim() || aiLoading ? "rgba(255,255,255,0.25)" : "#0A0F1A",
                          fontFamily:"'Space Grotesk',sans-serif",fontSize: isMobile ? "12px" : "14px",fontWeight:800,cursor: !input.trim() || aiLoading ? "default" : "pointer",
                          transition:"all 0.2s ease",flexShrink:0,textTransform:"uppercase",letterSpacing:"0.08em",
                          boxShadow: !input.trim() || aiLoading ? "none" : "0 0 20px rgba(0,220,130,0.3)" }}>
                        Search
                      </button>
                    </div>

                    {suggestions.length > 0 && input.length >= 2 && !merchantMap[input.toLowerCase()] && (
                      <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,backgroundColor:"#141A2A",
                        border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:"12px",zIndex:10,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
                        {suggestions.map((s, i) => (
                          <button key={s} onClick={() => setInput(s)}
                            style={{ display:"flex",alignItems:"center",gap:"10px",width:"100%",textAlign:"left",padding:"12px 16px",
                              border:"none",backgroundColor:"transparent",fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:500,
                              color:"rgba(255,255,255,0.7)",cursor:"pointer",borderBottom: i<suggestions.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(0,220,130,0.06)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                            <span style={{ fontSize:"14px" }}>{CATEGORY_ICONS[merchantMap[s.toLowerCase()]] || "🏪"}</span>{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section E: Search Results */}
                {aiLoading && input.trim() && (
                  <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"20px",
                    backgroundColor:"rgba(0,220,130,0.06)",border:"1px solid rgba(0,220,130,0.15)",fontSize:"12px",fontWeight:600,
                    color:"#00DC82",marginBottom:"16px",animation:"pulse 1.5s ease-in-out infinite" }}>
                    Categorizing...
                  </div>
                )}

                {!aiLoading && cat && input.trim() && (
                  <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"20px",
                    backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",fontSize:"12px",fontWeight:500,
                    color:"rgba(255,255,255,0.5)",marginBottom:"16px",animation:"fUp 0.2s ease" }}>
                    <span>{CATEGORY_ICONS[cat] || "💳"}</span>{CATEGORY_LABELS[cat] || cat}
                  </div>
                )}

                {ranked.length > 0 && input.trim() && (
                  <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
                    {ranked.map(({ card, rate }, i) => (
                      <ResultRow key={card.id} card={card} rate={rate} rank={i} maxRate={ranked[0].rate} isOnly={ranked.length===1} />
                    ))}

                    {savings && parseInt(savings) > 0 && (
                      <div style={{ marginTop:"8px",padding:"16px 20px",borderRadius:"14px",backgroundColor:"rgba(0,220,130,0.04)",
                        border:"1px solid rgba(0,220,130,0.1)",display:"flex",alignItems:"center",gap:"12px",animation:"fUp 0.4s ease 0.3s both" }}>
                        <div style={{ width:"36px",height:"36px",borderRadius:"10px",backgroundColor:"rgba(0,220,130,0.1)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0 }}>💰</div>
                        <div>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",color:"#00DC82" }}>Smart move</div>
                          <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"2px",lineHeight:1.4 }}>
                            <strong style={{ color:"rgba(255,255,255,0.7)" }}>{ranked[0].card.shortName}</strong> earns{" "}
                            <strong style={{ color:"#00DC82" }}>{savings}% more</strong> rewards on {(CATEGORY_LABELS[cat]||cat).toLowerCase()}.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section D: Quick Categories */}
                {!input.trim() && (
                  <div style={{ marginTop:"4px" }}>
                    <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                      color:"rgba(255,255,255,0.2)",marginBottom:"12px",fontFamily:"'Space Grotesk',sans-serif" }}>Quick Categories</div>
                    <div className="cat-grid" style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"10px" }}>
                      {(() => {
                        const ORDERED_CATS = ["dining","groceries","gas","flights","hotels","streaming",
                          "transit","drugstores","home_improvement","entertainment",
                          "car_rental","phone_plans","fitness","shipping","portal_flights","portal_hotels","wholesale_clubs"];
                        const defaultCats = ORDERED_CATS.slice(0, 6);
                        const extraCats = ORDERED_CATS.slice(6);
                        return (
                          <>
                            {defaultCats.map(k => (
                              <button key={k} onClick={() => setInput(CATEGORY_LABELS[k])}
                                style={{ height: isMobile ? "80px" : "96px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                                  padding:"16px",borderRadius:"12px",border:"1px solid rgba(75,85,99,0.5)",
                                  backgroundColor:"rgba(31,41,55,0.4)",textAlign:"center",cursor:"pointer",
                                  transition:"all 0.3s ease" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,220,130,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.6)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(75,85,99,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.4)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0.5)"; }}>
                                <span className="cat-icon" style={{ fontSize: isMobile ? "24px" : "30px",display:"block",marginBottom:"6px",filter:"grayscale(0.5)",transition:"filter 0.3s ease" }}>{CATEGORY_ICONS[k]}</span>
                                <span style={{ fontSize: isMobile ? "11px" : "13px",fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,0.45)" }}>{CATEGORY_LABELS[k]}</span>
                              </button>
                            ))}
                            <button onClick={() => setShowAllCats(!showAllCats)}
                              style={{ height: isMobile ? "80px" : "96px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                                padding:"16px",borderRadius:"12px",border:"1px solid rgba(75,85,99,0.5)",
                                backgroundColor:"rgba(31,41,55,0.4)",textAlign:"center",cursor:"pointer",
                                transition:"all 0.3s ease" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,220,130,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.6)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(75,85,99,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.4)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0.5)"; }}>
                              <span className="cat-icon" style={{ fontSize: isMobile ? "24px" : "30px",display:"block",marginBottom:"6px",filter:"grayscale(0.5)",transition:"filter 0.3s ease" }}>{showAllCats ? "⬆️" : "···"}</span>
                              <span style={{ fontSize: isMobile ? "11px" : "13px",fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,0.45)" }}>{showAllCats ? "Less" : "More"}</span>
                            </button>
                            {showAllCats && extraCats.map(k => (
                              <button key={k} onClick={() => setInput(CATEGORY_LABELS[k])}
                                style={{ height: isMobile ? "80px" : "96px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                                  padding:"16px",borderRadius:"12px",border:"1px solid rgba(75,85,99,0.5)",
                                  backgroundColor:"rgba(31,41,55,0.4)",textAlign:"center",cursor:"pointer",
                                  transition:"all 0.3s ease" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,220,130,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.6)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(75,85,99,0.5)"; e.currentTarget.style.backgroundColor="rgba(31,41,55,0.4)"; e.currentTarget.querySelector('.cat-icon').style.filter="grayscale(0.5)"; }}>
                                <span className="cat-icon" style={{ fontSize: isMobile ? "24px" : "30px",display:"block",marginBottom:"6px",filter:"grayscale(0.5)",transition:"filter 0.3s ease" }}>{CATEGORY_ICONS[k]}</span>
                                <span style={{ fontSize: isMobile ? "11px" : "13px",fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,0.45)" }}>{CATEGORY_LABELS[k]}</span>
                              </button>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Section F: Active Wallet Preview */}
                {!input.trim() && (
                  <div style={{ marginTop:"32px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px" }}>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.25)" }}>Active Wallet</div>
                      <button onClick={() => setView("wallet")}
                        style={{ background:"none",border:"none",fontFamily:"'Space Grotesk',sans-serif",fontSize:"11px",fontWeight:700,color:"#00DC82",cursor:"pointer",padding:0 }}>
                        Manage Wallet →
                      </button>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"16px" }}>
                      <div className="wallet-scroll" style={{ display:"flex",gap:"14px",overflowX:"auto",paddingBottom:"8px" }}>
                        {sel.map(id => {
                          const card = cardsDB.find(c => c.id === id);
                          if (!card) return null;
                          const isLight = card.id === "apple-card";
                          return (
                            <div key={card.id} style={{ width: isMobile ? "240px" : "300px",minWidth: isMobile ? "240px" : "300px",height: isMobile ? "150px" : "170px",borderRadius:"14px",background:card.gradient,
                              padding: isMobile ? "16px" : "24px",position:"relative",transition:"all 0.3s ease",cursor:"default",
                              boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}
                              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.4)"; }}
                              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.2)"; }}>
                              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"16px",fontWeight:700,color:isLight?"#1A1A1A":"#FFF" }}>{card.shortName}</div>
                              <div style={{ fontSize:"10px",letterSpacing:"0.15em",color:isLight?"rgba(26,26,26,0.5)":"rgba(255,255,255,0.5)",marginTop:"4px" }}>{card.currency.toUpperCase()}</div>
                              <div style={{ position:"absolute",top: isMobile ? "16px" : "24px",right: isMobile ? "16px" : "24px",fontSize:"18px",opacity:0.3 }}>⦿</div>
                              <div style={{ position:"absolute",bottom: isMobile ? "16px" : "24px",left: isMobile ? "16px" : "24px",fontSize:"11px",color:isLight?"rgba(26,26,26,0.4)":"rgba(255,255,255,0.4)" }}>{card.issuer}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {view === "analytics" && (
          <div style={{ animation:"fUp 0.3s ease",textAlign:"center",padding:"48px 20px" }}>
            <div style={{ fontSize:"48px",marginBottom:"16px" }}>📊</div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"22px",fontWeight:800,color:"#FFF",marginBottom:"8px" }}>Analytics</h2>
            <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"rgba(255,255,255,0.4)",marginBottom:"32px" }}>Coming Soon</div>
            <div style={{ padding:"24px",borderRadius:"16px",backgroundColor:"rgba(255,255,255,0.02)",border:"1.5px solid rgba(255,255,255,0.06)",maxWidth:"360px",margin:"0 auto" }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,color:"rgba(255,255,255,0.5)" }}>Spending insights &amp; optimization tips</div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.25)",marginTop:"8px" }}>Track your reward earnings, category breakdowns, and card utilization over time.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center",padding:"32px 20px",marginTop:"40px" }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(255,255,255,0.15)" }}>
          CardAdvisor Intelligence Engine v2.1.0
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.1)",marginTop:"8px",letterSpacing:"0.08em" }}>
          Help Center | Privacy Policy | Terms of Service
        </div>
      </div>
    </div>
  );
}
