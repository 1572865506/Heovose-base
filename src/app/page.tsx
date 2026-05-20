import { Suspense } from "react";
import { getServerLocale } from "@/lib/server-locale";
import HomeContent from "./HomeContent";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialLocale = await getServerLocale(resolvedSearchParams.lang);

  return (
    <Suspense fallback={<main className="relative min-h-screen" />}>
      <HomeContent initialLocale={initialLocale} />
    </Suspense>
  );
}
