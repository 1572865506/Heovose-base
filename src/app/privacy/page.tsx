import PrivacyContent from "./PrivacyContent";
import { Suspense } from 'react';

export default function RootPrivacyPage() {
  return (
    <Suspense fallback={null}>
      <PrivacyContent initialLocale="en" />
    </Suspense>
  );
}
