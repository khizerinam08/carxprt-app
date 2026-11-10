"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Mic, Paperclip, Plus, RefreshCw, ThumbsDown, ThumbsUp, X, Pencil, Image as ImageIcon } from "lucide-react";
import { Logo } from "./Brand";
import { useApp, type ChatMsg } from "@/lib/store";

const PROMPTS = ["Find me a reliable family SUV", "Search for an electric vehicle", "Show me Toyota cars"];
const PAST = ["Family SUV under $40k", "Electric cars near 12345", "Bentley options"];
const NEW_STAMP_AFTER = 15 * 60 * 1000;
const TOOL_BEAT = 500;
const MOVE_BEAT = 260;
const WORD_BEAT = 40;

const clock = (at: number) => new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function stamp(at: number) {
  const d = new Date(at);
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / 86400000);
  const day = days === 0 ? "Today" : days === 1 ? "Yesterday" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${clock(at)}`;
}

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
      <div className="m-meta"><button aria-label="Edit message" title="Edit" onClick={() => setEditing(true)}><Pencil size={13} /></button></div>
    </div>
  );
}

/** New replies play in order: the search update beside the avatar, the avatar moves down, the words stream in. */
function useReply(m: ChatMsg) {
  const tokens = m.text.split(/(\s+)/);
  const [stage, setStage] = useState<"tool" | "move" | "stream" | "done">(() => {
    const fresh = Date.now() - m.at < 1000 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !fresh ? "done" : m.tool && !m.regenerated ? "tool" : "stream";
  });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (stage === "tool" || stage === "move") {
      const t = setTimeout(() => setStage(stage === "tool" ? "move" : "stream"), stage === "tool" ? TOOL_BEAT : MOVE_BEAT);
      return () => clearTimeout(t);
    }
    if (stage !== "stream") return;
    const t = setInterval(() => setShown((n) => n + 2), WORD_BEAT); // a word plus the space after it
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => { if (stage === "stream" && shown >= tokens.length) setStage("done"); }, [stage, shown, tokens.length]);

  return { stage, shown, tokens };
}

function AiMessage({ m }: { m: ChatMsg }) {
  const a = useApp();
  const [copied, setCopied] = useState(false);
  const { stage, shown, tokens } = useReply(m);
  const total = m.variants?.length ?? 1;
  return (
    <div className={`m-ai ${m.tool ? "has-tool" : ""} ${stage === "tool" ? "at-tool" : ""}`}>
      {m.tool && <div className="tool"><Check size={14} /> {m.tool}</div>}
      <div className="ai-av"><Logo mark /></div>
      <p>{stage === "done" ? m.text : tokens.map((t, i) => <span key={i} className={i < shown ? "sw on" : "sw"}>{t}</span>)}</p>
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
        <time className="m-time">{clock(m.at)}</time>
      </div>
    </div>
  );
}

const QUERY_LIMIT = 50;
const VOICE_LIMIT = 10;
const VOICE_USED = 0;

function Meter({ label, left, limit, used, unit = "" }: { label: string; left: number; limit: number; used: number; unit?: string }) {
  return (
    <div className="quota-row">
      <div><span>{label}</span><small>{left} of {limit}{unit} left</small></div>
      <i><b style={{ width: `${(used / limit) * 100}%` }} /></i>
    </div>
  );
}

/** Small usage ring in the chat footer: fills as queries are used, click for what's left. */
function Quota({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const { queries } = useApp();
  const root = useRef<HTMLDivElement>(null);
  const used = Math.min(queries, QUERY_LIMIT);
  const left = QUERY_LIMIT - used;
  const C = 2 * Math.PI * 9;

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open, onClose]);

  return (
    <div className="quota" ref={root}>
      <button aria-label={`Quota: ${left} of ${QUERY_LIMIT} queries left`} aria-expanded={open} onClick={onToggle}>
        <svg className="quota-ring" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="9" strokeDasharray={C} strokeDashoffset={C * (1 - used / QUERY_LIMIT)} />
        </svg>
      </button>
      {open && (
        <div className="pop quota-pop">
          <h4>Quota left</h4>
          <Meter label="Queries" left={left} limit={QUERY_LIMIT} used={used} />
          <Meter label="Voice" left={VOICE_LIMIT - VOICE_USED} limit={VOICE_LIMIT} used={VOICE_USED} unit=" min" />
        </div>
      )}
    </div>
  );
}

export function ChatPanel({ advisor = false }: { advisor?: boolean }) {
  const a = useApp();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState<"history" | "attach" | "quota" | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [a.messages, a.pending]);
  useEffect(() => { if (a.voiceDraft) { setText(a.voiceDraft); a.clearVoiceDraft(); box.current?.focus(); } }, [a.voiceDraft, a]);
  useEffect(() => { const t = box.current; if (!t) return; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }, [text]);

  const closeMenu = useCallback(() => setMenu(null), []);
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
        {a.messages.map((m, i) => (
          <Fragment key={m.id}>
            {(i === 0 || m.at - a.messages[i - 1].at > NEW_STAMP_AFTER) && <time className="chat-stamp">{stamp(m.at)}</time>}
            {m.role === "user" ? <UserMessage key={m.text} m={m} /> : <AiMessage key={m.at} m={m} />}
          </Fragment>
        ))}
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
        <div className="small-print chat-note">
          <Quota open={menu === "quota"} onToggle={() => setMenu(menu === "quota" ? null : "quota")} onClose={closeMenu} />
          <span>AI can make mistakes.</span>
        </div>
      </div>
    </>
  );
}
