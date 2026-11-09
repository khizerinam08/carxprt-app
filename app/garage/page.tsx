"use client";
import Link from "next/link";
import { useState } from "react";
import { Fuel, Gauge, MapPin, Plus, Settings, Zap } from "lucide-react";
import { SearchPill } from "@/components/Common";
import { byId, initials, money, type Deal } from "@/lib/data";
import { useApp } from "@/lib/store";

const TABS = ["All", "Dealership Deals", "Advisor Deals", "Inactive Deals"];
const STAGES = ["Enquiry", "Offer", "Application", "Close"];

function DealCard({ d }: { d: Deal }) {
  const v = byId(d.vehicleId)!;
  return (
    <Link href={`/garage/${d.id}`} className="card link-card">
      <div className="deal-photo"><img src={v.img} alt={v.title} /><span className={`status ${d.inactive ? "off" : ""}`}>{d.inactive ? "Inactive" : "Active"}</span></div>
      <div className="pad">
        <div className="card-title"><span>{v.title}</span><Settings size={18} /></div>
        <div className="price-row" style={{ justifyContent: "space-between" }}><div className="price">{money(v.price)}</div><span className="tag">{d.kind}</span></div>
        <div className="mini"><span><MapPin size={13} />{v.city.split(",")[0]}</span><span><Fuel size={13} />{v.fuel}</span><span><Gauge size={13} />{v.miles.toLocaleString("en-US")} mi</span></div>
        <div className="dealer-out">
          <div className="dealer"><div className="sq-av">{initials(v.dealer)}</div><div>{v.dealer}<small><MapPin size={12} />{v.city}</small></div></div>
          <time>Started {d.created}</time>
        </div>
        <div className="stages">{STAGES.map((s, i) => <div key={s} className={i < d.stage ? "done" : ""}><i />{s}</div>)}</div>
        <div className="latest">
          <div className="latest-top"><span>Latest Message {d.unread && <b className="red">1</b>}</span><span className={`agent ${d.agent === "Active" ? "on" : ""}`}><Zap size={12} />{d.agent}</span></div>
          <div className="msg-row"><div className="sq-av">{initials(v.dealer)}</div><p>{d.message}</p></div>
        </div>
        <div className="otd"><span>Estimated OTD Price:</span><b>{money(v.price + 2850)}</b></div>
      </div>
    </Link>
  );
}

export default function Garage() {
  const a = useApp();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const list = a.deals.filter((d) => {
    const inTab = tab === "All" ? !d.inactive : tab === "Inactive Deals" ? d.inactive : !d.inactive && d.kind === (tab === "Dealership Deals" ? "Dealership Deal" : "Advisor Deal");
    return inTab && byId(d.vehicleId)!.title.toLowerCase().includes(q.trim().toLowerCase());
  });
  return (
    <>
      <header className="head stack">
        <div className="head-copy"><h1>My Garage</h1><p>Track your deals, preferences, and conversations in one place.</p></div>
        <SearchPill value={q} onChange={setQ} />
      </header>
      <div className="tabs-row"><div className="tabs" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div></div>
      <div className="deals">
        {list.map((d) => <DealCard key={d.id} d={d} />)}
        <Link href="/search" className="new-deal"><i><Plus size={26} /></i><b>Start a New Deal</b><small>Find a new car to start a deal</small></Link>
      </div>
    </>
  );
}
