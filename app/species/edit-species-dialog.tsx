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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, RotateCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { kingdoms, speciesSchema, type SpeciesFormValues } from "./species-form-schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

const populationFormatter = new Intl.NumberFormat("en-US");

function valuesFromSpecies(species: Species): SpeciesFormValues {
  return {
    scientific_name: species.scientific_name,
    common_name: species.common_name,
    kingdom: species.kingdom,
    total_population: species.total_population,
    image: species.image,
    description: species.description,
  };
}

export default function EditSpeciesDialog({ species, userId }: { species: Species; userId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: valuesFromSpecies(species),
    mode: "onChange",
  });
  const preview = form.watch();
  const previewScientificName = preview.scientific_name.trim() || "Scientific name";
  const commonName = preview.common_name?.trim();
  const description = preview.description?.trim();
  const previewCommonName = commonName && commonName.length > 0 ? commonName : "Common name not recorded";
  const previewDescription =
    description && description.length > 0 ? description : "Add a description to tell this species’ story.";

  const onOpenChange = (nextOpen: boolean) => {
    if (nextOpen) form.reset(valuesFromSpecies(species));
    setOpen(nextOpen);
  };

  const onSubmit = async (input: SpeciesFormValues) => {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("species")
      .update({
        scientific_name: input.scientific_name,
        common_name: input.common_name,
        kingdom: input.kingdom,
        total_population: input.total_population,
        image: input.image,
        description: input.description,
      })
      .eq("id", species.id)
      .eq("author", userId)
      .eq("is_seed", false)
      .select("id")
      .maybeSingle();

    if (error !== null || data === null) {
      toast({
        title: "Changes were not saved",
        description: error?.message ?? "This record may no longer be available for you to edit.",
        variant: "destructive",
      });
      return;
    }

    form.reset(input);
    setOpen(false);
    router.refresh();
    toast({ title: "Changes saved", description: `${input.scientific_name} has been updated.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 gap-2 border-[#b7d0be] text-[#225243] hover:bg-[#e8f3ea] hover:text-[#174936]"
        >
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg gap-0 overflow-y-auto rounded-xl border-0 bg-[#f7faf6] p-0 text-[#183e34] shadow-2xl sm:max-w-[920px]">
        <DialogHeader className="border-b border-[#d7e6d9] px-6 py-5 pr-14 text-left sm:px-8 sm:pr-16">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#537d67]">
            Field notes / record {String(species.id).padStart(3, "0")}
          </p>
          <DialogTitle className="font-serif text-2xl font-normal leading-tight text-[#183e34] sm:text-3xl">
            Revise this species
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5e7769]">
            Edit your record and see its field label update as you type.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <aside
            className="flex flex-col justify-between bg-[#173d34] p-6 text-[#e9f6eb] sm:p-8"
            aria-label="Live species preview"
          >
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-[#598171] pb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#b8d6c3]">
                <span>Live field label</span>
                <span className="rounded-full border border-[#81a997] px-2 py-1 text-[9px]">Draft</span>
              </div>
              <div className="pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8ceb6]">{preview.kingdom}</p>
                <h3 className="mt-3 break-words font-serif text-3xl italic leading-tight sm:text-4xl">
                  {previewScientificName}
                </h3>
                <p className="mt-2 text-sm text-[#c2dccc]">{previewCommonName}</p>
              </div>
              <p className="mt-8 border-t border-[#598171] pt-5 text-sm leading-6 text-[#d4e7d9]">
                {previewDescription.length > 170
                  ? `${previewDescription.slice(0, 170).trimEnd()}…`
                  : previewDescription}
              </p>
            </div>
            <div className="mt-8 flex items-baseline justify-between border-t border-[#598171] pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#a8ceb6]">Population</span>
              <span className="font-serif text-2xl tabular-nums">
                {preview.total_population === null ? "—" : populationFormatter.format(preview.total_population)}
              </span>
            </div>
          </aside>

          <Form {...form}>
            <form
              onSubmit={(event: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-5 p-6 sm:p-8"
            >
              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cavia porcellus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="common_name"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Common name</FormLabel>
                      <FormControl>
                        <Input value={value ?? ""} placeholder="Guinea pig" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kingdom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kingdom</FormLabel>
                      <Select onValueChange={(value) => field.onChange(kingdoms.parse(value))} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a kingdom" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {kingdoms.options.map((kingdom) => (
                              <SelectItem key={kingdom} value={kingdom}>
                                {kingdom}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="total_population"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={value ?? ""}
                          placeholder="Unknown"
                          {...field}
                          onChange={(event) =>
                            field.onChange(event.target.value === "" ? null : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          value={value ?? ""}
                          placeholder="https://example.com/photo.jpg"
                          {...field}
                          onChange={(event) => field.onChange(event.target.value === "" ? null : event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        value={value ?? ""}
                        rows={5}
                        placeholder="Describe its habitat, behavior, or distinguishing features."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#d7e6d9] pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-[#557461]"
                  disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  onClick={() => form.reset(valuesFromSpecies(species))}
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  Discard changes
                </Button>
                <Button
                  type="submit"
                  className="gap-2 bg-[#25684b] text-white hover:bg-[#1b523b]"
                  disabled={!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  {form.formState.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
