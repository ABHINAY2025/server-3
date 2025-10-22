"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import type { DashboardResponse } from "@/lib/api/dashboard"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

type SummaryCard = {
  key: string
  title: string
  value: string
  badge: string
  badgeIcon?: "up" | "down"
  footnoteTitle: string
  footnoteValue: string
  footnoteDescription: string
}

type StatusDatum = {
  key: string
  label: string
  transactions: number
  amount: number
  percentage: number
  color: string
}

type TierDatum = {
  key: string
  label: string
  transactions: number
  amount: number
  percentage: number
  color: string
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`
}

export function DataControlDashboard({ data }: { data: DashboardResponse }) {
  const summaryCards: SummaryCard[] = [
    {
      key: "received",
      title: "Total Received",
      value: formatCurrency(
        data.transactionsReceivedView.transactionReceivedAmount
      ),
      badge: `${formatNumber(data.transactionsReceivedView.totalTransactions)} txns`,
      badgeIcon: "up",
      footnoteTitle: "Coverage",
      footnoteValue: formatPercent(data.transactionsReceivedView.percentage),
      footnoteDescription: "Captured inflow",
    },
    {
      key: "stp",
      title: "Straight Through Processing",
      value: formatCurrency(data.stpView.stpAmount),
      badge: `${formatNumber(data.stpView.stpTransactions)} STP`,
      badgeIcon: "up",
      footnoteTitle: "STP rate",
      footnoteValue: formatPercent(data.stpView.stpPercentage),
      footnoteDescription: "Zero-touch completions",
    },
    {
      key: "released",
      title: "Released Today",
      value: formatCurrency(data.transactionsReleasedView.releasedAmount),
      badge: `${formatNumber(data.transactionsReleasedView.releasedTransactions)} released`,
      badgeIcon: "up",
      footnoteTitle: "Release rate",
      footnoteValue: formatPercent(
        data.transactionsReleasedView.releasedPercentage
      ),
      footnoteDescription: "Cleared & settled",
    },
    {
      key: "hold",
      title: "On Hold",
      value: formatCurrency(data.onHoldView.onHoldAmount),
      badge: `${formatNumber(data.onHoldView.onHoldTransactions)} pending`,
      badgeIcon: data.onHoldView.onHoldPercentage > 2 ? "down" : "up",
      footnoteTitle: "Hold ratio",
      footnoteValue: formatPercent(data.onHoldView.onHoldPercentage),
      footnoteDescription: "Pending resolution",
    },
  ]

  const statusData: StatusDatum[] = [
    {
      key: "released",
      label: "Released",
      transactions: data.transactionsReleasedView.releasedTransactions,
      amount: data.transactionsReleasedView.releasedAmount,
      percentage: data.transactionsReleasedView.releasedPercentage,
      color: "var(--chart-1)",
    },
    {
      key: "approved",
      label: "Approved",
      transactions: data.approvedView.approvedTransactions,
      amount: data.approvedView.approvedAmount,
      percentage: data.approvedView.approvedPercentage,
      color: "var(--chart-2)",
    },
    {
      key: "autocorrected",
      label: "Auto-corrected",
      transactions: data.autocorrectedView.autocorrectedTransactions,
      amount: data.autocorrectedView.autocorrectedAmount,
      percentage: data.autocorrectedView.autocorrectedPercentage,
      color: "var(--chart-3)",
    },
    {
      key: "repair",
      label: "To Be Repaired",
      transactions: data.repairView.toBeRepairedTransactions,
      amount: data.repairView.toBeRepairedAmount,
      percentage: data.repairView.toBeRepairedPercentage,
      color: "var(--chart-4)",
    },
    {
      key: "onHold",
      label: "On Hold",
      transactions: data.onHoldView.onHoldTransactions,
      amount: data.onHoldView.onHoldAmount,
      percentage: data.onHoldView.onHoldPercentage,
      color: "var(--chart-5)",
    },
  ]

  const tierData: TierDatum[] = [
    {
      key: "tier1",
      label: "Tier 1",
      transactions: data.transactionValueView.tier1Transactions,
      amount: data.transactionValueView.tier1Amount,
      percentage: data.transactionValueView.tier1Percentage,
      color: "var(--chart-1)",
    },
    {
      key: "tier2",
      label: "Tier 2",
      transactions: data.transactionValueView.tier2Transactions,
      amount: data.transactionValueView.tier2Amount,
      percentage: data.transactionValueView.tier2Percentage,
      color: "var(--chart-2)",
    },
    {
      key: "tier3",
      label: "Tier 3",
      transactions: data.transactionValueView.tier3Transactions,
      amount: data.transactionValueView.tier3Amount,
      percentage: data.transactionValueView.tier3Percentage,
      color: "var(--chart-3)",
    },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SummaryCardGrid items={summaryCards} />
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <StatusDistributionCard data={statusData} />
            <TierCompositionCard
              data={tierData}
              totalAmount={data.transactionValueView.totalAmount}
              totalTransactions={data.transactionValueView.totalTransactions}
            />
          </div>
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <OnHoldCard data={data.onHoldView} />
            <RepairHealthCard data={data.repairView} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCardGrid({ items }: { items: SummaryCard[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {items.map((item) => (
        <Card key={item.key} className="@container/card">
          <CardHeader>
            <CardDescription>{item.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {item.badgeIcon === "up" ? (
                  <IconTrendingUp className="size-4" />
                ) : item.badgeIcon === "down" ? (
                  <IconTrendingDown className="size-4" />
                ) : null}
                {item.badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.footnoteTitle} {item.footnoteValue}
            </div>
            <div className="text-muted-foreground">{item.footnoteDescription}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function StatusDistributionCard({ data }: { data: StatusDatum[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Flow Distribution</CardTitle>
        <CardDescription>Transactions by current resolution state</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={{}}
          className="h-[280px] w-full"
        >
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatNumber(value as number)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  hideIndicator
                  hideLabel
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as StatusDatum | undefined
                    if (!payload) return null
                    return (
                      <div className="grid gap-1.5">
                        <span className="text-sm font-medium">
                          {payload.label}
                        </span>
                        <span className="text-foreground font-mono text-sm">
                          {formatNumber(value as number)} txns
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(payload.amount)} · {formatPercent(payload.percentage)}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="transactions" radius={[10, 10, 0, 0]}>
              {data.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="grid gap-3">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-baseline justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-2 font-medium">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(item.amount)} · {formatPercent(item.percentage)}
            </span>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}

function TierCompositionCard({
  data,
  totalAmount,
  totalTransactions,
}: {
  data: TierDatum[]
  totalAmount: number
  totalTransactions: number
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Value Composition</CardTitle>
        <CardDescription>Amount distribution across transaction tiers</CardDescription>
      </CardHeader>
      <CardContent className="relative flex items-center justify-center px-2 pt-6 sm:px-6">
        <div className="relative mx-auto aspect-square w-full max-w-xs">
          <ChartContainer config={{}} className="aspect-square h-full w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value, _name, item) => {
                      const payload = item?.payload as TierDatum | undefined
                      if (!payload) return null
                      return (
                        <div className="grid gap-1.5">
                          <span className="text-sm font-medium">
                            {payload.label}
                          </span>
                          <span className="text-foreground font-mono text-sm">
                            {formatCurrency(payload.amount)}
                          </span>
                          <span className="text-muted-foreground">
                            {formatNumber(payload.transactions)} txns · {formatPercent(payload.percentage)}
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="label"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={4}
                strokeWidth={3}
              >
                {data.map((item) => (
                  <Cell key={item.key} fill={item.color} stroke={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Value
            </span>
            <span className="text-xl font-semibold tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatNumber(totalTransactions)} txns
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid gap-3 text-sm sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.key} className="rounded-lg border p-3">
            <div className="flex items-center gap-2 font-medium">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
            <div className="mt-1 text-muted-foreground">
              {formatCurrency(item.amount)}
            </div>
            <div className="text-muted-foreground">
              {formatNumber(item.transactions)} txns · {formatPercent(item.percentage)}
            </div>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}

function OnHoldCard({
  data,
}: {
  data: DashboardResponse["onHoldView"]
}) {
  const releasedRatio =
    data.totalTransactions === 0
      ? 0
      : (data.releasedTransactions / data.totalTransactions) * 100

  const onHoldRatio =
    data.totalTransactions === 0
      ? 0
      : (data.onHoldTransactions / data.totalTransactions) * 100

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>On Hold Overview</CardTitle>
        <CardDescription>Contrast pending items against released volume</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Pending review</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(data.onHoldAmount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(data.onHoldTransactions)} txns · {formatPercent(data.onHoldPercentage)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Released counterpart</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(data.releasedAmount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(data.releasedTransactions)} txns · {formatPercent(data.releasedPercentage)}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <ProgressRow
            label="Released"
            value={releasedRatio}
            color="var(--chart-1)"
          />
          <ProgressRow
            label="On Hold"
            value={onHoldRatio}
            color="var(--chart-5)"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function RepairHealthCard({
  data,
}: {
  data: DashboardResponse["repairView"]
}) {
  const total = data.totalTransactions || 1

  const stages = [
    {
      key: "approved",
      label: "Approved",
      value: data.approvedTransactions,
      amount: data.approvedAmount,
      percentage: data.approvedPercentage,
      color: "var(--chart-1)",
    },
    {
      key: "auto",
      label: "Auto-corrected",
      value: data.autoCorrectedTransactions,
      amount: data.autoCorrectedAmount,
      percentage: data.autoCorrectedPercentage,
      color: "var(--chart-3)",
    },
    {
      key: "repair",
      label: "To repair",
      value: data.toBeRepairedTransactions,
      amount: data.toBeRepairedAmount,
      percentage: data.toBeRepairedPercentage,
      color: "var(--chart-4)",
    },
  ]

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Repair Pipeline Health</CardTitle>
        <CardDescription>Track throughput across remediation stages</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total under repair</p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data.totalAmount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(data.totalTransactions)} txns
          </p>
        </div>
        <div className="space-y-3">
          {stages.map((stage) => (
            <ProgressRow
              key={stage.key}
              label={`${stage.label} · ${formatPercent(stage.percentage)}`}
              value={(stage.value / total) * 100}
              color={stage.color}
              caption={`${formatNumber(stage.value)} txns · ${formatCurrency(stage.amount)}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressRow({
  label,
  value,
  color,
  caption,
}: {
  label: string
  value: number
  color: string
  caption?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {percentFormatter.format(Math.min(value, 100))}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, value)}%`,
            background: color,
          }}
        />
      </div>
      {caption ? (
        <div className="text-xs text-muted-foreground">{caption}</div>
      ) : null}
    </div>
  )
}
