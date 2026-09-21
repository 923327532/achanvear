// app/(dashboard)/freelancer/interviews/page.tsx
import { Suspense } from "react";
import { InterviewsPage } from "@/features/interview/components/InterviewsPage";

export default function InterviewsRoute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A6B]" />
      </div>
    }>
      <InterviewsPage />
    </Suspense>
  );
}