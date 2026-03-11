import { useState, useCallback, useRef } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const layoutTemplates = [
  { id: "front-page",   name: "Front Page",      columns: 5, preview: "Classic newspaper front",  type: "print"   },
  { id: "feature",      name: "Feature Spread",   columns: 3, preview: "Magazine style layout",    type: "print"   },
  { id: "opinion",      name: "Opinion Section",  columns: 2, preview: "Editorial columns",        type: "print"   },
  { id: "web-article",  name: "Web Article",      columns: 1, preview: "Responsive web layout",    type: "digital" },
  { id: "web-grid",     name: "News Grid",        columns: 3, preview: "Card-based homepage",      type: "digital" },
  { id: "mobile-feed",  name: "Mobile Feed",      columns: 1, preview: "Scrollable mobile view",   type: "digital" },
];

// px dimensions are screen representations of the real paper ratio
// Broadsheet ~5:8, Tabloid ~2:3, A4 ~1:√2 (1:1.414)
const pageSizes = [
  { id: "broadsheet", name: "Broadsheet", size: "375 × 600mm", pxW: 560, pxH: 896 },
  { id: "tabloid",    name: "Tabloid",    size: "280 × 430mm", pxW: 500, pxH: 768 },
  { id: "a4",         name: "A4",         size: "210 × 297mm", pxW: 480, pxH: 679 },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  Layers:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Wand2:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>,
  Spin:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Grid3X3:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Columns:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="9" height="18" x="2" y="3" rx="1"/><rect width="9" height="18" x="13" y="3" rx="1"/></svg>,
  BigGrid:   () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Newspaper: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
  Monitor:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
  Phone:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>,
  FileText:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  ZoomIn:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>,
  ZoomOut:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>,
  Reset:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Check:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Upload:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  X:         () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Sparkle:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>,
};

