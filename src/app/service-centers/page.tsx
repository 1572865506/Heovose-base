import { Suspense } from "react";
import { getServerLocale } from "@/lib/server-locale";
import ServiceCentersContent from "./ServiceCentersContent";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function ServiceCentersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialLocale = await getServerLocale(resolvedSearchParams.lang);

  return (
    <Suspense fallback={null}>
      <ServiceCentersContent initialLocale={initialLocale} />
    </Suspense>
  );
}
