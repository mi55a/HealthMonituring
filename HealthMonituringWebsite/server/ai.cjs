let ai;

async function getAI() {
  if (!ai) {
    const { GoogleGenAI } = await import("@google/genai");

    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return ai;
}

// Tried in order. The first is a fast "lite" model; the second is the fallback.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
const TIMEOUT_MS = 25000;

const SYSTEM_INSTRUCTIONS = `
You are ASTROHEALTH, an astronaut health monitoring assistant.

Your responsibilities:
- Explain trends in supplied health measurements.
- Compare recent readings with personal baselines.
- Identify patterns across multiple health indicators.
- Explain which measurements contributed to an observation.
- Suggest appropriate follow-up questions.
- Explain when a medical professional should review the information.

Safety rules:
- Never diagnose a medical condition.
- Never prescribe medication or treatment.
- Never invent measurements or medical history.
- Do not treat a single measurement as a diagnosis.
- Distinguish observed facts from possible explanations.
- Do not invent medical thresholds.
- Do not claim that a person is medically safe.
- Encourage contact with qualified medical personnel
  when concerning information needs review.
- Use simple language.
- The supplied data may be simulated demonstration data.
`;

// Calls Gemini (Interactions API), trying each model with a timeout.
async function generate({ input, maxTokens, label }) {
  const client = await getAI();
  let lastError;

  for (const model of MODELS) {
    const start = Date.now();
    console.log(`[Gemini] ${label} started (model: ${model})`);

    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`timed out after ${TIMEOUT_MS / 1000}s`)),
        TIMEOUT_MS
      );
    });

    try {
      const interaction = await Promise.race([
        client.interactions.create({
          model,
          system_instruction: SYSTEM_INSTRUCTIONS,
          input,
          store: false,
          generation_config: {
            thinking_level: "low",
            max_output_tokens: maxTokens
          }
        }),
        timeout
      ]);

      if (!interaction.output_text) {
        throw new Error("empty response");
      }

      console.log(
        `[Gemini] ${label} finished in ${Date.now() - start}ms (${model})`
      );
      return interaction.output_text;
    } catch (err) {
      console.error(
        `[Gemini] ${label} failed on ${model} after ${Date.now() - start}ms:`,
        err.message
      );
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function extractJSON(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(cleaned);
}

// Generate AI health analysis.
async function analyzeHealth(healthData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const prompt = `
Today's date is ${new Date().toDateString()}.

Analyze the following astronaut health information.

HEALTH DATA:
${JSON.stringify(healthData)}

Return ONLY a JSON object (no markdown) with this exact structure:

{
  "overallStatus": "Monitor",
  "summary": "A short overall health trend summary.",
  "insights": [
    {
      "title": "Insight title",
      "description": "Explain the observed pattern.",
      "indicators": ["heart_rate", "sleep_hours"],
      "severity": "info"
    }
  ],
  "recommendations": [
    "Suggested follow-up or approved protocol review."
  ],
  "dataLimitations": [
    "Mention missing data or insufficient history."
  ]
}

Allowed overallStatus values:
- Stable
- Monitor
- Needs Review

Allowed severity values:
- info
- warning
- urgent

Keep it brief: at most 3 insights and 3 recommendations.
Do not invent clinical thresholds.
Explain patterns based on the provided readings and baseline.
If there is insufficient data, clearly say so.
`;

  const text = await generate({
    input: prompt,
    maxTokens: 2000,
    label: "analysis"
  });

  return extractJSON(text);
}

// Answer questions about the astronaut's health data.
// `history` is the recent chat: [{ role: "user" | "assistant", text }].
async function askHealthAssistant(question, healthData, history = []) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const conversation = history
    .map(
      (m) =>
        `${m.role === "user" ? "ASTRONAUT" : "ASTROHEALTH"}: ${String(
          m.text
        ).slice(0, 800)}`
    )
    .join("\n");

  return generate({
    input: `
Today's date is ${new Date().toDateString()}.

ASTROHEALTH HEALTH DATA:
${JSON.stringify(healthData)}

CONVERSATION SO FAR:
${conversation || "(no earlier messages)"}

LATEST ASTRONAUT MESSAGE:
${question}

Answer the latest message using the available data.
Explain relevant trends when possible.
If the data cannot answer the question, say so.
Do not diagnose or prescribe treatment.

Treat short replies like "yes" or "no" as answers to your last question, not new questions.
Do not repeat the full data summary every turn.
Keep the answer under 150 words. Lead with the direct answer, then at most 3 short bullets.
Do not repeat your whole role description unless asked.
`,
    maxTokens: 1000,
    label: "chat"
  });
}

module.exports = {
  analyzeHealth,
  askHealthAssistant
};