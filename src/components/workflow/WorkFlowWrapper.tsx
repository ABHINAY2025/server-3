"use client"

import { FC, ReactNode } from "react"

interface WorkFlowWrapperProps {
  children: ReactNode
}

export const WorkFlowWrapper: FC<WorkFlowWrapperProps> = ({ children }) => {
  return (
    <div className="flex h-full flex-col space-y-4 p-4 md:p-8">
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {children}
      </div>
    </div>
  )
}