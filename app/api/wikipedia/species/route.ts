import { NextResponse } from "next/server";
import { z } from "zod";

const searchSchema = z.string().trim().min(1).max(100);
const requestHeaders = {
  "Api-User-Agent": "BiodiversityHub/1.0 (https://github.com/zubeirnoorani/f26-eng-r2-deliverable)",
};
const acceptedBiologicalTopicIds = new Set([
  "Q16521", // taxon
  "Q55983715", // organisms known by a particular common name
]);

interface WikipediaPage {
  title?: unknown;
  extract?: unknown;
  thumbnail?: { source?: unknown };
  original?: { source?: unknown };
  fullurl?: unknown;
  pageprops?: {
    disambiguation?: unknown;
    wikibase_item?: unknown;
  };
}

interface WikipediaResponse {
  query?: {
    pages?: WikipediaPage[];
  };
}

interface WikidataClaim {
  mainsnak?: {
    snaktype?: unknown;
    datavalue?: {
      value?: unknown;
    };
  };
}

interface WikidataClaimsResponse {
  claims?: Record<string, WikidataClaim[]>;
}

async function getWikidataClaims(entityId: string, propertyId: string) {
  const parameters = new URLSearchParams({
    action: "wbgetclaims",
    entity: entityId,
    property: propertyId,
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const result = await fetch(`https://www.wikidata.org/w/api.php?${parameters.toString()}`, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 86_400 },
  });

  if (!result.ok) throw new Error(`Wikidata returned ${result.status}`);

  const data = (await result.json()) as WikidataClaimsResponse;
  return data.claims?.[propertyId] ?? [];
}

function hasItemClaim(claims: WikidataClaim[], acceptedIds: Set<string>) {
  return claims.some((claim) => {
    const value = claim.mainsnak?.datavalue?.value;
    if (claim.mainsnak?.snaktype !== "value" || typeof value !== "object" || value === null || !("id" in value)) {
      return false;
    }

    return typeof value.id === "string" && acceptedIds.has(value.id);
  });
}

async function verifyBiologicalTopic(wikidataId: string) {
  const classifications = await getWikidataClaims(wikidataId, "P31");
  return hasItemClaim(classifications, acceptedBiologicalTopicIds);
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
    prop: "extracts|pageimages|info|pageprops",
    ppprop: "wikibase_item|disambiguation",
    exintro: "1",
    explaintext: "1",
    exsentences: "4",
    piprop: "thumbnail|original",
    pithumbsize: "800",
    inprop: "url",
    redirects: "1",
    format: "json",
    formatversion: "2",
    origin: "*",
  });

  try {
    const result = await fetch(`https://en.wikipedia.org/w/api.php?${parameters.toString()}`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 86_400 },
    });

    if (!result.ok) throw new Error(`Wikipedia returned ${result.status}`);

    const data = (await result.json()) as WikipediaResponse;
    const page = data.query?.pages?.[0];
    const title = typeof page?.title === "string" ? page.title : null;
    const description = typeof page?.extract === "string" ? page.extract.trim() : null;

    if (title === null || description === null || description.length === 0) {
      return NextResponse.json({ error: "No matching Wikipedia article was found." }, { status: 404 });
    }

    const isDisambiguationPage = page?.pageprops !== undefined && "disambiguation" in page.pageprops;
    const wikidataId = page?.pageprops?.wikibase_item;

    if (isDisambiguationPage || typeof wikidataId !== "string" || !/^Q\d+$/.test(wikidataId)) {
      return NextResponse.json(
        {
          error: "The matching Wikipedia article is not a recognized species or biological group.",
          matchedTitle: title,
        },
        { status: 422 },
      );
    }

    const biologicalTopic = await verifyBiologicalTopic(wikidataId);
    if (!biologicalTopic) {
      return NextResponse.json(
        {
          error: "The matching Wikipedia article is not a recognized species or biological group.",
          matchedTitle: title,
        },
        { status: 422 },
      );
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
  } catch (error) {
    console.error("Wikipedia species lookup failed", error);
    return NextResponse.json(
      { error: "Wikipedia or Wikidata could not be reached. Try again shortly." },
      { status: 502 },
    );
  }
}
