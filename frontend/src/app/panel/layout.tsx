'use client';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f6fa] text-slate-800">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
