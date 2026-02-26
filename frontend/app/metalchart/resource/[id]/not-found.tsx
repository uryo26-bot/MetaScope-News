import Link from "next/link";

export default function ResourceNotFound() {
  return (
    <main className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-4">
      <p className="text-slate-600">この資源のデータはまだありません。</p>
      <Link href="/metalchart" className="text-slate-800 font-bold underline hover:no-underline">
        MetalChart 一覧へ戻る
      </Link>
    </main>
  );
}
