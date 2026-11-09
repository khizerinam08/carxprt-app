"use client";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { useApp } from "@/lib/store";

export default function Account() {
  const a = useApp();
  const router = useRouter();
  return (
    <>
      <header className="head"><h1>Account</h1></header>
      <div className="acct">
        <section className="box">
          <h2>Profile</h2>
          <div className="rows"><div><span>Name</span><span>Test Account</span></div><div><span>Plan</span><span>Free</span></div><div><span>Default ZIP</span><span>{a.zip}</span></div><div><span>Appearance</span><span style={{ textTransform: "capitalize" }}>{a.theme}</span></div></div>
        </section>
        <section className="box">
          <div className="sec-head"><h2 style={{ margin: 0 }}>Search history</h2><button className="btn btn-out btn-sm btn-pill" disabled={!a.history.length} onClick={a.clearHistory}>Clear All</button></div>
          {a.history.length ? a.history.map((h) => (
            <div className="hist-row" key={h}><button onClick={() => { a.replay(h); router.push("/search"); }}><History size={16} /> {h}</button></div>
          )) : <p style={{ color: "var(--sub)", marginTop: 12 }}>Your searches will show here.</p>}
        </section>
      </div>
    </>
  );
}
