export const speciesChatModelIds = ["claude-haiku-4-5-20251001", "claude-sonnet-5"] as const;

export const speciesChatModels = [
  {
    id: speciesChatModelIds[0],
    label: "Haiku 4.5",
    description: "Fastest · lowest cost",
  },
  {
    id: speciesChatModelIds[1],
    label: "Sonnet 5",
    description: "More depth · still efficient",
  },
] as const;

export type SpeciesChatModel = (typeof speciesChatModels)[number]["id"];

export const defaultSpeciesChatModel: SpeciesChatModel = "claude-haiku-4-5-20251001";

export function getSpeciesChatModelLabel(modelId: string): string {
  return speciesChatModels.find((model) => model.id === modelId)?.label ?? modelId;
}
