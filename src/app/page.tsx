'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(
  () => import('@/components/editor/Editor').then((m) => m.Editor),
  { ssr: false }
);

export default function Home() {
  return <Editor />;
}
