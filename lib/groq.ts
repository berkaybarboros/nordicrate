/**
 * The Groq model ids live here and nowhere else.
 *
 * 2026-11-01: `llama-3.3-70b-versatile` was decommissioned. Every AI route
 * started getting 404 from Groq, and /api/find-rate turned that into a 500 —
 * so "Find your best rate", the main call to action on the home page, answered
 * "Internal server error" to every visitor who clicked it. The model id had
 * been copy-pasted into five routes, and /api/chat's TPM fallback pointed at
 * `llama-3.1-8b-instant`, which was retired in the same sweep, so the outage
 * was six separate edits away from being fixed and nothing failed loudly until
 * a human clicked the button.
 *
 * Both ids below were verified against this account's /v1/models list and
 * exercised with the two shapes we actually use — `response_format:
 * json_object` and `stream: true`. gpt-oss-20b was rejected as a fallback: it
 * failed JSON-mode validation on a trivial prompt.
 */

export const GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * Used when the primary model is gone or out of quota. A different family on a
 * separate quota, so a TPM wall or a decommission on one does not take out both.
 */
export const GROQ_FALLBACK_MODEL = 'qwen/qwen3.8-27b';

/** Stored on `model_outputs.model_version` so a row can be traced to a model. */
export const MODEL_VERSION = `groq-${GROQ_MODEL}`;

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Both models reason before answering, and reasoning tokens are drawn from the
 * same `max_tokens` budget as the answer. At the default effort a 1024-token
 * chat reply spent most of its budget thinking; 'low' keeps the answer intact
 * and the first token early. Callers can override it in `body`.
 */
const DEFAULTS = { reasoning_effort: 'low' } as const;

/**
 * Retried on the fallback model: 404 (the id no longer exists — the failure
 * that caused this file), 429 (quota) and 5xx (Groq is unwell). A 400 is our
 * own malformed request, so it is returned as-is rather than paid for twice.
 */
function worthRetrying(status: number): boolean {
  return status === 404 || status === 429 || status >= 500;
}

export interface GroqRequest {
  messages: { role: string; content: string }[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  response_format?: { type: 'json_object' };
  reasoning_effort?: 'low' | 'medium' | 'high';
}

/**
 * POSTs to Groq, falling back to the second model when the first one cannot
 * answer. Returns the raw `Response` — including a synthetic 503 when
 * GROQ_API_KEY is unset, so every caller's existing `!res.ok` branch covers a
 * missing key instead of sending `Bearer undefined` and reading a confusing 401.
 *
 * `label` only names the caller in the server log.
 */
export async function callGroq(label: string, body: GroqRequest): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GROQ_API_KEY is not set' }, { status: 503 });
  }

  const post = (model: string) =>
    fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...DEFAULTS, ...body, model }),
    });

  const res = await post(GROQ_MODEL);
  if (res.ok || !worthRetrying(res.status)) return res;

  console.warn(`[${label}] ${GROQ_MODEL} answered ${res.status} — retrying on ${GROQ_FALLBACK_MODEL}`);
  return post(GROQ_FALLBACK_MODEL);
}
