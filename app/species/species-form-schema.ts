import { z } from "zod";

export const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

// Creation and editing use the same rules so an existing record can be saved without changing its shape.
export const speciesSchema = z.object({
  scientific_name: z.string().trim().min(1, "Enter a scientific name."),
  common_name: z
    .string()
    .nullable()
    .transform((value) => (!value || value.trim() === "" ? null : value.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().nullable(),
  image: z
    .string()
    .url("Enter a valid image URL.")
    .nullable()
    .transform((value) => (!value || value.trim() === "" ? null : value.trim())),
  description: z
    .string()
    .nullable()
    .transform((value) => (!value || value.trim() === "" ? null : value.trim())),
});

export type SpeciesFormValues = z.infer<typeof speciesSchema>;
