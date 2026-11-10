"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BadgePercent, Car, CarFront, Filter, Menu, MessageCircle, Moon, PanelLeftClose, PanelLeftOpen, Plus, Sun, Warehouse, X } from "lucide-react";
import { Logo, HatGlasses } from "./Brand";
import { ChatPanel } from "./ChatPanel";
import { FiltersPanel } from "./FiltersPanel";
import { byId } from "@/lib/data";
import { PANEL_MAX, useApp, type PanelKind } from "@/lib/store";

const MAIN = [
  { href: "/search", label: "Discovery Hub", icon: Car },
  { href: "/offers", label: "Offers", icon: BadgePercent },
  { href: "/garage", label: "Garage", icon: Warehouse },
];

function Nav({ open, close }: { open: boolean; close: () => void }) {
  const a = useApp();
  const path = usePathname();
  const router = useRouter();
  const isDeal = /^\/garage\/.+/.test(path);
  const isGarage = path === "/garage";
  const showFull = !isDeal && !isGarage;
  const compareOpen = a.compareMode && !a.navCollapsed;

  const togglePanel = (p: Exclude<PanelKind, null>) => { a.setPanel(a.panel === p ? null : p); close(); };
  const openFilters = () => { if (path !== "/search") router.push("/search"); a.setPanel(a.panel === "filters" && path === "/search" ? null : "filters"); close(); };
  const openCompare = () => { const next = !a.compareMode; a.setCompareMode(next); if (next && path !== "/search") router.push("/search"); close(); };

  return (
    <aside className={`nav ${a.navCollapsed ? "collapsed" : ""} ${open ? "open" : ""}`} aria-label="Main">
      <div className="nav-top">
        {a.navCollapsed ? (
          <button className="nav-swap tip" data-tip="Open sidebar  Ctrl+Shift+S" aria-label="Open sidebar" onClick={a.toggleNav}>
            <Logo mark /><PanelLeftOpen className="swap" size={18} />
          </button>
        ) : (
          <>
            <Link href="/search" aria-label="CarXprt home"><Logo /></Link>
            <button className="icon-btn sm tip" data-tip="Close sidebar  Ctrl+Shift+S" aria-label="Close sidebar" onClick={a.toggleNav}><PanelLeftClose size={16} /></button>
          </>
        )}
      </div>
      <div className="nav-list">
        {MAIN.map(({ href, label, icon: I }) => (
          <Link key={href} href={href} onClick={close} className={`nav-item ${path === href || (href !== "/search" && path.startsWith(href)) || (href === "/search" && path.startsWith("/vehicle")) ? "on" : ""}`} aria-label={label}>
            <I size={16} /><span className="lbl">{label}</span>
          </Link>
        ))}
      </div>
      {!isDeal && <div className="nav-rule" />}
      {!isDeal && (
        <div className="nav-list">
          <button className={`nav-item ${a.panel === "chat" ? "on" : ""}`} onClick={() => togglePanel("chat")} aria-label="CarXprt Chat"><MessageCircle size={16} /><span className="lbl">CarXprt Chat</span></button>
          {showFull && <button className={`nav-item ${a.panel === "filters" ? "on" : ""}`} onClick={openFilters} aria-label="Filters"><Filter size={16} /><span className="lbl">Filters</span></button>}
          {showFull && <button className={`nav-item ${a.compareMode ? "on" : ""}`} onClick={openCompare} aria-label="Compare Cars"><CarFront size={16} /><span className="lbl">Compare Cars</span></button>}
          {showFull && <button className={`nav-item ${a.panel === "advisor" ? "on" : ""}`} onClick={() => togglePanel("advisor")} aria-label="CarXprt Advisor"><HatGlasses /><span className="lbl">CarXprt Advisor</span></button>}
        </div>
      )}
      {compareOpen && showFull && (
        <div className="nav-compare">
          {[0, 1, 2].map((i) => {
            const v = a.compare[i] ? byId(a.compare[i]) : null;
            return (
              <div className="slot" key={i}>
                {v ? (<><img src={v.img} alt={v.title} /><button onClick={() => a.toggleCompare(v.id)} aria-label={`Remove ${v.title}`}><X size={14} /></button></>) : <Plus size={18} />}
              </div>
            );
          })}
          <button className="btn btn-lime btn-sm btn-pill" disabled={a.compare.length < 2} onClick={() => { router.push("/compare"); close(); }}>Compare</button>
          <button className="btn btn-out btn-sm btn-pill" disabled={!a.compare.length} onClick={a.clearCompare}>Clear All</button>
        </div>
      )}
      <div className="nav-end">
        {a.navCollapsed ? (
          <button className="icon-btn theme-toggle" aria-label={`Switch to ${a.theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${a.theme === "light" ? "dark" : "light"} mode`} onClick={() => a.setTheme(a.theme === "light" ? "dark" : "light")}>
            {a.theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        ) : (
          <div className="theme" role="group" aria-label="Appearance">
            <button className={a.theme === "light" ? "on" : ""} onClick={() => a.setTheme("light")} aria-label="Light"><Sun size={13} /><span>Light</span></button>
            <button className={a.theme === "dark" ? "on" : ""} onClick={() => a.setTheme("dark")} aria-label="Dark"><Moon size={13} /><span>Dark</span></button>
          </div>
        )}
        <Link href="/account" className="me" onClick={close}>
          <div className="avatar">T</div>
          <div>Test Account<small>Free</small></div>
        </Link>
      </div>
    </aside>
  );
}

function ResizablePanel() {
  const a = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const setW = a.setPanelWidth;

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const left = ref.current?.getBoundingClientRect().left ?? 0;
      const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--z")) || 1;
      const max = Math.min(PANEL_MAX, (window.innerWidth * 0.6) / z);
      setW(Math.round(Math.min(max, Math.max(320, (e.clientX - left) / z))));
    };
    const up = () => setDrag(false);
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { document.body.style.userSelect = ""; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [drag, setW]);

  if (!a.panel) return null;
  return (
    <div className="panel" ref={ref} style={{ width: a.panelWidth }}>
      {a.panel === "filters" ? <FiltersPanel /> : <ChatPanel advisor={a.panel === "advisor"} />}
      <div className={`grip ${drag ? "drag" : ""}`} role="separator" aria-orientation="vertical" aria-label="Drag to resize" onPointerDown={(e) => { e.preventDefault(); setDrag(true); }} />
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const a = useApp();
  return (
    <div className="shell">
      <div className="topbar">
        <Link href="/search" aria-label="CarXprt home"><Logo /></Link>
        <button className="icon-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      <Nav open={menu} close={() => setMenu(false)} />
      <ResizablePanel />
      <main className="main" onClick={() => { if (menu) setMenu(false); }} data-panel={a.panel ?? "none"}>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
