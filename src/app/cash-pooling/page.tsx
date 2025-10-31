import type { Metadata } from "next"

import PoolingTable from "@/components/pooling-table"

export const metadata: Metadata = {
  title: "Cash Pooling",
}

export default function CashPoolingPage() {
  return <PoolingTable />
}
