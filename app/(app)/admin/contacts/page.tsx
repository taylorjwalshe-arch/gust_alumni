import { Suspense } from "react";
import ContactsClient from "@/components/admin/ContactsClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ContactsClient />
    </Suspense>
  );
}
