export const runtime = "nodejs";
export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import OpenAI from "openai";
import { EvaluationSchema } from "@/lib/schema";
import { buildPrompt } from "@/lib/prompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Extrae el primer bloque JSON del texto (por si el modelo se sale del formato)
function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title/content" }, { status: 400 });
    }

    const prompt = buildPrompt(title, content);

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const resp = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return only valid JSON. No markdown." },
        { role: "user", content: prompt },
      ],
    });

    const raw = (resp.choices[0]?.message?.content || "").trim();
    const jsonText = extractJson(raw);

    if (!jsonText) {
      return NextResponse.json({ error: "Model did not return JSON", raw }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON", raw }, { status: 502 });
    }

    const validated = EvaluationSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Schema mismatch", issues: validated.error.issues, raw },
        { status: 502 }
      );
    }

    return NextResponse.json(validated.data);
} catch (err: any) {
    return NextResponse.json(
      { error: "Server error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
  
}
