"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

type Species = Database["public"]["Tables"]["species"]["Row"];

const populationFormatter = new Intl.NumberFormat("en-US");

export default function SpeciesDetailsDialog({ species }: { species: Species }) {
  const commonName = species.common_name?.trim() ?? "";
  const description = species.description?.trim() ?? "";
  const population =
    species.total_population === null ? "Not recorded" : populationFormatter.format(species.total_population);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full justify-between">
          Learn more
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg gap-0 overflow-y-auto rounded-xl border-0 bg-[#f6faf7] p-0 text-[#173a33] shadow-2xl sm:max-w-[860px]">
        <div className="flex min-h-14 items-center justify-between border-b border-[#d7e5dc] px-6 py-3 pr-14 sm:px-8 sm:pr-16">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#527568]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#c87b54]" />
            Biodiversity Hub{" "}
            <span aria-hidden="true" className="text-[#9eb8aa]">
              /
            </span>{" "}
            Species profile
          </p>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-[#506e61] sm:block">
            Record {String(species.id).padStart(3, "0")}
          </span>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="relative isolate min-h-[220px] overflow-hidden bg-[#1b4a40] md:min-h-[510px]">
            {species.image ? (
              <Image
                src={species.image}
                alt={commonName.length > 0 ? commonName : species.scientific_name}
                fill
                sizes="(max-width: 767px) 100vw, 430px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center px-8 text-center md:min-h-[510px]">
                <span aria-hidden="true" className="font-serif text-8xl italic text-[#a9cbbb]">
                  {species.scientific_name.charAt(0)}
                </span>
              </div>
            )}
            {!species.image && (
              <p className="absolute bottom-5 left-6 right-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                Image not recorded
              </p>
            )}
          </div>

          <div className="flex flex-col px-6 pb-9 pt-8 sm:px-9 sm:pb-11 sm:pt-10">
            <DialogHeader className="space-y-3 text-left">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#427a65]">
                Scientific name
              </p>
              <DialogTitle className="break-words font-serif text-4xl font-normal italic leading-[1.1] tracking-tight text-[#173a33] sm:text-5xl">
                {species.scientific_name}
              </DialogTitle>
              <DialogDescription className="text-base font-medium leading-6 text-[#55766a]">
                {commonName.length > 0 ? commonName : "Common name not recorded"}
              </DialogDescription>
            </DialogHeader>

            <dl className="mt-8 grid grid-cols-2 border-y border-[#cbded2] py-5">
              <div className="pr-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#506e61]">Kingdom</dt>
                <dd className="mt-2 text-lg font-semibold text-[#173a33]">{species.kingdom}</dd>
              </div>
              <div className="border-l border-[#cbded2] pl-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#506e61]">Total population</dt>
                <dd className="mt-2 text-lg font-semibold tabular-nums text-[#173a33]">{population}</dd>
              </div>
            </dl>

            <section className="pt-7" aria-label="Description">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[#506e61]">
                Description
              </h3>
              <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#37564c]">
                {description.length > 0 ? description : "No description has been recorded for this species yet."}
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
