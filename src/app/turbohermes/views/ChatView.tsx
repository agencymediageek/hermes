'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CircleStop, ExternalLink, FileText, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import { ChatCitation, ChatMessage, ChatSession, ChatStreamError, turbohermes } from '@/lib/turbohermes-client';
import { TurboHeader } from '@/components/TurboHermesShell';

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function citationKey(citation: ChatCitation) { return citation.id || [citation.documentId, citation.chunkId, citation.sourceId, citation.version, JSON.stringify(citation.locator || {})].join(':'); }
function uniqueCitations(citations: ChatCitation[] = []) { return citations.filter((citation, index, all) => citation && citationKey(citation) && all.findIndex((item) => citationKey(item) === citationKey(citation)) === index); }
function locatorLabel(locator: ChatCitation['locator']) {
  if (!locator || typeof locator !== 'object') return 'Location unavailable';
  const preferred = ['ordinal', 'page', 'line', 'section', 'offset'].find((field) => locator[field] !== undefined && locator[field] !== null);
  if (preferred) return `${preferred}: ${String(locator[preferred]).slice(0, 80)}`;
  try { return JSON.stringify(locator).slice(0, 120) || 'Location unavailable'; } catch { return 'Location unavailable'; }
}
function safeSourceUri(value?: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password ? url.toString() : null; } catch { return null; }
}
function SafeText({ content }: { content: string }) {
  const lines = content.split('\n'); let inCode = false;
  return <div className="space-y-2 text-sm leading-6">{lines.map((line, index) => {
    if (line.trim().startsWith('```')) { inCode = !inCode; return null; }
    if (inCode) return <code key={index} className="block overflow-x-auto rounded bg-background/70 px-3 py-2 font-mono text-xs">{line}</code>;
    if (!line.trim()) return <div key={index} className="h-1" />;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/); const text = bullet ? bullet[1] : line;
    const pieces = text.split(/(\*\*.*?\*\*)/g);
    const rendered = pieces.map((piece, pieceIndex) => piece.startsWith('**') && piece.endsWith('**') ? <strong key={pieceIndex}>{piece.slice(2, -2)}</strong> : piece);
    return bullet ? <div key={index} className="flex gap-2"><span className="text-primary">•</span><span>{rendered}</span></div> : <p key={index}>{rendered}</p>;
  })}</div>;
}
function CitationList({ citations }: { citations?: ChatCitation[] }) {
  const items = uniqueCitations(citations);
  if (!items.length) return null;
  return <section className="mt-4 border-t border-border/70 pt-3"><div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[.14em] text-muted-foreground"><FileText size={13} />Sources</div><ol className="space-y-1.5">{items.map((citation, index) => { const uri = safeSourceUri(citation.sourceUri); const label = citation.title || citation.sourceId || 'Untitled source'; return <li key={citationKey(citation)} className="min-w-0"><div className="flex min-w-0 items-start gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-2 text-xs"><span className="mt-0.5 shrink-0 font-mono text-2xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1">{uri ? <a href={uri} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1 font-medium text-primary hover:underline" title={label}><span className="truncate">{label}</span><ExternalLink size={12} className="shrink-0" /></a> : <span className="block truncate font-medium text-foreground" title={label}>{label}</span>}<div className="mt-0.5 flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 font-mono text-2xs text-muted-foreground" title={locatorLabel(citation.locator)}><span className="max-w-full truncate">{locatorLabel(citation.locator)}</span>{Number.isInteger(citation.version) && <span className="shrink-0">v{citation.version}</span>}{citation.sourceId && <span className="max-w-[12rem] truncate">{citation.sourceId}</span>}</div></div></div></li>; })}</ol></section>;
}

