import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

const searchableFields = [
  { key: "scientific_name", label: "scientific name" },
  { key: "common_name", label: "common name" },
  { key: "description", label: "description" },
] as const;

export function getSpeciesMatchingFields(species: Species, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery.length === 0) return [];

  return searchableFields
    .filter(({ key }) => (species[key] ?? "").toLocaleLowerCase().includes(normalizedQuery))
    .map(({ label }) => label);
}
