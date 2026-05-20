import { Suspense } from "react";
import { getServerLocale } from "@/lib/server-locale";
import AboutContent from "./AboutContent";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function AboutPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialLocale = await getServerLocale(resolvedSearchParams.lang);

  return (
    <Suspense fallback={null}>
      <AboutContent initialLocale={initialLocale} />
    </Suspense>
  );
}
