export const speciesChatModels = [
  {
    id: "claude-haiku-4-5-20251001",
    label: "Haiku 4.5",
    description: "Fastest · lowest cost",
  },
  {
    id: "claude-sonnet-5",
    label: "Sonnet 5",
    description: "More depth · still efficient",
  },
] as const;

export type SpeciesChatModel = (typeof speciesChatModels)[number]["id"];

export const defaultSpeciesChatModel: SpeciesChatModel = "claude-haiku-4-5-20251001";
