'use client';
import React, { useState, useRef } from 'react';
import { Terminal, Maximize2, X, Plus } from 'lucide-react';

interface TerminalPanelProps {
  height: number;
}

interface TerminalTab {
  id: string;
  label: string;
  lines: TerminalLine[];
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
}

const initialTabs: TerminalTab[] = [
  {
    id: 'term-main',
    label: 'bash',
    lines: [
      { id: 'l-001', type: 'info', content: '🐳 hermes-api · d8f3a91c2b44 · Node 20.11.0' },
      { id: 'l-002', type: 'info', content: 'Working directory: /workspace/hermes-api' },
      { id: 'l-003', type: 'command', content: '$ npm install' },
      { id: 'l-004', type: 'output', content: 'added 847 packages in 12.4s' },
      { id: 'l-005', type: 'command', content: '$ npx tsc --noEmit' },
      { id: 'l-006', type: 'output', content: '' },
      { id: 'l-007', type: 'command', content: '$ npm run dev' },
      { id: 'l-008', type: 'output', content: '> hermes-api@1.0.0 dev' },
      { id: 'l-009', type: 'output', content: '> tsx watch src/index.ts' },
      { id: 'l-010', type: 'output', content: '' },
      { id: 'l-011', type: 'info', content: '✓ Server running on http://localhost:3001' },
      { id: 'l-012', type: 'info', content: '✓ Cloudflare Tunnel active → hermes-api-ws001.tunnel.hermesdev.io' },
    ],
  },
  {
    id: 'term-agent',
    label: 'agent',
    lines: [
      { id: 'la-001', type: 'info', content: '🤖 Hermes Agent terminal — read-only view' },
      { id: 'la-002', type: 'command', content: '$ cat src/agent/executor.ts | head -40' },
      { id: 'la-003', type: 'output', content: "import { exec } from 'child_process';" },
      { id: 'la-004', type: 'output', content: "import type { DockerExecOptions } from './types';" },
      { id: 'la-005', type: 'output', content: '' },
      { id: 'la-006', type: 'output', content: 'export async function dockerExec(' },
      { id: 'la-007', type: 'output', content: '  workspaceId: string,' },
      { id: 'la-008', type: 'output', content: '  command: string,' },
      { id: 'la-009', type: 'output', content: '  opts: DockerExecOptions = {}' },
      { id: 'la-010', type: 'output', content: '): Promise<ExecResult> {' },
    ],
  },
];

export default function TerminalPanel({ height }: TerminalPanelProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState('term-main');
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTerminal = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // BACKEND INTEGRATION: WebSocket send to xterm.js backend connected to Docker exec session
    const newLine: TerminalLine = { id: `l-user-${Date.now()}`, type: 'command', content: `$ ${input}` };
    const responseLine: TerminalLine = {
      id: `l-resp-${Date.now()}`,
      type: input.startsWith('cd') ? 'info' : 'output',
      content: input === 'ls' ? 'node_modules/  package.json  src/  tsconfig.json'
        : input === 'pwd'? '/workspace/hermes-api' : input.startsWith('echo') ? input.replace('echo ', '')
        : `[demo] Command queued: ${input}`,
    };
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab
          ? { ...t, lines: [...t.lines, newLine, responseLine] }
          : t
      )
    );
    setCmdHistory((prev) => [input, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next] ?? '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? '' : cmdHistory[next] ?? '');
    }
  };

  const addTab = () => {
    const id = `term-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      {
        id,
        label: `bash ${prev.length + 1}`,
        lines: [{ id: `lt-${Date.now()}`, type: 'info', content: '🐳 New terminal session' }],
      },
    ]);
    setActiveTab(id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTab === id) setActiveTab(tabs.find((t) => t.id !== id)?.id ?? '');
  };

  const lineColor: Record<TerminalLine['type'], string> = {
    command: 'text-accent',
    output: 'text-foreground/80',
    error: 'text-danger',
    info: 'text-success/80',
  };

  return (
    <div
      className="flex flex-col bg-background border-t border-border shrink-0 overflow-hidden"
      style={{ height }}
    >
      {/* Terminal tab bar */}
      <div className="flex items-center bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-0 flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-r border-border whitespace-nowrap transition-colors duration-150
                ${activeTab === tab.id ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'}`}
            >
              <Terminal size={11} />
              {tab.label}
              {tabs.length > 1 && (
                <span
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') closeTab(tab.id, e as unknown as React.MouseEvent); }}
                  aria-label={`Close ${tab.label}`}
                >
                  <X size={10} />
                </span>
              )}
            </button>
          ))}
          <button
            onClick={addTab}
            className="px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors"
            title="New terminal session"
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Maximize terminal">
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 terminal-text cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {activeTerminal?.lines.map((line) => (
          <div key={line.id} className={`log-line ${lineColor[line.type]}`}>
            {line.content || '\u00A0'}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleCommand} className="flex items-center gap-1 mt-1">
          <span className="text-accent text-xs font-mono shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 outline-none text-xs font-mono text-foreground caret-accent"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  );
}