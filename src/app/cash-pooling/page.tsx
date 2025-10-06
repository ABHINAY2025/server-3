import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Cash Pooling",
}

export default function CashPoolingPage() {
  return (
    <PagePlaceholder
      title="Cash Pooling"
      description="Design and monitor pooling structures. Allocation, sweeps, and alerts will be configured here."
    />
  )
}
