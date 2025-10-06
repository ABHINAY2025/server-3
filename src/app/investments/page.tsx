import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Investments",
}

export default function InvestmentsPage() {
  return (
    <PagePlaceholder
      title="Investments"
      description="Manage short-term investments and allocations. Performance and exposure analytics will land here."
    />
  )
}
