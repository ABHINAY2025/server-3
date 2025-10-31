import type { Metadata } from "next";
import FraudDashboardTable from "@/components/fraud-dashboard-table";
import "./fraud-dashboard.css";
 
export const metadata: Metadata = {
  title: "Fraud Control",
};
 
export default function FraudControlPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fraud Control</h1>
          <p className="text-muted-foreground">
            Monitor and manage fraud cases, AML alerts, and suspicious transactions
          </p>
        </div>
      </div>
      <div className="flex-1">
        <FraudDashboardTable />
      </div>
    </div>
  );
}
 