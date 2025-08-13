'use client';

import { Suspense } from 'react';
import ChatInterface from '../../components/ChatInterface';

function ChatPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ChatInterface />
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}