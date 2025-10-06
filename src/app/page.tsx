import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Data Control",
}

export default function DataControlPage() {
  return (
    <PagePlaceholder
      title="Data Control"
      description="Monitor and manage enterprise data controls from a single workspace. Detailed workflows and insights will be available here."
    />
  )
}
