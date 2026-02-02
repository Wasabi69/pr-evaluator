export function buildPrompt(title: string, content: string) {
    return `
  You are a strict press-release compliance evaluator.
  Return ONLY valid JSON (no markdown, no extra text).
  
  Evaluate the following:
  
  TITLE: ${title}
  
  CONTENT:
  ${content}
  
  Return JSON exactly with this schema:
  {
    "score": <integer 1-100>,
    "classification": "PRESS_RELEASE" | "ADVERTORIAL",
    "top_traits": ["<trait1>", "<trait2>", "<trait3>"],
    "suggested_edits": ["<edit1>", "<edit2>", "<edit3>"],
    "prohibited_content_check": {
      "misleading_or_unverifiable_claims": <true|false>,
      "excessive_promotional_language": <true|false>,
      "incomplete_disclosures": <true|false>,
      "sensitive_or_speculative_political_medical_financial": <true|false>
    },
    "summary": "<one paragraph, max 2000 chars>"
  }
  
  Rules:
  - Use newsroom press-release standards.
  - If there is no clear, time-bound news hook, lean ADVERTORIAL.
  - Calls-to-action (buy, subscribe, invest, sign up, visit) strongly indicate ADVERTORIAL.
  - Set incomplete_disclosures=true if claims lack dates, metrics, sources, or verifiable specifics.
  - suggested_edits must be 3 to 5 items.
  `.trim();
  }
  