import type { Metadata } from "next"
import InvestmentSuggestions from "@/components/investment-suggestions"

export const metadata: Metadata = {
  title: "Investments",
}

export default function InvestmentsPage() {
  return <InvestmentSuggestions />
}
