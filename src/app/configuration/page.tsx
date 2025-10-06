import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Rules Management",
}

export default function ConfigurationPage() {
  return (
    <PagePlaceholder
      title="Rules Management"
      description="Manage configuration baselines and rule sets. Editing tools and publishing flows will be introduced here."
    />
  )
}
