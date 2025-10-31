"use client"

import dynamic from "next/dynamic"
const WorkFlowTable = dynamic(() => import("@/components/WorkFlowTable"), { ssr: false })

export default function RepairWorkflowPage() {
  return <WorkFlowTable status="To Be Repaired" />
}
