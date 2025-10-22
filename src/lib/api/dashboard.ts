import { apiFetch, type ApiRequestInit } from "./client"

export type StpView = {
  totalTransactions: number
  stpTransactions: number
  stpAmount: number
  stpPercentage: number
}

export type TransactionsReceivedView = {
  totalTransactions: number
  transactionReceivedAmount: number
  percentage: number
}

export type TransactionsReleasedView = {
  totalTransactions: number
  releasedTransactions: number
  releasedAmount: number
  releasedPercentage: number
}

export type OnHoldView = {
  totalTransactions: number
  totalAmount: number
  onHoldTransactions: number
  onHoldAmount: number
  onHoldPercentage: number
  releasedTransactions: number
  releasedAmount: number
  releasedPercentage: number
}

export type ApprovedView = {
  totalTransactions: number
  totalAmount: number
  approvedTransactions: number
  approvedAmount: number
  approvedPercentage: number
}

export type AutocorrectedView = {
  totalTransactions: number
  autocorrectedTransactions: number
  autocorrectedAmount: number
  autocorrectedPercentage: number
}

export type RepairView = {
  totalTransactions: number
  totalAmount: number
  toBeRepairedTransactions: number
  toBeRepairedAmount: number
  toBeRepairedPercentage: number
  autoCorrectedTransactions: number
  autoCorrectedAmount: number
  autoCorrectedPercentage: number
  approvedTransactions: number
  approvedAmount: number
  approvedPercentage: number
}

export type TransactionValueView = {
  totalTransactions: number
  totalAmount: number
  tier1Transactions: number
  tier1Amount: number
  tier1Percentage: number
  tier2Transactions: number
  tier2Amount: number
  tier2Percentage: number
  tier3Transactions: number
  tier3Amount: number
  tier3Percentage: number
}

export type DashboardResponse = {
  stpView: StpView
  transactionsReceivedView: TransactionsReceivedView
  transactionsReleasedView: TransactionsReleasedView
  onHoldView: OnHoldView
  approvedView: ApprovedView
  autocorrectedView: AutocorrectedView
  repairView: RepairView
  transactionValueView: TransactionValueView
}

export async function getDashboardView(init?: ApiRequestInit) {
  return apiFetch<DashboardResponse>("/api/views/dashboard", init)
}
