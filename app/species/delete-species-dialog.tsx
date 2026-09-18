"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({ species, userId }: { species: Species; userId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const deleteSpecies = async () => {
    setPending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("species")
        .delete()
        .eq("id", species.id)
        .eq("author", userId)
        .eq("is_seed", false)
        .select("id")
        .maybeSingle();

      if (error !== null || data === null) {
        toast({
          title: "Species was not deleted",
          description: error?.message ?? "This record may no longer be available for you to delete.",
          variant: "destructive",
        });
        return;
      }

      setOpen(false);
      router.refresh();
      toast({ title: "Species deleted", description: `${species.scientific_name} was removed.` });
    } catch {
      toast({
        title: "Species was not deleted",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && setOpen(nextOpen)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 gap-2 border-[#eccbc5] text-[#9a3c31] hover:bg-[#fff0ec] hover:text-[#7d3028]"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md gap-0 overflow-hidden rounded-xl border-0 bg-[#f7faf6] p-0 text-[#183e34] shadow-2xl">
        <div className="h-1.5 bg-[#b55343]" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="pr-6 text-left">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a04e3c]">
              Remove your record
            </p>
            <DialogTitle className="break-words font-serif text-2xl font-normal leading-tight sm:text-3xl">
              Delete {species.scientific_name}?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-[#5e7769]">
              This removes the species and its information from the collection. You cannot undo this.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-7 flex flex-wrap justify-end gap-2 border-t border-[#d7e6d9] pt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Keep species
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => void deleteSpecies()}>
              {pending ? "Deleting…" : "Delete species"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
