"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/schema";
import { Search, SearchX, X } from "lucide-react";
import { useMemo, useState } from "react";
import SpeciesCard from "./species-card";
import { getSpeciesMatchingFields } from "./species-search";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCollection({ species, sessionId }: { species: Species[]; sessionId: string }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const matches = useMemo(
    () =>
      species
        .map((record) => ({
          record,
          matchedFields: normalizedQuery.length > 0 ? getSpeciesMatchingFields(record, normalizedQuery) : [],
        }))
        .filter(({ matchedFields }) => normalizedQuery.length === 0 || matchedFields.length > 0),
    [normalizedQuery, species],
  );

  const isSearching = normalizedQuery.length > 0;

  return (
    <div className="mx-auto max-w-7xl">
      <section
        aria-labelledby="species-search-title"
        className="mb-8 overflow-hidden border border-[#b8cfc2] bg-[#f8fbf9] shadow-[0_18px_45px_-38px_rgba(14,60,50,0.85)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-[#b8cfc2] bg-[#e8f1eb] text-[#2f6d53]">
                <Search aria-hidden="true" className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5b7d6d]">
                  Specimen finder
                </p>
                <h2 id="species-search-title" className="mt-1 font-serif text-2xl font-normal text-[#173d35]">
                  Search the field records
                </h2>
              </div>
            </div>

            <div className="relative mt-5">
              <label htmlFor="species-search" className="sr-only">
                Search species by scientific name, common name, or description
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#638273]"
              />
              <Input
                id="species-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “Panthera”, “snow leopard”, or a phrase from the notes"
                autoComplete="off"
                className="h-12 rounded-none border-[#a9c5b5] bg-white pl-11 pr-12 text-[#173d35] placeholder:text-[#789084] focus-visible:ring-[#4e896c]"
              />
              {query.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setQuery("")}
                  aria-label="Clear species search"
                  className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-none text-[#5b7d6d] hover:bg-[#e8f1eb] hover:text-[#214f3e]"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-[#60796e]">
              Looks through <span className="font-medium text-[#315f4d]">scientific name</span>,{" "}
              <span className="font-medium text-[#315f4d]">common name</span>, and{" "}
              <span className="font-medium text-[#315f4d]">description</span> as you type.
            </p>
          </div>

          <div
            className="flex items-center justify-between border-t border-[#b8cfc2] bg-[#173d35] px-5 py-4 text-[#eff7f1] lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0 lg:px-6"
            aria-live="polite"
            aria-atomic="true"
          >
            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a9cbbb]">
                Visible records
              </p>
              <p className="mt-1 font-serif text-4xl leading-none">{matches.length}</p>
            </div>
            <p className="max-w-32 text-right text-xs leading-5 text-[#c7ddd0] lg:mt-3 lg:text-left">
              {isSearching ? `of ${species.length} in the archive` : "in the current archive"}
            </p>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#c8dbd0] pb-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
          Collection index
        </p>
        <p className="text-xs text-[#60796e]" aria-live="polite">
          {isSearching
            ? `${matches.length} ${matches.length === 1 ? "record" : "records"} found for “${query.trim()}”`
            : `${species.length} ${species.length === 1 ? "record" : "records"} catalogued`}
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {matches.map(({ record, matchedFields }) => (
            <SpeciesCard key={record.id} species={record} sessionId={sessionId} matchedFields={matchedFields} />
          ))}
        </div>
      ) : species.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-[#aac4b5] bg-[#f8fbf9] px-6 text-center">
          <SearchX aria-hidden="true" className="h-7 w-7 text-[#5f806f]" />
          <h2 className="mt-4 font-serif text-2xl text-[#204b3d]">No field records yet</h2>
          <p className="mt-2 text-sm text-[#60796e]">Add the first species to begin this collection.</p>
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-[#aac4b5] bg-[#f8fbf9] px-6 text-center">
          <SearchX aria-hidden="true" className="h-7 w-7 text-[#5f806f]" />
          <h2 className="mt-4 font-serif text-2xl text-[#204b3d]">No records match “{query.trim()}”</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#60796e]">
            Try another scientific name, common name, or phrase from a species description.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuery("")}
            className="mt-5 rounded-none border-[#9fbcac] bg-white text-[#285a46] hover:bg-[#e8f1eb]"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
