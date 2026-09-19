import { generateResponse, SPECIES_CHAT_FALLBACK } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";
import { z } from "zod";

const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(1_000),
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
    return NextResponse.json({ error: "Message must be between 1 and 1,000 characters." }, { status: 400 });
  }

  const response = await generateResponse(result.data.message);

  if (response === SPECIES_CHAT_FALLBACK) {
    return NextResponse.json({ response }, { status: 502 });
  }

  return NextResponse.json({ response });
}
