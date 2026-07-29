import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Feedback worker for ML Grind.
 *
 * The browser posts the learner's code plus their test results; this returns a
 * short markdown critique that the AI Feedback tab renders.
 *
 * Contract (kept identical to the previously deployed worker):
 *   POST   {code, problemTitle, problemDescription, testResults[]} -> 200 {feedback}
 *   OPTIONS                                                       -> 204 (CORS preflight)
 *   other methods                                                 -> 405 {error}
 *   missing fields                                                -> 400 {error}
 */

export interface Env {
  /** `npx wrangler secret put ANTHROPIC_API_KEY` */
  ANTHROPIC_API_KEY: string;
  /** Optional override, e.g. to pin a different model without a code change. */
  ANTHROPIC_MODEL?: string;
}

/** Model powering the feedback. Overridable via the ANTHROPIC_MODEL var. */
const DEFAULT_MODEL = 'claude-sonnet-5';

/**
 * `medium` keeps the tab responsive while still reasoning about the code.
 * Raise to `high` if the critiques feel shallow; drop to `low` for latency.
 */
const EFFORT = 'medium';

/**
 * Budget for thinking *and* the visible answer together — adaptive thinking draws
 * from the same pool, so this has to be well above the ~250-word reply the prompt
 * asks for or the answer gets truncated mid-sentence. Reply length is controlled
 * by the system prompt, not by starving this.
 */
const MAX_TOKENS = 8000;

const ALLOWED_ORIGINS = [
  'https://mlgrind.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const DEFAULT_ORIGIN = 'https://mlgrind.github.io';

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin':
      origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

interface TestResult {
  passed: boolean;
  description?: string;
  expected?: string;
  actual?: string;
}

interface FeedbackRequest {
  code: string;
  problemTitle: string;
  problemDescription: string;
  testResults: TestResult[];
}

const SYSTEM_PROMPT = `You are a supportive but precise ML coding tutor reviewing a learner's solution on ML Grind, where learners implement ML algorithms from scratch in NumPy.

Respond in GitHub-flavoured markdown using exactly these four sections, in this order, each as a level-3 heading:

### Correctness
### Implementation
### NumPy / Python Tips
### Next Steps

Rules for the response:
- Under each heading, use bullet points ("- "), never numbered lists.
- Keep the whole response under about 250 words. This renders in a narrow sidebar.
- Reference the learner's actual variable and function names.
- Wrap identifiers, expressions and shapes in backticks.
- If tests failed, lead with the specific reason and point at the line or expression responsible. Do not paste a corrected full solution — describe the fix so the learner writes it.
- If every test passed, say so plainly, then focus on numerical stability, vectorisation, and readability.
- Do not invent problems the code does not have, and do not restate the problem back to the learner.`;

function buildUserPrompt(body: FeedbackRequest): string {
  const { code, problemTitle, problemDescription, testResults } = body;

  const passed = testResults.filter(r => r.passed).length;
  const summary =
    testResults.length === 0
      ? 'No tests were run.'
      : `${passed}/${testResults.length} tests passed.`;

  const failures = testResults
    .filter(r => !r.passed)
    .map(
      r =>
        `- ${r.description ?? 'test'}: expected \`${r.expected ?? ''}\`, got \`${r.actual ?? ''}\``
    )
    .join('\n');

  return [
    `Problem: ${problemTitle}`,
    '',
    problemDescription,
    '',
    "The learner's solution:",
    '```python',
    code,
    '```',
    '',
    `Test results: ${summary}`,
    failures ? `\nFailing tests:\n${failures}` : '',
  ].join('\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request);
    }

    let body: Partial<FeedbackRequest>;
    try {
      body = (await request.json()) as Partial<FeedbackRequest>;
    } catch {
      return json({ error: 'Invalid JSON' }, 400, request);
    }

    if (!body.code || !body.problemTitle || !Array.isArray(body.testResults)) {
      return json({ error: 'Missing required fields' }, 400, request);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.messages.create({
        model: env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        thinking: { type: 'adaptive' },
        output_config: { effort: EFFORT },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt({
              code: body.code,
              problemTitle: body.problemTitle,
              problemDescription: body.problemDescription ?? '',
              testResults: body.testResults,
            }),
          },
        ],
      });

      // Safety classifiers can decline a request; `content` is then empty or
      // partial, so check before reading it.
      if (response.stop_reason === 'refusal') {
        return json(
          { error: 'The model declined to review this submission.' },
          422,
          request
        );
      }

      // Adaptive thinking means `content` can lead with a thinking block —
      // collect the text blocks rather than indexing content[0].
      const feedback = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .trim();

      if (!feedback) {
        return json({ error: 'Empty response from the model.' }, 502, request);
      }

      // Truncation is silent otherwise: the learner just sees a critique that
      // stops mid-sentence. Log it so MAX_TOKENS can be tuned from real traffic.
      if (response.stop_reason === 'max_tokens') {
        console.warn(
          `Response hit max_tokens (${MAX_TOKENS}); feedback truncated. ` +
            `output_tokens=${response.usage.output_tokens}`
        );
      }

      return json({ feedback }, 200, request);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        return json({ error: 'Rate limited — try again in a moment.' }, 429, request);
      }
      if (err instanceof Anthropic.AuthenticationError) {
        console.error('Anthropic auth failed — check the ANTHROPIC_API_KEY secret.');
        return json({ error: 'Feedback service misconfigured.' }, 500, request);
      }
      if (err instanceof Anthropic.APIError) {
        console.error(`Anthropic API error ${err.status}: ${err.message}`);
        return json({ error: 'Failed to get feedback. Please try again.' }, 502, request);
      }
      console.error(err);
      return json({ error: 'Failed to get feedback. Please try again.' }, 500, request);
    }
  },
};
