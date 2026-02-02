import { z } from "zod";

export const EvaluationSchema = z.object({
  score: z.number().int().min(1).max(100),
  classification: z.enum(["PRESS_RELEASE", "ADVERTORIAL"]),
  top_traits: z.array(z.string()).length(3),
  suggested_edits: z.array(z.string()).min(3).max(5),
  prohibited_content_check: z.object({
    misleading_or_unverifiable_claims: z.boolean(),
    excessive_promotional_language: z.boolean(),
    incomplete_disclosures: z.boolean(),
    sensitive_or_speculative_political_medical_financial: z.boolean(),
  }),
  summary: z.string().max(2000),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;
