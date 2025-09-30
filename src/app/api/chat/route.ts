import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiChatRequest {
  prompt: string;
  conversationHistory?: Record<string, unknown>[];
}

interface DesignRecommendationRequest {
  message: string;
  project_type: string;
  audience: string;
  color_pref: string;
  layout_pref: string;
  award_winner: string;
}

interface DesignParams {
  project_type: string;
  audience: string;
  color_pref: string;
  layout_pref: string;
  award_winner: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === "gemini") {
      return await handleGeminiChat(body);
    } else if (body.type === "design_recommendation") {
      return await handleDesignRecommendation(body);
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleGeminiChat(body: GeminiChatRequest) {
  const { prompt } = body;

  // Try design extraction first
  const designParams = extractDesignParameters(prompt);
  if (designParams) {
    return await handleLocalAIModel(designParams, prompt);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const generatedText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({
      response: generatedText,
      usage: result.response.usageMetadata ?? null,
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

async function handleDesignRecommendation(body: DesignRecommendationRequest) {
  const { project_type, audience, color_pref, layout_pref, award_winner } = body;

  try {
    const response = await fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_type, audience, color_pref, layout_pref, award_winner }),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.recommendation });
  } catch (error) {
    console.error("Python API error:", error);
    return NextResponse.json({
      reply: "Design recommendation service is currently unavailable. Please try again later.",
    });
  }
}

function extractDesignParameters(text: string): DesignParams | null {
  const lowerText = text.toLowerCase();

  const designKeywords = [
    "design",
    "website",
    "web",
    "ui",
    "ux",
    "layout",
    "color",
    "portfolio",
    "blog",
    "ecommerce",
    "landing",
  ];
  const hasDesignKeywords = designKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );

  if (!hasDesignKeywords) return null;

  let project_type = "portfolio";
  if (lowerText.includes("blog")) project_type = "blog";
  else if (lowerText.includes("ecommerce") || lowerText.includes("shop") || lowerText.includes("store"))
    project_type = "ecommerce";
  else if (lowerText.includes("landing")) project_type = "landing";
  else if (lowerText.includes("portfolio")) project_type = "portfolio";

  let audience = "general";
  if (lowerText.includes("tech") || lowerText.includes("developer") || lowerText.includes("programmer"))
    audience = "tech";
  else if (lowerText.includes("creative") || lowerText.includes("artist") || lowerText.includes("designer"))
    audience = "creative";
  else if (lowerText.includes("enterprise") || lowerText.includes("business") || lowerText.includes("corporate"))
    audience = "enterprise";
  else if (lowerText.includes("young") || lowerText.includes("youth") || lowerText.includes("student"))
    audience = "young";

  let color_pref = "neutral";
  if (lowerText.includes("blue")) color_pref = "blue";
  else if (lowerText.includes("purple") || lowerText.includes("violet")) color_pref = "purple";
  else if (lowerText.includes("green")) color_pref = "green";
  else if (lowerText.includes("orange")) color_pref = "orange";
  else if (lowerText.includes("red")) color_pref = "red";

  let layout_pref = "modern";
  if (lowerText.includes("minimal") || lowerText.includes("clean") || lowerText.includes("simple"))
    layout_pref = "minimal";
  else if (lowerText.includes("grid") || lowerText.includes("masonry"))
    layout_pref = "grid";
  else if (lowerText.includes("classic") || lowerText.includes("traditional"))
    layout_pref = "classic";
  else if (lowerText.includes("card") || lowerText.includes("cards"))
    layout_pref = "card-based";
  else if (lowerText.includes("one page") || lowerText.includes("single page"))
    layout_pref = "one-page";

  const award_winner = lowerText.includes("award") ||
    lowerText.includes("winning") ||
    lowerText.includes("premium")
    ? "yes"
    : "no";

  return {
    project_type,
    audience,
    color_pref,
    layout_pref,
    award_winner,
  };
}

async function handleLocalAIModel(params: DesignParams, originalPrompt: string) {
  try {
    const response = await fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendation = data.recommendation;

    const enhancedResponse = `Based on your design requirements, here's my recommendation:\n\n${recommendation}\n\nWould you like me to elaborate on any specific aspect of this design approach?`;

    return NextResponse.json({
      response: enhancedResponse,
      source: "local_ai_model",
    });
  } catch (error) {
    console.error("Local AI model error:", error);
    return await handleGeminiFallback(originalPrompt, "Local AI model is currently unavailable. ");
  }
}

async function handleGeminiFallback(prompt: string, prefix: string = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI services are currently unavailable" }, { status: 503 });
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const generatedText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({
      response: prefix + generatedText,
      source: "gemini_fallback",
    });
  } catch (error) {
    console.error("Gemini fallback error:", error);
    return NextResponse.json({ error: "AI services are currently unavailable" }, { status: 503 });
  }
}
