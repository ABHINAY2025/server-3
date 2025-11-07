import type { Metadata } from "next";
import FraudDashboardTable from "@/components/fraud-dashboard-table";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";
import "./fraud-dashboard.css";
 
export const metadata: Metadata = {
  title: "Fraud Control",
};
 
export default function FraudControlPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-card/50 via-card to-card/50 backdrop-blur-sm">
        <div className="relative flex flex-col gap-6 p-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-3 shadow-sm border border-destructive/20">
                <Shield className="h-6 w-6 text-destructive" strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Fraud Control
                  </h1>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Active Monitoring</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                  Monitor and manage fraud cases, AML alerts, and suspicious transactions in real-time. 
                  Stay protected with advanced detection and automated response systems.
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 pt-6">
        <div className="max-w-full">
          <FraudDashboardTable />
        </div>
      </div>
    </div>
  );
}
 