export type NavItem = {
  title: string
  href: string
}

export type NavSection = NavItem & {
  items?: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Data Control",
    href: "/",
    items: [
      { title: "Repair Workflow", href: "/repair-flow" },
      { title: "Auto-Corrected Flow", href: "/autocorrected-flow" },
      { title: "Network Resolution", href: "/network-resolution" },
    ],
  },
  {
    title: "Liquidity Control",
    href: "/liquidity-dashboard",
    items: [
      { title: "Cash Flow", href: "/cash-flow" },
      { title: "Cash Pooling", href: "/cash-pooling" },
      { title: "Cash Sweeping", href: "/cash-sweeping" },
      { title: "Cash Reserves", href: "/cash-reserves" },
      { title: "Investments", href: "/investments" },
    ],
  },
  {
    title: "Fraud Control",
    href: "/fraud-control",
    items: [
      { title: "Anomaly Detection", href: "/fraud-control/anomaly-detection" },
    ],
  },
  {
    title: "Rules Management",
    href: "/configuration",
    items: [
      { title: "Configuration", href: "/rules-management/configure" },
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
