import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import { Suspense } from "react";
import ServiceCentersContent from "./ServiceCentersContent";

export default async function ServiceCentersPage() {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'en';

  return (
    <Suspense fallback={null}>
      <ServiceCentersContent initialLocale={initialLocale} />
    </Suspense>
  );
}
