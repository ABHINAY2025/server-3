import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Liquidity Control",
}

export default function LiquidityDashboardPage() {
  return (
    <PagePlaceholder
      title="Liquidity Control"
      description="Centralize cash positions and liquidity signals. KPI dashboards and drill-downs will live here."
    />
  )
}
