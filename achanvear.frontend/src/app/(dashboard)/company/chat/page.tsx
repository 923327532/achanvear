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
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Cargando...</div>}>
      <ChatContent />
    </Suspense>
  );
}