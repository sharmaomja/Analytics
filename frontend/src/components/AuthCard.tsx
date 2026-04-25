import type { ReactNode } from "react";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
