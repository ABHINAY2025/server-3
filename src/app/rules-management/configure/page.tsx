import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Configuration",
}

export default function RulesConfigurationPage() {
  return (
    <PagePlaceholder
      title="Configuration"
      description="Configure rule parameters, approvals, and deployment pipelines. Detailed editors will be available here."
    />
  )
}
