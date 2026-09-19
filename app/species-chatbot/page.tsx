"use client";

import { Button } from "@/components/ui/button";
import { defaultSpeciesChatModel, speciesChatModels, type SpeciesChatModel } from "@/lib/species-chat-models";
import { ArrowUp, Leaf, MapPin, PawPrint, RotateCcw, ShieldCheck, Utensils } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

const fieldPrompts = [
  { label: "Snow leopard habitat", icon: MapPin, prompt: "What is the habitat of the snow leopard?" },
  { label: "Giant panda diet", icon: Utensils, prompt: "What do giant pandas eat, and how do they digest it?" },
  { label: "Axolotl conservation", icon: ShieldCheck, prompt: "Is the axolotl endangered, and what threatens it?" },
  { label: "Cheetah vs. pronghorn", icon: PawPrint, prompt: "Compare cheetah and pronghorn speeds." },
] as const;

const topicResearchSteps = [
  {
    pattern: /habitat|live|range|found|biome|region|where/i,
    steps: ["Mapping the species’ natural range…", "Connecting climate, terrain, and shelter…"],
  },
  {
    pattern: /diet|eat|food|prey|hunt|feed/i,
    steps: ["Tracing the food web…", "Checking feeding behavior and adaptations…"],
  },
  {
    pattern: /endanger|conservation|threat|extinct|population|iucn/i,
    steps: ["Checking conservation records…", "Reviewing threats and protection efforts…"],
  },
  {
    pattern: /compare|versus|\bvs\.?\b|difference|faster|speed/i,
    steps: ["Lining up the species side by side…", "Comparing their adaptations and abilities…"],
  },
  {
    pattern: /behavior|behaviour|adapt|communicat|social|mate/i,
    steps: ["Reviewing observed behavior…", "Connecting behavior to survival…"],
  },
] as const;

function createResearchSteps(prompt: string): string[] {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();
  const excerpt = normalizedPrompt.length > 48 ? `${normalizedPrompt.slice(0, 48).trimEnd()}…` : normalizedPrompt;
  const matchedSteps = topicResearchSteps.flatMap(({ pattern, steps }) => (pattern.test(prompt) ? steps : []));
  const subjectSteps =
    matchedSteps.length > 0
      ? matchedSteps
      : ["Identifying the species and key facts…", "Checking the ecological context…"];

  return [
    `Opening field notes for “${excerpt}”`,
    ...new Set(subjectSteps),
    "Writing a clear field guide answer…",
  ].slice(0, 5);
}

function readResponse(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("response" in value)) return null;
  return typeof value.response === "string" ? value.response : null;
}

