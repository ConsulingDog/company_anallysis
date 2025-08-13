'use client';

import { Suspense } from 'react';
import WhiteboardInterface from '../../components/WhiteboardInterface';

function WhiteboardPageContent() {
  return <WhiteboardInterface />;
}

export default function WhiteboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WhiteboardPageContent />
    </Suspense>
  );
}