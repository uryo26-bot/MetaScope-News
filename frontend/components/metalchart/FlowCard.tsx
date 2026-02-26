"use client";

interface FlowCardProps {
  title: string;
  steps: string[];
}

export function FlowCard({ title, steps }: FlowCardProps) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">{title}</h3>
      <ul className="flex flex-col gap-0 flex-1">
        {steps.map((step, i) => (
          <li key={step} className="flex flex-col items-center">
            <span className="w-full py-2 px-3 rounded-lg bg-white/80 text-slate-800 text-center text-sm">
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="text-slate-400 py-1" aria-hidden>
                ↓
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
