import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Fraud Control",
}

export default function FraudControlPage() {
  return (
    <PagePlaceholder
      title="Fraud Control"
      description="Consolidate fraud insights and mitigation actions. Detection metrics and workflows will display soon."
    />
  )
}
