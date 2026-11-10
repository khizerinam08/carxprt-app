"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, CircleUserRound, Fuel, Gauge, MapPin, Mic, Search, Tag } from "lucide-react";
import { money, suggestions, type Vehicle } from "@/lib/data";
import { useApp } from "@/lib/store";

/** The ZIP chip is a real field, so it can be edited in place. */
export function ZipField() {
  const a = useApp();
  const [v, setV] = useState(a.zip);
  useEffect(() => setV(a.zip), [a.zip]);
  const commit = () => { if (/^\d{5}$/.test(v)) a.setZip(v); else setV(a.zip); };
  return (
    <label className="zip">
      <MapPin size={14} />
      <input aria-label="ZIP code" inputMode="numeric" maxLength={5} value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") { commit(); e.currentTarget.blur(); } }} />
    </label>
  );
}

/** The search pill always searches. Talking to the AI is the Speak button or the chat panel. */
export function SearchPill({ value, onChange, withSuggestions, placeholder = "Search to discover more..." }: { value: string; onChange: (v: string) => void; withSuggestions?: boolean; placeholder?: string }) {
  const a = useApp();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away); return () => document.removeEventListener("mousedown", away);
  }, []);
  const items = withSuggestions && open ? suggestions(value) : [];
  return (
    <div className="search" ref={wrap}>
      <ZipField />
      <input aria-label="Search" placeholder={placeholder} value={value} onFocus={() => setOpen(true)} onChange={(e) => { onChange(e.target.value); setOpen(true); }} onKeyDown={(e) => { if (e.key === "Enter") { setOpen(false); if (withSuggestions) a.runSearch(value); } if (e.key === "Escape") setOpen(false); }} />
      <button className="speak" onClick={a.startListening} aria-label="Speak to CarXprt"><span>Speak to CarXprt</span><Mic size={15} /></button>
      {items.length > 0 && (
        <div className="pop suggest" role="listbox">
          <div className="pop-label">Suggestions</div>
          {items.map((s) => (
            <button key={s.label} className="pop-row" role="option" aria-selected={false} onClick={() => {
              a.patchFilters({ brands: s.make ? [s.make] : a.filters.brands, models: s.model ? [s.model] : [], body: s.body ? [s.body] : a.filters.body, fuel: s.fuel ? [s.fuel] : a.filters.fuel });
              a.runSearch(""); setOpen(false);
            }}>
              <Search size={15} /> {s.label}<small>{s.hint}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VehicleCard({ v, index }: { v: Vehicle; index: number }) {
  const a = useApp();
  const saved = a.saved.includes(v.id);
  const picked = a.compare.includes(v.id);
  const full = a.compareMode && !picked && a.compare.length >= 3;
  return (
    // in compare mode a click anywhere on the card picks the car instead of opening it
    <article className={`card link-card vcard ${a.compareMode && picked ? "picked" : ""} ${full ? "full" : ""}`} onClickCapture={(e) => {
      if (!a.compareMode || (e.target as Element).closest(".bm, .pick")) return;
      e.preventDefault(); e.stopPropagation(); a.toggleCompare(v.id);
    }}>
      <div className="card-photo">
        <Link href={`/vehicle/${v.id}`} aria-label={v.title}><img src={v.img} alt={v.title} loading="lazy" /></Link>
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        {v.seller === "Private seller" && <span className="seller-badge" role="img" aria-label="Private seller" title="Private seller"><CircleUserRound size={20} strokeWidth={1.5} /></span>}
        {a.compareMode && <button className={`pick ${picked ? "on" : ""}`} aria-pressed={picked} aria-label={`Compare ${v.title}`} onClick={() => a.toggleCompare(v.id)}>{picked && <Check size={15} />}</button>}
      </div>
      <div className="vcard-body">
        <Link href={`/vehicle/${v.id}`} className="card-body">
          <div className="card-title"><span>{v.title}</span></div>
          <div className="price-row"><div className="price">{money(v.price)}</div>{v.greatDeal && <span className="deal-dot" title="Great deal" aria-label="Great deal"><Tag size={12} /></span>}</div>
          <div className="specs">
            <span className="place" title={`${v.city} (${v.dist} mi)`}><MapPin size={15} /><em>{v.city}</em><small>({v.dist} mi)</small></span>
            <span><Fuel size={15} />{v.fuel}</span>
            <span><Gauge size={15} />{v.miles < 1000 ? v.miles : `${Math.round(v.miles / 100) / 10}k`} mi</span>
          </div>
        </Link>
        <button className={`bm ${saved ? "on" : ""}`} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save car"} onClick={() => a.toggleSaved(v.id)}><Bookmark size={20} fill={saved ? "currentColor" : "none"} /></button>
      </div>
    </article>
  );
}

export function Toast({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return <div className="toast" role="status">{text}{action && <button onClick={onAction}>{action}</button>}</div>;
}

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  if (photos.length === 1) return <div className="gallery one"><img src={photos[0]} alt={title} /></div>;
  const side = photos.slice(1, 5);
  return (
    <div className="gallery">
      <img src={photos[0]} alt={title} />
      <div className={`gal-side ${side.length <= 2 ? "two" : ""}`}>
        {side.map((p, i) => i === side.length - 1 && side.length === 4
          ? <div className="gal-more" key={p}><img src={p} alt="" /><b>20+ photos</b></div>
          : <img key={p} src={p} alt="" />)}
      </div>
    </div>
  );
}
