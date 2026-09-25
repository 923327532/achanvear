// app/(dashboard)/company/chat/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatPage } from "@/features/chat/components/ChatPage";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") ?? undefined;

  return <ChatPage initialUserId={initialUserId} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500 sm:p-6 lg:p-8">Cargando...</div>}>
      <ChatContent />
    </Suspense>
  );
}
