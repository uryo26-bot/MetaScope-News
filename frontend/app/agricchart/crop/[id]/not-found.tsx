import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center">
      <p className="text-slate-600 mb-4">指定された農産物が見つかりません。</p>
      <Link href="/agricchart" className="text-slate-800 font-bold underline hover:no-underline">
        AgriChart 一覧へ戻る
      </Link>
    </main>
  );
}
