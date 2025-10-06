import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Anomaly Detection",
}

export default function AnomalyDetectionPage() {
  return (
    <PagePlaceholder
      title="Anomaly Detection"
      description="Investigate suspicious transactions and model outputs. Alerts and review queues will be added soon."
    />
  )
}
