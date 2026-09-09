'use client';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, Paperclip, Bot, User, Loader2, FileEdit, FileSearch, Terminal, GitCommit, Package, X } from 'lucide-react';
import { initialMessages, OPENROUTER_MODELS, type ChatMessage } from './workspaceData';

const API_BASE_URL = 'https://api.hermes.waas.host';

interface UploadedAttachment {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  READ: <FileSearch size={10} />,
  WRITE: <FileEdit size={10} />,
  EXEC: <Terminal size={10} />,
  COMMIT: <GitCommit size={10} />,
  INSTALL: <Package size={10} />,
};

function getActionIcon(action: string) {
  const prefix = action.split(' ')[0];
  return actionIcons[prefix] ?? <Terminal size={10} />;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState('hermes-agent');
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isUploading) return;
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);

    try {
      const token = localStorage.getItem('hermes_admin_token') || sessionStorage.getItem('hermes_admin_token');
      if (!token) throw new Error('Authentication required');
      const response = await fetch(`${API_BASE_URL}/api/workspaces/primary/agent/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg.content,
          model: selectedModel,
          messages: nextMessages.map((message) => ({
            role: message.role === 'agent' ? 'assistant' : 'user',
            content: message.content,
          })),
          attachments,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.message) {
        throw new Error(body.error || body.message || `Agent API ${response.status}`);
      }
      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        role: 'agent',
        content: body.message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        model: body.model || selectedModel,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setAttachments([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reach Hermes');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const token = localStorage.getItem('hermes_admin_token') || sessionStorage.getItem('hermes_admin_token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsUploading(true);
    try {
      const uploaded: UploadedAttachment[] = [];
      const failed: string[] = [];
      for (const file of files) {
        try {
          const form = new FormData();
          form.append('file', file, file.name);
          const response = await fetch(`${API_BASE_URL}/api/workspaces/primary/agent/attachments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form,
          });
          const body = await response.json();
          if (!response.ok || !body.path) {
            throw new Error(body.error || body.message || `Upload failed (${response.status})`);
          }
          uploaded.push(body);
        } catch {
          failed.push(file.name);
        }
      }
      if (uploaded.length) {
        setAttachments((current) => [...current, ...uploaded]);
        toast.success(`${uploaded.length} arquivo${uploaded.length === 1 ? '' : 's'} anexado${uploaded.length === 1 ? '' : 's'}`);
      }
      if (failed.length) {
        toast.error(`Não foi possível anexar: ${failed.join(', ')}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedModelLabel = OPENROUTER_MODELS.find((m) => m.value === selectedModel)?.label ?? selectedModel;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Model selector */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
        <Bot size={13} className="text-primary shrink-0" />
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="flex-1 bg-transparent text-xs text-muted-foreground border-0 outline-none cursor-pointer hover:text-foreground transition-colors"
          aria-label="Select AI model"
        >
          {OPENROUTER_MODELS.map((m) => (
            <option key={m.id} value={m.value} className="bg-card text-foreground">
              {m.label}
            </option>
          ))}
        </select>
        <span className="text-2xs text-muted-foreground px-1.5 py-0.5 bg-secondary rounded border border-border">
          Native
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Bot size={28} className="text-primary mb-3 opacity-70" />
            <p className="text-sm font-medium text-foreground">Start a Hermes conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Messages are sent to the native Hermes agent.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} fade-in`}>
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${msg.role === 'agent' ? 'bg-primary/20 border border-primary/30' : 'bg-accent/20 border border-accent/30'}`}>
              {msg.role === 'agent'
                ? <Bot size={12} className="text-primary" />
                : <User size={12} className="text-accent" />
              }
            </div>

            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Bubble */}
              <div className={`px-3 py-2 text-xs leading-relaxed ${msg.role === 'agent' ? 'chat-bubble-agent' : 'chat-bubble-user'}`}>
                <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Agent actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {msg.actions.map((action, ai) => (
                    <span
                      key={`${msg.id}-action-${ai}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary border border-border rounded text-2xs font-mono text-muted-foreground"
                    >
                      {getActionIcon(action)}
                      {action}
                    </span>
                  ))}
                </div>
              )}

              {/* Timestamp + model */}
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-2xs text-muted-foreground font-mono">{msg.timestamp}</span>
                {msg.model && (
                  <span className="text-2xs text-muted-foreground">· {msg.model.split('/')[1]}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex gap-2 fade-in">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} className="text-primary" />
            </div>
            <div className="chat-bubble-agent px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Loader2 size={11} className="text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Agent is thinking…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachments.map((file) => (
              <span key={file.id} className="inline-flex items-center gap-1.5 max-w-full px-2 py-1 rounded border border-primary/30 bg-primary/10 text-2xs text-foreground">
                <span className="truncate">{file.filename}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${file.filename}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 bg-input border border-border rounded-lg p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-150">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent to read files, write code, run commands…"
            rows={3}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed"
            aria-label="Message to AI agent"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleFileAttach}
                disabled={isUploading || isStreaming}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                title="Attach file or image to message"
              >
                {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.md,.txt,.png,.jpg,.jpeg,.webp,.gif,application/pdf,text/markdown,text/plain,image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFilesSelected}
                className="hidden"
              />
              <span className="text-2xs text-muted-foreground">⏎ send · ⇧⏎ newline</span>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || isUploading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary/80 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isStreaming ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Send
            </button>
          </div>
        </div>
        <p className="text-2xs text-muted-foreground mt-1.5 text-center">
          Secrets are never shown in agent conversations
        </p>
      </div>
    </div>
  );
}