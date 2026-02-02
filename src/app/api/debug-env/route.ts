import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
    hasUser: Boolean(process.env.BASIC_AUTH_USER),
    hasPass: Boolean(process.env.BASIC_AUTH_PASS),
    model: process.env.OPENAI_MODEL || "not-set",
  });
}
