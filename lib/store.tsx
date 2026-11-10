"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { applyFilters, byId, EMPTY_FILTERS, SEED_DEALS, VEHICLES, type Deal, type Filters } from "./data";

export type PanelKind = "chat" | "advisor" | "filters" | null;
export type ChatMsg = { id: number; role: "user" | "ai"; text: string; at: number; tool?: string; variants?: string[]; variant?: number; regenerated?: boolean; vote?: "up" | "down" };

export const PANEL_MAX = 520;

let msgId = 1;

/** Reads a free-text request and returns filter changes plus the reply. Stands in for the real AI. */
function interpret(text: string, f: Filters) {
  const q = text.toLowerCase();
  const patch: Partial<Filters> = {};
  const brands = [...new Set(VEHICLES.map((v) => v.make))].filter((b) => q.includes(b.toLowerCase()));
  if (brands.length) patch.brands = brands;
  const models = [...new Set(VEHICLES.map((v) => v.model))].filter((m) => m.length > 2 && q.includes(m.toLowerCase()));
  if (models.length) { patch.models = models; patch.brands = [...new Set(VEHICLES.filter((v) => models.includes(v.model)).map((v) => v.make))]; }
  for (const [word, body] of [["suv", "SUV"], ["sedan", "Sedan"], ["coupe", "Coupe"], ["convertible", "Convertible"]]) if (q.includes(word)) patch.body = [body];
  if (/electric|\bev\b/.test(q)) patch.fuel = ["Electric"];
  else if (q.includes("hybrid")) patch.fuel = ["Hybrid"];
  const budget = q.replace(/,/g, "").match(/(?:under|below|less than|max|budget(?: of)?)\s*\$?\s*(\d+)\s*(k?)/);
  if (budget) patch.priceMax = String(+budget[1] * (budget[2] ? 1000 : 1));
  const next = { ...f, ...patch };
  return { patch, next, changed: Object.keys(patch).length > 0 };
}

function fromVoice() { return "Find me a hybrid SUV under $45,000"; }

type Ctx = {
  zip: string; setZip: (z: string) => void; radius: number; setRadius: (r: number) => void; defaultLoc: boolean; setDefaultLoc: (b: boolean) => void;
  query: string; setQuery: (q: string) => void; runSearch: (q: string) => void;
  filters: Filters; patchFilters: (p: Partial<Filters>) => void; clearFilters: () => void; results: typeof VEHICLES;
  saved: string[]; toggleSaved: (id: string) => void;
  compareMode: boolean; setCompareMode: (b: boolean) => void; compare: string[]; toggleCompare: (id: string) => void; clearCompare: () => void;
  panel: PanelKind; setPanel: (p: PanelKind) => void; panelWidth: number; setPanelWidth: (n: number) => void;
  navCollapsed: boolean; toggleNav: () => void; theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void;
  deals: Deal[]; startDeal: (vehicleId: string, kind: Deal["kind"]) => string; setDealInactive: (id: string, v: boolean) => void;
  history: string[]; clearHistory: () => void; replay: (h: string) => void;
  messages: ChatMsg[]; pending: boolean; send: (t: string) => void; editMessage: (id: number, t: string) => void; regenerate: (id: number) => void; setVariant: (id: number, d: number) => void; vote: (id: number, v: "up" | "down") => void; newChat: () => void;
  listening: boolean; startListening: () => void; stopListening: () => void; voiceDraft: string; clearVoiceDraft: () => void; queries: number;
};
const C = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(C); if (!c) throw new Error("useApp outside provider"); return c; };

