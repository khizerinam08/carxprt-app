"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Clock, MapPin } from "lucide-react";
import { SearchPill } from "@/components/Common";
import { byId, initials, money, OFFERS, type Offer } from "@/lib/data";

const KINDS = ["All", "Cash", "Loyalty", "Incentive"];

function OfferCard({ o, i, market, zipState }: { o: Offer; i: number; market: boolean; zipState: string }) {
  const v = byId(o.vehicleId)!;
  const [open, setOpen] = useState(false);
  const name = market ? o.dealer : o.maker;
  return (
    <article className="card offer-card">
      <Link href={`/vehicle/${v.id}`} className="card-photo" style={{ display: "block" }}>
        <img src={v.img} alt={v.title} loading="lazy" />
        <span className="num">{String(i + 1).padStart(2, "0")}</span>
        <span className="exp"><Clock size={12} /> Expires in {o.days} days</span>
      </Link>
      <div className="card-body">
        <div className="card-title"><span>{v.title}</span><em className="pill-lime" style={{ fontStyle: "normal" }}>{o.kind}</em></div>
        <div className="offer-amt">{money(o.amount)}<small>back</small></div>
        <div className="offer-sub">Customer cash · applied at purchase</div>
        <div className="maker">
          <div className="dealer"><div className="sq-av">{initials(name)}</div><div><b>{name}</b><small>{market ? o.dealerType : "Manufacturer"}</small></div></div>
          <button className={`pin ${open ? "on" : ""}`} aria-label={`Where ${name} offers this`} aria-expanded={open} onClick={() => setOpen((x) => !x)}><MapPin size={17} /></button>
          {open && (
            <div className="pop states">
              <b>Available in {o.states.length} states</b>
              {o.states.includes(zipState) && <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--sub)", margin: "6px 0 10px" }}><span className="deal-dot" style={{ width: 16, height: 16 }}><Check size={11} /></span> Includes your area</div>}
              <ul>{o.states.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Offers() {
  const [source, setSource] = useState<"Manufacturer Offers" | "Deal Marketplace">("Manufacturer Offers");
  const [kind, setKind] = useState("All");
  const [q, setQ] = useState("");
  const list = OFFERS.filter((o) => (kind === "All" || o.kind === kind) && byId(o.vehicleId)!.title.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <header className="head stack">
        <div className="head-copy"><h1>Offers</h1><p>Discover exclusive cash offers, loyalty bonuses, and special incentives to help you save on your next vehicle.</p></div>
        <SearchPill value={q} onChange={setQ} />
      </header>
      <div className="filter-row">
        <div className="fr-left">
          <span className="count" style={{ border: 0 }}>{list.length} {list.length === 1 ? "offer" : "offers"} found</span>
          {q && <button className="btn btn-out btn-pill btn-sm" style={{ height: 30 }} onClick={() => setQ("")}>Clear All</button>}
        </div>
        <div className="tabs">{(["Manufacturer Offers", "Deal Marketplace"] as const).map((s) => <button key={s} className={source === s ? "on" : ""} onClick={() => setSource(s)}>{s}</button>)}</div>
      </div>
      <div className="offer-tabs" role="tablist">{KINDS.map((k) => <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{k}</button>)}</div>
      {list.length ? <div className="grid">{list.map((o, i) => <OfferCard key={o.id} o={o} i={i} market={source === "Deal Marketplace"} zipState="New York" />)}</div> : <div className="empty"><h3>No offers match</h3><p>Try another search or tab.</p></div>}
    </>
  );
}
