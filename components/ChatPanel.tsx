"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Mic, Paperclip, Plus, RefreshCw, ThumbsDown, ThumbsUp, X, Pencil, Image as ImageIcon } from "lucide-react";
import { Logo } from "./Brand";
import { useApp, type ChatMsg } from "@/lib/store";

const PROMPTS = ["Find me a reliable family SUV", "Search for an electric vehicle", "Show me Toyota cars"];
const PAST = ["Family SUV under $40k", "Electric cars near 12345", "Bentley options"];

function UserMessage({ m }: { m: ChatMsg }) {
  const a = useApp();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.text);
  if (editing) {
    return (
      <div className="edit">
        <textarea autoFocus rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit your message" />
        <div className="edit-row">
          <button className="btn btn-out btn-sm btn-pill" onClick={() => { setEditing(false); setText(m.text); }}>Cancel</button>
          <button className="btn btn-dark btn-sm btn-pill" disabled={!text.trim()} onClick={() => { a.editMessage(m.id, text); setEditing(false); }}>Send</button>
        </div>
      </div>
    );
  }
  return (
    <div className="m-user">
      <div className="bubble">{m.text}</div>
      <div className="m-meta"><button onClick={() => setEditing(true)}><Pencil size={12} /> Edit</button></div>
    </div>
  );
}

function AiMessage({ m }: { m: ChatMsg }) {
  const a = useApp();
  const [copied, setCopied] = useState(false);
  const total = m.variants?.length ?? 1;
  return (
    <div className="m-ai">
      <div className="ai-av"><Logo mark /></div>
      <div>
        {m.tool && <div className="tool"><Check size={14} /> {m.tool}</div>}
        <p>{m.text}</p>
        <div className="act">
          <button className="icon-btn sm" aria-label="Copy" onClick={() => { navigator.clipboard?.writeText(m.text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
          <button className={`icon-btn sm ${m.vote === "up" ? "on" : ""}`} aria-label="Good response" aria-pressed={m.vote === "up"} onClick={() => a.vote(m.id, "up")}><ThumbsUp size={14} /></button>
          <button className={`icon-btn sm ${m.vote === "down" ? "on" : ""}`} aria-label="Bad response" aria-pressed={m.vote === "down"} onClick={() => a.vote(m.id, "down")}><ThumbsDown size={14} /></button>
          <button className="icon-btn sm" aria-label="Regenerate" onClick={() => a.regenerate(m.id)}><RefreshCw size={14} /></button>
          {total > 1 && m.regenerated && (
            <span className="pager">
              <button className="icon-btn sm" aria-label="Previous version" onClick={() => a.setVariant(m.id, -1)}><ChevronLeft size={14} /></button>
              {(m.variant ?? 0) + 1}/{total}
              <button className="icon-btn sm" aria-label="Next version" onClick={() => a.setVariant(m.id, 1)}><ChevronRight size={14} /></button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ advisor = false }: { advisor?: boolean }) {
  const a = useApp();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState<"history" | "attach" | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [a.messages, a.pending]);
  useEffect(() => { if (a.voiceDraft) { setText(a.voiceDraft); a.clearVoiceDraft(); box.current?.focus(); } }, [a.voiceDraft, a]);
  useEffect(() => { const t = box.current; if (!t) return; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }, [text]);

  const submit = () => { if (!text.trim()) return; a.send(text); setText(""); };
  const title = advisor ? "CarXprt Advisor" : a.messages.length ? (a.messages[0].text.length > 26 ? a.messages[0].text.slice(0, 26) + "…" : a.messages[0].text) : "New Chat";

  return (
    <>
      <div className="panel-head" style={{ position: "relative" }}>
        <button className="panel-title" onClick={() => setMenu(menu === "history" ? null : "history")} aria-expanded={menu === "history"} aria-label="Chat history">
          <span>{title}</span><ChevronDown size={16} />
        </button>
        <div style={{ display: "flex" }}>
          <button className="icon-btn" aria-label="New chat" onClick={() => { a.newChat(); setMenu(null); }}><Plus size={20} /></button>
          <button className="icon-btn" aria-label="Close" onClick={() => a.setPanel(null)}><X size={20} /></button>
        </div>
        {menu === "history" && (
          <div className="pop" style={{ top: 54, left: 12, width: 280 }}>
            <div className="pop-label">Recent chats</div>
            {PAST.map((p) => <button key={p} className="pop-row" onClick={() => { setMenu(null); a.newChat(); a.send(p); }}>{p}</button>)}
          </div>
        )}
      </div>
      <div className="chat-scroll">
        {!a.messages.length && !a.pending && (
          <div className="hello">
            <h2>Hi, Test</h2>
            <p>{advisor ? "A human advisor can negotiate your deal." : "Let’s find your perfect car."}</p>
            {PROMPTS.map((p) => <button className="prompt" key={p} onClick={() => a.send(p)}>{p}<ArrowRight size={16} /></button>)}
          </div>
        )}
        {a.messages.map((m) => (m.role === "user" ? <UserMessage key={m.id + m.text} m={m} /> : <AiMessage key={m.id} m={m} />))}
        {a.pending && <div className="m-ai"><div className="ai-av"><Logo mark /></div><div className="dots-wait" aria-label="CarXprt is typing"><i /><i /><i /></div></div>}
        <div ref={end} />
      </div>
      <div className="composer-wrap">
        <div className="composer">
          <textarea ref={box} rows={1} value={text} placeholder={a.listening ? "Listening…" : "Message CarXprt…"} aria-label="Message CarXprt" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} />
          <div className="composer-row">
            <button className="icon-btn sm" aria-label="Attach" aria-expanded={menu === "attach"} onClick={() => setMenu(menu === "attach" ? null : "attach")}><Plus size={18} /></button>
            <button className={`mic ${a.listening ? "live" : ""}`} aria-label={a.listening ? "Stop listening" : "Speak to CarXprt"} onClick={() => (a.listening ? a.stopListening() : a.startListening())}><Mic size={18} /></button>
            <button className="btn btn-out btn-sm btn-pill" disabled={!text.trim()} onClick={submit}>Send <ArrowUp size={14} /></button>
          </div>
          {menu === "attach" && (
            <div className="pop plus-menu" style={{ width: 220 }}>
              <button className="pop-row" onClick={() => setMenu(null)}><Paperclip size={16} /> Add a file</button>
              <button className="pop-row" onClick={() => setMenu(null)}><ImageIcon size={16} /> Add a photo</button>
            </div>
          )}
        </div>
        <div className="small-print"><span>Queries {a.queries}/50 · Voice 0/10 min</span><span>AI can make mistakes.</span></div>
      </div>
    </>
  );
}
