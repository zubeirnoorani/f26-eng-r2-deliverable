"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, Leaf, MapPin, PawPrint, RotateCcw, ShieldCheck, Utensils } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

const fieldPrompts = [
  { label: "Habitat", icon: MapPin, prompt: "What is the habitat of the snow leopard?" },
  { label: "Diet", icon: Utensils, prompt: "What do giant pandas eat, and how do they digest it?" },
  { label: "Conservation", icon: ShieldCheck, prompt: "Is the axolotl endangered, and what threatens it?" },
  { label: "Compare", icon: PawPrint, prompt: "Compare cheetah and pronghorn speeds." },
] as const;

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

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isWaiting]);

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
    setIsWaiting(true);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outgoingMessage }),
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
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
            Field prompts
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {fieldPrompts.map(({ label, icon: Icon, prompt }) => (
              <button
                key={label}
                type="button"
                disabled={isWaiting}
                onClick={() => void sendMessage(prompt)}
                className="group flex min-h-12 items-center gap-3 rounded-lg border border-[#bdd2c5] bg-[#f7faf8] px-3 py-2 text-left text-xs font-medium text-[#285444] transition hover:-translate-y-0.5 hover:border-[#7fa78f] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7257] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none"
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[#5d8a72] transition group-hover:text-[#be773e]"
                />
                {label}
              </button>
            ))}
          </div>

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
                {isWaiting ? "Consulting field notes" : "Guide online"}
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
              <div className="flex items-center gap-3" aria-label="Field guide is writing">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebe2]">
                  <Leaf aria-hidden="true" className="h-4 w-4 text-[#3c7459]" />
                </div>
                <div className="flex gap-1 rounded-xl rounded-tl-sm border border-[#d3e2d8] bg-white px-4 py-4 shadow-sm">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      aria-hidden="true"
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6c9480] motion-reduce:animate-none"
                      style={{ animationDelay: `${dot * 140}ms` }}
                    />
                  ))}
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
