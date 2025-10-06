import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Cash Flow",
}

export default function CashFlowPage() {
  return (
    <PagePlaceholder
      title="Cash Flow"
      description="Analyze inflows and outflows across entities. Interactive charts and forecasts will appear shortly."
    />
  )
}
