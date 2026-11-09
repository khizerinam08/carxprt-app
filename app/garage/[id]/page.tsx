"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, CalendarCheck, ChevronLeft, ChevronUp, FileText, Files, Globe, MapPin, MessageCircle, Phone, Plus, Star, Zap } from "lucide-react";
import { HatGlasses } from "@/components/Brand";
import { Gallery, Toast } from "@/components/Common";
import { byId, initials, money, type Vehicle } from "@/lib/data";
import { useApp } from "@/lib/store";

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="box">
      <div className="sec-head">
        <button className={`sec-toggle ${open ? "" : "closed"}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}><ChevronUp size={18} />{title}</button>
        {right}
      </div>
      {open && children}
    </section>
  );
}

type Line = { id: number; day?: string; me?: boolean; text: string };
const REQUESTS = ["Confirm it's still available", "Send an out-the-door quote", "Send more photos", "Send the vehicle history report"];

function DealChat({ v, negotiatorDefault }: { v: Vehicle; negotiatorDefault: boolean }) {
  const [tab, setTab] = useState<"chat" | "docs" | "neg">("chat");
  const [text, setText] = useState("");
  const [plus, setPlus] = useState(false);
  const [neg, setNeg] = useState(negotiatorDefault);
  const [lines, setLines] = useState<Line[]>([
    { id: 1, day: "Mon, Oct 12, 2026", me: true, text: "Hi! I'm interested in this car. Is it still available?" },
    { id: 2, me: false, text: `Yes, the ${v.model} is still on the lot. Would you like to schedule a test drive?` },
    { id: 3, day: "Tue, Oct 13, 2026", me: true, text: "Is this one still on the lot? A quick yes or no would help." },
  ]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [lines, tab]);
  const post = (t: string) => {
    if (!t.trim()) return;
    setLines((l) => [...l, { id: l.length + 1, me: true, text: t.trim() }]);
    setText(""); setPlus(false);
  };
  const dealer = initials(v.dealer);
  return (
    <aside className="deal-chat">
      <div className="deal-tabs" role="tablist">
        {([["chat", "Chat", MessageCircle], ["docs", "Quotes & Docs", Files], ["neg", "Negotiator", Zap]] as const).map(([k, l, I]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><I size={15} />{l}</button>
        ))}
      </div>
      {tab === "chat" && (
        <>
          <div className="dc-scroll">
            {lines.map((m) => (
              <div key={m.id} style={{ display: "contents" }}>
                {m.day && <span className="day">{m.day}</span>}
                {m.me ? (
                  <div className="out"><div><div className="bubble">{m.text}</div>{neg && <small>Sent by Xprt Negotiator</small>}</div><div className="round"><Zap size={16} /></div></div>
                ) : (
                  <div className="in"><div className="av">{dealer}</div><div><p>{m.text}</p></div></div>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          <div className="composer-wrap">
            <div className="composer">
              <textarea rows={2} value={text} placeholder="Send a message..." aria-label="Send a message" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(text); } }} />
              <div className="composer-row">
                <button className="icon-btn sm" aria-label="More options" aria-expanded={plus} onClick={() => setPlus((p) => !p)}><Plus size={18} /></button>
                <span className="info-chip dark"><HatGlasses size={14} /> Info: Private</span>
                <button className={`info-chip ${neg ? "" : ""}`} aria-pressed={neg} style={neg ? { background: "var(--lime)", color: "#000" } : undefined} onClick={() => setNeg((n) => !n)}><Zap size={13} /> Xprt Negotiator</button>
                <button className="send" disabled={!text.trim()} onClick={() => post(text)} aria-label="Send"><ArrowUp size={16} /></button>
              </div>
              {plus && (
                <div className="pop plus-menu">
                  <div className="pop-label">Request more information</div>
                  {REQUESTS.map((r) => <button key={r} className="pop-row" onClick={() => post(r)}>{r}</button>)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {tab === "docs" && (
        <div className="dc-scroll" style={{ gap: 0 }}>
          {["Out-the-door quote.pdf", "Vehicle history report.pdf"].map((d) => <div className="doc" key={d}><FileText size={22} /><div>{d}<small>Oct 12, 2026 · 12:33 PM</small></div><button className="btn btn-out btn-sm btn-pill">Open</button></div>)}
        </div>
      )}
      {tab === "neg" && (
        <div className="dc-scroll">
          <div className="center" style={{ margin: "auto 0" }}>
            <div className="round-lg"><Zap size={24} /></div>
            <h3 style={{ fontSize: 20, fontWeight: 400 }}>{neg ? "Xprt Negotiator is on" : "Xprt Negotiator is paused"}</h3>
            <p style={{ color: "var(--sub)", maxWidth: 300 }}>{neg ? `It's asking ${v.dealer} for the out-the-door price. You approve any deal.` : "Turn it on and it will talk to the dealer for you. Your details stay private."}</p>
            <button className={`btn btn-pill ${neg ? "btn-out" : "btn-lime"}`} onClick={() => setNeg((n) => !n)}>{neg ? "Pause negotiator" : "Start negotiator"}</button>
          </div>
        </div>
      )}
    </aside>
  );
}

