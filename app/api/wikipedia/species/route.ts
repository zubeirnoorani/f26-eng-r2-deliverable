import { NextResponse } from "next/server";
import { z } from "zod";

const searchSchema = z.string().trim().min(1).max(100);

interface WikipediaPage {
  title?: unknown;
  extract?: unknown;
  thumbnail?: { source?: unknown };
  original?: { source?: unknown };
  fullurl?: unknown;
}

interface WikipediaResponse {
  query?: {
    pages?: WikipediaPage[];
  };
}

export async function GET(request: Request) {
  const search = searchSchema.safeParse(new URL(request.url).searchParams.get("q"));

  if (!search.success) {
    return NextResponse.json({ error: "Enter a species name between 1 and 100 characters." }, { status: 400 });
  }

  const parameters = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: search.data,
    gsrnamespace: "0",
    gsrlimit: "1",
    prop: "extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "4",
    piprop: "thumbnail|original",
    pithumbsize: "800",
    inprop: "url",
    format: "json",
    formatversion: "2",
    origin: "*",
  });

  try {
    const result = await fetch(`https://en.wikipedia.org/w/api.php?${parameters.toString()}`, {
      headers: {
        "Api-User-Agent": "BiodiversityHub/1.0 (https://github.com/zubeirnoorani/f26-eng-r2-deliverable)",
      },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 86_400 },
    });

    if (!result.ok) throw new Error(`Wikipedia returned ${result.status}`);

    const data = (await result.json()) as WikipediaResponse;
    const page = data.query?.pages?.[0];
    const title = typeof page?.title === "string" ? page.title : null;
    const description = typeof page?.extract === "string" ? page.extract.trim() : null;

    if (!title || !description) {
      return NextResponse.json({ error: "No matching Wikipedia article was found." }, { status: 404 });
    }

    const thumbnail = typeof page?.thumbnail?.source === "string" ? page.thumbnail.source : null;
    const original = typeof page?.original?.source === "string" ? page.original.source : null;
    const articleUrl = typeof page?.fullurl === "string" ? page.fullurl : null;

    return NextResponse.json({
      title,
      description,
      image: thumbnail ?? original,
      articleUrl,
    });
  } catch {
    return NextResponse.json({ error: "Wikipedia could not be reached. Try again shortly." }, { status: 502 });
  }
}
