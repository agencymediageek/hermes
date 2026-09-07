'use client';
import React, { useState } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import EditorPanel from './EditorPanel';
import TerminalPanel from './TerminalPanel';
import RightSidebar from './RightSidebar';
import ApprovalGateModal from './ApprovalGateModal';

export type RightTab = 'chat' | 'logs' | 'secrets' | 'commits';

export default function WorkspaceEditorContent() {
  const [rightTab, setRightTab] = useState<RightTab>('chat');
  const [terminalHeight, setTerminalHeight] = useState(220);
  const [showApproval, setShowApproval] = useState(false);
  const [sidebarWidth] = useState(360);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <WorkspaceHeader onRequestApproval={() => setShowApproval(true)} />

      {/* Main content: editor + right sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor + terminal column */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* VSCode editor area */}
          <EditorPanel terminalHeight={terminalHeight} />

          {/* Resize handle */}
          <div
            className="h-1.5 bg-border hover:bg-primary/40 cursor-row-resize transition-colors duration-150 shrink-0 group"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startH = terminalHeight;
              const onMove = (ev: MouseEvent) => {
                const delta = startY - ev.clientY;
                setTerminalHeight(Math.max(100, Math.min(500, startH + delta)));
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-0.5 rounded bg-primary/60" />
            </div>
          </div>

          {/* Terminal panel */}
          <TerminalPanel height={terminalHeight} />
        </div>

        {/* Right sidebar */}
        <RightSidebar
          activeTab={rightTab}
          onTabChange={setRightTab}
          width={sidebarWidth}
        />
      </div>

      {/* Approval gate modal */}
      {showApproval && (
        <ApprovalGateModal onClose={() => setShowApproval(false)} />
      )}
    </div>
  );
}