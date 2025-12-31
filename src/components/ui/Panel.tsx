'use client';

import React from 'react';

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-xs text-slate-400">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
