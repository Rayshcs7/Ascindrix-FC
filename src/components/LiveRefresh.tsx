"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the page every few seconds while a match is live.
export default function LiveRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
