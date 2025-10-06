import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Network Resolution",
}

export default function NetworkResolutionPage() {
  return (
    <PagePlaceholder
      title="Network Resolution"
      description="Surface and resolve network-level data discrepancies. Visual diagnostics will be added soon."
    />
  )
}
