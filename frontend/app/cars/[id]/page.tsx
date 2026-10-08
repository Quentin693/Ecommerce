import { Suspense } from "react";
import CarDetailClient from "./CarDetailClient";
import { Skeleton } from "@/components/ui/LoadingSkeleton";

export const instant = false;

function CarDetailFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 px-4">
      <div className="max-w-7xl mx-auto py-10">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Skeleton className="h-[480px] rounded-2xl mb-4" />
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarDetailPage() {
  return (
    <Suspense fallback={<CarDetailFallback />}>
      <CarDetailClient />
    </Suspense>
  );
}
