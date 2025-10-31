import type { Metadata } from "next"

import RuleManagementPage from "@/components/rule-management-page"

export const metadata: Metadata = {
  title: "Rules Management",
}

export default function ConfigurationPage() {
  return (
    <RuleManagementPage />
  )
}

 