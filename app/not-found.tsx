import { FieldPage } from "@/components/global/field-page";
import { ArrowLeft, Map } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <FieldPage
      eyebrow="Field note 404"
      title="This trail ends here."
      description="The page you were looking for is not part of the current field map."
      contentClassName="flex items-center justify-center"
    >
      <div className="flex max-w-lg flex-col items-center text-center">
        <Map aria-hidden="true" className="h-10 w-10 text-[#4e7b66]" />
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25684b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1b523b]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Return to the station
        </Link>
      </div>
    </FieldPage>
  );
}
