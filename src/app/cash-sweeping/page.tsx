import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Cash Sweeping",
}

export default function CashSweepingPage() {
  return (
    <PagePlaceholder
      title="Cash Sweeping"
      description="Configure sweep rules and review execution history. Automation tools will populate this workspace."
    />
  )
}
