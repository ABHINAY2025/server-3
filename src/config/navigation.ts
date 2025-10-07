import type { LucideIcon } from "lucide-react"

import {
  ArrowLeftRight,
  Brush,
  Database,
  Layers,
  LayoutDashboard,
  LineChart,
  Network,
  PiggyBank,
  ScanSearch,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon?: LucideIcon
}

export type NavSection = NavItem & {
  items?: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Data Control",
    href: "/",
    icon: Database,
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Repair Workflow", href: "/repair-flow", icon: Wrench },
      { title: "Auto-Corrected Flow", href: "/autocorrected-flow", icon: Sparkles },
      { title: "Network Resolution", href: "/network-resolution", icon: Network },
    ],
  },
  {
    title: "Liquidity Control",
    href: "/liquidity-dashboard",
    icon: PiggyBank,
    items: [
      { title: "Dashboard", href: "/liquidity-dashboard", icon: LayoutDashboard },
      { title: "Cash Flow", href: "/cash-flow", icon: ArrowLeftRight },
      { title: "Cash Pooling", href: "/cash-pooling", icon: Layers },
      { title: "Cash Sweeping", href: "/cash-sweeping", icon: Brush },
      { title: "Cash Reserves", href: "/cash-reserves", icon: ShieldCheck },
      { title: "Investments", href: "/investments", icon: LineChart },
    ],
  },
  {
    title: "Fraud Control",
    href: "/fraud-control",
    icon: ShieldAlert,
    items: [
      { title: "Dashboard", href: "/fraud-control", icon: LayoutDashboard },
      { title: "Anomaly Detection", href: "/fraud-control/anomaly-detection", icon: ScanSearch },
    ],
  },
  {
    title: "Rules Management",
    href: "/configuration",
    icon: Settings2,
    items: [
      { title: "Configuration", href: "/rules-management/configure", icon: SlidersHorizontal },
    ],
  },
]

export const ROUTE_TITLES = NAV_SECTIONS.reduce<Record<string, string>>(
  (acc, section) => {
    acc[section.href] = section.title
    section.items?.forEach((item) => {
      acc[item.href] = item.title
    })
    return acc
  },
  {
    "/dashboard": "Dashboard",
  }
)
