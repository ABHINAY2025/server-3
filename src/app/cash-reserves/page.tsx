import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Cash Reserves",
}

export default function CashReservesPage() {
  return (
    <PagePlaceholder
      title="Cash Reserves"
      description="Assess reserve levels and policy compliance. Balance details and trends will surface soon."
    />
  )
}
