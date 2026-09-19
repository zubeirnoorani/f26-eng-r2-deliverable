import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[#eef5f1] text-[#173d35]">
      <div className="text-center" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dfece5]">
          <Leaf aria-hidden="true" className="h-6 w-6 animate-pulse text-[#39715a] motion-reduce:animate-none" />
        </span>
        <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#517765]">
          Opening field notes…
        </p>
      </div>
    </div>
  );
}
