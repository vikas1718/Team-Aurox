import { useState, useRef } from "react";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const Ico = {
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Filter: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Calendar: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  Globe: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  Radio: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>,
  Phone: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>,
  Newspaper: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/></svg>,
  Share: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Headphones: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>,
  Monitor: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
  Edit: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Copy: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Trash: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  X: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
};

const PLATFORM_CONFIG = {
  Web:       { icon: Ico.Globe,       color: "#3b82f6", dim: "rgba(59,130,246,0.15)",  dot: "#3b82f6" },
  Radio:     { icon: Ico.Radio,       color: "#22c55e", dim: "rgba(34,197,94,0.15)",   dot: "#22c55e" },
  App:       { icon: Ico.Phone,       color: "#06b6d4", dim: "rgba(6,182,212,0.15)",   dot: "#06b6d4" },
  Print:     { icon: Ico.Newspaper,   color: "#f97316", dim: "rgba(249,115,22,0.15)",  dot: "#f97316" },
  Social:    { icon: Ico.Share,       color: "#ec4899", dim: "rgba(236,72,153,0.15)",  dot: "#ec4899" },
  Podcast:   { icon: Ico.Headphones,  color: "#f59e0b", dim: "rgba(245,158,11,0.15)", dot: "#f59e0b" },
  "e-Paper": { icon: Ico.Monitor,     color: "#a855f7", dim: "rgba(168,85,247,0.15)", dot: "#a855f7" },
  All:       { icon: Ico.Globe,       color: "#d4a853", dim: "rgba(212,168,83,0.15)", dot: "#d4a853" },
};

const PLATFORMS = Object.keys(PLATFORM_CONFIG);

const INITIAL_CONTENT = [
  { id:"1",  title:"Morning Brief",        description:"Daily morning news roundup",       platform:"Radio",     time:"08:00", date:"2026-01-15", status:"published" },
  { id:"2",  title:"Market Open Report",   description:"Stock market opening analysis",    platform:"Web",       time:"09:00", date:"2026-01-15", status:"published" },
  { id:"3",  title:"Daily Digest",         description:"Comprehensive news digest",        platform:"e-Paper",   time:"09:30", date:"2026-01-15", status:"scheduled" },
  { id:"4",  title:"Breaking: Policy",     description:"Government policy announcement",   platform:"All",       time:"11:00", date:"2026-01-15", status:"scheduled" },
  { id:"5",  title:"Noon Update",          description:"Midday news summary",              platform:"App",       time:"12:00", date:"2026-01-15", status:"scheduled" },
  { id:"6",  title:"Deep Dive Analysis",   description:"In-depth analysis podcast",        platform:"Podcast",   time:"14:00", date:"2026-01-15", status:"draft" },
  { id:"7",  title:"Evening Social",       description:"Social media engagement content",  platform:"Social",    time:"18:00", date:"2026-01-15", status:"scheduled" },
  { id:"8",  title:"Print Edition",        description:"Tomorrow's print edition",         platform:"Print",     time:"22:00", date:"2026-01-15", status:"draft" },
  { id:"9",  title:"Tech Review",          description:"Weekly technology review",         platform:"Web",       time:"10:00", date:"2026-01-16", status:"scheduled" },
  { id:"10", title:"Weekend Preview",      description:"Events preview for the weekend",   platform:"App",       time:"15:00", date:"2026-01-17", status:"draft" },
];

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

function getDays(start) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function fmtDate(d) { return d.toISOString().split("T")[0]; }
function fmtDisp(d) { return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }); }

const STATUS_STYLE = {
  published: { bg: "rgba(34,197,94,0.12)",  color: "#4ade80",  label: "Published"  },
  scheduled: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa",  label: "Scheduled"  },
  draft:     { bg: "rgba(120,113,108,0.2)", color: "#a8a29e",  label: "Draft"      },
};

