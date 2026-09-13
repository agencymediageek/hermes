'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CircleStop, ExternalLink, FileText, MessageSquare, Plus, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import { ChatCitation, ChatMessage, ChatStreamError, ChatSession, turbohermes } from '@/lib/turbohermes-client';
import { TurboHeader } from '@/components/TurboHermesShell';

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function citationKey(citation: ChatCitation) {
  return citation.id || [citation.documentId, citation.chunkId, citation.sourceId, citation.version, JSON.stringify(citation.locator || {})].join(':');
}
function uniqueCitations(citations: ChatCitation[] = []) {
  return citations.filter((citation, index, all) => citation && citationKey(citation) && all.findIndex((item) => citationKey(item) === citationKey(citation)) === index);
}
function locatorLabel(locator: ChatCitation['locator']) {
  if (!locator || typeof locator !== 'object') return 'Location unavailable';
  const preferred = ['ordinal', 'page', 'line', 'section', 'offset'].find((field) => locator[field] !== undefined && locator[field] !== null);
  if (preferred) return `${preferred}: ${String(locator[preferred]).slice(0, 80)}`;
  try {
    return JSON.stringify(locator).slice(0, 120) || 'Location unavailable';
  } catch { return 'Location unavailable'; }
}
function safeSourceUri(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}
function SafeText({ content }: { content: string }) {
  const lines = content.split('\n'); let inCode = false;
  return <div className="space-y-2 text-sm leading-6">{lines.map((line, index) => {
    if (line.trim().startsWith('```')) { inCode = !inCode; return null; }
    if (inCode) return <code key={index} className="block overflow-x-auto rounded bg-background/70 px-3 py-2 font-mono text-xs">{line}</code>;
    if (!line.trim()) return <div key={index} className="h-1" />;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const text = bullet ? bullet[1] : line;
    const pieces = text.split(/(\*\*.*?\*\*)/g);
    const rendered = pieces.map((piece, pieceIndex) => piece.startsWith('**') && piece.endsWith('**') ? <strong key={pieceIndex}>{piece.slice(2, -2)}</strong> : piece);
    return bullet ? <div key={index} className="flex gap-2"><span className="text-primary">•</span><span>{rendered}</span></div> : <p key={index}>{rendered}</p>;
  })}</div>;
}

function CitationList({ citations }: { citations?: ChatCitation[] }) {
  const items = uniqueCitations(citations);
  if (!items.length) return null;
  return <section className="mt-4 border-t border-border/70 pt-3" aria-label="Sources">
    <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[.14em] text-muted-foreground"><FileText size={13} />Sources</div>
    <ol className="space-y-1.5">
      {items.map((citation, index) => {
        const uri = safeSourceUri(citation.sourceUri);
        const label = citation.title || citation.sourceId || 'Untitled source';
        return <li key={citationKey(citation)} className="min-w-0">
          <div className="flex min-w-0 items-start gap-2 rounded-md border border-border/60 bg-background/40 px-2.5 py-2 text-xs">
            <span className="mt-0.5 shrink-0 font-mono text-2xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              {uri ? <a href={uri} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1 font-medium text-primary hover:underline" title={label}><span className="truncate">{label}</span><ExternalLink size={12} className="shrink-0" aria-hidden="true" /></a> : <span className="block truncate font-medium text-foreground" title={label}>{label}</span>}
              <div className="mt-0.5 flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 font-mono text-2xs text-muted-foreground" title={locatorLabel(citation.locator)}>
                <span className="max-w-full truncate">{locatorLabel(citation.locator)}</span>
                {Number.isInteger(citation.version) && <span className="shrink-0">v{citation.version}</span>}
                {citation.sourceId && <span className="max-w-[12rem] truncate">{citation.sourceId}</span>}
              </div>
            </div>
          </div>
        </li>;
      })}
    </ol>
  </section>;
}

