import type { Metadata } from "next"
import CashFlowTable from "@/components/cash-flow-table"

export const metadata: Metadata = {
  title: "Cash Flow",
}

export default function CashFlowPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cash Flow</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <CashFlowTable />
      </div>
    </div>
  )
}
