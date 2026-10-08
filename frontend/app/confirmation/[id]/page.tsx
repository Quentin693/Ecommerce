import { Suspense } from "react";
import ConfirmationClient from "./ConfirmationClient";

export const instant = false;

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] pt-28">
          <p className="text-center text-gray-500">Chargement…</p>
        </div>
      }
    >
      <ConfirmationClient bookingId={id} />
    </Suspense>
  );
}
