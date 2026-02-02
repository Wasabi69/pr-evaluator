"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [accessKey, setAccessKey] = useState(""); // No se usa con Basic Auth, pero lo dejo fuera por si luego quieres
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const wordCount = useMemo(() => {
    const t = content.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [content]);

  async function onEvaluate() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  const isOk = result && !result.error;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">PR Evaluator</h1>
          <p className="text-neutral-400">Internal tool · Paste Title + Content · Get structured evaluation</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <label className="block text-sm text-neutral-300">TITLE</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Company X Announces..."
            />

            <div className="mt-4 flex items-center justify-between">
              <label className="block text-sm text-neutral-300">CONTENT</label>
              <span className="text-xs text-neutral-400">Words: {wordCount} (ideal 400–600+)</span>
            </div>

            <textarea
              className="mt-2 h-[420px] w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the full press release here..."
            />

            <button
              onClick={onEvaluate}
              disabled={loading || !title.trim() || !content.trim()}
              className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-neutral-950 font-medium disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "Evaluate"}
            </button>
          </div>

          {/* Right */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Output</h2>
              {isOk && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copyText(JSON.stringify(result, null, 2))}
                    className="rounded-lg border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => copyText(result.summary || "")}
                    className="rounded-lg border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
                  >
                    Copy Summary
                  </button>
                </div>
              )}
            </div>

            {!result && (
              <p className="mt-4 text-neutral-400">
                Run an evaluation to see the structured result here.
              </p>
            )}

            {result?.error && (
              <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4">
                <div className="font-medium text-red-200">Error</div>
                <div className="mt-1 text-sm text-red-300">{String(result.error)}</div>
                {result.raw && (
                  <pre className="mt-3 overflow-auto rounded-lg bg-neutral-950 p-3 text-xs text-neutral-200">
                    {String(result.raw)}
                  </pre>
                )}
              </div>
            )}

            {isOk && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-xs text-neutral-400">Score</div>
                    <div className="text-2xl font-semibold">{result.score}</div>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="text-xs text-neutral-400">Classification</div>
                    <div className="text-2xl font-semibold">{result.classification}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400 mb-2">Top traits</div>
                  <ul className="list-disc pl-5 text-sm text-neutral-200 space-y-1">
                    {(result.top_traits || []).map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400 mb-2">Suggested edits</div>
                  <ul className="list-disc pl-5 text-sm text-neutral-200 space-y-1">
                    {(result.suggested_edits || []).map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400 mb-2">Prohibited content check</div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Object.entries(result.prohibited_content_check || {}).map(([k, v]: any) => (
                      <div key={k} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
                        <span className="text-neutral-200">{k}</span>
                        <span className={v ? "text-red-300" : "text-green-300"}>
                          {v ? "true" : "false"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400 mb-2">Summary</div>
                  <p className="text-sm text-neutral-200 whitespace-pre-wrap">{result.summary}</p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xs text-neutral-400 mb-2">Raw JSON</div>
                  <pre className="overflow-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-200">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          Note: This tool does not store press releases. Keep client-sensitive info minimal when possible.
        </p>
      </div>
    </main>
  );
}
