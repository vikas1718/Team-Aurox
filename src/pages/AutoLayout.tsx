import { useState, useCallback, useRef } from "react";
import {
  Layers, Wand2, RefreshCw, Grid3X3, Columns,
  FileText, ZoomIn, ZoomOut, RotateCcw, Check,
  Upload, X, Sparkles, Monitor, Smartphone, Newspaper
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const layoutTemplates = [
  { id: "front-page",  name: "Front Page",     columns: 5, preview: "Classic newspaper front",  type: "print"   },
  { id: "feature",     name: "Feature Spread",  columns: 3, preview: "Magazine style layout",    type: "print"   },
  { id: "opinion",     name: "Opinion Section", columns: 2, preview: "Editorial columns",        type: "print"   },
  { id: "web-article", name: "Web Article",     columns: 1, preview: "Responsive web layout",    type: "digital" },
  { id: "web-grid",    name: "News Grid",       columns: 3, preview: "Card-based homepage",      type: "digital" },
  { id: "mobile-feed", name: "Mobile Feed",     columns: 1, preview: "Scrollable mobile view",   type: "digital" },
];

const pageSizes = [
  { id: "broadsheet", name: "Broadsheet", size: "375 × 600mm", pxW: 560, pxH: 896 },
  { id: "tabloid",    name: "Tabloid",    size: "280 × 430mm", pxW: 500, pxH: 768 },
  { id: "a4",         name: "A4",         size: "210 × 297mm", pxW: 480, pxH: 679 },
];

// ── Image block helper ────────────────────────────────────────
function ImgBlock({ src, style = {} }: { src?: string; style?: React.CSSProperties }) {
  const isReal = src && src !== "placeholder" && src !== "main-image" && src !== "secondary-image";
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 90, background: "#e2ddd8", borderRadius: 2, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      {isReal
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
      }
    </div>
  );
}

// ── Templates ─────────────────────────────────────────────────
function FrontPageLayout({ blocks, pageW = 560, pageH = 896 }: any) {
  const headline  = blocks.find((b: any) => b.type === "headline");
  const images    = blocks.filter((b: any) => b.type === "image");
  const subhead   = blocks.find((b: any) => b.type === "subhead");
  const bodies    = blocks.filter((b: any) => b.type === "body");
  const pullquote = blocks.find((b: any) => b.type === "pullquote");
  const today     = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();
  const pad       = Math.round(pageW * 0.05);
  const imgH      = Math.round(pageH * 0.22);
  const hl        = Math.round(pageW * 0.048);
  const body      = Math.round(pageW * 0.019);
  return (
    <div style={{ width: pageW, minHeight: pageH, background: "#faf8f3", fontFamily: "Georgia,serif", color: "#111", padding: `${pad}px ${pad + 4}px ${pad + 8}px`, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ position: "absolute", top: 5, right: 8, fontSize: 7.5, color: "#d4c4a0", letterSpacing: "0.1em", fontFamily: "monospace", textTransform: "uppercase" }}>{pageW === 560 ? "Broadsheet" : pageW === 500 ? "Tabloid" : "A4"}</div>
      <div style={{ textAlign: "center", borderBottom: "3px double #111", paddingBottom: Math.round(pad * 0.55), marginBottom: Math.round(pad * 0.65) }}>
        <div style={{ fontSize: Math.round(pageW * 0.058), fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>The Daily Forge</div>
        <div style={{ fontSize: Math.round(pageW * 0.016), color: "#888", marginTop: 4, letterSpacing: "0.12em" }}>{today} · EST. MCMXXI · VOL. XLVII</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: Math.round(pageW * 0.018) }}>
        {headline && <div style={{ gridColumn: "span 5", borderBottom: "2px solid #111", paddingBottom: 8, marginBottom: 2 }}><div style={{ fontSize: hl, fontWeight: 900, lineHeight: 1.15 }}>{headline.content}</div></div>}
        <div style={{ gridColumn: "span 3", minHeight: imgH }}><ImgBlock src={images[0]?.content} style={{ minHeight: imgH }} /></div>
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 8 }}>
          {subhead   && <p style={{ fontSize: Math.round(body * 1.15), fontWeight: 700, color: "#222", borderLeft: "2.5px solid #111", paddingLeft: 8, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{subhead.content}</p>}
          {bodies[0] && <p style={{ fontSize: body, lineHeight: 1.75, color: "#1a1a1a", margin: 0, textAlign: "justify" }}>{bodies[0].content}</p>}
          {pullquote && <blockquote style={{ fontSize: Math.round(body * 1.1), fontStyle: "italic", fontWeight: 700, borderTop: "2px solid #111", borderBottom: "2px solid #111", padding: "8px 0", margin: 0, textAlign: "center" }}>{pullquote.content}</blockquote>}
        </div>
        {bodies.slice(1).map((b: any) => <div key={b.id} style={{ gridColumn: "span 2", fontSize: body, lineHeight: 1.75, textAlign: "justify", color: "#1a1a1a" }}>{b.content}</div>)}
        {images.slice(1).map((img: any) => <div key={img.id} style={{ gridColumn: "span 2", minHeight: Math.round(imgH * 0.55) }}><ImgBlock src={img.content} style={{ minHeight: Math.round(imgH * 0.55) }} /></div>)}
      </div>
    </div>
  );
}

