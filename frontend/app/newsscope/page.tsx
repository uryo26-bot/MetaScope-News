import NewsScopeClient from "../../components/newsscope/NewsScopeClient";

export default function NewsScopePage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-header mb-2">NewsScope</h1>
        <p className="text-zinc-400 mb-8">ニュースを入力して、多角的な視点で構造を読む</p>
        <NewsScopeClient />
      </div>
    </main>
  );
}