export function PublicationTimeline() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [newItem, setNewItem] = useState({ title:"", description:"", platform:"Web", date: new Date().toISOString().split("T")[0], time:"09:00" });
  const [hoveredId, setHoveredId] = useState(null);

  const days = getDays(currentDate);
  const TODAY = new Date().toISOString().split("T")[0];

  const navWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const navDay = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const navMonth = (dir) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const handleNav = (dir) => {
    if (view === "day") {
      navDay(dir);
    } else if (view === "week") {
      navWeek(dir);
    } else {
      navMonth(dir);
    }
  };

  const getDateRangeDisplay = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } else if (view === "week") {
      return `${weekStart} — ${weekEnd}`;
    } else {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  };

  const getSlotContent = (date, hour) => content.filter(c =>
    c.date === date &&
    c.time.startsWith(hour.split(":")[0]) &&
    (selectedPlatforms.length === 0 || selectedPlatforms.includes(c.platform))
  );

  const togglePlatform = (p) => setSelectedPlatforms(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  );

  const addContent = () => {
    if (!newItem.title) return;
    setContent(prev => [...prev, { ...newItem, id: Date.now().toString(), status: "draft" }]);
    setNewItem({ title:"", description:"", platform:"Web", date:"2026-01-15", time:"09:00" });
    setShowModal(false);
  };

  const deleteContent = (id) => setContent(prev => prev.filter(c => c.id !== id));

  const duplicateContent = (item) => setContent(prev => [...prev, { ...item, id: Date.now().toString(), status: "draft" }]);

  const onDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => { setDraggedId(null); setDragOver(null); };
  const onDragOver = (e, date, hour) => { e.preventDefault(); setDragOver(`${date}|${hour}`); };
  const onDrop = (e, date, hour) => {
    e.preventDefault();
    if (draggedId) {
      setContent(prev => prev.map(c => c.id === draggedId
        ? { ...c, date, time: hour, status: c.status === "published" ? "scheduled" : c.status }
        : c
      ));
    }
    setDraggedId(null);
    setDragOver(null);
  };

  const weekStart = days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekEnd   = days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const stats = {
    scheduled: content.filter(c => c.status === "scheduled").length,
    published: content.filter(c => c.status === "published").length,
    draft:     content.filter(c => c.status === "draft").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #080810; --surface: #12121e; --surface2: #1a1a28; --surface3: #1f1f30;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
          --gold: #d4a853; --gold2: #f0c878; --gold-dim: rgba(212,168,83,0.12); --gold-glow: rgba(212,168,83,0.22);
          --text: #e2ddd6; --text-dim: #7a7585; --text-faint: #3d3948;
          --green: #4ade80; --blue: #60a5fa; --red: #f87171;
          --radius: 10px; --radius-sm: 6px;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }

        .pt-root { min-height:100vh; background:var(--ink); color:var(--text); font-family:'DM Sans',sans-serif; position:relative; }
        .pt-root::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
          background: radial-gradient(ellipse 80% 50% at 60% 0%, rgba(212,168,83,0.04) 0%, transparent 60%);
        }
        .pt-inner { position:relative; z-index:1; }

        /* Header */
        .pt-header { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid var(--border); background:rgba(8,8,16,0.85); backdrop-filter:blur(12px); position:sticky; top:0; z-index:50; animation:fadeUp .4s ease; }
        .pt-logo { width:34px; height:34px; background:linear-gradient(135deg,var(--gold),#8b6020); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#080810; box-shadow:0 0 18px var(--gold-glow); }
        .pt-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:900; color:#f5f0e8; }
        .pt-sub { font-size:11px; color:var(--text-dim); margin-top:1px; font-weight:300; }

        /* Controls */
        .pt-controls { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:20px 28px 0; animation:fadeUp .4s ease .08s both; }
        .view-toggle { display:flex; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:3px; gap:2px; }
        .view-btn { padding:7px 16px; border:none; border-radius:4px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:.04em; text-transform:capitalize; transition:all .15s; }
        .view-on { background:var(--gold); color:#080810; }
        .view-off { background:transparent; color:var(--text-dim); }
        .view-off:hover { color:var(--text); }

        .nav-row { display:flex; align-items:center; gap:8px; }
        .nav-btn { width:30px; height:30px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:all .15s; }
        .nav-btn:hover { border-color:var(--border2); color:var(--text); }
        .date-chip { display:flex; align-items:center; gap:8px; padding:7px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); font-size:12px; font-weight:500; color:var(--text); font-family:'DM Mono',monospace; }
        .today-btn { padding:7px 14px; background:transparent; border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; color:var(--text-dim); transition:all .15s; }
        .today-btn:hover { border-color:var(--gold); color:var(--gold); }

        .add-btn { display:flex; align-items:center; gap:7px; padding:9px 18px; background:linear-gradient(135deg,var(--gold),#a07030); border:none; border-radius:var(--radius-sm); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:700; color:#080810; letter-spacing:.04em; transition:all .2s; box-shadow:0 4px 16px var(--gold-glow); }
        .add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(212,168,83,.35); }

        /* Filters */
        .filters { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:16px 28px 0; animation:fadeUp .4s ease .12s both; }
        .filter-label { font-size:11px; color:var(--text-faint); display:flex; align-items:center; gap:5px; }
        .filter-chip { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:99px; border:1px solid transparent; cursor:pointer; font-size:11.5px; font-weight:600; transition:all .15s; font-family:'DM Sans',sans-serif; }
        .filter-off { background:var(--surface2); border-color:var(--border); color:var(--text-dim); }
        .filter-off:hover { border-color:var(--border2); color:var(--text); }
        .clear-btn { background:none; border:none; cursor:pointer; font-size:11px; color:var(--text-faint); text-decoration:underline; font-family:'DM Sans',sans-serif; }
        .clear-btn:hover { color:var(--text-dim); }

        /* Calendar */
        .cal-wrap { margin:20px 28px 0; border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; animation:fadeUp .4s ease .16s both; }
        .cal-head { display:grid; grid-template-columns:56px repeat(7,1fr); border-bottom:1px solid var(--border); background:var(--surface); }
        .cal-head-cell { padding:12px 8px; text-align:center; border-left:1px solid var(--border); }
        .cal-head-cell:first-child { border-left:none; display:flex; align-items:center; justify-content:center; color:var(--text-faint); }
        .cal-head-day { font-size:12px; font-weight:700; color:var(--text); font-family:'DM Sans',sans-serif; }
        .cal-head-month { font-size:10px; color:var(--text-faint); margin-top:2px; font-family:'DM Mono',monospace; }
        .cal-today-head { background:var(--gold-dim); }
        .cal-today-text { color:var(--gold) !important; }

        .cal-body { max-height:580px; overflow-y:auto; background:var(--surface); }
        .cal-body::-webkit-scrollbar { width:4px; }
        .cal-body::-webkit-scrollbar-track { background:transparent; }
        .cal-body::-webkit-scrollbar-thumb { background:var(--border2); border-radius:99px; }

        .cal-row { display:grid; grid-template-columns:56px repeat(7,1fr); border-bottom:1px solid var(--border); }
        .cal-row:last-child { border-bottom:none; }

        .cal-hour { padding:0 6px; display:flex; align-items:flex-start; justify-content:center; padding-top:8px; font-family:'DM Mono',monospace; font-size:10px; color:var(--text-faint); border-right:1px solid var(--border); background:var(--surface2); min-height:72px; }
        .cal-cell { min-height:72px; padding:4px; border-left:1px solid var(--border); transition:background .15s; position:relative; }
        .cal-cell-today { background:rgba(212,168,83,0.03); }
        .cal-cell-dragover { background:rgba(212,168,83,0.1) !important; box-shadow:inset 0 0 0 1.5px var(--gold); }

        /* Content cards */
        .content-card { border-radius:5px; padding:6px 7px; margin-bottom:3px; cursor:grab; transition:all .15s; border:1px solid rgba(255,255,255,0.06); position:relative; animation:fadeIn .25s ease; }
        .content-card:active { cursor:grabbing; }
        .content-card:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.4); border-color:rgba(255,255,255,0.12); }
        .content-card-dragging { opacity:.4; transform:scale(.96); }
        .card-title { font-size:10.5px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
        .card-meta { display:flex; align-items:center; gap:5px; }
        .card-platform { font-size:9px; color:var(--text-dim); }
        .card-status { font-size:9px; font-weight:600; padding:1px 6px; border-radius:99px; margin-left:auto; }
        .card-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; margin-top:1px; }

        .card-actions { position:absolute; top:3px; right:3px; display:flex; gap:2px; opacity:0; transition:opacity .15s; background:rgba(8,8,16,.9); border-radius:4px; padding:2px; }
        .content-card:hover .card-actions { opacity:1; }
        .card-act-btn { width:20px; height:20px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:3px; color:var(--text-dim); transition:all .12s; }
        .card-act-btn:hover { background:rgba(255,255,255,0.1); color:var(--text); }
        .card-act-del:hover { background:rgba(248,113,113,0.2); color:var(--red); }

        /* Stats */
        .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:20px 28px 0; animation:fadeUp .4s ease .2s both; }
        .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; }
        .stat-label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text-faint); margin-bottom:14px; display:flex; align-items:center; gap:6px; }
        .stat-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,var(--border2),transparent); }

        .stats-nums { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; text-align:center; }
        .stat-num { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; line-height:1; }
        .stat-desc { font-size:10px; color:var(--text-faint); margin-top:4px; }

        .legend-item { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .legend-item:last-child { margin-bottom:0; }
        .legend-dot { width:10px; height:10px; border-radius:3px; }
        .legend-text { font-size:12px; color:var(--text-dim); }

        .distrib-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .distrib-chip { display:flex; align-items:center; gap:5px; background:var(--surface2); border:1px solid var(--border); border-radius:99px; padding:4px 10px; }
        .distrib-chip-dot { width:6px; height:6px; border-radius:50%; }
        .distrib-chip-name { font-size:10.5px; color:var(--text-dim); }
        .distrib-chip-count { font-size:10.5px; font-weight:700; color:var(--text); font-family:'DM Mono',monospace; }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:center; justify-content:center; animation:fadeIn .2s ease; }
        .modal { background:var(--surface); border:1px solid var(--border2); border-radius:14px; padding:28px; width:100%; max-width:440px; box-shadow:0 24px 80px rgba(0,0,0,.6); animation:modalIn .25s cubic-bezier(.16,1,.3,1); }
        .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
        .modal-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#f5f0e8; }
        .modal-close { width:28px; height:28px; background:var(--surface2); border:1px solid var(--border); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:all .15s; }
        .modal-close:hover { border-color:var(--border2); color:var(--text); }

        .field { margin-bottom:16px; }
        .field:last-child { margin-bottom:0; }
        .field-label { font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--text-faint); margin-bottom:7px; }
        .field-input { width:100%; padding:10px 13px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; outline:none; transition:border-color .15s; }
        .field-input:focus { border-color:rgba(212,168,83,.45); }
        .field-input::placeholder { color:var(--text-faint); }
        textarea.field-input { resize:none; height:72px; line-height:1.5; }
        select.field-input { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237a7585' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
        select.field-input option { background:var(--surface2); }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        .submit-btn { width:100%; padding:12px; background:linear-gradient(135deg,var(--gold),#a07030); border:none; border-radius:var(--radius-sm); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; color:#080810; letter-spacing:.05em; transition:all .2s; margin-top:4px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px var(--gold-glow); }
        .submit-btn:disabled { opacity:.35; cursor:not-allowed; }

        .pt-bottom { height:28px; }
      `}</style>

      <div className="pt-root">
        <div className="pt-inner">

          {/* Header */}
          <header className="pt-header">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="pt-logo"><Ico.Calendar /></div>
              <div>
                <div className="pt-title">Publication Timeline</div>
                <div className="pt-sub">Schedule and manage content across all platforms</div>
              </div>
            </div>
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <Ico.Plus /> Schedule Content
            </button>
          </header>

          {/* Controls */}
          <div className="pt-controls">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="view-toggle">
                {["day","week","month"].map(v => (
                  <button key={v} className={`view-btn ${view === v ? "view-on" : "view-off"}`} onClick={() => setView(v)}>{v}</button>
                ))}
              </div>
              <div className="nav-row">
                <button className="nav-btn" onClick={() => handleNav(-1)}><Ico.ChevronLeft /></button>
                <div className="date-chip">
                  <Ico.Calendar /> {getDateRangeDisplay()}
                </div>
                <button className="nav-btn" onClick={() => handleNav(1)}><Ico.ChevronRight /></button>
                <button className="today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters">
            <span className="filter-label"><Ico.Filter /> Filter:</span>
            {PLATFORMS.map(p => {
              const cfg = PLATFORM_CONFIG[p];
              const active = selectedPlatforms.includes(p);
              const PIcon = cfg.icon;
              return (
                <button
                  key={p}
                  className={`filter-chip ${active ? "" : "filter-off"}`}
                  style={active ? { background: cfg.dim, borderColor: cfg.color, color: cfg.color } : {}}
                  onClick={() => togglePlatform(p)}
                >
                  <PIcon /> {p}
                </button>
              );
            })}
            {selectedPlatforms.length > 0 && (
              <button className="clear-btn" onClick={() => setSelectedPlatforms([])}>Clear all</button>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="cal-wrap">
            {/* Header row */}
            <div className="cal-head">
              <div className="cal-head-cell"><Ico.Clock /></div>
              {days.map((day, i) => {
                const isToday = fmtDate(day) === TODAY;
                return (
                  <div key={i} className={`cal-head-cell ${isToday ? "cal-today-head" : ""}`}>
                    <div className={`cal-head-day ${isToday ? "cal-today-text" : ""}`}>{fmtDisp(day)}</div>
                    <div className="cal-head-month">{day.toLocaleDateString("en-US", { month:"short" })}</div>
                  </div>
                );
              })}
            </div>

            {/* Time slots */}
            <div className="cal-body">
              {HOURS.map(hour => (
                <div key={hour} className="cal-row">
                  <div className="cal-hour">{hour}</div>
                  {days.map((day, di) => {
                    const date = fmtDate(day);
                    const isToday = date === TODAY;
                    const slotKey = `${date}|${hour}`;
                    const isDragOver = dragOver === slotKey;
                    const slotContent = getSlotContent(date, hour);

                    return (
                      <div
                        key={di}
                        className={`cal-cell ${isToday ? "cal-cell-today" : ""} ${isDragOver ? "cal-cell-dragover" : ""}`}
                        onDragOver={e => onDragOver(e, date, hour)}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => onDrop(e, date, hour)}
                      >
                        {slotContent.map((item, ci) => {
                          const cfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.Web;
                          const PIcon = cfg.icon;
                          const st = STATUS_STYLE[item.status];
                          return (
                            <div
                              key={item.id}
                              className={`content-card ${draggedId === item.id ? "content-card-dragging" : ""}`}
                              style={{
                                background: cfg.dim,
                                borderColor: draggedId === item.id ? cfg.color : "rgba(255,255,255,0.07)",
                                animationDelay: `${ci * 0.04}s`,
                              }}
                              draggable
                              onDragStart={e => onDragStart(e, item.id)}
                              onDragEnd={onDragEnd}
                            >
                              <div style={{ display:"flex", alignItems:"flex-start", gap:5 }}>
                                <div className="card-dot" style={{ background: cfg.color }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div className="card-title">{item.title}</div>
                                  <div className="card-meta">
                                    <PIcon />
                                    <span className="card-platform">{item.platform}</span>
                                    <span className="card-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="card-actions">
                                <button className="card-act-btn" title="Edit"><Ico.Edit /></button>
                                <button className="card-act-btn" title="Duplicate" onClick={() => duplicateContent(item)}><Ico.Copy /></button>
                                <button className="card-act-btn card-act-del" title="Delete" onClick={() => deleteContent(item.id)}><Ico.Trash /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-row">
            {/* Status Legend */}
            <div className="stat-card">
              <div className="stat-label">Status Legend</div>
              {Object.entries(STATUS_STYLE).map(([key, val]) => (
                <div key={key} className="legend-item">
                  <div className="legend-dot" style={{ background: val.bg, border: `1.5px solid ${val.color}` }} />
                  <span className="legend-text">{val.label}</span>
                </div>
              ))}
            </div>

            {/* This Week */}
            <div className="stat-card">
              <div className="stat-label">This Week</div>
              <div className="stats-nums">
                <div>
                  <div className="stat-num" style={{ color: "#60a5fa" }}>{stats.scheduled}</div>
                  <div className="stat-desc">Scheduled</div>
                </div>
                <div>
                  <div className="stat-num" style={{ color: "#4ade80" }}>{stats.published}</div>
                  <div className="stat-desc">Published</div>
                </div>
                <div>
                  <div className="stat-num" style={{ color: "#a8a29e" }}>{stats.draft}</div>
                  <div className="stat-desc">Drafts</div>
                </div>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="stat-card">
              <div className="stat-label">Platforms</div>
              <div className="distrib-chips">
                {PLATFORMS.map(p => {
                  const count = content.filter(c => c.platform === p).length;
                  if (!count) return null;
                  const cfg = PLATFORM_CONFIG[p];
                  return (
                    <div key={p} className="distrib-chip">
                      <div className="distrib-chip-dot" style={{ background: cfg.color }} />
                      <span className="distrib-chip-name">{p}</span>
                      <span className="distrib-chip-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-bottom" />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Schedule Content</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><Ico.X /></button>
            </div>

            <div className="field">
              <div className="field-label">Title</div>
              <input className="field-input" placeholder="Content title…" value={newItem.title}
                onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
            </div>
            <div className="field">
              <div className="field-label">Description</div>
              <textarea className="field-input" placeholder="Brief description…" value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="field">
                <div className="field-label">Platform</div>
                <select className="field-input" value={newItem.platform}
                  onChange={e => setNewItem({ ...newItem, platform: e.target.value })}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field">
                <div className="field-label">Time</div>
                <select className="field-input" value={newItem.time}
                  onChange={e => setNewItem({ ...newItem, time: e.target.value })}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <div className="field-label">Date</div>
              <input type="date" className="field-input" value={newItem.date}
                onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
            </div>
            <button className="submit-btn" onClick={addContent} disabled={!newItem.title}>
              Schedule Content
            </button>
          </div>
        </div>
      )}
    </>
  );
}