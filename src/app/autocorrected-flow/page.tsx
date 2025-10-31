"use client"

import dynamic from "next/dynamic"
const WorkFlowTable = dynamic(() => import("@/components/WorkFlowTable"), { ssr: false })

import { WorkFlowWrapper } from "@/components/workflow/WorkFlowWrapper"

export default function AutocorrectedFlowPage() {
  return (
    <WorkFlowWrapper>
      <WorkFlowTable status="Auto Corrected" />
    </WorkFlowWrapper>
  )
}
