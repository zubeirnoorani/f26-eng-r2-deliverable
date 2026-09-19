"use client";

import { Icons } from "@/components/icons";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { kingdoms, speciesSchema, type SpeciesFormValues } from "./species-form-schema";

// Default values for the form fields.
/* Because the react-hook-form (RHF) used here is a controlled form (not an uncontrolled form),
fields that are nullable/not required should explicitly be set to `null` by default.
Otherwise, they will be `undefined` by default, which will raise warnings because `undefined` conflicts with controlled components.
All form fields should be set to non-undefined default values.
Read more here: https://legacy.react-hook-form.com/api/useform/
*/
const defaultValues: SpeciesFormValues = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

interface WikipediaAutofill {
  title: string;
  description: string;
  image: string | null;
  articleUrl: string | null;
}

interface WikipediaLookupError {
  error: string;
  matchedTitle: string | null;
}

function readWikipediaAutofill(value: unknown): WikipediaAutofill | null {
  if (typeof value !== "object" || value === null) return null;
  if (!("title" in value) || !("description" in value) || !("image" in value) || !("articleUrl" in value)) return null;
  if (typeof value.title !== "string" || typeof value.description !== "string") return null;
  if (value.image !== null && typeof value.image !== "string") return null;
  if (value.articleUrl !== null && typeof value.articleUrl !== "string") return null;
  return {
    title: value.title,
    description: value.description,
    image: value.image,
    articleUrl: value.articleUrl,
  };
}

function readWikipediaLookupError(value: unknown): WikipediaLookupError | null {
  if (typeof value !== "object" || value === null || !("error" in value) || typeof value.error !== "string") {
    return null;
  }

  const matchedTitle = "matchedTitle" in value && typeof value.matchedTitle === "string" ? value.matchedTitle : null;
  return { error: value.error, matchedTitle };
}

