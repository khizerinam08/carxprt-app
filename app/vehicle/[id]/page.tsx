"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, CarFront, ChevronLeft, ChevronRight, ChevronUp, MapPin } from "lucide-react";
import { Gallery, VehicleCard } from "@/components/Common";
import { byId, FEATURES, initials, money, VEHICLES } from "@/lib/data";
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

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const v = byId(id);
  const a = useApp();
  const router = useRouter();
  const [from, setFrom] = useState("33434");
  const [to, setTo] = useState(a.zip);
  const similar = useMemo(() => (v ? VEHICLES.filter((x) => x.id !== v.id).sort((x, y) => Math.abs(x.price - v.price) - Math.abs(y.price - v.price)).slice(0, 2) : []), [v]);
  if (!v) notFound();

  const idx = VEHICLES.findIndex((x) => x.id === v.id);
  const next = VEHICLES[(idx + 1) % VEHICLES.length];
  const saved = a.saved.includes(v.id);
  const picked = a.compare.includes(v.id);
  const ready = /^\d{5}$/.test(from) && /^\d{5}$/.test(to);
  const shipping = ready ? 250 + (Math.abs(+from - +to) % 400) : 350;
  const base = v.price - 950 - shipping;
  const go = (kind: "Dealership Deal" | "Advisor Deal") => router.push(`/garage/${a.startDeal(v.id, kind)}`);

  return (
    <>
      <div className="top-row">
        <button className="grey-btn" onClick={() => router.back()}><ChevronLeft size={18} /> Back</button>
        <Link className="grey-btn r" href={`/vehicle/${next.id}`}>Next <ChevronRight size={18} /></Link>
      </div>
      <Gallery photos={v.photos} title={v.title} />
      <div className="detail">
        <div>
          <div className="title-row">
            <div>
              <h1>{v.title}</h1>
              <p>{v.year} · {v.condition}</p>
              <div className="loc"><MapPin size={15} />{v.city} ({v.dist} miles away)</div>
            </div>
            <div className="title-btns">
              <button className={`btn btn-sm btn-pill ${saved ? "btn-lime" : "btn-out"}`} aria-pressed={saved} onClick={() => a.toggleSaved(v.id)}><Bookmark size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button>
              <button className={`btn btn-sm btn-pill ${picked ? "btn-dark" : "btn-lime"}`} aria-pressed={picked} onClick={() => { a.setCompareMode(true); a.toggleCompare(v.id); }}><CarFront size={15} /> {picked ? "Added" : "Compare"}</button>
            </div>
          </div>
          <section className="box">
            <div className="colors">
              <div><i style={{ background: v.exteriorHex }} /><span>Exterior colour<b>{v.exterior}</b></span></div>
              <div><i style={{ background: v.interiorHex }} /><span>Interior colour<b>{v.interior}</b></span></div>
            </div>
            <div className="spec-grid">
              {[["Mileage", `${v.miles.toLocaleString("en-US")} mi`], ["Fuel type", v.fuel], ["Drivetrain", v.drivetrain], ["Engine", v.engine], ["Year", String(v.year)], ["Body type", v.body]].map(([l, r]) => <div key={l}><small>{l}</small><b>{r}</b></div>)}
            </div>
          </section>
          <Section title="Vehicle Details" right={<a className="link" href="#" onClick={(e) => e.preventDefault()}>View on dealer website <ArrowUpRight size={14} /></a>}>
            <h3 className="sub-head">Vehicle identification</h3>
            <div className="rows"><div><span>Stock number</span><span>{v.stock}</span></div><div><span>VIN</span><span>{v.vin}</span></div></div>
            {Object.entries(FEATURES).map(([group, items]) => (
              <div key={group}><h3 className="sub-head">{group}</h3>{items.map((i) => <div className="list-row" key={i}>{i}</div>)}</div>
            ))}
          </Section>
          <Section title="Shipping Details">
            <div className="ship">
              <div><h4>Delivery from</h4><label className="field"><small>ZIP code</small><input inputMode="numeric" maxLength={5} value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))} /></label><p>{v.city}</p></div>
              <div><h4>Delivery to</h4><label className="field"><small>ZIP code</small><input inputMode="numeric" maxLength={5} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} /></label><p>Your location</p></div>
            </div>
            <p style={{ fontSize: 13, marginTop: 20 }}>Estimated shipping cost</p>
            <div className="big">{money(shipping)}</div>
          </Section>
          <h2 className="h-sec">People also viewed similar cars</h2>
          <div className="grid-2">{similar.map((s, i) => <VehicleCard key={s.id} v={s} index={i} />)}</div>
        </div>
        <aside className="side">
          <div className="box">
            <div className="big">{money(v.price)}</div>
            <div className="bd head-line" style={{ marginTop: 16 }}><span>Vehicle Price</span><span>{money(base)}</span></div>
            <div className="bd head-line"><span>Registration & Taxes</span><span>$600</span></div>
            <div className="bd minor"><span>Sales Tax (est. 8%)</span><span>$350</span></div>
            <div className="bd minor"><span>Registration Fee</span><span>$250</span></div>
            <div className="bd head-line"><span>Dealer Fee</span><span>$350</span></div>
            <div className="bd minor"><span>Documentation Fee</span><span>$350</span></div>
            <div className="bd head-line"><span>Shipping Fee</span><span>{money(shipping)}</span></div>
            <p className="bd-note">To ZIP {to || a.zip}, from the shipping section.</p>
            <div className="rule" />
            <button className="btn btn-lime btn-full" onClick={() => go("Dealership Deal")}>Contact Dealership</button>
            <p className="note">Let the dealership contact you or handle it yourself privately.</p>
            <div className="or">OR</div>
            <button className="btn btn-lime btn-glow btn-full" onClick={() => go("Advisor Deal")}>Start Deal With CarXprt Advisor</button>
            <p className="note">Get a human advisor to negotiate your deal.</p>
            <div className="rule" />
            <div className="dealer-card">
              <div className="dealer-top"><span>Dealership Info</span><a className="link" href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12 }}>View Dealership</a></div>
              <div className="dealer"><div className="sq-av">{initials(v.dealer)}</div><div>{v.dealer}<small><MapPin size={12} />{v.city}</small></div></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
