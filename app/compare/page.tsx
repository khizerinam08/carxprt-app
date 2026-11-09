"use client";
import Link from "next/link";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { byId, money, type Vehicle } from "@/lib/data";
import { useApp } from "@/lib/store";

const ROWS: [string, (v: Vehicle) => string][] = [
  ["Price", (v) => money(v.price)], ["Mileage", (v) => `${v.miles.toLocaleString("en-US")} mi`], ["Fuel", (v) => v.fuel], ["Body", (v) => v.body],
  ["Drivetrain", (v) => v.drivetrain], ["Engine", (v) => v.engine], ["Transmission", (v) => v.transmission], ["Condition", (v) => v.condition],
  ["Seller", (v) => v.seller], ["Location", (v) => `${v.city} (${v.dist} mi)`],
];

export default function Compare() {
  const a = useApp();
  const cars = a.compare.map(byId).filter(Boolean) as Vehicle[];
  return (
    <>
      <div className="top-row"><Link href="/search" className="grey-btn"><ChevronLeft size={18} /> Back</Link></div>
      <header className="head"><h1>Compare Cars</h1></header>
      {cars.length < 2 ? (
        <div className="empty"><h3>Pick at least two cars</h3><p>Choose cars in the Discovery Hub to compare them here.</p><Link className="btn btn-lime" href="/search" onClick={() => a.setCompareMode(true)}>Choose cars</Link></div>
      ) : (
        <div className="box">
          <div className="cmp">
            <table>
              <thead><tr><th />{cars.map((v) => <th key={v.id}><Link href={`/vehicle/${v.id}`}><img src={v.img} alt="" />{v.title}</Link></th>)}</tr></thead>
              <tbody>{ROWS.map(([l, fn]) => <tr key={l}><td>{l}</td>{cars.map((v) => <td key={v.id}>{fn(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <button className="btn btn-lime" style={{ marginTop: 20 }} onClick={() => { a.setPanel("chat"); a.send(`Help me choose between ${cars.map((c) => c.title).join(" and ")}`); }}><MessageCircle size={16} /> Ask CarXprt about these cars</button>
        </div>
      )}
    </>
  );
}