export default function AddSpeciesDialog({ userId }: { userId: string }) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);
  const [wikipediaSearch, setWikipediaSearch] = useState("");
  const [isSearchingWikipedia, setIsSearchingWikipedia] = useState(false);
  const [wikipediaMatch, setWikipediaMatch] = useState<{ title: string; url: string } | null>(null);

  // Instantiate form functionality with React Hook Form, passing in the Zod schema (for validation) and default values
  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const searchWikipedia = async () => {
    const speciesName = wikipediaSearch.trim();

    if (speciesName.length === 0) {
      toast({
        title: "Enter a species name",
        description: "Search with a common or scientific name.",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingWikipedia(true);
    setWikipediaMatch(null);

    try {
      const response = await fetch(`/api/wikipedia/species?q=${encodeURIComponent(speciesName)}`);
      const body: unknown = await response.json();

      if (response.status === 404) {
        toast({
          title: "No Wikipedia article found",
          description: `Try another common or scientific name for “${speciesName}.”`,
          variant: "destructive",
        });
        return;
      }

      if (response.status === 422) {
        const lookupError = readWikipediaLookupError(body);
        const matchedArticle = lookupError?.matchedTitle ? `Wikipedia matched “${lookupError.matchedTitle},” but ` : "";
        toast({
          title: "That isn’t a species",
          description: `${matchedArticle}Wikidata does not identify it as a species or biological group. Try a more specific common or scientific name.`,
          variant: "destructive",
        });
        return;
      }

      const autofill = readWikipediaAutofill(body);
      if (!response.ok || autofill === null) throw new Error("Wikipedia lookup failed");

      form.setValue("description", autofill.description, { shouldDirty: true, shouldValidate: true });
      form.setValue("image", autofill.image, { shouldDirty: true, shouldValidate: true });
      form.setValue("common_name", autofill.title, { shouldDirty: true, shouldValidate: true });
      if (autofill.articleUrl !== null) {
        setWikipediaMatch({ title: autofill.title, url: autofill.articleUrl });
      }

      toast({
        title: `Found ${autofill.title}`,
        description:
          autofill.image === null
            ? "Common name and description were filled in. This article has no lead image."
            : "Common name, description, and image are ready for you to review.",
      });
    } catch {
      toast({
        title: "Wikipedia search failed",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingWikipedia(false);
    }
  };

  const handleWikipediaSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void searchWikipedia();
    }
  };

  const onSubmit = async (input: SpeciesFormValues) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        common_name: input.common_name,
        description: input.description,
        kingdom: input.kingdom,
        scientific_name: input.scientific_name,
        total_population: input.total_population,
        image: input.image,
      },
    ]);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Because Supabase errors were caught above, the remainder of the function will only execute upon a successful edit

    // Reset form values to the default (empty) values.
    // Practically, this line can be removed because router.refresh() also resets the form. However, we left it as a reminder that you should generally consider form "cleanup" after an add/edit operation.
    form.reset(defaultValues);

    setOpen(false);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();

    return toast({
      title: "New species added!",
      description: "Successfully added " + input.scientific_name + ".",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#bf7138] text-white hover:bg-[#a95e2a]">
          <Icons.add className="mr-3 h-5 w-5" />
          Add Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto border-0 bg-[#f7faf6] p-0 text-[#183e34] shadow-2xl sm:max-w-[680px]">
        <DialogHeader className="border-b border-[#d7e6d9] px-6 py-5 pr-14 text-left sm:px-8 sm:pr-16">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#537d67]">
            New field record
          </p>
          <DialogTitle className="font-serif text-3xl font-normal text-[#183e34]">Add a species</DialogTitle>
          <DialogDescription className="text-sm text-[#5e7769]">
            Add a new species here. Click &quot;Add Species&quot; below when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="p-6 sm:p-8" onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
            <div className="grid w-full items-center gap-4">
              <section
                className="mb-2 overflow-hidden border border-[#b9cfc2] bg-[#eaf3ed]"
                aria-labelledby="wikipedia-search-label"
              >
                <div className="flex items-start gap-4 border-b border-[#c8dbd0] bg-[#f8fbf9] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d5ddd8] bg-white p-1.5 shadow-sm">
                    <Image src="/wikipedia-logo-v2.png" width={40} height={37} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p id="wikipedia-search-label" className="font-serif text-lg font-semibold text-[#254d40]">
                        Import from Wikipedia
                      </p>
                      <span className="hidden rounded-full border border-[#c5d8cd] bg-[#eef5f1] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#557467] sm:block">
                        Optional
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#60796e]">
                      Search one name to fill verified species data. Review everything before adding the species.
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f806f]">
                    Fills automatically
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Fields filled by Wikipedia search">
                    {["Common name", "Description", "Image URL"].map((fieldName) => (
                      <span
                        key={fieldName}
                        className="rounded-full border border-[#bed2c6] bg-white px-2.5 py-1 text-[11px] font-medium text-[#3d6955]"
                      >
                        {fieldName}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-[#6a8277]">
                    Scientific name, kingdom, and total population stay manual.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={wikipediaSearch}
                      onChange={(event) => {
                        setWikipediaSearch(event.target.value);
                        setWikipediaMatch(null);
                      }}
                      onKeyDown={handleWikipediaSearchKeyDown}
                      disabled={isSearchingWikipedia}
                      maxLength={100}
                      placeholder="Common or scientific name"
                      aria-label="Common or scientific species name"
                      className="border-[#a9c5b5] bg-white focus-visible:ring-[#4e896c]"
                    />
                    <Button
                      type="button"
                      disabled={isSearchingWikipedia || wikipediaSearch.trim().length === 0}
                      onClick={() => void searchWikipedia()}
                      className="shrink-0 gap-2 bg-[#25684b] text-white hover:bg-[#1b523b]"
                    >
                      {isSearchingWikipedia ? (
                        <Icons.spinner aria-hidden="true" className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search aria-hidden="true" className="h-4 w-4" />
                      )}
                      {isSearchingWikipedia ? "Searching…" : "Search Wikipedia"}
                    </Button>
                  </div>
                  {wikipediaMatch && (
                    <div className="mt-3 flex items-center justify-between gap-3 border-l-2 border-[#bf7138] bg-white px-3 py-2">
                      <p className="text-xs text-[#4f6f61]">
                        Imported from <span className="font-semibold text-[#254d40]">{wikipediaMatch.title}</span>
                      </p>
                      <a
                        href={wikipediaMatch.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${wikipediaMatch.title} on Wikipedia`}
                        className="shrink-0 text-[#39715a] hover:text-[#254d40]"
                      >
                        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cavia porcellus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Common Name</FormLabel>
                      <FormControl>
                        <Input value={value ?? ""} placeholder="Guinea pig" {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
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
              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        {/* Using shadcn/ui form with number: https://github.com/shadcn-ui/ui/issues/421 */}
                        <Input
                          type="number"
                          value={value ?? ""}
                          placeholder="300000"
                          {...rest}
                          onChange={(event) =>
                            field.onChange(event.target.value === "" ? null : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Wikipedia has no consistent exact population field, so enter the best current estimate manually.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          value={value ?? ""}
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/George_the_amazing_guinea_pig.jpg/440px-George_the_amazing_guinea_pig.jpg"
                          {...rest}
                          onChange={(event) => field.onChange(event.target.value === "" ? null : event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={value ?? ""}
                          placeholder="The guinea pig or domestic guinea pig, also known as the cavy or domestic cavy, is a species of rodent belonging to the genus Cavia in the family Caviidae."
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="mt-2 flex gap-2 border-t border-[#d7e6d9] pt-5">
                <Button
                  type="submit"
                  disabled={isSearchingWikipedia || form.formState.isSubmitting}
                  className="flex-auto bg-[#25684b] text-white hover:bg-[#1b523b]"
                >
                  {form.formState.isSubmitting ? "Adding…" : "Add Species"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" className="flex-auto" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
