"use client";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { COLORS, SORTS, VEHICLES, type Filters } from "@/lib/data";
import { useApp } from "@/lib/store";

type ListKey = "condition" | "seller" | "fuel" | "body" | "colors";
const uniq = <T,>(a: T[]) => [...new Set(a)];

function Accordion({ title, disabled, children, startOpen = false }: { title: string; disabled?: boolean; children: React.ReactNode; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const shown = open && !disabled;
  return (
    <div>
      <button className="acc-btn" disabled={disabled} aria-expanded={shown} onClick={() => setOpen((o) => !o)}>
        {title}{shown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {shown && <div className="acc-list">{children}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="field">
      <small>{label}</small>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown size={18} />
    </label>
  );
}

export function FiltersPanel() {
  const a = useApp();
  const f = a.filters;
  const [zipDraft, setZipDraft] = useState(a.zip);

  const toggle = (key: "brands" | "models" | ListKey, v: string) => {
    const cur = f[key] as string[];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    const p: Partial<Filters> = { [key]: next };
    if (key === "brands") p.models = f.models.filter((m) => VEHICLES.some((c) => c.model === m && next.includes(c.make)));
    a.patchFilters(p);
  };
  const brands = useMemo(() => uniq(VEHICLES.map((v) => v.make)).sort(), []);
  const models = useMemo(() => uniq(VEHICLES.filter((v) => f.brands.includes(v.make)).map((v) => v.model)).sort(), [f.brands]);
  const n = (fn: (v: (typeof VEHICLES)[number]) => boolean) => VEHICLES.filter(fn).length;

  const Chips = ({ k, items }: { k: ListKey; items: string[] }) => (
    <div className="chips">{items.map((i) => <button key={i} className={`opt ${(f[k] as string[]).includes(i) ? "on" : ""}`} aria-pressed={(f[k] as string[]).includes(i)} onClick={() => toggle(k, i)}>{i}</button>)}</div>
  );
  const commitZip = () => { if (/^\d{5}$/.test(zipDraft)) a.setZip(zipDraft); else setZipDraft(a.zip); };

  return (
    <>
      <div className="panel-head">
        <div className="panel-title"><span>Filters</span></div>
        <button className="icon-btn" aria-label="Close filters" onClick={() => a.setPanel(null)}><X size={20} /></button>
      </div>
      <div className="filters">
        <section className="f-group">
          <h3>Sorting</h3>
          <Select label="Sort by" value={f.sort} onChange={(sort) => a.patchFilters({ sort })} options={SORTS.map((s) => [s, s])} />
        </section>
        <section className="f-group">
          <h3>Location</h3>
          <label className="field"><small>ZIP code</small><input inputMode="numeric" maxLength={5} value={zipDraft} onChange={(e) => setZipDraft(e.target.value.replace(/\D/g, ""))} onBlur={commitZip} onKeyDown={(e) => e.key === "Enter" && commitZip()} /></label>
          <label className="check"><input type="checkbox" checked={a.defaultLoc} onChange={(e) => a.setDefaultLoc(e.target.checked)} /> Set as my default location</label>
          <Select label="Search radius" value={String(a.radius)} onChange={(v) => a.setRadius(+v)} options={[["10", "10 miles"], ["25", "25 miles"], ["50", "50 miles"], ["100", "100 miles"]]} />
        </section>
        <section className="f-group">
          <h3>Basics</h3>
          <div>
            <Accordion title="Brand" startOpen>
              {brands.map((b) => <label className="check" key={b}><input type="checkbox" checked={f.brands.includes(b)} onChange={() => toggle("brands", b)} /> {b}<small>{n((v) => v.make === b)}</small></label>)}
            </Accordion>
            <Accordion title="Model" disabled={!f.brands.length}>
              {models.map((m) => <label className="check" key={m}><input type="checkbox" checked={f.models.includes(m)} onChange={() => toggle("models", m)} /> {m}<small>{n((v) => v.model === m)}</small></label>)}
            </Accordion>
          </div>
          <Select label="Year" value={f.yearMin} onChange={(yearMin) => a.patchFilters({ yearMin })} options={[["", "Any year"], ["2024", "2024 and newer"], ["2023", "2023 and newer"], ["2022", "2022 and newer"], ["2021", "2021 and newer"]]} />
        </section>
        <section className="f-group"><h3>Condition</h3><Chips k="condition" items={["New", "Certified", "Used"]} /></section>
        <section className="f-group"><h3>Seller type</h3><Chips k="seller" items={["Dealership", "Private seller"]} /></section>
        <section className="f-group"><h3>Fuel</h3><Chips k="fuel" items={["Gasoline", "Hybrid", "Electric"]} /></section>
        <section className="f-group"><h3>Body style</h3><Chips k="body" items={uniq(VEHICLES.map((v) => v.body)).sort()} /></section>
        <section className="f-group">
          <h3>Price and mileage</h3>
          <Select label="Max price" value={f.priceMax} onChange={(priceMax) => a.patchFilters({ priceMax })} options={[["", "Any price"], ["35000", "$35,000"], ["45000", "$45,000"], ["70000", "$70,000"], ["150000", "$150,000"]]} />
          <Select label="Max mileage" value={f.milesMax} onChange={(milesMax) => a.patchFilters({ milesMax })} options={[["", "Any mileage"], ["5000", "5,000 mi"], ["15000", "15,000 mi"], ["30000", "30,000 mi"]]} />
          <Select label="Transmission" value={f.transmission} onChange={(transmission) => a.patchFilters({ transmission })} options={[["", "Any"], ["Automatic", "Automatic"], ["Manual", "Manual"]]} />
        </section>
        <section className="f-group">
          <h3>Exterior colour</h3>
          <div className="chips">
            {COLORS.map(([name, hex]) => <button key={name} className={`opt swatch ${f.colors.includes(name) ? "on" : ""}`} aria-pressed={f.colors.includes(name)} onClick={() => toggle("colors", name)}><i style={{ background: hex }} />{name}</button>)}
          </div>
        </section>
      </div>
      <div className="f-foot">
        <button className="btn btn-lime" onClick={() => { commitZip(); if (window.innerWidth <= 820) a.setPanel(null); }}>Search</button>
        <button className="btn btn-out" onClick={() => { a.clearFilters(); }}>Clear All</button>
      </div>
    </>
  );
}