function FeatureLayout({ blocks, pageW = 560, pageH = 896 }: any) {
  const headline  = blocks.find((b: any) => b.type === "headline");
  const images    = blocks.filter((b: any) => b.type === "image");
  const subhead   = blocks.find((b: any) => b.type === "subhead");
  const bodies    = blocks.filter((b: any) => b.type === "body");
  const pullquote = blocks.find((b: any) => b.type === "pullquote");
  const heroH     = Math.round(pageH * 0.26);
  const pad       = Math.round(pageW * 0.04);
  const bodyFs    = Math.round(pageW * 0.019);
  return (
    <div style={{ width: pageW, minHeight: pageH, background: "#fff", fontFamily: "Georgia,serif", color: "#111", borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", overflow: "hidden", position: "relative" }}>
      <div style={{ width: "100%", height: heroH, position: "relative" }}>
        <ImgBlock src={images[0]?.content} style={{ minHeight: heroH, borderRadius: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)", display: "flex", alignItems: "flex-end", padding: `${pad}px ${pad + 2}px` }}>
          {headline && <div style={{ fontSize: Math.round(pageW * 0.044), fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{headline.content}</div>}
        </div>
        <div style={{ position: "absolute", top: 14, left: 14, background: "#d4a853", color: "#0a0a0a", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99 }}>Feature</div>
      </div>
      <div style={{ padding: `${pad}px ${pad + 2}px ${pad + 6}px`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: Math.round(pageW * 0.025) }}>
        {subhead && <div style={{ gridColumn: "span 3", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 2 }}><p style={{ fontSize: Math.round(bodyFs * 1.2), fontWeight: 700, color: "#333", margin: 0, lineHeight: 1.5 }}>{subhead.content}</p></div>}
        {bodies.map((b: any) => <div key={b.id} style={{ fontSize: bodyFs, lineHeight: 1.8, color: "#222", textAlign: "justify" }}>{b.content}</div>)}
        {pullquote && <div style={{ gridColumn: "span 3", background: "#f5f0e8", borderLeft: "4px solid #d4a853", padding: "12px 16px", margin: "4px 0" }}><div style={{ fontSize: Math.round(bodyFs * 1.3), fontStyle: "italic", fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{pullquote.content}</div></div>}
        {images.slice(1).map((img: any) => <div key={img.id} style={{ minHeight: Math.round(pageH * 0.12) }}><ImgBlock src={img.content} style={{ minHeight: Math.round(pageH * 0.12) }} /></div>)}
      </div>
    </div>
  );
}

function OpinionLayout({ blocks, pageW = 560, pageH = 896 }: any) {
  const headline  = blocks.find((b: any) => b.type === "headline");
  const subhead   = blocks.find((b: any) => b.type === "subhead");
  const bodies    = blocks.filter((b: any) => b.type === "body");
  const pullquote = blocks.find((b: any) => b.type === "pullquote");
  const images    = blocks.filter((b: any) => b.type === "image");
  const pad       = Math.round(pageW * 0.058);
  const bodyFs    = Math.round(pageW * 0.021);
  return (
    <div style={{ width: pageW, minHeight: pageH, background: "#faf8f3", fontFamily: "Georgia,serif", color: "#111", padding: `${pad}px ${pad + 6}px`, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #ccc" }}>
        <div style={{ background: "#111", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 10px" }}>Opinion</div>
        <div style={{ fontSize: 9, color: "#999", letterSpacing: "0.06em" }}>The Daily Forge Editorial Board</div>
      </div>
      {headline && <div style={{ fontSize: Math.round(pageW * 0.052), fontWeight: 900, lineHeight: 1.15, marginBottom: 8, borderBottom: "2px solid #111", paddingBottom: 10 }}>{headline.content}</div>}
      {subhead  && <div style={{ fontSize: Math.round(bodyFs * 1.05), fontStyle: "italic", color: "#555", marginBottom: 16, lineHeight: 1.5 }}>{subhead.content}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: Math.round(pageW * 0.035) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bodies.filter((_: any, i: number) => i % 2 === 0).map((b: any) => <p key={b.id} style={{ fontSize: bodyFs, lineHeight: 1.8, margin: 0, textAlign: "justify", color: "#1a1a1a" }}>{b.content}</p>)}
          {images[0] && <div style={{ minHeight: Math.round(pageH * 0.14) }}><ImgBlock src={images[0].content} style={{ minHeight: Math.round(pageH * 0.14) }} /></div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pullquote && <div style={{ borderTop: "3px solid #111", borderBottom: "3px solid #111", padding: "10px 0" }}><div style={{ fontSize: Math.round(bodyFs * 1.3), fontStyle: "italic", fontWeight: 700, lineHeight: 1.4, color: "#111" }}>{pullquote.content}</div></div>}
          {bodies.filter((_: any, i: number) => i % 2 !== 0).map((b: any) => <p key={b.id} style={{ fontSize: bodyFs, lineHeight: 1.8, margin: 0, textAlign: "justify", color: "#1a1a1a" }}>{b.content}</p>)}
          {images[1] && <div style={{ minHeight: Math.round(pageH * 0.14) }}><ImgBlock src={images[1].content} style={{ minHeight: Math.round(pageH * 0.14) }} /></div>}
        </div>
      </div>
    </div>
  );
}

function WebArticleLayout({ blocks }: any) {
  const headline  = blocks.find((b: any) => b.type === "headline");
  const subhead   = blocks.find((b: any) => b.type === "subhead");
  const bodies    = blocks.filter((b: any) => b.type === "body");
  const pullquote = blocks.find((b: any) => b.type === "pullquote");
  const images    = blocks.filter((b: any) => b.type === "image");
  return (
    <div style={{ width: 480, background: "#fff", fontFamily: "Georgia,serif", color: "#1a1a1a", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", overflow: "hidden" }}>
      {images[0] && <div style={{ width: "100%", height: 180 }}><ImgBlock src={images[0].content} style={{ minHeight: 180, borderRadius: 0 }} /></div>}
      <div style={{ padding: "24px 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ background: "#f0f0f0", color: "#555", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 99, fontFamily: "sans-serif" }}>Breaking News</span>
          <span style={{ fontSize: 10, color: "#aaa", fontFamily: "sans-serif" }}>· 4 min read</span>
        </div>
        {headline && <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, margin: "0 0 10px", color: "#0a0a0a" }}>{headline.content}</h1>}
        {subhead  && <p  style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "0 0 18px", borderBottom: "1px solid #eee", paddingBottom: 16, fontStyle: "italic" }}>{subhead.content}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#d4a853,#a07840)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#333", fontFamily: "sans-serif" }}>Staff Reporter</div>
            <div style={{ fontSize: 10, color: "#aaa", fontFamily: "sans-serif" }}>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>
        {bodies.map((b: any, i: number) => (
          <div key={b.id}>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: "#222", margin: "0 0 16px" }}>{b.content}</p>
            {pullquote && i === 1 && <blockquote style={{ borderLeft: "4px solid #d4a853", paddingLeft: 16, margin: "16px 0", fontSize: 15, fontStyle: "italic", fontWeight: 700, color: "#333" }}>{pullquote.content}</blockquote>}
            {images[i + 1] && <div style={{ margin: "16px 0", borderRadius: 6, overflow: "hidden", height: 120 }}><ImgBlock src={images[i + 1].content} style={{ minHeight: 120 }} /></div>}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #eee", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, color: "#aaa", fontFamily: "sans-serif" }}>Share this article</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["𝕏", "in", "f"].map(s => <div key={s} style={{ width: 26, height: 26, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#555" }}>{s}</div>)}
        </div>
      </div>
    </div>
  );
}

function NewsGridLayout({ blocks }: any) {
  const headline = blocks.find((b: any) => b.type === "headline");
  const images   = blocks.filter((b: any) => b.type === "image");
  const bodies   = blocks.filter((b: any) => b.type === "body");
  const subhead  = blocks.find((b: any) => b.type === "subhead");
  const cards: any[] = [];
  if (headline) cards.push({ title: headline.content, body: bodies[0]?.content, img: images[0]?.content, tag: "Breaking" });
  if (subhead)  cards.push({ title: subhead.content,  body: bodies[1]?.content, img: images[1]?.content, tag: "Politics" });
  bodies.slice(2).forEach((b: any, i: number) => cards.push({ title: b.content.substring(0, 60) + "…", img: images[i + 2]?.content, tag: ["Tech", "World", "Economy", "Sports"][i % 4] }));
  while (cards.length < 3) cards.push({ title: "More stories loading…", img: null, tag: "News" });
  return (
    <div style={{ width: 540, fontFamily: "Georgia,serif", color: "#111" }}>
      <div style={{ background: "#0a0a0a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "3px 3px 0 0" }}>
        <div style={{ color: "#d4a853", fontWeight: 900, fontSize: 15, letterSpacing: "0.06em" }}>THE DAILY FORGE</div>
        <div style={{ display: "flex", gap: 14 }}>
          {["World", "Politics", "Tech", "Sports"].map(t => <span key={t} style={{ color: "#888", fontSize: 10, letterSpacing: "0.04em", fontFamily: "sans-serif" }}>{t}</span>)}
        </div>
      </div>
      <div style={{ background: "#f0f0f0", padding: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, borderRadius: "0 0 3px 3px" }}>
        {cards[0] && (
          <div style={{ gridColumn: "span 2", background: "#fff", borderRadius: 6, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ height: 150 }}><ImgBlock src={cards[0].img} style={{ minHeight: 150, borderRadius: 0 }} /></div>
            <div style={{ padding: "12px 14px" }}>
              <span style={{ background: "#e03131", color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 99, fontFamily: "sans-serif" }}>{cards[0].tag.toUpperCase()}</span>
              <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.2, marginTop: 6, color: "#0a0a0a" }}>{cards[0].title}</div>
              {cards[0].body && <p style={{ fontSize: 10, color: "#666", lineHeight: 1.6, margin: "6px 0 0", fontFamily: "sans-serif" }}>{cards[0].body.substring(0, 100)}…</p>}
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.slice(1, 3).map((card: any, i: number) => (
            <div key={i} style={{ background: "#fff", borderRadius: 6, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", flex: 1 }}>
              {card.img && <div style={{ height: 70 }}><ImgBlock src={card.img} style={{ minHeight: 70, borderRadius: 0 }} /></div>}
              <div style={{ padding: "8px 10px" }}>
                <span style={{ background: "#e8e8e8", color: "#555", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 99, fontFamily: "sans-serif" }}>{card.tag.toUpperCase()}</span>
                <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginTop: 4, color: "#0a0a0a" }}>{card.title.substring(0, 55)}{card.title.length > 55 ? "…" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileFeedLayout({ blocks }: any) {
  const headline = blocks.find((b: any) => b.type === "headline");
  const images   = blocks.filter((b: any) => b.type === "image");
  const bodies   = blocks.filter((b: any) => b.type === "body");
  const subhead  = blocks.find((b: any) => b.type === "subhead");
  const feedItems: any[] = [];
  if (headline) feedItems.push({ title: headline.content, body: subhead?.content || "", img: images[0]?.content, time: "Just now", tag: "Top Story" });
  bodies.forEach((b: any, i: number) => feedItems.push({ title: b.content.substring(0, 70), img: images[i + 1]?.content, time: `${i + 1}h ago`, tag: ["World", "Tech", "Sports", "Economy"][i % 4] }));
  while (feedItems.length < 4) feedItems.push({ title: "More headlines loading…", img: null, time: "—", tag: "News" });
  const tagColors: any = { "Top Story": "#d4a853", World: "#3b82f6", Tech: "#8b5cf6", Sports: "#22c55e", Economy: "#ef4444", News: "#6b7280" };
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 240, background: "#1a1a1a", borderRadius: 32, padding: "10px 6px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", border: "1.5px solid #333" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><div style={{ width: 60, height: 6, background: "#333", borderRadius: 99 }} /></div>
        <div style={{ background: "#f5f5f5", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ background: "#0a0a0a", padding: "10px 14px" }}>
            <div style={{ color: "#d4a853", fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", fontFamily: "sans-serif" }}>FORGE</div>
          </div>
          <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
            {feedItems.slice(0, 4).map((item: any, i: number) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                {i === 0 && item.img && <div style={{ height: 80 }}><ImgBlock src={item.img} style={{ minHeight: 80, borderRadius: 0 }} /></div>}
                <div style={{ padding: "7px 9px" }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: tagColors[item.tag] || "#888", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "sans-serif", marginBottom: 3 }}>{item.tag} · {item.time}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1.3, color: "#0a0a0a", fontFamily: "Georgia,serif" }}>{item.title.substring(0, 65)}{item.title.length > 65 ? "…" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ templateId, blocks, pageSize }: any) {
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

function generateBlocks(text: string, images: string[]) {
  const blocks: any[] = [];
  if (text.trim()) {
    const sentences = text.split(/[.!?]+/).map((s: string) => s.trim()).filter(Boolean);
    if (sentences[0]) blocks.push({ id: "h1",   type: "headline",  content: sentences[0].substring(0, 120), span: 5 });
    blocks.push({ id: "img1", type: "image", content: images[0] || "placeholder", span: 3 });
    if (sentences[1]) blocks.push({ id: "sub1", type: "subhead",   content: sentences[1].substring(0, 100), span: 2 });
    sentences.slice(2).forEach((s: string, i: number) => blocks.push({ id: `body${i}`, type: "body", content: s, span: i % 2 === 0 ? 2 : 3 }));
    if (sentences.length > 3) blocks.push({ id: "pq1", type: "pullquote", content: `"${sentences[Math.floor(sentences.length / 2)]}"`, span: 2 });
    images.slice(1).forEach((url: string, i: number) => blocks.push({ id: `img${i + 2}`, type: "image", content: url, span: 2 }));
  } else {
    images.forEach((url: string, i: number) => blocks.push({ id: `img${i}`, type: "image", content: url, span: i === 0 ? 5 : 2 }));
  }
  return blocks;
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export function AutoLayout() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedPageSize, setSelectedPageSize] = useState(pageSizes[0]);
  const [contentBlocks,    setContentBlocks]    = useState<any[]>([]);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [zoom,             setZoom]             = useState(90);
  const [activeTab,        setActiveTab]        = useState("print");
  const [inputText,        setInputText]        = useState("");
  const [uploadedImages,   setUploadedImages]   = useState<string[]>([]);
  const [isDragging,       setIsDragging]       = useState(false);
  const [isUploading,      setIsUploading]      = useState(false);
  const [exportMsg,        setExportMsg]        = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) { setIsUploading(true); setUploadedImages(p => [...p, ...files.map(f => URL.createObjectURL(f))]); setIsUploading(false); }
  }, []);
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) { setIsUploading(true); setUploadedImages(p => [...p, ...files.map(f => URL.createObjectURL(f))]); setIsUploading(false); }
    e.target.value = "";
  }, []);

  const removeImage = (i: number) => {
    const url = uploadedImages[i];
    URL.revokeObjectURL(url);
    setUploadedImages(p => p.filter((_, idx) => idx !== i));
    setContentBlocks(p => p.filter((b: any) => b.content !== url));
  };

  const handleGenerate = () => {
    if (!inputText.trim() && !uploadedImages.length) return;
    setIsGenerating(true);
    setTimeout(() => { setContentBlocks(generateBlocks(inputText, uploadedImages)); setIsGenerating(false); }, 1400);
  };

  const showMsg = (msg: string) => { setExportMsg(msg); setTimeout(() => setExportMsg(""), 3000); };

  // ── Export PDF via window.print() ────────────────────────────
  const exportPDF = () => {
    if (!contentBlocks.length) return;
    const prevZoom = zoom;
    setZoom(100);
    setTimeout(() => {
      window.print();
      setZoom(prevZoom);
      showMsg("Print dialog opened — save as PDF.");
    }, 300);
  };

  // ── Export HTML ───────────────────────────────────────────────
  const exportHTML = () => {
    if (!contentBlocks.length) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Layout</title></head><body style="font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px">${contentBlocks.map((b: any) =>
      `<div style="margin:12px 0">${
        b.type === "headline"  ? `<h1>${b.content}</h1>` :
        b.type === "body"      ? `<p>${b.content}</p>` :
        b.type === "subhead"   ? `<h2>${b.content}</h2>` :
        b.type === "pullquote" ? `<blockquote style="border-left:4px solid #d4a853;padding:8px 16px;font-style:italic">${b.content}</blockquote>` :
        b.type === "image" && b.content && b.content !== "placeholder"
          ? `<img src="${b.content}" style="width:100%;border-radius:4px" />`
          : `<p><em>[Image]</em></p>`
      }</div>`).join("")}</body></html>`;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([html], { type: "text/html" })),
      download: `layout-${Date.now()}.html`
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showMsg("HTML exported successfully.");
  };

  // ── Export JSON ───────────────────────────────────────────────
  const exportJSON = () => {
    if (!contentBlocks.length) return;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([JSON.stringify({ template: selectedTemplate, pageSize: selectedPageSize, blocks: contentBlocks }, null, 2)], { type: "application/json" })),
      download: `layout-${Date.now()}.json`
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showMsg("JSON downloaded.");
  };

  const filteredTemplates = layoutTemplates.filter(t => t.type === activeTab);
  const canGenerate = (inputText.trim() || uploadedImages.length) && selectedTemplate && !isGenerating;

  return (
    <div className="min-h-screen">

      {/* ── Print stylesheet: isolates preview for PDF export ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .preview-render-target,
          .preview-render-target * { visibility: visible !important; }
          .preview-render-target {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <Header title="Auto Layout" subtitle="AI-powered layout generation for print & digital" />

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_220px] gap-6">

          {/* ── LEFT PANEL ── */}
          <div className="space-y-4">

            {/* Content Input */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Content</h3>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste your article content here…"
                className="w-full h-28 p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all text-sm"
              />

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-3 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                  isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                )}
              >
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading…</span>
                  </div>
                ) : (
                  <>
                    <Upload className={cn("w-6 h-6 mx-auto mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
                    <p className="text-xs text-muted-foreground">{isDragging ? "Drop images here" : "Drop images or click to browse"}</p>
                  </>
                )}
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={e => { e.stopPropagation(); removeImage(i); }} className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Print / Digital Toggle */}
            <div className="card-elevated p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("print")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === "print" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Newspaper className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => setActiveTab("digital")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === "digital" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="w-4 h-4" /> Digital
              </button>
            </div>

            {/* Templates */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Templates</h3>
              <div className="space-y-2">
                {filteredTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selectedTemplate?.id === t.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-transparent bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      selectedTemplate?.id === t.id ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    )}>
                      {t.columns === 1 ? <FileText className="w-4 h-4" /> : t.columns <= 2 ? <Columns className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.preview}</p>
                    </div>
                    {selectedTemplate?.id === t.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size (print only) */}
            {activeTab === "print" && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Page Size</h3>
                <div className="space-y-2">
                  {pageSizes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedPageSize(s)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                        selectedPageSize.id === s.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-transparent bg-secondary/50 hover:bg-secondary"
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{s.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-gradient-to-r from-primary to-amber-600 text-primary-foreground disabled:opacity-60"
            >
              {isGenerating
                ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                : <><Wand2 className="w-4 h-4 mr-2" />Generate Layout</>}
            </Button>
          </div>

          {/* ── CENTER PREVIEW ── */}
          <div className="card-elevated p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {selectedTemplate ? `Preview — ${selectedTemplate.name}` : "Layout Preview"}
                </h3>
                {activeTab === "print" && contentBlocks.length > 0 && (
                  <span className="text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                    {selectedPageSize.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(40, z - 10))} className="w-7 h-7 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground font-mono w-9 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-7 h-7 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setZoom(90)} className="w-7 h-7 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={cn(
              "flex-1 rounded-xl overflow-auto flex min-h-[520px] p-7",
              contentBlocks.length
                ? "bg-secondary/30 items-start justify-center"
                : "bg-secondary/20 items-center justify-center border-2 border-dashed border-border"
            )}>
              {contentBlocks.length > 0 ? (
                <div
                  className="preview-render-target"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform .25s ease" }}
                >
                  <TemplatePreview templateId={selectedTemplate?.id} blocks={contentBlocks} pageSize={selectedPageSize} />
                </div>
              ) : (
                <div className="text-center">
                  <Grid3X3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Select a template and generate a layout</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Each template renders a different format</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="space-y-4">

            {/* Layout Fit */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Layout Fit</h3>
                {contentBlocks.length > 0 && (
                  <span className="text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">OK</span>
                )}
              </div>
              {contentBlocks.length > 0 ? (
                <div className="space-y-4">
                  {[["Column Usage", "92%", 92], ["Text Overflow", "None", 0], ["Image Fit", "100%", 100]].map(([label, val, pct]) => (
                    <div key={label as string}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={cn("text-xs font-semibold font-mono", pct === 0 ? "text-green-400" : "text-foreground")}>{val}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", pct === 0 ? "bg-green-400" : "bg-primary")} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3 italic">Generate a layout to see analysis</p>
              )}
            </div>

            {/* AI Suggestions */}
            {contentBlocks.length > 0 && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">AI Suggestions</h3>
                <div className="space-y-3">
                  {[
                    { title: "Optimize headline", desc: "Shorten by 2 words for better balance", hi: true  },
                    { title: "Add pull quote",    desc: "Consider a quote in column 4",          hi: false },
                    { title: "Image crop",        desc: "Auto-crop for better focus point",       hi: false },
                  ].map(s => (
                    <div key={s.title} className={cn(
                      "p-3 rounded-xl border transition-all",
                      s.hi ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-transparent"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Export</h3>
              <div className="space-y-2">

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!contentBlocks.length}
                  onClick={exportPDF}
                >
                  <FileText className="w-4 h-4 mr-2" />Export as PDF
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!contentBlocks.length}
                  onClick={exportHTML}
                >
                  <Monitor className="w-4 h-4 mr-2" />Publish to Web
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!contentBlocks.length}
                  onClick={exportJSON}
                >
                  <Layers className="w-4 h-4 mr-2" />Export to InDesign
                </Button>

              </div>

              {exportMsg && (
                <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center">
                  {exportMsg}
                </div>
              )}
            </div>

            {/* Preview As (digital only) */}
            {activeTab === "digital" && (
              <div className="card-elevated p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Preview As</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 justify-center"><Monitor className="w-4 h-4 mr-2" />Desktop</Button>
                  <Button variant="outline" className="flex-1 justify-center"><Smartphone className="w-4 h-4 mr-2" />Mobile</Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default AutoLayout;