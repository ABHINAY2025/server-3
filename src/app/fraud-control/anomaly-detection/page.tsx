import type { Metadata } from "next"
import AnomalyDetectionTable from "@/components/anomaly-detection-table"

export const metadata: Metadata = {
  title: "Anomaly Detection",
}

export default function AnomalyDetectionPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suspicious Transactions</h1>
          <p className="text-muted-foreground">
            Analyze if the transaction is Suspicious or not
          </p>
        </div>
      </div>
      <div className="flex-1">
        <AnomalyDetectionTable />
      </div>
    </div>
  )
}
