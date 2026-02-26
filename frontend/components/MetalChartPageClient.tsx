"use client";

import { ResourceCard } from "./metalchart/ResourceCard";
import { resourceList } from "../data/resources";

export default function MetalChartPageClient() {
  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">MetalChart</h1>
        <p className="text-slate-600 mb-8">主要鉱物を選んで、構造を理解する</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resourceList.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