function TradeIn() {
  const [mode, setMode] = useState<"vin" | "ymm">("vin");
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [model, setModel] = useState("");
  const [done, setDone] = useState(false);
  const can = mode === "vin" ? vin.length === 17 : year.length === 4 && model.trim().length > 1;
  return (
    <section className="box tint">
      {done ? (
        <><h2 style={{ fontSize: 28, letterSpacing: "-.02em" }}>Your trade-in offer</h2><div className="big" style={{ margin: "10px 0" }}>$18,400</div><p style={{ color: "var(--sub)" }}>Sample offer. It would be applied to this deal when you accept it.</p><button className="btn btn-out btn-sm btn-pill" style={{ marginTop: 14 }} onClick={() => setDone(false)}>Change car</button></>
      ) : (
        <>
          <h2 style={{ fontSize: 28, letterSpacing: "-.02em" }}>Get your best trade-in offer</h2>
          <p style={{ color: "var(--sub)", marginBottom: 16 }}>Takes about 3 minutes, and the offer goes straight into this deal.</p>
          <div className="box" style={{ marginBottom: 12, padding: 16, boxShadow: "none" }}>
            <div className="seg"><button className={mode === "vin" ? "on" : ""} onClick={() => setMode("vin")}>VIN</button><button className={mode === "ymm" ? "on" : ""} onClick={() => setMode("ymm")}>Year, make, model</button></div>
            {mode === "vin"
              ? <label className="field"><small>VIN (17 characters)</small><input maxLength={17} value={vin} placeholder="Enter your VIN" onChange={(e) => setVin(e.target.value.toUpperCase())} /></label>
              : <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}><label className="field"><small>Year</small><input inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} /></label><label className="field"><small>Make and model</small><input value={model} onChange={(e) => setModel(e.target.value)} /></label></div>}
            <button className="btn btn-lime btn-full" style={{ marginTop: 12 }} disabled={!can} onClick={() => setDone(true)}>Get my offer</button>
          </div>
          <p style={{ fontSize: 12, color: "var(--sub)" }}>We only use your VIN to look the car up. Nothing goes to the dealer until you apply the offer.</p>
        </>
      )}
    </section>
  );
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const a = useApp();
  const deal = a.deals.find((d) => d.id === id);
  const [drive, setDrive] = useState(false);
  const [dealerTab, setDealerTab] = useState("About");
  const [toast, setToast] = useState(false);
  if (!deal) notFound();
  const v = byId(deal.vehicleId)!;
  const total = v.price + 2850;
  const rows: [string, string][] = [["Registration Fee", "$250"], ["Sales Tax (est. 8%)", "$350"]];

  return (
    <>
      <div className="deal-layout">
        <div>
          <div className="top-row" style={{ marginBottom: 16 }}>
            <Link className="grey-btn" href="/garage"><ChevronLeft size={18} /> Back to garage</Link>
            <button className="btn btn-out btn-sm btn-pill" onClick={() => { a.setDealInactive(deal.id, !deal.inactive); setToast(!deal.inactive); }}>{deal.inactive ? "Move back to active" : "Not interested"}</button>
          </div>
          <h1 className="deal-title">{v.title}</h1>
          <div className="deal-meta"><span className="tag" style={{ color: "var(--ink)" }}>{deal.kind}</span><span>Deal {deal.number} · Created {deal.created}</span></div>
          <Gallery photos={v.photos.slice(0, 3)} title={v.title} />
          <Section title="Pricing Details">
            <div className="stat-pair"><div><small>Selling price</small><b>{money(v.price)}</b></div><div><small>Out-the-door estimate</small><b>{money(total)}</b></div></div>
            <div className="rule" />
            <div className="bd head-line"><span>Vehicle Price</span><span>{money(v.price)}</span></div>
            <div className="bd head-line"><span>Registration & Taxes</span><span>$600</span></div>
            {rows.map(([l, r]) => <div className="bd minor" key={l}><span>{l}</span><span>{r}</span></div>)}
            <div className="bd head-line"><span>Dealer Fee</span><span>$350</span></div>
            <div className="bd minor"><span>Documentation Fee</span><span>$350</span></div>
            <div className="bd head-line"><span>Shipping Fee</span><span>$1,900</span></div>
            <div className="rule" />
            <div className="bd head-line" style={{ marginTop: 0 }}><span>Estimated total, the walk-away price</span><span>{money(total)}</span></div>
          </Section>
          <Section title="Dealership Info">
            <div style={{ paddingTop: 12 }}>
              <div style={{ fontSize: 18 }}>{v.dealer}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "6px 0", fontSize: 13 }}>{[0, 1, 2, 3].map((i) => <Star key={i} size={14} fill="var(--lime-2)" stroke="var(--lime-2)" />)}<Star size={14} stroke="var(--lime-2)" /> 4.8</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--sub)" }}><MapPin size={13} />{v.city}</div>
              <div className="offer-tabs" style={{ marginTop: 14, marginBottom: 14 }}>{["About", "Socials", "Reviews", "Sales Team"].map((t) => <button key={t} style={{ fontSize: 14 }} className={dealerTab === t ? "on" : ""} onClick={() => setDealerTab(t)}>{t}</button>)}</div>
              {dealerTab === "About" ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {[[Phone, "Phone", "View dealer phone number"], [Globe, "Website", "Visit dealership website"], [MapPin, "Address", v.city]].map(([I, l, t]) => { const Icon = I as typeof Phone; return <div key={l as string} style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="pin" style={{ background: "var(--muted)" }}><Icon size={16} /></span><div><small style={{ fontSize: 12, color: "var(--sub)", display: "block" }}>{l as string}</small>{t as string}</div></div>; })}
                </div>
              ) : <p style={{ color: "var(--sub)" }}>Sample content for {dealerTab.toLowerCase()} goes here.</p>}
            </div>
          </Section>
          <Section title="Vehicle Details" right={<Link className="link" href={`/vehicle/${v.id}`}>View Listing <ArrowUpRight size={14} /></Link>}>
            <div className="rows" style={{ marginTop: 8 }}>
              <div><span>Make</span><span>{v.make}</span></div><div><span>Mileage</span><span>{v.miles.toLocaleString("en-US")} mi</span></div><div><span>Exterior</span><span>{v.exterior}</span></div><div><span>VIN</span><span>{v.vin}</span></div>
            </div>
          </Section>
          <section className="box"><div className="center">
            <div className="round-lg"><CalendarCheck size={24} /></div>
            <h3 style={{ fontSize: 20, fontWeight: 400 }}>Test Drive</h3>
            {drive ? <><p style={{ color: "var(--sub)" }}>Booked for Saturday at 10:00 AM.</p><button className="btn btn-out btn-pill" onClick={() => setDrive(false)}>Cancel test drive</button></>
              : <><p style={{ color: "var(--sub)" }}>Schedule and manage your test drive appointments for this vehicle.</p><button className="btn btn-lime" onClick={() => setDrive(true)}>Schedule Test Drive</button></>}
          </div></section>
          <TradeIn />
          <Section title="Proposed Vehicles">
            <div className="doc" style={{ marginTop: 12 }}><img src="/cars/bentley.jpg" alt="" style={{ width: 72, height: 52, objectFit: "cover", borderRadius: 8 }} /><div><small>New car proposed</small>Bentley Continental GT Speed<br /><b style={{ fontWeight: 500 }}>$178,500</b></div><span className="tag">Rejected</span></div>
          </Section>
        </div>
        <DealChat v={v} negotiatorDefault={deal.agent === "Active"} />
      </div>
      {toast && <Toast text="Moved to Inactive Deals" action="Undo" onAction={() => { a.setDealInactive(deal.id, false); setToast(false); }} />}
    </>
  );
}
