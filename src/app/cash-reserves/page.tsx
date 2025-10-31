import type { Metadata } from "next"
import ReservesTable from "@/components/reserves-table"

export const metadata: Metadata = {
  title: "Cash Reserves",
}

export default function CashReservesPage() {
  return <ReservesTable />
}
