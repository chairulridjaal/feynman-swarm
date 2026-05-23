import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
loadEnv(join(rootDir, ".env"));

const config = {
  port: Number(process.env.PORT || 8787),
  baseUrl: process.env.LB_BASE_URL || "https://codex-lb.herdsphere.xyz/v1",
  model: process.env.LB_MODEL || "gpt-5.4",
  reasoningEffort: process.env.LB_REASONING_EFFORT || "medium",
  apiKey: process.env.LB_API_KEY || "",
  timeoutMs: Number(process.env.LB_STREAM_IDLE_TIMEOUT_MS || 10000000)
};

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && request.url === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        provider: "LB",
        model: config.model,
        hasKey: Boolean(config.apiKey)
      });
      return;
    }

    if (request.method === "POST" && request.url === "/api/live-research") {
      const body = await readJson(request);
      const result = await runLiveResearch(body);
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
});

server.listen(config.port, "127.0.0.1", () => {
  console.log(`Feynman Swarm API listening on http://127.0.0.1:${config.port}`);
});

async function runLiveResearch(payload) {
  if (!config.apiKey) {
    throw new Error("LB_API_KEY is missing. Copy apps/api/.env.example to apps/api/.env and add the workshop key.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const prompt = buildPrompt(payload);
    const requestBody = {
      model: config.model,
      reasoning: { effort: config.reasoningEffort },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are Feynman Swarm's live verifier-writer. Produce concise, evidence-aware workshop output. Return only valid JSON with keys executiveSummary, recommendation, confidence, citations, rejectedClaims, and paymentNotes."
            }
          ]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ],
      tools: [{ type: "web_search_preview" }]
    };

    const raw = await postResponses(requestBody, controller.signal);
    const text = extractOutputText(raw);
    const parsed = parseJsonFromText(text);

    return {
      mode: "live",
      provider: "LB",
      model: config.model,
      receivedAt: new Date().toISOString(),
      rawText: text,
      result: normalizeLiveResult(parsed)
    };
  } catch (error) {
    if (String(error instanceof Error ? error.message : error).includes("web_search")) {
      const retryBody = {
        model: config.model,
        reasoning: { effort: config.reasoningEffort },
        input: buildPrompt(payload)
      };
      const raw = await postResponses(retryBody, controller.signal);
      const text = extractOutputText(raw);
      const parsed = parseJsonFromText(text);
      return {
        mode: "live",
        provider: "LB",
        model: config.model,
        receivedAt: new Date().toISOString(),
        rawText: text,
        result: normalizeLiveResult(parsed)
      };
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function postResponses(body, signal) {
  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    signal
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`LB Responses API ${response.status}: ${text.slice(0, 700)}`);
  }

  return JSON.parse(text);
}

function buildPrompt(payload) {
  const evidenceLines = Array.isArray(payload?.evidence)
    ? payload.evidence
        .map(
          (card) =>
            `- ${card.agentName || "Agent"} | status=${card.status} | score=${card.score} | confidence=${card.confidence} | reward=${card.proposedRewardXlm} XLM | claim=${card.claim} | source=${card.source}`
        )
        .join("\n")
    : "No submitted evidence yet.";

  return `
Mission question:
${payload?.question || "Unknown research question"}

Budget:
${payload?.budgetXlm || 0} XLM

Depth:
${payload?.depth || "standard"}

Output type:
${payload?.outputType || "technical"}

Current evidence ledger:
${evidenceLines}

Task:
Act as a live AI research/verifier pass for a hackathon demo. Use web search if available. Return JSON:
{
  "executiveSummary": "2-3 sentences",
  "recommendation": "clear recommendation",
  "confidence": 0.0-1.0,
  "citations": [{"title":"...", "url":"...", "note":"..."}],
  "rejectedClaims": ["..."],
  "paymentNotes": ["which artifacts should be paid or rejected and why"]
}
`.trim();
}

function extractOutputText(raw) {
  if (typeof raw.output_text === "string" && raw.output_text.trim()) {
    return raw.output_text;
  }

  const chunks = [];
  for (const item of raw.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
      if (typeof content.output_text === "string") {
        chunks.push(content.output_text);
      }
    }
  }

  const text = chunks.join("\n").trim();
  if (!text) {
    throw new Error("LB Responses API returned no output text.");
  }
  return text;
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`Live AI returned non-JSON output: ${text.slice(0, 400)}`);
    }
    return JSON.parse(match[0]);
  }
}

function normalizeLiveResult(result) {
  return {
    executiveSummary: String(result.executiveSummary || ""),
    recommendation: String(result.recommendation || ""),
    confidence: clampNumber(Number(result.confidence || 0.7), 0, 1),
    citations: Array.isArray(result.citations)
      ? result.citations.slice(0, 5).map((citation) => ({
          title: String(citation.title || "Source"),
          url: String(citation.url || ""),
          note: String(citation.note || "")
        }))
      : [],
    rejectedClaims: Array.isArray(result.rejectedClaims) ? result.rejectedClaims.map(String).slice(0, 6) : [],
    paymentNotes: Array.isArray(result.paymentNotes) ? result.paymentNotes.map(String).slice(0, 8) : []
  };
}

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function loadEnv(path) {
  if (!existsSync(path)) {
    return;
  }

  const contents = readFileSync(path, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [rawKey, ...valueParts] = trimmed.split("=");
    const key = rawKey.replace(/^\uFEFF/, "");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}