export default function SpeciesChatbot() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<SpeciesChatModel>(defaultSpeciesChatModel);
  const [researchSteps, setResearchSteps] = useState<string[]>(["Opening the field guide…"]);
  const [researchStepIndex, setResearchStepIndex] = useState(0);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isWaiting, researchStepIndex]);

  useEffect(() => {
    if (!isWaiting || researchSteps.length < 2) return;

    const interval = window.setInterval(() => {
      setResearchStepIndex((current) => (current + 1) % researchSteps.length);
    }, 1_600);

    return () => window.clearInterval(interval);
  }, [isWaiting, researchSteps]);

  const resizeInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  };

  const resetInputHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const sendMessage = async (suggestedMessage?: string) => {
    const outgoingMessage = (suggestedMessage ?? message).trim();
    if (outgoingMessage.length === 0 || isWaiting) return;

    setError(null);
    setMessage("");
    resetInputHeight();
    setChatLog((current) => [...current, { role: "user", content: outgoingMessage }]);
    setResearchSteps(createResearchSteps(outgoingMessage));
    setResearchStepIndex(0);
    setIsWaiting(true);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outgoingMessage, model: selectedModel }),
      });
      const body: unknown = await result.json();
      const response = readResponse(body);

      if (response === null) throw new Error("Invalid chat response");

      setChatLog((current) => [...current, { role: "bot", content: response }]);
    } catch {
      setError("The field guide could not answer. Check your connection and try again.");
    } finally {
      setIsWaiting(false);
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="mx-auto max-w-6xl text-[#173d35]">
      <header className="relative overflow-hidden rounded-t-2xl bg-[#123d36] px-6 py-8 text-[#ecf6ee] sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#78a994]/30"
        />
        <div
          aria-hidden="true"
          className="absolute -right-6 -top-10 h-40 w-40 rounded-full border border-[#78a994]/35"
        />
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#abd2bc]">
            <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
            Field station / Ask the atlas
          </p>
          <h1 className="mt-4 font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
            A field guide that talks back.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#c8ddd0] sm:text-base">
            Ask about an animal’s habitat, diet, behavior, adaptations, taxonomy, or conservation story.
          </p>
        </div>
      </header>

      <div className="grid overflow-hidden rounded-b-2xl border border-t-0 border-[#c8dbd0] bg-[#eef5f1] shadow-[0_20px_55px_-35px_rgba(14,60,50,0.55)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-[#c8dbd0] bg-[#dfece5] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">Answer model</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {speciesChatModels.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  disabled={isWaiting}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedModel(model.id)}
                  className={`rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7257] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${
                    isSelected
                      ? "border-[#3f7a5e] bg-[#f8fbf9] shadow-sm"
                      : "border-[#bdd2c5] bg-[#e9f2ed] hover:border-[#7fa78f] hover:bg-[#f4f8f5]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#285444]">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${isSelected ? "bg-[#bf7138]" : "bg-[#9ab4a6]"}`}
                    />
                    {model.label}
                  </span>
                  <span className="mt-1 block pl-4 text-[11px] leading-4 text-[#60796e]">{model.description}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-[#60796e]">
            Haiku keeps routine questions inexpensive. Choose Sonnet when you want more nuance.
          </p>

          <div className="mt-5 border-t border-[#bdd2c5] pt-5 lg:mt-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
              Guide scope
            </p>
            <p className="mt-2 text-xs leading-5 text-[#527064]">
              Wildlife and species questions only. For changing conservation assessments, verify the latest IUCN record.
            </p>
          </div>
        </aside>

        <section className="flex min-h-[560px] min-w-0 flex-col bg-[#f8fbf9]" aria-label="Species chat">
          <div className="flex min-h-14 items-center justify-between border-b border-[#d5e3da] px-5 py-3 sm:px-7">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isWaiting ? "animate-pulse bg-[#d69b43]" : "bg-[#4d9a6e]"}`} />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#547466]">
                {isWaiting
                  ? "Research in progress"
                  : `${speciesChatModels.find((model) => model.id === selectedModel)?.label} online`}
              </span>
            </div>
            {chatLog.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isWaiting}
                onClick={() => {
                  setChatLog([]);
                  setError(null);
                }}
                className="h-8 gap-2 px-2 text-xs text-[#557467] hover:bg-[#e4efe8] hover:text-[#234d3e]"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Clear notes
              </Button>
            )}
          </div>

          <div className="border-b border-[#d5e3da] bg-[#f0f6f2] px-5 py-3 sm:px-7">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#688277]">
              Suggested questions
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {fieldPrompts.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  type="button"
                  disabled={isWaiting}
                  onClick={() => void sendMessage(prompt)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-[#bdd2c5] bg-white px-3 py-2 text-xs font-medium text-[#285444] transition hover:border-[#7fa78f] hover:bg-[#e4efe8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7257] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 text-[#bf7138]" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            role="log"
            aria-live="polite"
            aria-busy={isWaiting}
            className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-7 sm:px-7"
          >
            {chatLog.length === 0 ? (
              <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#b9d1c2] bg-[#e4efe8]">
                  <PawPrint aria-hidden="true" className="h-7 w-7 text-[#46745e]" />
                </div>
                <h2 className="mt-5 font-serif text-2xl font-normal text-[#204b3d]">What have you spotted?</h2>
                <p className="mt-2 text-sm leading-6 text-[#60796e]">
                  Name an animal or choose a field prompt. Specific questions get the most useful notes.
                </p>
              </div>
            ) : (
              chatLog.map((entry, index) => (
                <article
                  key={`${entry.role}-${index}`}
                  className={`flex gap-3 ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {entry.role === "bot" && (
                    <div className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcebe2]">
                      <Leaf aria-hidden="true" className="h-4 w-4 text-[#3c7459]" />
                    </div>
                  )}
                  <div className={`max-w-[88%] sm:max-w-[76%] ${entry.role === "user" ? "text-right" : "text-left"}`}>
                    <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6c8379]">
                      {entry.role === "user" ? "You" : "Field guide"}
                    </p>
                    <div
                      className={`rounded-xl px-4 py-3 text-left text-sm leading-6 shadow-sm ${
                        entry.role === "user"
                          ? "rounded-tr-sm bg-[#1f5b49] text-white"
                          : "rounded-tl-sm border border-[#d3e2d8] bg-white text-[#294d40]"
                      } [&_a]:underline [&_li]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p:not(:first-child)]:mt-3 [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc`}
                    >
                      <ReactMarkdown>{entry.content}</ReactMarkdown>
                    </div>
                  </div>
                </article>
              ))
            )}

            {isWaiting && (
              <div className="flex items-start gap-3" role="status" aria-label="Field guide research progress">
                <div className="mt-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebe2]">
                  <Leaf aria-hidden="true" className="h-4 w-4 text-[#3c7459]" />
                </div>
                <div className="max-w-[88%] sm:max-w-[76%]">
                  <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6c8379]">
                    Field guide · working
                  </p>
                  <div className="min-w-[230px] rounded-xl rounded-tl-sm border border-[#d3e2d8] bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-medium text-[#365d4d]">{researchSteps[researchStepIndex]}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e1ece5]">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-[#6f9d83] motion-reduce:animate-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={logEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#d5e3da] bg-white p-4 sm:p-5">
            {error && (
              <p role="alert" className="mb-3 text-sm font-medium text-[#a14536]">
                {error}
              </p>
            )}
            <div className="flex items-end gap-3 rounded-xl border border-[#bcd2c5] bg-[#f8fbf9] p-2 shadow-[0_8px_25px_-20px_rgba(14,60,50,0.8)] focus-within:border-[#4e896c] focus-within:ring-2 focus-within:ring-[#4e896c]/20">
              <textarea
                ref={textareaRef}
                value={message}
                disabled={isWaiting}
                maxLength={1_000}
                rows={1}
                onChange={(event) => setMessage(event.target.value)}
                onInput={resizeInput}
                onKeyDown={handleKeyDown}
                placeholder={isWaiting ? "The guide is checking its notes…" : "Ask about a species…"}
                aria-label="Species question"
                className="max-h-36 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-6 text-[#183f33] outline-none placeholder:text-[#7b9187] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isWaiting || message.trim().length === 0}
                aria-label="Send question"
                className="h-10 w-10 shrink-0 rounded-lg bg-[#bf7138] p-0 text-white hover:bg-[#a95e2a]"
              >
                <ArrowUp aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#7a9086]">
              <span>Enter to send · Shift + Enter for a new line</span>
              <span className="tabular-nums">{message.length}/1000</span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
