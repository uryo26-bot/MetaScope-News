"use client";

import Link from "next/link";
import type { ResourceCategory } from "../../data/resources";
import { categoryStyles } from "../../data/resources";

export type ResourceCardItem = {
  id: string;
  name: string;
  nameEn: string;
  chemicalFormula: string;
  icon: string;
  category: ResourceCategory;
  structureTags?: { emoji: string; label: string }[];
};

export function ResourceCard({ item }: { item: ResourceCardItem }) {
  const style = categoryStyles[item.category];
  const classes = [
    "group block rounded-2xl shadow-md p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border",
    style.bg,
    style.border,
    style.hover,
  ].join(" ");

  return (
    <Link href={`/metalchart/resource/${item.id}`} className={classes}>
      <div className="flex flex-col items-center text-center gap-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {style.label}
        </span>
        <span className="text-4xl" aria-hidden>
          {item.icon}
        </span>
        <div>
          <p className="font-bold text-lg text-slate-800">{item.name}</p>
          <p className="text-sm text-slate-500">{item.nameEn}</p>
        </div>
        <p className="text-xs font-mono text-slate-600">{item.chemicalFormula}</p>
        {item.structureTags && item.structureTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {item.structureTags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 border border-slate-200"
                title={tag.label}
              >
                <span aria-hidden>{tag.emoji}</span>
                <span>{tag.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
