import { cookies } from "next/headers";
import { Locale } from "@/lib/translations";
import { Suspense } from "react";
import AboutContent from "./AboutContent";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'en';

  return (
    <Suspense fallback={null}>
      <AboutContent initialLocale={initialLocale} />
    </Suspense>
  );
}
