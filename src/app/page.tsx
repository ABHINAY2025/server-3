import type { Metadata } from "next"

import { DataControlDashboard } from "@/components/data-control/dashboard"
import { getDashboardView } from "@/lib/api/dashboard"

export const metadata: Metadata = {
  title: "Data Control",
}

export default async function DataControlPage() {
  const data = await getDashboardView()

  return <DataControlDashboard data={data} />
}