export default function ChatView({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [assistantText, setAssistantText] = useState('');
  const [assistantCitations, setAssistantCitations] = useState<ChatCitation[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const [stage, setStage] = useState<'plan' | 'refine' | 'execute'>('plan');
  const abortRef = useRef<AbortController | null>(null);
  const sessionsRef = useRef<ChatSession[]>([]);
  const selectedRef = useRef<string | null>(null);
  const intentRef = useRef(0);
  const streamRef = useRef(0);
  const requestedRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectSession = useCallback((item: ChatSession) => {
    intentRef.current += 1;
    selectedRef.current = item.id;
    setSelected(item); setStage('plan'); setDraft(''); setActivity([]); setStreamError(null);
  }, []);

  useEffect(() => {
    requestedRef.current = new URLSearchParams(window.location.search).get('session');
    let cancelled = false;
    const handleSelection = async (event: Event) => {
      const id = (event as CustomEvent<{ sessionId?: string }>).detail?.sessionId;
      if (!id || streaming) return;
      const local = sessionsRef.current.find((candidate) => candidate.id === id);
      if (local) { selectSession(local); return; }
      try {
        const fetched = await turbohermes.chatSession(id);
        if (cancelled || streaming) return;
        sessionsRef.current = [fetched, ...sessionsRef.current.filter((candidate) => candidate.id !== fetched.id)];
        selectSession(fetched);
      } catch {
        // A stale or unauthorized session must not interrupt the current transcript.
      }
    };
    window.addEventListener('hermes:select-chat-session', handleSelection);
    return () => { cancelled = true; window.removeEventListener('hermes:select-chat-session', handleSelection); };
  }, [selectSession, streaming]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await turbohermes.chatSessions();
      sessionsRef.current = items;
      if (!selectedRef.current && items.length) selectSession(items.find((item) => item.id === requestedRef.current) || items[0]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load chat sessions');
    } finally { setLoading(false); }
  }, [selectSession]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = selected?.id;
    if (!id) { setMessages([]); return; }
    const intent = intentRef.current; setMessageLoading(true);
    turbohermes.chatMessages(id).then((items) => { if (intent === intentRef.current && selectedRef.current === id) setMessages(items); }).catch((cause) => { if (intent === intentRef.current) setError(cause instanceof Error ? cause.message : 'Unable to load transcript'); }).finally(() => { if (intent === intentRef.current) setMessageLoading(false); });
  }, [selected]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, assistantText]);

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault(); const content = draft.trim();
    if (!content || !selected || streaming) return;
    const id = selected.id; const streamId = ++streamRef.current; const controller = new AbortController(); abortRef.current = controller;
    setMessages((items) => [...items, { id: crypto.randomUUID(), sessionId: id, role: 'user', content, createdAt: new Date().toISOString() }]); setDraft(''); setStreaming(true); setAssistantText(''); setAssistantCitations([]); setStreamError(null);
    try {
      await turbohermes.streamChat(id, { content, idempotencyKey: crypto.randomUUID(), correlationId: crypto.randomUUID() }, controller.signal, (event) => {
        if (streamRef.current !== streamId) return;
        if (event.type === 'start') setActivity((items) => [...items.slice(-2), 'Stream started']);
        if (event.type === 'token') { setAssistantText((text) => text + (event.text || '')); setActivity((items) => items.includes('Streaming response') ? items : [...items.slice(-2), 'Streaming response']); }
        if (event.type === 'citation' || event.type === 'citations' || event.citations || event.citation) { const incoming = event.citations || (event.citation ? [event.citation] : []); if (incoming.length) { setAssistantCitations((items) => uniqueCitations([...items, ...incoming])); setActivity((items) => [...items.slice(-2), `${incoming.length} citation${incoming.length === 1 ? '' : 's'} received`]); } }
        if (event.type === 'terminal') setActivity((items) => [...items.slice(-2), typeof event.text === 'string' && event.text ? `Terminal event: ${event.text}` : 'Terminal event received']);
      });
      const latest = await turbohermes.chatMessages(id); if (streamRef.current === streamId) setMessages(latest);
    } catch (cause) {
      if ((cause as Error).name !== 'AbortError') setStreamError(cause instanceof ChatStreamError ? `Request not completed (${cause.code}): ${cause.message}` : cause instanceof Error ? cause.message : 'The stream ended unexpectedly');
    } finally { if (streamRef.current === streamId) { setStreaming(false); setAssistantText(''); setAssistantCitations([]); } abortRef.current = null; }
  };

  const stageCopy = {
    plan: 'Describe the objective, context, constraints and expected result. TurboHermes will structure the work into governed microtasks before any execution is considered.',
    refine: 'Refine requires project ingestion, indexing and a refinement pipeline that are not available in the backend yet.',
    execute: 'Execute requires an approved plan and an authorized executor. No execution is available in this environment.',
  };
  const controlsLocked = loading || messageLoading || streaming;
  return <div className={`flex min-h-full flex-col ${compact ? 'text-[13px]' : ''}`}>{!compact && <TurboHeader eyebrow="TurboHermes / governed conversation" title="Chat" current="/turbohermes/chat" />}<main className={`flex min-h-0 flex-1 flex-col ${compact ? 'p-2' : 'p-3 sm:p-6'}`}><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Persistent governed transcript.</p><p className="mt-1 text-xs text-amber-300/80">Plan is the only operational stage.</p></div>{!compact && <button disabled={controlsLocked} onClick={load} className="btn-secondary px-3 py-2 text-xs"><RefreshCw size={14} />Reload</button>}</div>{error && <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error"><X size={15} /></button></div>}<section className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card ${compact ? 'min-h-[420px]' : 'min-h-[600px]'}`}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={15} className="text-primary" />{selected ? 'Persistent transcript' : 'Select a recent chat'}</div><div className="flex rounded-md border border-border bg-background p-0.5" role="group" aria-label="Chat stage">{(['plan', 'refine', 'execute'] as const).map((item) => <button key={item} disabled={!selected || controlsLocked || item !== 'plan'} onClick={() => item === 'plan' && setStage('plan')} title={stageCopy[item]} className={`rounded px-3 py-1.5 text-xs capitalize ${stage === item ? 'bg-primary text-primary-foreground' : item !== 'plan' ? 'cursor-not-allowed text-muted-foreground/40' : 'text-muted-foreground hover:text-foreground'}`}>{stage === item && <Check size={12} className="mr-1 inline" />}{item}{item !== 'plan' && <span className="ml-1 text-[9px] uppercase">locked</span>}</button>)}</div></div><div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8"><div className="mx-auto max-w-3xl">{activity.length > 0 && <div className="mb-4 border-l border-primary/40 pl-3 text-xs text-muted-foreground"><div className="mb-1 text-2xs uppercase tracking-[.14em] text-primary">Live activity</div>{activity.slice(-3).map((item, index) => <div key={`${item}-${index}`}>{item}</div>)}</div>}{messageLoading ? <div className="space-y-4"><div className="skeleton h-16" /><div className="skeleton h-24" /></div> : !selected ? <div className="flex min-h-[260px] items-center justify-center text-center text-sm text-muted-foreground"><p>Select a Recent Chat from the navigation to begin.</p></div> : messages.length === 0 && !assistantText ? <div className="flex min-h-[260px] items-center justify-center text-center"><div><p className="text-base font-medium text-foreground">Plan a precise next move.</p><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{stageCopy.plan}</p></div></div> : <div className="space-y-5">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><article className={`max-w-[88%] px-4 py-3 text-[15px] ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}`}><div className="mb-2 text-2xs uppercase tracking-wider text-muted-foreground">{message.role} · {formatDate(message.createdAt)}</div><SafeText content={message.content} /><CitationList citations={message.citations} /></article></div>)}{(assistantText || assistantCitations.length > 0) && <div className="chat-bubble-agent max-w-[88%] px-4 py-3 text-[15px]"><div className="mb-2 text-2xs uppercase text-primary">assistant · streaming</div><SafeText content={assistantText} /><CitationList citations={assistantCitations} /></div>}{streamError && <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{streamError}</div>}<div ref={bottomRef} /></div>}</div></div><form onSubmit={send} className="border-t border-border bg-muted/10 p-3 sm:p-4"><div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-2 focus-within:border-primary/60"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} disabled={!selected || controlsLocked} rows={3} placeholder={selected ? 'Describe objective, context, constraints and expected result…' : 'Select a recent chat first'} className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" aria-label="Chat prompt" /><div className="flex items-center justify-between px-2 pt-2"><span className="text-2xs text-muted-foreground">Enter sends · Shift+Enter adds a line</span>{streaming ? <button type="button" onClick={() => abortRef.current?.abort()} className="btn-danger px-3 py-1.5 text-xs"><CircleStop size={14} />Cancel</button> : <button type="submit" disabled={!selected || controlsLocked || !draft.trim()} className="btn-primary px-3 py-1.5 text-xs"><Send size={14} />Send</button>}</div></div></form></section></main></div>;
}