// ── Image block helper ────────────────────────────────────────────────────────
function ImgBlock({ src, style = {} }) {
  const isReal = src && src !== "placeholder" && src !== "main-image" && src !== "secondary-image";
  return (
    <div style={{ width:"100%", height:"100%", minHeight:90, background:"#e2ddd8", borderRadius:2, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", ...style }}>
      {isReal
        ? <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — FRONT PAGE: classic 5-column broadsheet
// ══════════════════════════════════════════════════════════════════════════════
function FrontPageLayout({ blocks, pageW = 560, pageH = 896 }) {
  const headline  = blocks.find(b => b.type === "headline");
  const images    = blocks.filter(b => b.type === "image");
  const subhead   = blocks.find(b => b.type === "subhead");
  const bodies    = blocks.filter(b => b.type === "body");
  const pullquote = blocks.find(b => b.type === "pullquote");
  const today     = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" }).toUpperCase();
  const pad       = Math.round(pageW * 0.05);
  const imgH      = Math.round(pageH * 0.22);
  const hl        = Math.round(pageW * 0.048);
  const body      = Math.round(pageW * 0.019);

  return (
    <div style={{ width:pageW, minHeight:pageH, background:"#faf8f3", fontFamily:"Georgia,serif", color:"#111", padding:`${pad}px ${pad+4}px ${pad+8}px`, borderRadius:3, boxShadow:"0 20px 60px rgba(0,0,0,0.55)", position:"relative" }}>
      {/* Page size watermark */}
      <div style={{ position:"absolute", top:5, right:8, fontSize:7.5, color:"#d4c4a0", letterSpacing:"0.1em", fontFamily:"monospace", textTransform:"uppercase" }}>
        {pageW === 560 ? "Broadsheet" : pageW === 500 ? "Tabloid" : "A4"}
      </div>
      {/* Masthead */}
      <div style={{ textAlign:"center", borderBottom:"3px double #111", paddingBottom:Math.round(pad*0.55), marginBottom:Math.round(pad*0.65) }}>
        <div style={{ fontSize:Math.round(pageW*0.058), fontWeight:900, letterSpacing:"0.07em", textTransform:"uppercase" }}>The Daily Forge</div>
        <div style={{ fontSize:Math.round(pageW*0.016), color:"#888", marginTop:4, letterSpacing:"0.12em" }}>{today} · EST. MCMXXI · VOL. XLVII</div>
      </div>
      {/* 5-col grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:Math.round(pageW*0.018) }}>
        {headline && (
          <div style={{ gridColumn:"span 5", borderBottom:"2px solid #111", paddingBottom:8, marginBottom:2 }}>
            <div style={{ fontSize:hl, fontWeight:900, lineHeight:1.15 }}>{headline.content}</div>
          </div>
        )}
        {/* Big image spans 3 cols */}
        <div style={{ gridColumn:"span 3", minHeight:imgH }}>
          <ImgBlock src={images[0]?.content} style={{ minHeight:imgH }} />
        </div>
        {/* Right sidebar spans 2 cols */}
        <div style={{ gridColumn:"span 2", display:"flex", flexDirection:"column", gap:8 }}>
          {subhead   && <p style={{ fontSize:Math.round(body*1.15), fontWeight:700, color:"#222", borderLeft:"2.5px solid #111", paddingLeft:8, margin:0, lineHeight:1.5, fontStyle:"italic" }}>{subhead.content}</p>}
          {bodies[0] && <p style={{ fontSize:body, lineHeight:1.75, color:"#1a1a1a", margin:0, textAlign:"justify" }}>{bodies[0].content}</p>}
          {pullquote && <blockquote style={{ fontSize:Math.round(body*1.1), fontStyle:"italic", fontWeight:700, borderTop:"2px solid #111", borderBottom:"2px solid #111", padding:"8px 0", margin:0, textAlign:"center" }}>{pullquote.content}</blockquote>}
        </div>
        {/* Remaining body paragraphs */}
        {bodies.slice(1).map(b => (
          <div key={b.id} style={{ gridColumn:"span 2", fontSize:body, lineHeight:1.75, textAlign:"justify", color:"#1a1a1a" }}>{b.content}</div>
        ))}
        {/* Extra images */}
        {images.slice(1).map(img => (
          <div key={img.id} style={{ gridColumn:"span 2", minHeight:Math.round(imgH*0.55) }}>
            <ImgBlock src={img.content} style={{ minHeight:Math.round(imgH*0.55) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — FEATURE SPREAD: large hero image, 3-col magazine
// ══════════════════════════════════════════════════════════════════════════════
function FeatureLayout({ blocks, pageW = 560, pageH = 896 }) {
  const headline  = blocks.find(b => b.type === "headline");
  const images    = blocks.filter(b => b.type === "image");
  const subhead   = blocks.find(b => b.type === "subhead");
  const bodies    = blocks.filter(b => b.type === "body");
  const pullquote = blocks.find(b => b.type === "pullquote");
  const heroH     = Math.round(pageH * 0.26);
  const pad       = Math.round(pageW * 0.04);
  const bodyFs    = Math.round(pageW * 0.019);

  return (
    <div style={{ width:pageW, minHeight:pageH, background:"#fff", fontFamily:"Georgia,serif", color:"#111", borderRadius:3, boxShadow:"0 20px 60px rgba(0,0,0,0.55)", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", top:5, right:8, fontSize:7.5, color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em", fontFamily:"monospace", textTransform:"uppercase", zIndex:10 }}>
        {pageW === 560 ? "Broadsheet" : pageW === 500 ? "Tabloid" : "A4"}
      </div>
      {/* Full-bleed hero with headline overlay */}
      <div style={{ width:"100%", height:heroH, position:"relative" }}>
        <ImgBlock src={images[0]?.content} style={{ minHeight:heroH, borderRadius:0 }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)", display:"flex", alignItems:"flex-end", padding:`${pad}px ${pad+2}px` }}>
          {headline && <div style={{ fontSize:Math.round(pageW*0.044), fontWeight:900, color:"#fff", lineHeight:1.2, textShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>{headline.content}</div>}
        </div>
        <div style={{ position:"absolute", top:14, left:14, background:"#d4a853", color:"#0a0a0a", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 10px", borderRadius:99 }}>Feature</div>
      </div>
      {/* 3-col body */}
      <div style={{ padding:`${pad}px ${pad+2}px ${pad+6}px`, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:Math.round(pageW*0.025) }}>
        {subhead && (
          <div style={{ gridColumn:"span 3", borderBottom:"1px solid #ddd", paddingBottom:10, marginBottom:2 }}>
            <p style={{ fontSize:Math.round(bodyFs*1.2), fontWeight:700, color:"#333", margin:0, lineHeight:1.5 }}>{subhead.content}</p>
          </div>
        )}
        {bodies.map(b => (
          <div key={b.id} style={{ fontSize:bodyFs, lineHeight:1.8, color:"#222", textAlign:"justify" }}>{b.content}</div>
        ))}
        {pullquote && (
          <div style={{ gridColumn:"span 3", background:"#f5f0e8", borderLeft:"4px solid #d4a853", padding:"12px 16px", margin:"4px 0" }}>
            <div style={{ fontSize:Math.round(bodyFs*1.3), fontStyle:"italic", fontWeight:700, color:"#333", lineHeight:1.4 }}>{pullquote.content}</div>
          </div>
        )}
        {images.slice(1).map(img => (
          <div key={img.id} style={{ minHeight:Math.round(pageH*0.12) }}>
            <ImgBlock src={img.content} style={{ minHeight:Math.round(pageH*0.12) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — OPINION: narrow 2-col editorial, heavy serif, byline
// ══════════════════════════════════════════════════════════════════════════════
function OpinionLayout({ blocks, pageW = 560, pageH = 896 }) {
  const headline  = blocks.find(b => b.type === "headline");
  const subhead   = blocks.find(b => b.type === "subhead");
  const bodies    = blocks.filter(b => b.type === "body");
  const pullquote = blocks.find(b => b.type === "pullquote");
  const images    = blocks.filter(b => b.type === "image");
  const pad       = Math.round(pageW * 0.058);
  const bodyFs    = Math.round(pageW * 0.021);

  return (
    <div style={{ width:pageW, minHeight:pageH, background:"#faf8f3", fontFamily:"Georgia,serif", color:"#111", padding:`${pad}px ${pad+6}px`, borderRadius:3, boxShadow:"0 20px 60px rgba(0,0,0,0.55)", position:"relative" }}>
      <div style={{ position:"absolute", top:5, right:8, fontSize:7.5, color:"#d4c4a0", letterSpacing:"0.1em", fontFamily:"monospace", textTransform:"uppercase" }}>
        {pageW === 560 ? "Broadsheet" : pageW === 500 ? "Tabloid" : "A4"}
      </div>
      {/* Opinion strip */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, paddingBottom:10, borderBottom:"1px solid #ccc" }}>
        <div style={{ background:"#111", color:"#fff", fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", padding:"3px 10px" }}>Opinion</div>
        <div style={{ fontSize:9, color:"#999", letterSpacing:"0.06em" }}>The Daily Forge Editorial Board</div>
      </div>
      {headline && (
        <div style={{ fontSize:Math.round(pageW*0.052), fontWeight:900, lineHeight:1.15, marginBottom:8, borderBottom:"2px solid #111", paddingBottom:10 }}>{headline.content}</div>
      )}
      {subhead && (
        <div style={{ fontSize:Math.round(bodyFs*1.05), fontStyle:"italic", color:"#555", marginBottom:16, lineHeight:1.5 }}>{subhead.content}</div>
      )}
      {/* 2-col body */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:Math.round(pageW*0.035) }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {bodies.filter((_,i)=>i%2===0).map(b=>(
            <p key={b.id} style={{ fontSize:bodyFs, lineHeight:1.8, margin:0, textAlign:"justify", color:"#1a1a1a" }}>{b.content}</p>
          ))}
          {images[0] && <div style={{ minHeight:Math.round(pageH*0.14) }}><ImgBlock src={images[0].content} style={{ minHeight:Math.round(pageH*0.14) }} /></div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {pullquote && (
            <div style={{ borderTop:"3px solid #111", borderBottom:"3px solid #111", padding:"10px 0" }}>
              <div style={{ fontSize:Math.round(bodyFs*1.3), fontStyle:"italic", fontWeight:700, lineHeight:1.4, color:"#111" }}>{pullquote.content}</div>
            </div>
          )}
          {bodies.filter((_,i)=>i%2!==0).map(b=>(
            <p key={b.id} style={{ fontSize:bodyFs, lineHeight:1.8, margin:0, textAlign:"justify", color:"#1a1a1a" }}>{b.content}</p>
          ))}
          {images[1] && <div style={{ minHeight:Math.round(pageH*0.14) }}><ImgBlock src={images[1].content} style={{ minHeight:Math.round(pageH*0.14) }} /></div>}
        </div>
      </div>
      <div style={{ borderTop:"1px solid #ccc", marginTop:20, paddingTop:10, fontSize:9, color:"#aaa", textAlign:"center", letterSpacing:"0.06em" }}>
        © THE DAILY FORGE — ALL RIGHTS RESERVED
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — WEB ARTICLE: single column, modern article format
// ══════════════════════════════════════════════════════════════════════════════
function WebArticleLayout({ blocks }) {
  const headline  = blocks.find(b => b.type === "headline");
  const subhead   = blocks.find(b => b.type === "subhead");
  const bodies    = blocks.filter(b => b.type === "body");
  const pullquote = blocks.find(b => b.type === "pullquote");
  const images    = blocks.filter(b => b.type === "image");

  return (
    <div style={{ width:480, background:"#fff", fontFamily:"Georgia,serif", color:"#1a1a1a", borderRadius:8, boxShadow:"0 20px 60px rgba(0,0,0,0.55)", overflow:"hidden" }}>
      {images[0] && (
        <div style={{ width:"100%", height:180 }}>
          <ImgBlock src={images[0].content} style={{ minHeight:180, borderRadius:0 }} />
        </div>
      )}
      <div style={{ padding:"24px 32px 32px" }}>
        {/* Tag + read time */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ background:"#f0f0f0", color:"#555", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:99, fontFamily:"sans-serif" }}>Breaking News</span>
          <span style={{ fontSize:10, color:"#aaa", fontFamily:"sans-serif" }}>· 4 min read</span>
        </div>
        {headline && <h1 style={{ fontSize:26, fontWeight:900, lineHeight:1.2, margin:"0 0 10px", color:"#0a0a0a" }}>{headline.content}</h1>}
        {subhead  && <p  style={{ fontSize:14, color:"#555", lineHeight:1.6, margin:"0 0 18px", borderBottom:"1px solid #eee", paddingBottom:16, fontStyle:"italic" }}>{subhead.content}</p>}
        {/* Byline */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#d4a853,#a07840)", flexShrink:0 }} />
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"#333", fontFamily:"sans-serif" }}>Staff Reporter</div>
            <div style={{ fontSize:10, color:"#aaa", fontFamily:"sans-serif" }}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
          </div>
        </div>
        {/* Body paragraphs with pullquote and images interleaved */}
        {bodies.map((b, i) => (
          <div key={b.id}>
            <p style={{ fontSize:13, lineHeight:1.85, color:"#222", margin:"0 0 16px" }}>{b.content}</p>
            {pullquote && i === 1 && (
              <blockquote style={{ borderLeft:"4px solid #d4a853", paddingLeft:16, margin:"16px 0", fontSize:15, fontStyle:"italic", fontWeight:700, color:"#333" }}>{pullquote.content}</blockquote>
            )}
            {images[i + 1] && (
              <div style={{ margin:"16px 0", borderRadius:6, overflow:"hidden", height:120 }}>
                <ImgBlock src={images[i+1].content} style={{ minHeight:120 }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Share bar */}
      <div style={{ borderTop:"1px solid #eee", padding:"12px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:10, color:"#aaa", fontFamily:"sans-serif" }}>Share this article</div>
        <div style={{ display:"flex", gap:8 }}>
          {["𝕏","in","f"].map(s => (
            <div key={s} style={{ width:26, height:26, borderRadius:"50%", background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#555" }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 — NEWS GRID: card-based 3-col homepage
// ══════════════════════════════════════════════════════════════════════════════
function NewsGridLayout({ blocks }) {
  const headline = blocks.find(b => b.type === "headline");
  const images   = blocks.filter(b => b.type === "image");
  const bodies   = blocks.filter(b => b.type === "body");
  const subhead  = blocks.find(b => b.type === "subhead");

  const cards = [];
  if (headline) cards.push({ title: headline.content, body: bodies[0]?.content, img: images[0]?.content, tag:"Breaking", featured:true });
  if (subhead)  cards.push({ title: subhead.content,  body: bodies[1]?.content, img: images[1]?.content, tag:"Politics" });
  bodies.slice(2).forEach((b,i) => cards.push({ title: b.content.substring(0,60)+"…", img: images[i+2]?.content, tag:["Tech","World","Economy","Sports"][i%4] }));
  while (cards.length < 3) cards.push({ title:"More stories loading…", img:null, tag:"News" });

  return (
    <div style={{ width:540, fontFamily:"Georgia,serif", color:"#111" }}>
      {/* Nav bar */}
      <div style={{ background:"#0a0a0a", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:"3px 3px 0 0" }}>
        <div style={{ color:"#d4a853", fontWeight:900, fontSize:15, letterSpacing:"0.06em" }}>THE DAILY FORGE</div>
        <div style={{ display:"flex", gap:14 }}>
          {["World","Politics","Tech","Sports"].map(t => (
            <span key={t} style={{ color:"#888", fontSize:10, letterSpacing:"0.04em", fontFamily:"sans-serif" }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Card grid */}
      <div style={{ background:"#f0f0f0", padding:12, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, borderRadius:"0 0 3px 3px" }}>
        {/* Featured — spans 2 cols */}
        {cards[0] && (
          <div style={{ gridColumn:"span 2", background:"#fff", borderRadius:6, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ height:150 }}><ImgBlock src={cards[0].img} style={{ minHeight:150, borderRadius:0 }} /></div>
            <div style={{ padding:"12px 14px" }}>
              <span style={{ background:"#e03131", color:"#fff", fontSize:8, fontWeight:700, letterSpacing:"0.1em", padding:"2px 8px", borderRadius:99, fontFamily:"sans-serif" }}>{cards[0].tag.toUpperCase()}</span>
              <div style={{ fontSize:15, fontWeight:900, lineHeight:1.2, marginTop:6, color:"#0a0a0a" }}>{cards[0].title}</div>
              {cards[0].body && <p style={{ fontSize:10, color:"#666", lineHeight:1.6, margin:"6px 0 0", fontFamily:"sans-serif" }}>{cards[0].body.substring(0,100)}…</p>}
            </div>
          </div>
        )}
        {/* Right stacked cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {cards.slice(1,3).map((card,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:6, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", flex:1 }}>
              {card.img && <div style={{ height:70 }}><ImgBlock src={card.img} style={{ minHeight:70, borderRadius:0 }} /></div>}
              <div style={{ padding:"8px 10px" }}>
                <span style={{ background:"#e8e8e8", color:"#555", fontSize:8, fontWeight:700, letterSpacing:"0.08em", padding:"2px 6px", borderRadius:99, fontFamily:"sans-serif" }}>{card.tag.toUpperCase()}</span>
                <div style={{ fontSize:11, fontWeight:700, lineHeight:1.3, marginTop:4, color:"#0a0a0a" }}>{card.title.substring(0,55)}{card.title.length>55?"…":""}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Bottom row */}
        {cards.slice(3,6).map((card,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:6, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
            {card.img && <div style={{ height:60 }}><ImgBlock src={card.img} style={{ minHeight:60, borderRadius:0 }} /></div>}
            <div style={{ padding:"8px 10px" }}>
              <span style={{ background:"#e8e8e8", color:"#555", fontSize:8, fontWeight:700, letterSpacing:"0.08em", padding:"2px 6px", borderRadius:99, fontFamily:"sans-serif" }}>{card.tag.toUpperCase()}</span>
              <div style={{ fontSize:10.5, fontWeight:700, lineHeight:1.3, marginTop:4, color:"#0a0a0a" }}>{card.title.substring(0,50)}{card.title.length>50?"…":""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 6 — MOBILE FEED: phone shell with scrollable news feed
// ══════════════════════════════════════════════════════════════════════════════
function MobileFeedLayout({ blocks }) {
  const headline = blocks.find(b => b.type === "headline");
  const images   = blocks.filter(b => b.type === "image");
  const bodies   = blocks.filter(b => b.type === "body");
  const subhead  = blocks.find(b => b.type === "subhead");

  const feedItems = [];
  if (headline) feedItems.push({ title: headline.content, body: subhead?.content||"", img: images[0]?.content, time:"Just now", tag:"Top Story" });
  bodies.forEach((b,i) => feedItems.push({ title: b.content.substring(0,70), img: images[i+1]?.content, time:`${i+1}h ago`, tag:["World","Tech","Sports","Economy"][i%4] }));
  while (feedItems.length < 4) feedItems.push({ title:"More headlines loading…", img:null, time:"—", tag:"News" });

  const tagColors = { "Top Story":"#d4a853", World:"#3b82f6", Tech:"#8b5cf6", Sports:"#22c55e", Economy:"#ef4444", News:"#6b7280" };

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      {/* Phone shell */}
      <div style={{ width:240, background:"#1a1a1a", borderRadius:32, padding:"10px 6px", boxShadow:"0 20px 60px rgba(0,0,0,0.6)", border:"1.5px solid #333" }}>
        {/* Notch */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}>
          <div style={{ width:60, height:6, background:"#333", borderRadius:99 }} />
        </div>
        {/* Status bar */}
        <div style={{ padding:"0 12px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:8, color:"#888", fontFamily:"sans-serif", fontWeight:600 }}>{new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>
          <div style={{ display:"flex", gap:3, alignItems:"center" }}>
            {[3,2,1].map(h => <div key={h} style={{ width:3, height:h*3+3, background:"#888", borderRadius:1 }} />)}
            <div style={{ width:12, height:7, border:"1px solid #888", borderRadius:2, marginLeft:2, display:"flex", alignItems:"center", padding:"0 1px" }}>
              <div style={{ width:8, height:4, background:"#888", borderRadius:1 }} />
            </div>
          </div>
        </div>
        {/* App content */}
        <div style={{ background:"#f5f5f5", borderRadius:20, overflow:"hidden" }}>
          {/* App header */}
          <div style={{ background:"#0a0a0a", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ color:"#d4a853", fontSize:11, fontWeight:900, letterSpacing:"0.06em", fontFamily:"sans-serif" }}>FORGE</div>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"#d4a853", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          {/* Category tabs */}
          <div style={{ display:"flex", overflowX:"auto", background:"#fff", borderBottom:"1px solid #eee", padding:"0 8px" }}>
            {["For You","World","Tech","Sports"].map((t,i)=>(
              <div key={t} style={{ padding:"7px 10px", fontSize:9, fontWeight:i===0?700:400, color:i===0?"#d4a853":"#999", borderBottom:i===0?"2px solid #d4a853":"2px solid transparent", whiteSpace:"nowrap", fontFamily:"sans-serif" }}>{t}</div>
            ))}
          </div>
          {/* Feed cards */}
          <div style={{ padding:"8px", display:"flex", flexDirection:"column", gap:6 }}>
            {feedItems.slice(0,4).map((item,i)=>(
              <div key={i} style={{ background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                {i === 0 && item.img && <div style={{ height:80 }}><ImgBlock src={item.img} style={{ minHeight:80, borderRadius:0 }} /></div>}
                <div style={{ padding:"7px 9px", display:"flex", gap:8, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
                      <span style={{ fontSize:7, fontWeight:700, color:tagColors[item.tag]||"#888", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"sans-serif" }}>{item.tag}</span>
                      <span style={{ fontSize:7, color:"#ccc", fontFamily:"sans-serif" }}>· {item.time}</span>
                    </div>
                    <div style={{ fontSize:9.5, fontWeight:700, lineHeight:1.3, color:"#0a0a0a", fontFamily:"Georgia,serif" }}>{item.title.substring(0,65)}{item.title.length>65?"…":""}</div>
                  </div>
                  {i !== 0 && item.img && (
                    <div style={{ width:40, height:40, borderRadius:6, overflow:"hidden", flexShrink:0 }}>
                      <ImgBlock src={item.img} style={{ minHeight:40, borderRadius:0 }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom nav */}
          <div style={{ background:"#fff", borderTop:"1px solid #eee", padding:"6px 0", display:"flex", justifyContent:"space-around" }}>
            {[
              <svg key="h" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
              <svg key="s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
              <svg key="b" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
              <svg key="p" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            ].map((icon,i)=>(
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, color:i===0?"#d4a853":"#aaa" }}>
                {icon}
                <div style={{ width:4, height:4, borderRadius:"50%", background:i===0?"#d4a853":"transparent" }} />
              </div>
            ))}
          </div>
        </div>
        {/* Home indicator */}
        <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
          <div style={{ width:50, height:4, background:"#444", borderRadius:99 }} />
        </div>
      </div>
    </div>
  );
}

// ── Route to correct template ─────────────────────────────────────────────────
function TemplatePreview({ templateId, blocks, pageSize }) {
  if (!blocks.length) return null;
  const pW = pageSize?.pxW ?? 560;
  const pH = pageSize?.pxH ?? 896;
  switch (templateId) {
    case "front-page":  return <FrontPageLayout  blocks={blocks} pageW={pW} pageH={pH} />;
    case "feature":     return <FeatureLayout     blocks={blocks} pageW={pW} pageH={pH} />;
    case "opinion":     return <OpinionLayout     blocks={blocks} pageW={pW} pageH={pH} />;
    case "web-article": return <WebArticleLayout  blocks={blocks} />;
    case "web-grid":    return <NewsGridLayout     blocks={blocks} />;
    case "mobile-feed": return <MobileFeedLayout  blocks={blocks} />;
    default:            return <FrontPageLayout   blocks={blocks} pageW={pW} pageH={pH} />;
  }
}

// ── Generate structured blocks from raw input ─────────────────────────────────
function generateBlocks(text, images) {
  const blocks = [];
  if (text.trim()) {
    const sentences = text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
    if (sentences[0]) blocks.push({ id:"h1",  type:"headline",  content:sentences[0].substring(0,120), span:5 });
    blocks.push({ id:"img1", type:"image", content:images[0]||"placeholder", span:3 });
    if (sentences[1]) blocks.push({ id:"sub1", type:"subhead",  content:sentences[1].substring(0,100), span:2 });
    sentences.slice(2).forEach((s,i) => blocks.push({ id:`body${i}`, type:"body", content:s, span:i%2===0?2:3 }));
    if (sentences.length > 3) blocks.push({ id:"pq1", type:"pullquote", content:`"${sentences[Math.floor(sentences.length/2)]}"`, span:2 });
    images.slice(1).forEach((url,i) => blocks.push({ id:`img${i+2}`, type:"image", content:url, span:2 }));
  } else {
    images.forEach((url,i) => blocks.push({ id:`img${i}`, type:"image", content:url, span:i===0?5:2 }));
  }
  return blocks;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export function AutoLayout() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPageSize, setSelectedPageSize] = useState(pageSizes[0]);
  const [contentBlocks, setContentBlocks]       = useState([]);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [zoom, setZoom]                         = useState(90);
  const [activeTab, setActiveTab]               = useState("print");
  const [inputText, setInputText]               = useState("");
  const [uploadedImages, setUploadedImages]     = useState([]);
  const [isDragging, setIsDragging]             = useState(false);
  const [isUploading, setIsUploading]           = useState(false);
  const [exportMsg, setExportMsg]               = useState("");
  const fileInputRef = useRef(null);

  const handleDragOver  = useCallback(e=>{ e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(e=>{ e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback(async e => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith("image/"));
    if (files.length) { setIsUploading(true); setUploadedImages(p=>[...p,...files.map(f=>URL.createObjectURL(f))]); setIsUploading(false); }
  }, []);
  const handleFileSelect = useCallback(async e => {
    const files = Array.from(e.target.files||[]);
    if (files.length) { setIsUploading(true); setUploadedImages(p=>[...p,...files.map(f=>URL.createObjectURL(f))]); setIsUploading(false); }
    e.target.value="";
  }, []);

  const removeImage = i => {
    const url = uploadedImages[i];
    URL.revokeObjectURL(url);
    setUploadedImages(p=>p.filter((_,idx)=>idx!==i));
    setContentBlocks(p=>p.filter(b=>b.content!==url));
  };

  const handleGenerate = () => {
    if (!inputText.trim() && !uploadedImages.length) return;
    setIsGenerating(true);
    setTimeout(()=>{ setContentBlocks(generateBlocks(inputText, uploadedImages)); setIsGenerating(false); }, 1400);
  };

  const showMsg = msg => { setExportMsg(msg); setTimeout(()=>setExportMsg(""), 3000); };

  const exportPDF = () => {
    if (!contentBlocks.length) return;
    const w = window.open("","_blank");
    if (w) { w.document.write(`<!DOCTYPE html><html><head><title>Layout Export</title></head><body style="margin:40px auto;max-width:600px;font-family:Georgia,serif">${document.querySelector(".preview-render-target")?.innerHTML||"<p>No layout rendered yet.</p>"}</body></html>`); w.document.close(); setTimeout(()=>w.print(),700); }
    showMsg("Print dialog opened — save as PDF.");
  };

  const exportJSON = () => {
    if (!contentBlocks.length) return;
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([JSON.stringify({template:selectedTemplate,pageSize:selectedPageSize,blocks:contentBlocks},null,2)],{type:"application/json"})),download:`layout-${Date.now()}.json`});
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showMsg("JSON downloaded — import via InDesign scripting.");
  };

  const exportHTML = () => {
    if (!contentBlocks.length) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Layout</title></head><body style="font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px">${contentBlocks.map(b=>`<div style="margin:12px 0">${b.type==="headline"?`<h1>${b.content}</h1>`:b.type==="body"?`<p>${b.content}</p>`:b.type==="subhead"?`<h2>${b.content}</h2>`:b.type==="pullquote"?`<blockquote style="border-left:4px solid #d4a853;padding:8px 16px;font-style:italic">${b.content}</blockquote>`:b.type==="image"&&b.content&&b.content!=="placeholder"?`<img src="${b.content}" style="width:100%;border-radius:4px" />`:`<p><em>[Image]</em></p>`}</div>`).join("")}</body></html>`;
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([html],{type:"text/html"})),download:`layout-${Date.now()}.html`});
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showMsg("HTML exported — open in any browser.");
  };

  const filteredTemplates = layoutTemplates.filter(t=>t.type===activeTab);
  const canGenerate = (inputText.trim()||uploadedImages.length) && selectedTemplate && !isGenerating;

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#e2ddd6", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:99px;}
        .al-card{background:#12121e;border:1px solid rgba(255,255,255,0.07);border-radius:12px;transition:border-color .2s;}
        .al-card:hover{border-color:rgba(255,255,255,0.11);}
        .al-label{font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#d4a853;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
        .al-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,0.1),transparent);}
        .tab-btn{flex:1;padding:9px;border:none;border-radius:6px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;letter-spacing:.03em;}
        .tab-on{background:#d4a853;color:#080810;}
        .tab-off{background:transparent;color:#5a5a6a;}
        .tab-off:hover{color:#9a9a9a;}
        .tmpl-btn{width:100%;background:#1a1a28;border:1px solid transparent;border-radius:8px;padding:9px 11px;cursor:pointer;display:flex;align-items:center;gap:9px;text-align:left;transition:all .15s;}
        .tmpl-btn:hover{border-color:rgba(255,255,255,0.12);background:#1f1f30;}
        .tmpl-on{background:rgba(212,168,83,0.1)!important;border-color:rgba(212,168,83,0.35)!important;}
        .size-btn{width:100%;background:#1a1a28;border:1px solid transparent;border-radius:8px;padding:9px 13px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all .15s;}
        .size-btn:hover{border-color:rgba(255,255,255,0.12);}
        .size-on{background:rgba(212,168,83,0.1)!important;border-color:rgba(212,168,83,0.35)!important;}
        .gen-btn{width:100%;padding:13px;border:none;border-radius:8px;background:linear-gradient(135deg,#d4a853,#a07030);color:#080810;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;letter-spacing:.05em;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(212,168,83,.2);}
        .gen-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(212,168,83,.35);}
        .gen-btn:disabled{opacity:.35;cursor:not-allowed;transform:none;}
        .drop-zone{border:1.5px dashed rgba(255,255,255,0.12);border-radius:8px;padding:16px 12px;text-align:center;cursor:pointer;transition:all .2s;}
        .drop-zone:hover{border-color:rgba(212,168,83,.45);background:rgba(212,168,83,.03);}
        .drop-active{border-color:#d4a853!important;background:rgba(212,168,83,.07)!important;}
        .export-btn{width:100%;background:#1a1a28;border:1px solid rgba(255,255,255,0.07);color:#7a7585;padding:9px 13px;border-radius:7px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:12px;font-family:'DM Sans',sans-serif;transition:all .15s;}
        .export-btn:hover:not(:disabled){border-color:rgba(255,255,255,.15);color:#e2ddd6;background:#1f1f30;}
        .export-btn:disabled{opacity:.3;cursor:not-allowed;}
        .suggestion{background:#1a1a28;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:11px 12px;}
        .suggestion-hi{background:rgba(212,168,83,.07)!important;border-color:rgba(212,168,83,.25)!important;}
        .zoom-btn{background:#12121e;border:1px solid rgba(255,255,255,.07);color:#7a7585;cursor:pointer;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .zoom-btn:hover{border-color:rgba(255,255,255,.15);color:#e2ddd6;}
        .al-textarea{width:100%;height:108px;padding:11px 13px;background:#1a1a28;border:1px solid rgba(255,255,255,.07);border-radius:8px;color:#e2ddd6;font-size:12.5px;resize:none;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s;line-height:1.6;}
        .al-textarea:focus{border-color:rgba(212,168,83,.4);}
        .al-textarea::placeholder{color:#3a3a4a;font-style:italic;}
        .progress-track{height:3px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;}
        .progress-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.16,1,.3,1);}
        .preview-render{animation:fadeIn .35s ease;}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"16px 26px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(8,8,16,0.92)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#d4a853,#8b6020)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 16px rgba(212,168,83,.3)" }}>
            <Icons.Newspaper />
          </div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:"#f5f0e8" }}>Auto Layout</div>
            <div style={{ fontSize:11, color:"#5a5a6a", marginTop:1, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>AI-powered layout generation for print & digital</div>
          </div>
        </div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"#d4a853", background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.25)", padding:"4px 12px", borderRadius:99 }}>INFYNEXA STUDIO</div>
      </div>

      <main style={{ padding:"22px 26px", display:"grid", gridTemplateColumns:"258px 1fr 216px", gap:18 }}>

        {/* LEFT PANEL */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <div className="al-card" style={{ padding:18 }}>
            <div className="al-label">Content</div>
            <textarea className="al-textarea" value={inputText} onChange={e=>setInputText(e.target.value)} placeholder="Paste your article content here…" />
            <div className={cn("drop-zone", isDragging&&"drop-active")} style={{ marginTop:10 }}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={()=>fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display:"none" }} />
              {isUploading
                ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:"#5a5a6a" }}><Icons.Spin /><span style={{ fontSize:12 }}>Uploading…</span></div>
                : <><div style={{ color:isDragging?"#d4a853":"#3a3a4a", marginBottom:6 }}><Icons.Upload /></div>
                    <p style={{ fontSize:11, color:isDragging?"#d4a853":"#3a3a4a", margin:0 }}>{isDragging?"Release to drop":"Drop images or click to browse"}</p></>}
            </div>
            {uploadedImages.length > 0 && (
              <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {uploadedImages.map((img,i)=>(
                  <div key={i} style={{ position:"relative", borderRadius:7, overflow:"hidden", aspectRatio:"1", background:"#1a1a28" }}>
                    <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    <button onClick={e=>{e.stopPropagation();removeImage(i);}}
                      style={{ position:"absolute", top:3, right:3, background:"rgba(0,0,0,0.8)", border:"none", borderRadius:"50%", width:18, height:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                      <Icons.X />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tab toggle */}
          <div className="al-card" style={{ padding:5, display:"flex", gap:3 }}>
            <button className={cn("tab-btn", activeTab==="print"?"tab-on":"tab-off")} onClick={()=>setActiveTab("print")}><Icons.Newspaper /> Print</button>
            <button className={cn("tab-btn", activeTab==="digital"?"tab-on":"tab-off")} onClick={()=>setActiveTab("digital")}><Icons.Monitor /> Digital</button>
          </div>

          {/* Templates */}
          <div className="al-card" style={{ padding:18 }}>
            <div className="al-label">Templates</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {filteredTemplates.map(t=>(
                <button key={t.id} className={cn("tmpl-btn", selectedTemplate?.id===t.id&&"tmpl-on")} onClick={()=>setSelectedTemplate(t)}>
                  <div style={{ width:34, height:34, background:"rgba(255,255,255,0.04)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#5a5a6a", flexShrink:0 }}>
                    {t.columns===1?<Icons.FileText />:t.columns<=2?<Icons.Columns />:<Icons.Grid3X3 />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12.5, fontWeight:600, color:"#e2ddd6", fontFamily:"'DM Sans',sans-serif" }}>{t.name}</div>
                    <div style={{ fontSize:10.5, color:"#4a4a5a", marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>{t.preview}</div>
                  </div>
                  {selectedTemplate?.id===t.id && <span style={{ color:"#d4a853" }}><Icons.Check /></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Page size */}
          {activeTab==="print" && (
            <div className="al-card" style={{ padding:18 }}>
              <div className="al-label">Page Size</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {pageSizes.map(s=>(
                  <button key={s.id} className={cn("size-btn", selectedPageSize.id===s.id&&"size-on")} onClick={()=>setSelectedPageSize(s)}>
                    <span style={{ fontSize:12.5, fontWeight:600, color:"#e2ddd6", fontFamily:"'DM Sans',sans-serif" }}>{s.name}</span>
                    <span style={{ fontSize:10.5, color:"#4a4a5a", fontFamily:"'DM Mono',monospace" }}>{s.size}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="gen-btn" onClick={handleGenerate} disabled={!canGenerate}>
            {isGenerating ? <><Icons.Spin /> Generating…</> : <><Icons.Wand2 /> Generate Layout</>}
          </button>
        </div>

        {/* CENTER PREVIEW */}
        <div className="al-card" style={{ padding:18, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="al-label" style={{ margin:0 }}>
                {selectedTemplate ? `Preview — ${selectedTemplate.name}` : "Layout Preview"}
              </div>
              {activeTab === "print" && selectedPageSize && contentBlocks.length > 0 && (
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", background:"rgba(212,168,83,0.12)", color:"#d4a853", border:"1px solid rgba(212,168,83,0.3)", padding:"2px 9px", borderRadius:99, fontFamily:"'DM Mono',monospace" }}>
                  {selectedPageSize.name} · {selectedPageSize.size}
                </span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <button className="zoom-btn" onClick={()=>setZoom(z=>Math.max(40,z-10))}><Icons.ZoomOut /></button>
              <span style={{ fontSize:11, color:"#5a5a6a", width:36, textAlign:"center", fontFamily:"'DM Mono',monospace" }}>{zoom}%</span>
              <button className="zoom-btn" onClick={()=>setZoom(z=>Math.min(150,z+10))}><Icons.ZoomIn /></button>
              <button className="zoom-btn" onClick={()=>setZoom(90)}><Icons.Reset /></button>
            </div>
          </div>

          <div style={{ flex:1, background:"#06060e", borderRadius:8, overflow:"auto", display:"flex", alignItems:contentBlocks.length?"flex-start":"center", justifyContent:"center", minHeight:520, padding:28,
            backgroundImage:contentBlocks.length?"none":"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
            backgroundSize:"36px 36px" }}>
            {contentBlocks.length > 0 ? (
              <div className="preview-render preview-render-target" style={{ transform:`scale(${zoom/100})`, transformOrigin:"top center", transition:"transform .25s cubic-bezier(.16,1,.3,1)" }}>
                <TemplatePreview templateId={selectedTemplate?.id} blocks={contentBlocks} pageSize={selectedPageSize} />
              </div>
            ) : (
              <div style={{ textAlign:"center", color:"#2a2a3a" }}>
                <Icons.BigGrid />
                <p style={{ fontSize:13, margin:"10px 0 4px", color:"#3a3a4a" }}>Select a template and generate a layout</p>
                <p style={{ fontSize:11, color:"#2a2a3a" }}>Each template renders a genuinely different format</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <div className="al-card" style={{ padding:18 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div className="al-label" style={{ margin:0 }}>Layout Fit</div>
              {contentBlocks.length>0 && <span style={{ fontSize:9, fontWeight:700, background:"rgba(74,222,128,0.12)", color:"#4ade80", padding:"2px 8px", borderRadius:99, letterSpacing:"0.08em" }}>OK</span>}
            </div>
            {contentBlocks.length>0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[["Column Usage","92%",92,"#d4a853"],["Text Overflow","None",0,"#4ade80"],["Image Fit","100%",100,"#d4a853"]].map(([label,val,pct,color])=>(
                  <div key={label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:11, color:"#5a5a6a", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:pct===0?"#4ade80":"#e2ddd6", fontFamily:"'DM Mono',monospace" }}>{val}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width:`${pct}%`, background:color }} /></div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize:11, color:"#3a3a4a", textAlign:"center", padding:"10px 0", margin:0, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>Generate a layout to see analysis</p>}
          </div>

          {contentBlocks.length>0 && (
            <div className="al-card" style={{ padding:18 }}>
              <div className="al-label">AI Suggestions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  { title:"Optimize headline", desc:"Shorten by 2 words for better balance", hi:true },
                  { title:"Add pull quote",    desc:"Consider a quote in column 4",          hi:false },
                  { title:"Image crop",        desc:"Auto-crop for better focus point",       hi:false },
                ].map(s=>(
                  <div key={s.title} className={cn("suggestion", s.hi&&"suggestion-hi")}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ color:"#d4a853" }}><Icons.Sparkle /></span>
                      <span style={{ fontSize:11.5, fontWeight:600, color:"#e2ddd6", fontFamily:"'DM Sans',sans-serif" }}>{s.title}</span>
                    </div>
                    <p style={{ fontSize:10.5, color:"#4a4a5a", margin:0, paddingLeft:18, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="al-card" style={{ padding:18 }}>
            <div className="al-label">Export</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <button className="export-btn" disabled={!contentBlocks.length} onClick={exportPDF}><Icons.FileText /> Export as PDF</button>
              <button className="export-btn" disabled={!contentBlocks.length} onClick={exportJSON}><Icons.Layers /> Export to InDesign</button>
              <button className="export-btn" disabled={!contentBlocks.length} onClick={exportHTML}><Icons.Monitor /> Publish to Web</button>
            </div>
            {exportMsg && (
              <div style={{ marginTop:8, padding:"8px 10px", background:"rgba(74,222,128,0.1)", borderRadius:6, fontSize:10.5, color:"#4ade80", textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>
                {exportMsg}
              </div>
            )}
          </div>

          {activeTab==="digital" && (
            <div className="al-card" style={{ padding:18 }}>
              <div className="al-label">Preview As</div>
              <div style={{ display:"flex", gap:7 }}>
                <button className="export-btn" style={{ flex:1, justifyContent:"center" }}><Icons.Monitor /> Desktop</button>
                <button className="export-btn" style={{ flex:1, justifyContent:"center" }}><Icons.Phone /> Mobile</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AutoLayout;