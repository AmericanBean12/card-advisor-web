import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ============================================
// 25-CARD REWARDS DATABASE
// ============================================
const CARDS_DATABASE = [
  // ---- AMERICAN EXPRESS ----
  {
    id: "amex-gold", name: "American Express Gold Card", issuer: "American Express", shortName: "Amex Gold",
    annualFee: 250, currency: "Membership Rewards",
    color: "#D4A843", gradient: "linear-gradient(135deg, #D4A843 0%, #A67C2E 100%)",
    categories: { dining: 4, groceries: 4, flights: 3, transit: 1, gas: 1, streaming: 1, travel: 1, online_shopping: 1, drugstores: 1, home_improvement: 1, general: 1 },
  },
  {
    id: "amex-platinum", name: "American Express Platinum", issuer: "American Express", shortName: "Amex Platinum",
    annualFee: 695, currency: "Membership Rewards",
    color: "#A0A0A0", gradient: "linear-gradient(135deg, #C0C0C0 0%, #888 50%, #A8A8A8 100%)",
    categories: { flights: 5, hotels: 5, dining: 1, groceries: 1, gas: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "amex-blue-cash-preferred", name: "Blue Cash Preferred", issuer: "American Express", shortName: "Blue Cash Pref.",
    annualFee: 95, currency: "Cash Back",
    color: "#0077C8", gradient: "linear-gradient(135deg, #0077C8 0%, #004E82 100%)",
    categories: { groceries: 6, streaming: 6, gas: 3, transit: 3, dining: 1, flights: 1, travel: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "amex-blue-cash-everyday", name: "Blue Cash Everyday", issuer: "American Express", shortName: "Blue Cash Every.",
    annualFee: 0, currency: "Cash Back",
    color: "#00A4E4", gradient: "linear-gradient(135deg, #00A4E4 0%, #0077B5 100%)",
    categories: { groceries: 3, online_shopping: 3, gas: 3, dining: 1, streaming: 1, transit: 1, travel: 1, general: 1 },
  },
  // ---- CHASE ----
  {
    id: "chase-sapphire-reserve", name: "Chase Sapphire Reserve", issuer: "Chase", shortName: "Sapphire Reserve",
    annualFee: 550, currency: "Ultimate Rewards",
    color: "#1A2744", gradient: "linear-gradient(135deg, #1A2744 0%, #2D4A7A 100%)",
    categories: { dining: 3, travel: 3, flights: 3, hotels: 3, car_rental: 3, transit: 3, gas: 1, groceries: 1, streaming: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "chase-sapphire-preferred", name: "Chase Sapphire Preferred", issuer: "Chase", shortName: "Sapphire Preferred",
    annualFee: 95, currency: "Ultimate Rewards",
    color: "#2255A0", gradient: "linear-gradient(135deg, #2255A0 0%, #1A3D75 100%)",
    categories: { dining: 3, travel: 2, flights: 2, hotels: 2, streaming: 3, online_shopping: 3, groceries: 1, gas: 1, transit: 1, general: 1 },
  },
  {
    id: "chase-freedom-unlimited", name: "Chase Freedom Unlimited", issuer: "Chase", shortName: "Freedom Unlimited",
    annualFee: 0, currency: "Ultimate Rewards",
    color: "#0F6BB5", gradient: "linear-gradient(135deg, #0F6BB5 0%, #0A4D85 100%)",
    categories: { dining: 3, drugstores: 3, travel: 5, groceries: 1.5, gas: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, general: 1.5 },
  },
  {
    id: "chase-freedom-flex", name: "Chase Freedom Flex", issuer: "Chase", shortName: "Freedom Flex",
    annualFee: 0, currency: "Ultimate Rewards",
    color: "#3A7FCA", gradient: "linear-gradient(135deg, #3A7FCA 0%, #2260A0 100%)",
    categories: { dining: 3, drugstores: 3, travel: 5, groceries: 1, gas: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- CAPITAL ONE ----
  {
    id: "cap1-venture-x", name: "Capital One Venture X", issuer: "Capital One", shortName: "Venture X",
    annualFee: 395, currency: "Capital One Miles",
    color: "#333333", gradient: "linear-gradient(135deg, #333 0%, #555 50%, #333 100%)",
    categories: { flights: 5, hotels: 10, car_rental: 5, dining: 2, groceries: 2, gas: 2, travel: 2, streaming: 2, online_shopping: 2, transit: 2, general: 2 },
  },
  {
    id: "cap1-venture", name: "Capital One Venture", issuer: "Capital One", shortName: "Venture",
    annualFee: 95, currency: "Capital One Miles",
    color: "#444", gradient: "linear-gradient(135deg, #444 0%, #666 100%)",
    categories: { flights: 5, hotels: 5, car_rental: 5, dining: 2, groceries: 2, gas: 2, travel: 2, streaming: 2, online_shopping: 2, transit: 2, general: 2 },
  },
  {
    id: "cap1-savor", name: "Capital One Savor", issuer: "Capital One", shortName: "Savor",
    annualFee: 0, currency: "Cash Back",
    color: "#2B6E44", gradient: "linear-gradient(135deg, #2B6E44 0%, #1E5233 100%)",
    categories: { dining: 3, groceries: 3, streaming: 3, entertainment: 3, gas: 1, transit: 1, travel: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "cap1-quicksilver", name: "Capital One Quicksilver", issuer: "Capital One", shortName: "Quicksilver",
    annualFee: 0, currency: "Cash Back",
    color: "#5A5A5A", gradient: "linear-gradient(135deg, #6A6A6A 0%, #4A4A4A 100%)",
    categories: { flights: 5, hotels: 5, car_rental: 5, dining: 1.5, groceries: 1.5, gas: 1.5, travel: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, drugstores: 1.5, home_improvement: 1.5, general: 1.5 },
  },
  // ---- CITI ----
  {
    id: "citi-double-cash", name: "Citi Double Cash", issuer: "Citi", shortName: "Double Cash",
    annualFee: 0, currency: "ThankYou Points",
    color: "#004B87", gradient: "linear-gradient(135deg, #004B87 0%, #003560 100%)",
    categories: { dining: 2, groceries: 2, gas: 2, travel: 2, flights: 2, hotels: 2, streaming: 2, online_shopping: 2, transit: 2, drugstores: 2, home_improvement: 2, general: 2 },
  },
  {
    id: "citi-custom-cash", name: "Citi Custom Cash", issuer: "Citi", shortName: "Custom Cash",
    annualFee: 0, currency: "ThankYou Points",
    color: "#0066A1", gradient: "linear-gradient(135deg, #0066A1 0%, #004775 100%)",
    categories: { dining: 5, groceries: 5, gas: 5, travel: 5, streaming: 5, drugstores: 5, home_improvement: 5, online_shopping: 1, transit: 1, general: 1 },
  },
  {
    id: "citi-strata-premier", name: "Citi Strata Premier", issuer: "Citi", shortName: "Strata Premier",
    annualFee: 95, currency: "ThankYou Points",
    color: "#1A1A4E", gradient: "linear-gradient(135deg, #1A1A4E 0%, #2D2D7A 100%)",
    categories: { flights: 3, hotels: 3, dining: 3, groceries: 3, gas: 3, travel: 3, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- WELLS FARGO ----
  {
    id: "wf-autograph", name: "Wells Fargo Autograph", issuer: "Wells Fargo", shortName: "Autograph",
    annualFee: 0, currency: "WF Rewards",
    color: "#D71E28", gradient: "linear-gradient(135deg, #D71E28 0%, #A3161E 100%)",
    categories: { dining: 3, travel: 3, flights: 3, hotels: 3, gas: 3, transit: 3, streaming: 3, groceries: 1, online_shopping: 1, general: 1 },
  },
  {
    id: "wf-active-cash", name: "Wells Fargo Active Cash", issuer: "Wells Fargo", shortName: "Active Cash",
    annualFee: 0, currency: "Cash Back",
    color: "#E03C31", gradient: "linear-gradient(135deg, #E03C31 0%, #B52D24 100%)",
    categories: { dining: 2, groceries: 2, gas: 2, travel: 2, flights: 2, hotels: 2, streaming: 2, online_shopping: 2, transit: 2, drugstores: 2, home_improvement: 2, general: 2 },
  },
  {
    id: "wf-autograph-journey", name: "Wells Fargo Autograph Journey", issuer: "Wells Fargo", shortName: "Autograph Journey",
    annualFee: 95, currency: "WF Rewards",
    color: "#8B1A1A", gradient: "linear-gradient(135deg, #8B1A1A 0%, #5C1111 100%)",
    categories: { hotels: 5, flights: 4, dining: 3, travel: 3, gas: 1, groceries: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- DISCOVER ----
  {
    id: "discover-it", name: "Discover It Cash Back", issuer: "Discover", shortName: "Discover It",
    annualFee: 0, currency: "Cash Back",
    color: "#FF6B00", gradient: "linear-gradient(135deg, #FF6B00 0%, #CC5500 100%)",
    categories: { dining: 1, groceries: 1, gas: 1, travel: 1, streaming: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- BANK OF AMERICA ----
  {
    id: "bofa-customized-cash", name: "Bank of America Customized Cash", issuer: "Bank of America", shortName: "BofA Custom Cash",
    annualFee: 0, currency: "Cash Back",
    color: "#DC1431", gradient: "linear-gradient(135deg, #DC1431 0%, #A00E24 100%)",
    categories: { dining: 2, groceries: 2, gas: 3, travel: 1, online_shopping: 3, streaming: 1, transit: 1, drugstores: 1, home_improvement: 1, general: 1 },
  },
  {
    id: "bofa-unlimited-cash", name: "Bank of America Unlimited Cash", issuer: "Bank of America", shortName: "BofA Unlimited",
    annualFee: 0, currency: "Cash Back",
    color: "#C41230", gradient: "linear-gradient(135deg, #C41230 0%, #8C0D22 100%)",
    categories: { dining: 1.5, groceries: 1.5, gas: 1.5, travel: 1.5, flights: 1.5, hotels: 1.5, streaming: 1.5, online_shopping: 1.5, transit: 1.5, drugstores: 1.5, home_improvement: 1.5, general: 1.5 },
  },
  // ---- US BANK ----
  {
    id: "usbank-cash-plus", name: "U.S. Bank Cash+", issuer: "U.S. Bank", shortName: "Cash+",
    annualFee: 0, currency: "Cash Back",
    color: "#1D2951", gradient: "linear-gradient(135deg, #1D2951 0%, #0F1730 100%)",
    categories: { streaming: 5, home_improvement: 5, gas: 2, groceries: 2, dining: 1, travel: 1, online_shopping: 1, transit: 1, general: 1 },
  },
  // ---- AMAZON ----
  {
    id: "amazon-prime-visa", name: "Amazon Prime Visa", issuer: "Chase", shortName: "Amazon Prime Visa",
    annualFee: 0, currency: "Cash Back",
    color: "#232F3E", gradient: "linear-gradient(135deg, #232F3E 0%, #131921 100%)",
    categories: { online_shopping: 5, groceries: 2, dining: 2, gas: 2, transit: 2, drugstores: 2, travel: 1, streaming: 1, general: 1 },
  },
  // ---- APPLE ----
  {
    id: "apple-card", name: "Apple Card", issuer: "Goldman Sachs", shortName: "Apple Card",
    annualFee: 0, currency: "Daily Cash",
    color: "#F5F5F7", gradient: "linear-gradient(135deg, #F5F5F7 0%, #D2D2D7 100%)",
    categories: { online_shopping: 2, dining: 2, groceries: 2, gas: 2, transit: 2, streaming: 2, travel: 2, drugstores: 2, home_improvement: 2, general: 1 },
  },
];

// ============================================
// MERCHANT → CATEGORY MAP
// ============================================
const MC = {
  "whole foods":"groceries","trader joes":"groceries","trader joe's":"groceries","costco":"groceries","kroger":"groceries","safeway":"groceries","aldi":"groceries","publix":"groceries","wegmans":"groceries","heb":"groceries","h-e-b":"groceries","target":"groceries","walmart grocery":"groceries","instacart":"groceries","freshdirect":"groceries","sprouts":"groceries","stop and shop":"groceries","giant":"groceries","food lion":"groceries","piggly wiggly":"groceries","harris teeter":"groceries","meijer":"groceries","lidl":"groceries",
  "chipotle":"dining","starbucks":"dining","mcdonalds":"dining","mcdonald's":"dining","chick-fil-a":"dining","sweetgreen":"dining","doordash":"dining","uber eats":"dining","ubereats":"dining","grubhub":"dining","seamless":"dining","postmates":"dining","panera":"dining","shake shack":"dining","dominos":"dining","domino's":"dining","olive garden":"dining","cheesecake factory":"dining","restaurant":"dining","cafe":"dining","pizza":"dining","sushi":"dining","ramen":"dining","taco bell":"dining","wendys":"dining","wendy's":"dining","popeyes":"dining","five guys":"dining","in-n-out":"dining","panda express":"dining","nobu":"dining","peter luger":"dining","cava":"dining","wingstop":"dining","nandos":"dining","nando's":"dining","buffalo wild wings":"dining","applebees":"dining","applebee's":"dining","ihop":"dining","denny's":"dining","waffle house":"dining","cracker barrel":"dining","chilis":"dining","chili's":"dining","outback":"dining","red lobster":"dining","texas roadhouse":"dining","raising canes":"dining","raising cane's":"dining","jersey mikes":"dining","jersey mike's":"dining","subway restaurant":"dining","jimmy johns":"dining","jimmy john's":"dining","papa johns":"dining","papa john's":"dining","pizza hut":"dining","little caesars":"dining",
  "delta":"flights","united":"flights","american airlines":"flights","southwest":"flights","jetblue":"flights","alaska airlines":"flights","spirit":"flights","frontier":"flights","british airways":"flights","lufthansa":"flights","emirates":"flights","qatar":"flights","singapore airlines":"flights","air france":"flights",
  "marriott":"hotels","hilton":"hotels","hyatt":"hotels","ihg":"hotels","airbnb":"hotels","vrbo":"hotels","booking.com":"hotels","hotels.com":"hotels","expedia":"hotels","four seasons":"hotels","ritz carlton":"hotels",
  "shell":"gas","exxon":"gas","chevron":"gas","bp":"gas","mobil":"gas","sunoco":"gas","citgo":"gas","speedway":"gas","wawa":"gas","sheetz":"gas","buc-ees":"gas","buc-ee's":"gas",
  "uber":"transit","lyft":"transit","subway":"transit","mta":"transit","metro":"transit","amtrak":"transit",
  "netflix":"streaming","spotify":"streaming","hulu":"streaming","disney+":"streaming","disney plus":"streaming","hbo max":"streaming","max":"streaming","apple tv":"streaming","youtube premium":"streaming","peacock":"streaming","paramount+":"streaming","apple music":"streaming","tidal":"streaming","audible":"streaming",
  "amazon":"online_shopping","walmart":"online_shopping","ebay":"online_shopping","etsy":"online_shopping","wayfair":"online_shopping","best buy":"online_shopping","apple store":"online_shopping","nike":"online_shopping","adidas":"online_shopping","nordstrom":"online_shopping","zara":"online_shopping","uniqlo":"online_shopping","j crew":"online_shopping","brooks brothers":"online_shopping","ralph lauren":"online_shopping","lululemon":"online_shopping","target online":"online_shopping","macys":"online_shopping","macy's":"online_shopping","bloomingdales":"online_shopping","saks":"online_shopping","neiman marcus":"online_shopping","gap":"online_shopping","old navy":"online_shopping","banana republic":"online_shopping","h&m":"online_shopping",
  "cvs":"drugstores","walgreens":"drugstores","rite aid":"drugstores","duane reade":"drugstores",
  "home depot":"home_improvement","lowes":"home_improvement","lowe's":"home_improvement","ace hardware":"home_improvement","menards":"home_improvement",
  "hertz":"car_rental","avis":"car_rental","enterprise":"car_rental","turo":"car_rental","national":"car_rental","budget":"car_rental",
  "kayak":"travel","google flights":"travel","tripadvisor":"travel","priceline":"travel","hopper":"travel",
};

const CATEGORY_LABELS = { dining:"Dining",groceries:"Groceries",flights:"Flights",hotels:"Hotels",gas:"Gas",transit:"Transit & Rideshare",streaming:"Streaming",online_shopping:"Online Shopping",drugstores:"Drugstores",home_improvement:"Home Improvement",car_rental:"Car Rental",travel:"Travel",entertainment:"Entertainment",general:"Everything Else" };
const CATEGORY_ICONS = { dining:"🍽️",groceries:"🛒",flights:"✈️",hotels:"🏨",gas:"⛽",transit:"🚗",streaming:"📺",online_shopping:"🛍️",drugstores:"💊",home_improvement:"🔨",car_rental:"🚙",travel:"🌍",entertainment:"🎭",general:"💳" };

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
        color: selected ? "#00DC82" : "rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"'Syne',sans-serif",
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
        display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",
        fontSize:"12px",fontWeight:800,flexShrink:0 }}>{rank+1}</div>
      <div style={{ width:"42px",height:"26px",borderRadius:"5px",background:card.gradient,flexShrink:0,
        boxShadow: isTop ? "0 0 16px rgba(0,220,130,0.2)" : "0 2px 6px rgba(0,0,0,0.3)",
        border: !isDark ? "1px solid rgba(0,0,0,0.15)" : "none" }} />
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize: isTop?"14px":"13px",
          color: isTop?"#FFF":"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:"8px" }}>
          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{card.shortName}</span>
          {isTop && !isOnly && <span style={{ fontSize:"9px",fontWeight:800,letterSpacing:"0.1em",
            textTransform:"uppercase",padding:"3px 8px",borderRadius:"4px",
            backgroundColor:"#00DC82",color:"#0A0F1A",flexShrink:0 }}>Best</span>}
        </div>
        <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px" }}>
          {card.currency}{card.annualFee > 0 ? ` · ${card.annualFee}/yr` : " · No fee"}
        </div>
        <div style={{ marginTop:"6px",height:"3px",borderRadius:"2px",backgroundColor:"rgba(255,255,255,0.06)",overflow:"hidden",maxWidth:"140px" }}>
          <div style={{ height:"100%",width:`${pct}%`,borderRadius:"2px",
            backgroundColor: isTop?"#00DC82":"rgba(255,255,255,0.15)",
            transition:`width 0.6s cubic-bezier(0.16,1,0.3,1)`,transitionDelay:`${rank*0.08+0.3}s` }} />
        </div>
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize: isTop?"26px":"20px",
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
  const ref = useRef(null);

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const walletLoaded = useRef(false);
  const userRef = useRef(null);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Keep userRef in sync so the save effect can read it without depending on it
  useEffect(() => { userRef.current = user; }, [user]);

  const signIn = () => supabase.auth.signInWithOAuth({ provider: "google" });
  const signOut = () => supabase.auth.signOut();

  // Load wallet: from Supabase if logged in, else localStorage
  useEffect(() => {
    console.log("[LOAD] effect fired — authLoading:", authLoading, "user:", user?.id ?? null);
    if (authLoading) { console.log("[LOAD] still loading auth, skipping"); return; }
    walletLoaded.current = false;
    if (user) {
      console.log("[LOAD] fetching wallet from Supabase for user:", user.id);
      supabase
        .from("user_wallets")
        .select("card_ids")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          console.log("[LOAD] Supabase response — data:", data, "error:", error);
          if (error) console.error("Wallet load error:", error);
          if (data?.card_ids?.length) {
            console.log("[LOAD] setting sel to", data.card_ids);
            setSel(data.card_ids);
          } else {
            console.log("[LOAD] no card_ids found in Supabase (data was:", data, ")");
          }
          walletLoaded.current = true;
          console.log("[LOAD] walletLoaded set to true");
        });
    } else {
      console.log("[LOAD] no user, loading from localStorage");
      try {
        const s = window.localStorage?.getItem?.("ca_cards");
        console.log("[LOAD] localStorage ca_cards:", s);
        if (s) setSel(JSON.parse(s));
      } catch {}
      walletLoaded.current = true;
    }
    try {
      const l = window.localStorage?.getItem?.("ca_lookups");
      if (l) setLookups(parseInt(l));
      const t = window.localStorage?.getItem?.("ca_saved");
      if (t) setTotalSaved(parseFloat(t));
    } catch {}
  }, [user, authLoading]);

  // Save wallet: to Supabase if logged in, always to localStorage.
  // Only depends on [sel] — NOT on user/authLoading — so it only fires
  // when the user actually changes their card selection, never on auth changes.
  useEffect(() => {
    console.log("[SAVE] effect fired — sel:", sel, "walletLoaded:", walletLoaded.current, "userRef:", userRef.current?.id ?? null);
    if (!walletLoaded.current) { console.log("[SAVE] walletLoaded is false, skipping"); return; }
    try { window.localStorage?.setItem?.("ca_cards", JSON.stringify(sel)); } catch {}
    if (userRef.current) {
      const payload = { user_id: userRef.current.id, card_ids: sel, updated_at: new Date().toISOString() };
      console.log("[SAVE] upserting to Supabase:", payload);
      supabase
        .from("user_wallets")
        .upsert(payload, { onConflict: "user_id" })
        .then(({ data, error }) => {
          console.log("[SAVE] Supabase upsert response — data:", data, "error:", error);
        });
    } else {
      console.log("[SAVE] no user, saved to localStorage only");
    }
  }, [sel]);

  // Save stats to localStorage
  useEffect(() => { try { window.localStorage?.setItem?.("ca_lookups", lookups.toString()); } catch {} }, [lookups]);
  useEffect(() => { try { window.localStorage?.setItem?.("ca_saved", totalSaved.toString()); } catch {} }, [totalSaved]);

  const toggle = (id) => setSel(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const resolveCat = useCallback((i) => {
    const l = i.toLowerCase().trim();
    if (!l) return null;
    if (MC[l]) return MC[l];
    for (const [m, c] of Object.entries(MC)) { if (l.includes(m) || m.includes(l)) return c; }
    for (const [k, v] of Object.entries(CATEGORY_LABELS)) { if (l === k || l === v.toLowerCase()) return k; }
    return "general";
  }, []);

  const cat = resolveCat(input);

  const ranked = useMemo(() => {
    if (!cat || sel.length === 0) return [];
    return sel.map(id => {
      const card = CARDS_DATABASE.find(c => c.id === id);
      const rate = card.categories[cat] || card.categories.general || 1;
      return { card, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [cat, sel]);

  // Track which merchant searches we've already counted
  const countedSearches = useRef(new Set());

  // Confetti + stats — only count a lookup when the resolved category changes from a real merchant match
  useEffect(() => {
    if (ranked.length === 0 || !input.trim()) return;
    const key = input.toLowerCase().trim();

    // Only count if this is an exact merchant match (not just partial typing)
    const isExactMatch = MC[key] || Object.keys(MC).some(m => m === key);
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
  }, [ranked, lastTop, input]);

  const suggestions = useMemo(() => {
    if (!input.trim() || input.length < 2) return [];
    const l = input.toLowerCase();
    return Object.keys(MC).filter(m => m.includes(l)).slice(0, 6)
      .map(m => m.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  }, [input]);

  const savings = useMemo(() => {
    if (ranked.length < 2) return null;
    const diff = ranked[0].rate - ranked[ranked.length-1].rate;
    if (diff <= 0) return null;
    return ((diff / ranked[ranked.length-1].rate) * 100).toFixed(0);
  }, [ranked]);

  const issuers = [...new Set(CARDS_DATABASE.map(c => c.issuer))];
  const filteredCards = search.trim()
    ? CARDS_DATABASE.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase()))
    : CARDS_DATABASE;
  const filteredIssuers = search.trim()
    ? [...new Set(filteredCards.map(c => c.issuer))]
    : issuers;

  return (
    <div style={{ minHeight:"100vh",backgroundColor:"#0A0F1A",color:"#FFF",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes rSlide { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:rgba(255,255,255,0.25)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>

      {/* BG glow */}
      <div style={{ position:"fixed",top:"-30%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(0,220,130,0.06) 0%,transparent 70%)",pointerEvents:"none",animation:"glow 4s ease-in-out infinite" }} />

      <Confetti active={confetti} />

      {/* Header */}
      <div style={{ padding:"24px 20px 16px",textAlign:"center",position:"relative",zIndex:1 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px" }}>
          <div style={{ width:"80px" }} />
          <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 12px",borderRadius:"20px",
            backgroundColor:"rgba(0,220,130,0.08)",border:"1px solid rgba(0,220,130,0.15)" }}>
            <div style={{ width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"#00DC82",animation:"pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#00DC82" }}>CardAdvisor</span>
          </div>
          {!authLoading && (
            user ? (
              <button onClick={signOut} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)",
                backgroundColor:"rgba(255,255,255,0.04)",fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,
                color:"rgba(255,255,255,0.5)",cursor:"pointer",letterSpacing:"0.05em",width:"80px" }}>
                Sign out
              </button>
            ) : (
              <button onClick={signIn} style={{ padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(0,220,130,0.2)",
                backgroundColor:"rgba(0,220,130,0.06)",fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,
                color:"#00DC82",cursor:"pointer",letterSpacing:"0.05em",width:"80px" }}>
                Sign in
              </button>
            )
          )}
        </div>
        <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"26px",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,
          background:"linear-gradient(135deg,#FFF 0%,rgba(255,255,255,0.6) 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
          Maximize every purchase.
        </h1>

        {/* Stats bar */}
        {(lookups > 0) && (
          <div style={{ display:"flex",justifyContent:"center",gap:"24px",marginTop:"12px",animation:"fUp 0.3s ease" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#00DC82" }}>{lookups}</div>
              <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Lookups</div>
            </div>
            <div style={{ width:"1px",backgroundColor:"rgba(255,255,255,0.06)" }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#00DC82" }}>{sel.length}</div>
              <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Cards</div>
            </div>
            <div style={{ width:"1px",backgroundColor:"rgba(255,255,255,0.06)" }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"18px",fontWeight:800,color:"#FFD700" }}>~${totalSaved.toFixed(0)}</div>
              <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600 }}>Extra rewards</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",margin:"0 20px",borderRadius:"12px",backgroundColor:"rgba(255,255,255,0.03)",padding:"4px",position:"relative",zIndex:1 }}>
        {[{key:"wallet",label:"My Wallet"},{key:"search",label:"Find Best Card"}].map(t => (
          <button key={t.key} onClick={() => { setView(t.key); if(t.key==="search") setTimeout(()=>ref.current?.focus(),150); }}
            style={{ flex:1,padding:"12px",border:"none",borderRadius:"10px",
              backgroundColor: view===t.key?"rgba(0,220,130,0.1)":"transparent",
              fontFamily:"'Syne',sans-serif",fontSize:"12px",fontWeight:700,letterSpacing:"0.06em",
              textTransform:"uppercase",color: view===t.key?"#00DC82":"rgba(255,255,255,0.3)",cursor:"pointer",transition:"all 0.25s ease" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"20px",maxWidth:"520px",margin:"0 auto",position:"relative",zIndex:1 }}>

        {/* WALLET */}
        {view === "wallet" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {/* Card search */}
            <div style={{ position:"relative",marginBottom:"16px" }}>
              <div style={{ position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"14px",opacity:0.4,pointerEvents:"none" }}>🔍</div>
              <input type="text" placeholder="Search 25 cards..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%",padding:"12px 14px 12px 40px",border:"1.5px solid rgba(255,255,255,0.06)",borderRadius:"12px",
                  backgroundColor:"rgba(255,255,255,0.03)",fontFamily:"'Outfit',sans-serif",fontSize:"13px",color:"#FFF",outline:"none" }} />
            </div>

            {filteredIssuers.map(issuer => {
              const cards = filteredCards.filter(c => c.issuer === issuer);
              if (cards.length === 0) return null;
              return (
                <div key={issuer} style={{ marginBottom:"18px" }}>
                  <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                    color:"rgba(255,255,255,0.2)",marginBottom:"8px",fontFamily:"'Syne',sans-serif" }}>{issuer}</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
                    {cards.map(card => <Chip key={card.id} card={card} selected={sel.includes(card.id)} onToggle={toggle} />)}
                  </div>
                </div>
              );
            })}

            {sel.length > 0 && (
              <button onClick={() => { setView("search"); setTimeout(()=>ref.current?.focus(),150); }}
                style={{ width:"100%",padding:"16px",background:"linear-gradient(135deg,#00DC82 0%,#00C974 100%)",
                  color:"#0A0F1A",border:"none",borderRadius:"14px",fontFamily:"'Syne',sans-serif",fontSize:"14px",
                  fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",marginTop:"8px",
                  boxShadow:"0 4px 20px rgba(0,220,130,0.3)",transition:"all 0.2s ease" }}>
                Find the best card →
              </button>
            )}
          </div>
        )}

        {/* SEARCH */}
        {view === "search" && (
          <div style={{ animation:"fUp 0.3s ease" }}>
            {sel.length === 0 ? (
              <div style={{ textAlign:"center",padding:"48px 20px" }}>
                <div style={{ fontSize:"40px",marginBottom:"16px" }}>💳</div>
                <div style={{ fontSize:"15px",fontWeight:600,color:"rgba(255,255,255,0.5)",fontFamily:"'Syne',sans-serif" }}>Add cards first</div>
                <button onClick={() => setView("wallet")}
                  style={{ marginTop:"20px",padding:"12px 28px",background:"linear-gradient(135deg,#00DC82,#00C974)",
                    color:"#0A0F1A",border:"none",borderRadius:"12px",fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer" }}>
                  Set Up Wallet
                </button>
              </div>
            ) : (
              <>
                <div style={{ position:"relative",marginBottom:"20px" }}>
                  <div style={{ position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",fontSize:"16px",opacity:0.4,pointerEvents:"none" }}>🔍</div>
                  <input ref={ref} type="text" placeholder="Where are you spending?" value={input}
                    onChange={e => { setInput(e.target.value); setLastTop(null); }}
                    style={{ width:"100%",padding:"16px 18px 16px 44px",border:"2px solid rgba(255,255,255,0.06)",borderRadius:"14px",
                      backgroundColor:"rgba(255,255,255,0.03)",fontFamily:"'Outfit',sans-serif",fontSize:"15px",fontWeight:500,color:"#FFF",outline:"none",
                      transition:"all 0.2s ease" }}
                    onFocus={e => { e.target.style.borderColor="rgba(0,220,130,0.4)"; e.target.style.backgroundColor="rgba(0,220,130,0.03)"; }}
                    onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.06)"; e.target.style.backgroundColor="rgba(255,255,255,0.03)"; }} />

                  {suggestions.length > 0 && input.length >= 2 && !MC[input.toLowerCase()] && (
                    <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,backgroundColor:"#141A2A",
                      border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:"12px",zIndex:10,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
                      {suggestions.map((s, i) => (
                        <button key={s} onClick={() => setInput(s)}
                          style={{ display:"flex",alignItems:"center",gap:"10px",width:"100%",textAlign:"left",padding:"12px 16px",
                            border:"none",backgroundColor:"transparent",fontFamily:"'Outfit',sans-serif",fontSize:"13px",fontWeight:500,
                            color:"rgba(255,255,255,0.7)",cursor:"pointer",borderBottom: i<suggestions.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(0,220,130,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                          <span style={{ fontSize:"14px" }}>{CATEGORY_ICONS[MC[s.toLowerCase()]] || "🏪"}</span>{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {cat && input.trim() && (
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
                          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"13px",color:"#00DC82" }}>Smart move</div>
                          <div style={{ fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"2px",lineHeight:1.4 }}>
                            <strong style={{ color:"rgba(255,255,255,0.7)" }}>{ranked[0].card.shortName}</strong> earns{" "}
                            <strong style={{ color:"#00DC82" }}>{savings}% more</strong> rewards on {(CATEGORY_LABELS[cat]||cat).toLowerCase()}.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!input.trim() && (
                  <div style={{ marginTop:"4px" }}>
                    <div style={{ fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",
                      color:"rgba(255,255,255,0.2)",marginBottom:"12px",fontFamily:"'Syne',sans-serif" }}>Popular categories</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
                      {Object.entries(CATEGORY_LABELS).filter(([k]) => k!=="general" && k!=="entertainment").map(([k, v]) => (
                        <button key={k} onClick={() => setInput(v)}
                          style={{ padding:"8px 14px",border:"1.5px solid rgba(255,255,255,0.06)",borderRadius:"20px",
                            backgroundColor:"rgba(255,255,255,0.02)",fontFamily:"'Outfit',sans-serif",fontSize:"12px",fontWeight:500,
                            color:"rgba(255,255,255,0.45)",cursor:"pointer",transition:"all 0.2s ease",display:"flex",alignItems:"center",gap:"6px" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor="rgba(0,220,130,0.08)"; e.currentTarget.style.color="#00DC82"; e.currentTarget.style.borderColor="rgba(0,220,130,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor="rgba(255,255,255,0.02)"; e.currentTarget.style.color="rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}>
                          <span style={{ fontSize:"13px" }}>{CATEGORY_ICONS[k]}</span>{v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign:"center",padding:"32px 20px",fontSize:"11px",color:"rgba(255,255,255,0.12)",marginTop:"40px" }}>
        CardAdvisor · 25 cards · Not financial advice · Rates as of Feb 2026
      </div>
    </div>
  );
}
