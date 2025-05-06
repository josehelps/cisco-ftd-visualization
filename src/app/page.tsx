'use client';

import dynamic from 'next/dynamic';

// Dynamically import the visualization component to prevent SSR issues
const FTDVisualization = dynamic(
  () => import('./components/FTDVisualization'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-full h-screen">
      <FTDVisualization />
    </main>
  );
}