export default function ChatView() {
  const [sessions, setSessions] = useState<ChatSession[]>([]); const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [draft, setDraft] = useState(''); const [mode, setMode] = useState<'normal' | 'plan'>('normal');
  const [loading, setLoading] = useState(true); const [messageLoading, setMessageLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [streaming, setStreaming] = useState(false); const [streamError, setStreamError] = useState<string | null>(null); const [creationPending, setCreationPending] = useState(false); const [modePending, setModePending] = useState(false);
  const [assistantText, setAssistantText] = useState(''); const [assistantCitations, setAssistantCitations] = useState<ChatCitation[]>([]); const abortRef = useRef<AbortController | null>(null); const streamingSessionIdRef = useRef<string | null>(null); const streamTokenRef = useRef(0); const selectedSessionRef = useRef<string | null>(null); const selectionIntentRef = useRef(0); const creationTokenRef = useRef(0); const modeTokenRef = useRef(0); const loadTokenRef = useRef(0); const listLoadingRef = useRef(false); const transcriptLoadTokenRef = useRef(0); const bottomRef = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    if (listLoadingRef.current) return;
    const token = ++loadTokenRef.current;
    const selectionIntent = selectionIntentRef.current;
    const selectionSnapshot = selectedSessionRef.current;
    listLoadingRef.current = true; setLoading(true); setError(null);
    try {
      const items = await turbohermes.chatSessions();
      if (loadTokenRef.current !== token) return;
      setSessions(items);
      if (items.length && !selectedSessionRef.current && selectionIntentRef.current === selectionIntent && selectedSessionRef.current === selectionSnapshot) {
        selectedSessionRef.current = items[0].id; setSelected(items[0]); setMode(items[0].mode === 'plan' ? 'plan' : 'normal');
      }
    } catch (e) {
      if (loadTokenRef.current === token && selectionIntentRef.current === selectionIntent && selectedSessionRef.current === selectionSnapshot) setError(e instanceof Error ? e.message : 'Unable to load chat sessions');
    } finally {
      if (loadTokenRef.current === token) { listLoadingRef.current = false; setLoading(false); }
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setDraft(''); setAssistantText(''); setAssistantCitations([]); setStreamError(null);
    const token = ++transcriptLoadTokenRef.current;
    const capturedSessionId = selected?.id || null;
    const capturedSelectionIntent = selectionIntentRef.current;
    if (!selected) { selectedSessionRef.current = null; setMessages([]); setMessageLoading(false); return; }
    selectedSessionRef.current = selected.id; setMessageLoading(true); setError(null);
    turbohermes.chatMessages(selected.id)
      .then((items) => token === transcriptLoadTokenRef.current && selectedSessionRef.current === capturedSessionId && selectionIntentRef.current === capturedSelectionIntent && setMessages(items))
      .catch((e) => token === transcriptLoadTokenRef.current && selectedSessionRef.current === capturedSessionId && selectionIntentRef.current === capturedSelectionIntent && setError(e instanceof Error ? e.message : 'Unable to load transcript'))
      .finally(() => { if (token === transcriptLoadTokenRef.current && selectedSessionRef.current === capturedSessionId && selectionIntentRef.current === capturedSelectionIntent) setMessageLoading(false); });
  }, [selected]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, assistantText]);
  const controlsLocked = loading || messageLoading || streaming || creationPending || modePending;
  const newSession = async () => {
    if (controlsLocked) return;
    const intent = ++creationTokenRef.current;
    const initiatingId = selectedSessionRef.current;
    const selectionIntent = selectionIntentRef.current;
    setCreationPending(true);
    try {
      const next = await turbohermes.createChatSession(mode);
      if (creationTokenRef.current !== intent || selectionIntentRef.current !== selectionIntent || selectedSessionRef.current !== initiatingId) return;
      setSessions((items) => [next, ...items]); selectionIntentRef.current += 1; transcriptLoadTokenRef.current += 1; setMessageLoading(false); selectedSessionRef.current = next.id; setSelected(next); setMessages([]);
    } catch (e) {
      if (creationTokenRef.current === intent && selectedSessionRef.current === initiatingId) setError(e instanceof Error ? e.message : 'Unable to create session');
    } finally {
      if (creationTokenRef.current === intent) setCreationPending(false);
    }
  };
  const switchMode = async (next: 'normal' | 'plan') => {
    const initiatingId = selectedSessionRef.current;
    const selectionIntent = selectionIntentRef.current;
    if (!selected || !initiatingId || next === mode || controlsLocked) return;
    const intent = ++modeTokenRef.current;
    const previousMode = mode;
    setModePending(true); setMode(next);
    try {
      const updated = await turbohermes.changeChatMode(initiatingId, next, crypto.randomUUID());
      if (modeTokenRef.current !== intent || selectionIntentRef.current !== selectionIntent || selectedSessionRef.current !== initiatingId) return;
      setSelected(updated); setSessions((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (e) {
      if (modeTokenRef.current === intent && selectionIntentRef.current === selectionIntent && selectedSessionRef.current === initiatingId) { setMode(previousMode); setError(e instanceof Error ? e.message : 'Unable to change mode'); }
    } finally {
      if (modeTokenRef.current === intent) setModePending(false);
    }
  };
  const send = async (event?: React.FormEvent) => {
    event?.preventDefault(); const content = draft.trim(); if (!content || !selected || controlsLocked) return;
    const streamSessionId = selected.id; const streamToken = ++streamTokenRef.current; const streamSelectionIntent = selectionIntentRef.current; streamingSessionIdRef.current = streamSessionId; selectedSessionRef.current = streamSessionId;
    const now = new Date().toISOString(); const optimistic: ChatMessage = { id: crypto.randomUUID(), sessionId: streamSessionId, role: 'user', content, createdAt: now };
    if (streamTokenRef.current !== streamToken || streamingSessionIdRef.current !== streamSessionId || selectedSessionRef.current !== streamSessionId || selectionIntentRef.current !== streamSelectionIntent) return;
    setMessages((items) => [...items, optimistic]); setDraft(''); setAssistantText(''); setAssistantCitations([]); setStreamError(null); setStreaming(true); const controller = new AbortController(); abortRef.current = controller;
    try { await turbohermes.streamChat(selected.id, { content, idempotencyKey: crypto.randomUUID(), correlationId: crypto.randomUUID() }, controller.signal, (event) => {
      if (streamTokenRef.current !== streamToken || streamingSessionIdRef.current !== streamSessionId || selectedSessionRef.current !== streamSessionId || selectionIntentRef.current !== streamSelectionIntent) return;
      if (event.type === 'token') setAssistantText((text) => text + (event.text || ''));
      if (event.type === 'citation' || event.type === 'citations' || event.citations || event.citation) {
        const incoming = event.citations || (event.citation ? [event.citation] : []);
        if (incoming.length) setAssistantCitations((items) => uniqueCitations([...items, ...incoming]));
      }
      if (event.type === 'error') setStreamError(event.reason || 'The stream returned an error');
    }); if (streamTokenRef.current === streamToken && streamingSessionIdRef.current === streamSessionId && selectedSessionRef.current === streamSessionId && selectionIntentRef.current === streamSelectionIntent) await turbohermes.chatMessages(streamSessionId).then((items) => { if (streamTokenRef.current === streamToken && streamingSessionIdRef.current === streamSessionId && selectedSessionRef.current === streamSessionId && selectionIntentRef.current === streamSelectionIntent) setMessages(items); });
    } catch (e) {
      if (streamTokenRef.current === streamToken && streamingSessionIdRef.current === streamSessionId && selectedSessionRef.current === streamSessionId && selectionIntentRef.current === streamSelectionIntent && (e as Error).name !== 'AbortError') {
        if (e instanceof ChatStreamError) setStreamError(`Request not completed (${e.code}): ${e.message}. Review the prompt and retry.`);
        else setStreamError(e instanceof Error ? `${e.message}. Retry the request.` : 'The stream ended unexpectedly. Retry the request.');
      }
    } finally { if (streamTokenRef.current === streamToken && streamingSessionIdRef.current === streamSessionId && selectedSessionRef.current === streamSessionId && selectionIntentRef.current === streamSelectionIntent) { setStreaming(false); streamingSessionIdRef.current = null; setAssistantText(''); setAssistantCitations([]); } if (abortRef.current === controller) abortRef.current = null; }
  };
  const cancel = () => abortRef.current?.abort();
  return <div className="flex min-h-full flex-col"><TurboHeader eyebrow="TurboHermes / governed conversation" title="Chat" current="/turbohermes/chat" />
    <main className="flex min-h-0 flex-1 flex-col p-3 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">A persistent transcript for precise work inside the private control plane.</p></div><button disabled={controlsLocked} onClick={load} className="btn-secondary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><RefreshCw size={14} />Reload</button></div>
      {error && <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}><X size={15} /></button></div>}
      <div className="grid min-h-[600px] flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-[260px_minmax(0,1fr)]">
         <aside className="border-b border-border bg-muted/20 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between border-b border-border px-4 py-3"><span className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Sessions</span><button disabled={controlsLocked} onClick={newSession} className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Create session"><Plus size={16} /></button></div>
            {loading ? <div className="space-y-2 p-3"><div className="skeleton h-12" /><div className="skeleton h-12" /></div> : sessions.length ? <div className="max-h-48 overflow-y-auto p-2 lg:max-h-[calc(100vh-280px)]">{sessions.map((item) => <button disabled={controlsLocked} key={item.id} onClick={() => { if (controlsLocked) return; selectionIntentRef.current += 1; transcriptLoadTokenRef.current += 1; setMessageLoading(false); selectedSessionRef.current = item.id; setSelected(item); setMode(item.mode === 'plan' ? 'plan' : 'normal'); }} className={`mb-1 w-full rounded-md border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${selected?.id === item.id ? 'border-primary/50 bg-primary/10' : 'border-transparent hover:bg-muted/50'}`}><div className="flex items-center justify-between gap-2"><span className="truncate font-mono text-xs text-foreground">{item.id.slice(0, 12)}</span><span className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} /></div><div className="mt-1 text-2xs uppercase tracking-wider text-muted-foreground">{item.mode} · {formatDate(item.updatedAt)}</div></button>)}</div> : <div className="p-5 text-center text-xs text-muted-foreground"><MessageSquare className="mx-auto mb-2 opacity-60" size={18} /><p>No sessions yet.</p><button disabled={controlsLocked} onClick={newSession} className="mt-3 text-primary hover:underline disabled:opacity-40">Create one</button></div>}
        </aside>
            <section className="flex min-h-0 flex-col"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"><div><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={15} className="text-primary" />{selected ? 'Persistent transcript' : 'No session selected'}</div>{selected && <p className="mt-1 font-mono text-2xs text-muted-foreground">{selected.id}</p>}</div><div className="flex rounded-md border border-border bg-background p-0.5" role="group" aria-label="Chat mode">{(['normal', 'plan'] as const).map((item) => <button key={item} disabled={!selected || controlsLocked} onClick={() => switchMode(item)} className={`relative rounded px-3 py-1.5 text-xs capitalize transition-colors ${mode === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{mode === item && <Check size={12} className="mr-1 inline" />}{item}</button>)}</div></div>
           <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">{messageLoading ? <div className="space-y-4"><div className="skeleton ml-auto h-16 max-w-[70%]" /><div className="skeleton h-24 max-w-[80%]" /></div> : !selected ? <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground"><div><MessageSquare className="mx-auto mb-3 text-primary/70" size={26} /><p>Select a session or create one to begin.</p></div></div> : messages.length === 0 && !assistantText && !assistantCitations.length ? <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground"><div><p className="text-foreground">This session is ready.</p><p className="mt-1">Send a prompt to add the first message.</p></div></div> : <div className="mx-auto max-w-3xl space-y-5">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><article className={`max-w-[88%] min-w-0 px-4 py-3 ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}`}><div className="mb-2 flex items-center justify-between gap-4 text-2xs uppercase tracking-wider text-muted-foreground"><span>{message.role}</span><time>{formatDate(message.createdAt)}</time></div><SafeText content={message.content} /><CitationList citations={message.citations} /></article></div>)}{(assistantText || assistantCitations.length > 0) && <div className="chat-bubble-agent max-w-[88%] min-w-0 px-4 py-3"><div className="mb-2 text-2xs uppercase tracking-wider text-primary">assistant · streaming</div><SafeText content={assistantText} /><CitationList citations={assistantCitations} /></div>}{streamError && <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{streamError}</div>}<div ref={bottomRef} /></div>}</div>
           <form onSubmit={send} className="border-t border-border bg-muted/10 p-3 sm:p-4"><div className="mx-auto max-w-3xl"><div className="rounded-lg border border-border bg-background p-2 transition-colors focus-within:border-primary/60"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={!selected || controlsLocked} rows={3} placeholder={selected ? 'Write a precise prompt…' : 'Create or select a session first'} className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" aria-label="Chat prompt" /><div className="flex items-center justify-between gap-2 px-2 pt-2"><span className="text-2xs text-muted-foreground">Enter to send · Shift+Enter for a new line</span>{streaming ? <button type="button" onClick={cancel} className="btn-danger px-3 py-1.5 text-xs"><CircleStop size={14} />Cancel</button> : <button type="submit" disabled={!selected || controlsLocked || !draft.trim()} className="btn-primary px-3 py-1.5 text-xs"><Send size={14} />Send</button>}</div></div></div></form>
        </section>
      </div>
    </main></div>;
}