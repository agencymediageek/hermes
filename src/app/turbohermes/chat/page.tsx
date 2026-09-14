import { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import ChatView from '../views/ChatView';
export default function ChatPage() {
  return (
    <AppLayout currentPath="/turbohermes/chat">
      <Suspense fallback={<div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">Loading chat…</div>}>
        <ChatView />
      </Suspense>
    </AppLayout>
  );
}