import { generateResponse, SPECIES_CHAT_FALLBACK } from "@/lib/services/species-chat";
import { defaultSpeciesChatModel, speciesChatModelIds } from "@/lib/species-chat-models";
import { NextResponse } from "next/server";
import { z } from "zod";

const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(1_000),
    model: z.enum(speciesChatModelIds).default(defaultSpeciesChatModel),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = chatRequestSchema.safeParse(body);

  if (!result.success) {
    const invalidModel = result.error.issues.some((issue) => issue.path[0] === "model");
    const error = invalidModel
      ? "Choose one of the supported chatbot models."
      : "Message must be between 1 and 1,000 characters.";

    return NextResponse.json({ error }, { status: 400 });
  }

  const response = await generateResponse(result.data.message, result.data.model);

  if (response.text === SPECIES_CHAT_FALLBACK) {
    return NextResponse.json({ response: response.text, model: response.model }, { status: 502 });
  }

  return NextResponse.json({ response: response.text, model: response.model });
}
