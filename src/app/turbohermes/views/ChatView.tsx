'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, CircleStop, MessageSquare, Plus, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import { ChatMessage, ChatStreamError, ChatSession, turbohermes } from '@/lib/turbohermes-client';
import { TurboHeader } from '@/components/TurboHermesShell';

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function SafeText({ content }: { content: string }) {
  const lines = content.split('\n'); let inCode = false;
  return <div className="space-y-2 text-sm leading-6">{lines.map((line, index) => {
    if (line.trim().startsWith('```')) { inCode = !inCode; return null; }
    if (inCode) return <code key={index} className="block overflow-x-auto rounded bg-background/70 px-3 py-2 font-mono text-xs">{line}</code>;
    if (!line.trim()) return <div key={index} className="h-1" />;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const text = bullet ? bullet[1] : line;
    const pieces = text.split(/(\*\*.*?\*\*)/g);
    const rendered = pieces.map((piece, i) => piece.startsWith('**') && piece.endsWith('**') ? <strong key={i}>{piece.slice(2, -2)}</strong> : piece);
    return bullet ? <div key={index} className="flex gap-2"><span className="text-primary">•</span><span>{rendered}</span></div> : <p key={index}>{rendered}</p>;
  })}</div>;
}

export default function ChatView() {
  const [sessions, setSessions] = useState<ChatSession[]>([]); const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [draft, setDraft] = useState(''); const [mode, setMode] = useState<'normal' | 'plan'>('normal');
  const [loading, setLoading] = useState(true); const [messageLoading, setMessageLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [streaming, setStreaming] = useState(false); const [streamError, setStreamError] = useState<string | null>(null);
  const [assistantText, setAssistantText] = useState(''); const abortRef = useRef<AbortController | null>(null); const bottomRef = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { const items = await turbohermes.chatSessions(); setSessions(items); if (items.length && !selected) { setSelected(items[0]); setMode(items[0].mode === 'plan' ? 'plan' : 'normal'); } } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load chat sessions'); } finally { setLoading(false); } }, [selected]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!selected) { setMessages([]); return; } let alive = true; setMessageLoading(true); setError(null); turbohermes.chatMessages(selected.id).then((items) => alive && setMessages(items)).catch((e) => alive && setError(e instanceof Error ? e.message : 'Unable to load transcript')).finally(() => alive && setMessageLoading(false)); return () => { alive = false; }; }, [selected]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, assistantText]);
  const newSession = async () => { try { const next = await turbohermes.createChatSession(mode); setSessions((items) => [next, ...items]); setSelected(next); setMessages([]); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create session'); } };
  const switchMode = async (next: 'normal' | 'plan') => { if (!selected || next === mode || streaming) return; setMode(next); try { const updated = await turbohermes.changeChatMode(selected.id, next, crypto.randomUUID()); setSelected(updated); setSessions((items) => items.map((item) => item.id === updated.id ? updated : item)); } catch (e) { setMode(mode); setError(e instanceof Error ? e.message : 'Unable to change mode'); } };
  const send = async (event?: React.FormEvent) => {
    event?.preventDefault(); const content = draft.trim(); if (!content || !selected || streaming) return;
    const now = new Date().toISOString(); const optimistic: ChatMessage = { id: crypto.randomUUID(), sessionId: selected.id, role: 'user', content, createdAt: now };
    setMessages((items) => [...items, optimistic]); setDraft(''); setAssistantText(''); setStreamError(null); setStreaming(true); const controller = new AbortController(); abortRef.current = controller;
    try { await turbohermes.streamChat(selected.id, { content, idempotencyKey: crypto.randomUUID(), correlationId: crypto.randomUUID() }, controller.signal, (event) => {
      if (event.type === 'token') setAssistantText((text) => text + (event.text || '')); if (event.type === 'error') setStreamError(event.reason || 'The stream returned an error'); if (event.type === 'terminal') setStreaming(false);
    }); if (assistantText) { /* terminal persistence is authoritative; reload below */ } await turbohermes.chatMessages(selected.id).then(setMessages);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        if (e instanceof ChatStreamError) setStreamError(`Request not completed (${e.code}): ${e.message}. Review the prompt and retry.`);
        else setStreamError(e instanceof Error ? `${e.message}. Retry the request.` : 'The stream ended unexpectedly. Retry the request.');
      }
    } finally { setStreaming(false); abortRef.current = null; setAssistantText(''); }
  };
  const cancel = () => abortRef.current?.abort();
  return <div className="flex min-h-full flex-col"><TurboHeader eyebrow="TurboHermes / governed conversation" title="Chat" current="/turbohermes/chat" />
    <main className="flex min-h-0 flex-1 flex-col p-3 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">A persistent transcript for precise work inside the private control plane.</p></div><button onClick={load} className="btn-secondary px-3 py-2 text-xs"><RefreshCw size={14} />Reload</button></div>
      {error && <div className="mb-3 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}><X size={15} /></button></div>}
      <div className="grid min-h-[600px] flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-muted/20 lg:border-b-0 lg:border-r"><div className="flex items-center justify-between border-b border-border px-4 py-3"><span className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Sessions</span><button onClick={newSession} className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10" aria-label="Create session"><Plus size={16} /></button></div>
          {loading ? <div className="space-y-2 p-3"><div className="skeleton h-12" /><div className="skeleton h-12" /></div> : sessions.length ? <div className="max-h-48 overflow-y-auto p-2 lg:max-h-[calc(100vh-280px)]">{sessions.map((item) => <button key={item.id} onClick={() => { setSelected(item); setMode(item.mode === 'plan' ? 'plan' : 'normal'); }} className={`mb-1 w-full rounded-md border p-3 text-left transition-colors ${selected?.id === item.id ? 'border-primary/50 bg-primary/10' : 'border-transparent hover:bg-muted/50'}`}><div className="flex items-center justify-between gap-2"><span className="truncate font-mono text-xs text-foreground">{item.id.slice(0, 12)}</span><span className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} /></div><div className="mt-1 text-2xs uppercase tracking-wider text-muted-foreground">{item.mode} · {formatDate(item.updatedAt)}</div></button>)}</div> : <div className="p-5 text-center text-xs text-muted-foreground"><MessageSquare className="mx-auto mb-2 opacity-60" size={18} /><p>No sessions yet.</p><button onClick={newSession} className="mt-3 text-primary hover:underline">Create one</button></div>}
        </aside>
        <section className="flex min-h-0 flex-col"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"><div><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={15} className="text-primary" />{selected ? 'Persistent transcript' : 'No session selected'}</div>{selected && <p className="mt-1 font-mono text-2xs text-muted-foreground">{selected.id}</p>}</div><div className="flex rounded-md border border-border bg-background p-0.5" role="group" aria-label="Chat mode">{(['normal', 'plan'] as const).map((item) => <button key={item} disabled={!selected || streaming} onClick={() => switchMode(item)} className={`relative rounded px-3 py-1.5 text-xs capitalize transition-colors ${mode === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{mode === item && <Check size={12} className="mr-1 inline" />}{item}</button>)}</div></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">{messageLoading ? <div className="space-y-4"><div className="skeleton ml-auto h-16 max-w-[70%]" /><div className="skeleton h-24 max-w-[80%]" /></div> : !selected ? <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground"><div><MessageSquare className="mx-auto mb-3 text-primary/70" size={26} /><p>Select a session or create one to begin.</p></div></div> : messages.length === 0 && !assistantText ? <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground"><div><p className="text-foreground">This session is ready.</p><p className="mt-1">Send a prompt to add the first message.</p></div></div> : <div className="mx-auto max-w-3xl space-y-5">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><article className={`max-w-[88%] px-4 py-3 ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}`}><div className="mb-2 flex items-center justify-between gap-4 text-2xs uppercase tracking-wider text-muted-foreground"><span>{message.role}</span><time>{formatDate(message.createdAt)}</time></div><SafeText content={message.content} /></article></div>)}{assistantText && <div className="chat-bubble-agent max-w-[88%] px-4 py-3"><div className="mb-2 text-2xs uppercase tracking-wider text-primary">assistant · streaming</div><SafeText content={assistantText} /></div>}{streamError && <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{streamError}</div>}<div ref={bottomRef} /></div>}</div>
          <form onSubmit={send} className="border-t border-border bg-muted/10 p-3 sm:p-4"><div className="mx-auto max-w-3xl"><div className="rounded-lg border border-border bg-background p-2 transition-colors focus-within:border-primary/60"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={!selected || streaming} rows={3} placeholder={selected ? 'Write a precise prompt…' : 'Create or select a session first'} className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" aria-label="Chat prompt" /><div className="flex items-center justify-between gap-2 px-2 pt-2"><span className="text-2xs text-muted-foreground">Enter to send · Shift+Enter for a new line</span>{streaming ? <button type="button" onClick={cancel} className="btn-danger px-3 py-1.5 text-xs"><CircleStop size={14} />Cancel</button> : <button type="submit" disabled={!selected || !draft.trim()} className="btn-primary px-3 py-1.5 text-xs"><Send size={14} />Send</button>}</div></div></div></form>
        </section>
      </div>
    </main></div>;
}