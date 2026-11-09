"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpNarrowWide, Filter, X } from "lucide-react";
import { SearchPill, VehicleCard } from "@/components/Common";
import { SORTS, money } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function DiscoveryHub() {
  const a = useApp();
  const f = a.filters;
  const [sortOpen, setSortOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  const chips: { label: string; clear: () => void }[] = [
    ...(a.query ? [{ label: `“${a.query}”`, clear: () => a.setQuery("") }] : []),
    ...f.brands.map((b) => ({ label: b, clear: () => a.patchFilters({ brands: f.brands.filter((x) => x !== b), models: [] }) })),
    ...f.models.map((m) => ({ label: m, clear: () => a.patchFilters({ models: f.models.filter((x) => x !== m) }) })),
    ...f.condition.map((c) => ({ label: c, clear: () => a.patchFilters({ condition: f.condition.filter((x) => x !== c) }) })),
    ...f.seller.map((c) => ({ label: c, clear: () => a.patchFilters({ seller: f.seller.filter((x) => x !== c) }) })),
    ...f.fuel.map((c) => ({ label: c, clear: () => a.patchFilters({ fuel: f.fuel.filter((x) => x !== c) }) })),
    ...f.body.map((c) => ({ label: c, clear: () => a.patchFilters({ body: f.body.filter((x) => x !== c) }) })),
    ...f.colors.map((c) => ({ label: c, clear: () => a.patchFilters({ colors: f.colors.filter((x) => x !== c) }) })),
    ...(f.transmission ? [{ label: f.transmission, clear: () => a.patchFilters({ transmission: "" }) }] : []),
    ...(f.yearMin ? [{ label: `${f.yearMin}+`, clear: () => a.patchFilters({ yearMin: "" }) }] : []),
    ...(f.priceMax ? [{ label: `Under ${money(+f.priceMax)}`, clear: () => a.patchFilters({ priceMax: "" }) }] : []),
    ...(f.milesMax ? [{ label: `Under ${(+f.milesMax).toLocaleString("en-US")} mi`, clear: () => a.patchFilters({ milesMax: "" }) }] : []),
  ];

  useEffect(() => {
    const el = scroller.current; if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check); ro.observe(el);
    return () => ro.disconnect();
  }, [chips.length]);

  return (
    <>
      <header className="head">
        <h1>Discovery Hub</h1>
        <SearchPill value={a.query} onChange={a.setQuery} withSuggestions />
      </header>
      <div className="filter-row">
        <div className="fr-left">
          <span className="count">{a.results.length} {a.results.length === 1 ? "vehicle" : "vehicles"} found</span>
          <div className="chip-scroll" ref={scroller}>
            <span className="chip plain">{a.zip} • {a.radius} mi</span>
            {chips.map((c) => <span className="chip" key={c.label}>{c.label}<button onClick={c.clear} aria-label={`Remove ${c.label}`}><X size={13} /></button></span>)}
          </div>
          {overflow && <button className="fr-arrow" aria-label="Scroll filters" onClick={() => scroller.current?.scrollBy({ left: 180, behavior: "smooth" })}><ArrowRight size={15} /></button>}
          {chips.length > 0 && <button className="btn btn-out btn-pill btn-sm" style={{ height: 30, flex: "none" }} onClick={a.clearFilters}>Clear All</button>}
        </div>
        <div className="fr-right">
          <button className={`tool-btn ${a.panel === "filters" ? "on" : ""}`} onClick={() => a.setPanel(a.panel === "filters" ? null : "filters")}><Filter size={15} /> Filters</button>
          <button className="tool-btn" aria-expanded={sortOpen} onClick={() => setSortOpen((o) => !o)}><ArrowUpNarrowWide size={15} /> Sort</button>
          {sortOpen && (
            <div className="pop" style={{ top: 46, right: 0, width: 220 }}>
              {SORTS.map((s) => <button key={s} className={`pop-row ${f.sort === s ? "on" : ""}`} onClick={() => { a.patchFilters({ sort: s }); setSortOpen(false); }}>{s}</button>)}
            </div>
          )}
        </div>
      </div>
      {a.compareMode && (
        <div className="banner">Select up to 3 cars to compare their features, specs and differences.
          <button className="btn btn-out btn-sm btn-pill" onClick={() => { a.setCompareMode(false); a.clearCompare(); }}>Exit Compare Mode</button>
        </div>
      )}
      {a.results.length ? (
        <div className="grid vgrid">{a.results.map((v, i) => <VehicleCard key={v.id} v={v} index={i} />)}</div>
      ) : (
        <div className="empty"><h3>No cars match yet</h3><p>Remove a filter or widen your search radius.</p><button className="btn btn-lime" onClick={a.clearFilters}>Clear All</button></div>
      )}
    </>
  );
}
