"use client";

import type { Database } from "@/lib/schema";
import { getSpeciesImageUrl } from "@/lib/species-images";
import Image from "next/image";
import { useState } from "react";
import DeleteSpeciesDialog from "./delete-species-dialog";
import EditSpeciesDialog from "./edit-species-dialog";
import SpeciesDetailsDialog from "./species-details-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId: string }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const canManage = !species.is_seed && species.author === sessionId;
  const sourceLabel = species.is_seed ? "Starter collection" : canManage ? "Your species" : "Community species";
  const recordedCommonName = species.common_name?.trim() ?? "";
  const recordedDescription = species.description?.trim() ?? "";
  const commonName = recordedCommonName.length > 0 ? recordedCommonName : "Common name not recorded";
  const description =
    recordedDescription.length > 0 ? recordedDescription : "No field description has been recorded yet.";
  const imageUrl = species.image === null ? null : getSpeciesImageUrl(species.image);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden border border-[#c8dbd0] bg-[#f8fbf9] shadow-[0_16px_35px_-32px_rgba(14,60,50,0.75)] transition hover:-translate-y-0.5 hover:border-[#9dbbab] hover:bg-white hover:shadow-[0_22px_40px_-30px_rgba(14,60,50,0.65)]">
      <div className="relative h-52 overflow-hidden bg-[#1b4a40]">
        {imageUrl !== null && failedImageUrl !== imageUrl ? (
          <Image
            src={imageUrl}
            alt={commonName}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-7xl italic text-[#a9cbbb]">{species.scientific_name.charAt(0)}</span>
          </div>
        )}
        <span className="absolute left-4 top-4 bg-[#f8fbf9]/95 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#34664f] shadow-sm backdrop-blur">
          {sourceLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5f806f]">
          {species.kingdom} · Record {String(species.id).padStart(3, "0")}
        </p>
        <h2 className="mt-3 break-words font-serif text-2xl font-normal italic leading-tight text-[#173d35]">
          {species.scientific_name}
        </h2>
        <p className="mt-1 text-sm font-medium text-[#547466]">{commonName}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#60796e]">{description}</p>

        <div className="mt-auto space-y-2 pt-6">
          <SpeciesDetailsDialog species={species} />
          {canManage && (
            <div className="flex gap-2">
              <EditSpeciesDialog species={species} userId={sessionId} />
              <DeleteSpeciesDialog species={species} userId={sessionId} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
