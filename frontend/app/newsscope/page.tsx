import NewsScopeClient from "../../components/newsscope/NewsScopeClient";

export default function NewsScopePage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-header mb-8">NewsScope</h1>
        <NewsScopeClient />
      </div>
    </main>
  );
}