export function AppProvider({ children }: { children: ReactNode }) {
  const [zip, setZip] = useState("12345");
  const [radius, setRadius] = useState(50);
  const [defaultLoc, setDefaultLoc] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [saved, setSaved] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [panel, setPanelState] = useState<PanelKind>(null);
  const [panelWidth, setPanelWidth] = useState(372);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [history, setHistory] = useState<string[]>(["Ford near 12345", "Hybrid SUV under $45,000", "Bentley · 50 miles", "Electric cars"]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const [queries, setQueries] = useState(0);
  const filtersRef = useRef(filters); filtersRef.current = filters;
  const voiceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("cx-theme");
      if (t === "dark" || t === "light") setThemeState(t);
      const w = Number(localStorage.getItem("cx-panel"));
      if (w) setPanelWidth(Math.min(w, PANEL_MAX));
    } catch { /* storage can be blocked; defaults are fine */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.add("theme-switch"); // colours swap at once instead of animating
    root.dataset.theme = theme;
    const t = setTimeout(() => root.classList.remove("theme-switch"), 60);
    try { localStorage.setItem("cx-theme", theme); } catch {}
    return () => clearTimeout(t);
  }, [theme, ready]);
  useEffect(() => { try { localStorage.setItem("cx-panel", String(panelWidth)); } catch {} }, [panelWidth]);

  const toggleNav = useCallback(() => setNavCollapsed((v) => !v), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); toggleNav(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [toggleNav]);

  const results = useMemo(() => applyFilters(VEHICLES, filters, radius, query), [filters, radius, query]);
  const remember = (s: string) => setHistory((h) => [s, ...h.filter((x) => x !== s)].slice(0, 12));
  const patchFilters = useCallback((p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p })), []);
  const runSearch = (q: string) => { setQuery(q); if (q.trim()) remember(`${q.trim()} near ${zip}`); };

  const answer = (text: string): { reply: string; tool?: string; alt: string } => {
    const { patch, next, changed } = interpret(text, filtersRef.current);
    if (!changed) return { reply: "I can narrow the cars on your screen. Tell me a brand, body style, fuel type or budget, and I'll update the results.", alt: "Happy to help. Try something like “electric SUV under $70,000” and I'll filter the list for you." };
    setFilters(next); setQuery("");
    const n = applyFilters(VEHICLES, next, radius, "").length;
    remember(text.length > 40 ? text.slice(0, 40) + "…" : text);
    const parts = [...(patch.brands ?? []), ...(patch.fuel ?? []), ...(patch.body ?? [])].join(" ") || "Cars";
    const budget = patch.priceMax ? ` under $${(+patch.priceMax).toLocaleString("en-US")}` : "";
    return {
      tool: `Updated your search · ${n} ${n === 1 ? "car" : "cars"}`,
      reply: n ? `${parts}${budget} are up for ZIP ${zip} within ${radius} miles. I found ${n}. Do you want the lowest price first, or the lowest mileage?` : `I couldn't find ${parts}${budget} within ${radius} miles of ${zip}. Want me to widen the search area?`,
      alt: n ? `There are ${n} matches near ${zip}. Tell me your must-haves and I'll shorten the list.` : `Nothing matches yet. A wider radius or a higher budget would bring more cars in.`,
    };
  };

  const respond = (text: string) => {
    setPending(true);
    setTimeout(() => {
      const a = answer(text);
      setMessages((m) => [...m, { id: msgId++, role: "ai", text: a.reply, at: Date.now(), tool: a.tool, variants: [a.reply, a.alt], variant: 0 }]);
      setPending(false);
    }, 650);
  };
  const send = (t: string) => { const text = t.trim(); if (!text) return; setQueries((q) => q + 1); setMessages((m) => [...m, { id: msgId++, role: "user", text, at: Date.now() }]); respond(text); };
  const editMessage = (id: number, t: string) => {
    const text = t.trim(); if (!text) return;
    setMessages((m) => { const i = m.findIndex((x) => x.id === id); return [...m.slice(0, i), { ...m[i], text, at: Date.now() }]; });
    respond(text);
  };
  const regenerate = (id: number) => setMessages((m) => m.map((x) => { if (x.id !== id || !x.variants) return x; const v = ((x.variant ?? 0) + 1) % x.variants.length; return { ...x, variant: v, regenerated: true, at: Date.now(), text: x.variants[v] }; }));
  const setVariant = (id: number, d: number) => setMessages((m) => m.map((x) => { if (x.id !== id || !x.variants) return x; const v = Math.min(x.variants.length - 1, Math.max(0, (x.variant ?? 0) + d)); return { ...x, variant: v, text: x.variants[v] }; }));
  const vote = (id: number, v: "up" | "down") => setMessages((m) => m.map((x) => (x.id === id ? { ...x, vote: x.vote === v ? undefined : v } : x)));

  const stopListening = () => { if (voiceTimer.current) clearTimeout(voiceTimer.current); setListening(false); };
  const startListening = () => {
    setPanelState((p) => (p === "chat" || p === "advisor" ? p : "chat"));
    setListening(true);
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    voiceTimer.current = setTimeout(() => { setListening(false); setVoiceDraft(fromVoice()); }, 2200);
  };

  const value: Ctx = {
    zip, setZip, radius, setRadius, defaultLoc, setDefaultLoc, query, setQuery, runSearch, filters, patchFilters,
    clearFilters: () => { setFilters((f) => ({ ...EMPTY_FILTERS, sort: f.sort })); setQuery(""); }, results,
    saved, toggleSaved: (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    compareMode, setCompareMode, compare,
    toggleCompare: (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id])),
    clearCompare: () => setCompare([]),
    panel, setPanel: setPanelState, panelWidth, setPanelWidth, navCollapsed, toggleNav, theme, setTheme: setThemeState, deals,
    startDeal: (vehicleId, kind) => {
      const existing = deals.find((d) => d.vehicleId === vehicleId && !d.inactive);
      if (existing) return existing.id;
      const id = "d" + (400 + deals.length);
      const v = byId(vehicleId);
      setDeals((ds) => [{ id, vehicleId, kind, number: "D00" + (400 + ds.length), created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), stage: 1, agent: "Active", unread: false, message: `Your request for the ${v?.title ?? "car"} was sent.` }, ...ds]);
      return id;
    },
    setDealInactive: (id, v) => setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, inactive: v } : d))),
    history, clearHistory: () => setHistory([]),
    replay: (h) => { const r = interpret(h, EMPTY_FILTERS); if (r.changed) { setFilters(r.next); setQuery(""); } else setQuery(h.replace(/ near d+$/, "")); },
    messages, pending, send, editMessage, regenerate, setVariant, vote,
    newChat: () => { setMessages([]); setPending(false); },
    listening, startListening, stopListening, voiceDraft, clearVoiceDraft: () => setVoiceDraft(""), queries,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
