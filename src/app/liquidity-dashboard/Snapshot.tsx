
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Box, Typography, Select } from "@mui/material";
import moment from "moment-timezone";
import isEqual from "lodash/isEqual";

import AreaChartContainer from "../../components/charts/AreaChartContainer";
import BarChart from "../../components/charts/BarChart";
import SunburstChart from "../../components/charts/SunburstChart";
import {
  overviewDataSSE,
  fetchOverviewDataOptimized,
} from "../../lib/api/liquidity"; 
import InsightCarousel from "../../components/ui/InsightCarousel";
import {
  AIInsightCard,
  LiquidityLevelCard,
  RiskAssessmentCard,
  MarketTrendsCard,
} from "../../components/ui/InsightCards";

const { Option } = Select;

// Type definitions
interface HourlyCombinedData {
  time: string;
  inflow: number;
  outflow: number;
}

interface CashOutflowGroup {
  name: string;
  value: number;
  children?: CashOutflowGroup[];
}

interface LiquidityLevel {
  liquidityLevel?: string;
  thresholdLimit?: string;
  liquidityThreshold?: string;
  confidence?: string;
  [key: string]: string | undefined; // All other keys must be strings or undefined
}

interface MarketTrend {
  trend: "Bullish" | "Bearish" | "Neutral";
  change: string;
}

interface RiskAssessment {
  riskLevel: "Low" | "Medium" | "High" | "Unknown";
  riskScore: number;
}

interface OverviewData {
  netCashFlow?: number;
  cashInflows?: { hourlyInflows?: Record<string, number> };
  cashOutflows?: { hourlyOutflows?: Record<string, number>; outflowGroups?: CashOutflowGroup[] };
  predictionResponse?: LiquidityLevel[];
  [key: string]: number | { hourlyInflows?: Record<string, number> } | { hourlyOutflows?: Record<string, number>; outflowGroups?: CashOutflowGroup[] } | LiquidityLevel[] | undefined;
}

const Snapshot: React.FC = () => {
  const [chartData, setChartData] = useState<CashOutflowGroup[]>([]);
  const [hourlyCombined, setHourlyCombined] = useState<HourlyCombinedData[]>([]);
  const [netCashFlow, setNetCashFlow] = useState<number | null>(null);
  const [liquidityLevel, setLiquidityLevel] = useState<LiquidityLevel | null>(null);

  const [timeOpen, setTimeOpen] = useState<string>("");
  const [timeClose, setTimeClose] = useState<string>("");

  const lastDataRef = useRef<OverviewData | null>(null);

  const marketTrend: MarketTrend = useMemo(() => {
    if (netCashFlow === null) return { trend: "Neutral", change: "0.0%" };

    const trend: MarketTrend["trend"] = netCashFlow >= 0 ? "Bullish" : "Bearish";
    const absValue = Math.abs(netCashFlow);
    const changePercentage = absValue > 0 ? ((absValue / 1000000) * 100).toFixed(1) : "0.0";
    const change = netCashFlow >= 0 ? `+${changePercentage}` : `-${changePercentage}`;

    return { trend, change };
  }, [netCashFlow]);

  const riskAssessment: RiskAssessment = useMemo(() => {
    const currentLevelStr =
      liquidityLevel?.liquidityLevel || liquidityLevel?.liquidityLevel;
    const thresholdStr =
      liquidityLevel?.thresholdLimit || liquidityLevel?.liquidityThreshold;
    const confidenceStr = liquidityLevel?.confidence;

    if (!currentLevelStr || !thresholdStr) {
      return { riskLevel: "Unknown", riskScore: 50 };
    }

    const currentLevel = parseFloat(currentLevelStr);
    const threshold = parseFloat(thresholdStr);
    const confidence = confidenceStr ? parseFloat(confidenceStr) : 0.8;


    if (isNaN(currentLevel) || isNaN(threshold) || threshold === 0) {
      return { riskLevel: "Unknown", riskScore: 50 };
    }

    const ratio = currentLevel / threshold;

    let riskLevel: RiskAssessment["riskLevel"];
    if (ratio >= 1.2) riskLevel = "Low";
    else if (ratio >= 1.0) riskLevel = "Low";
    else if (ratio >= 0.8) riskLevel = "Medium";
    else riskLevel = "High";

    return { riskLevel, riskScore: confidence };
  }, [liquidityLevel]);

  const processData = (data: OverviewData) => {
    if (isEqual(lastDataRef.current, data)) return;
    lastDataRef.current = data;

    setNetCashFlow(
      Number(data?.predictionResponse?.[0]?.netCashflow ?? data?.netCashFlow ?? 0)
    );
    setLiquidityLevel(data.predictionResponse?.[0] ?? {});

    const inflows = data.cashInflows?.hourlyInflows || {};
    const outflows = data.cashOutflows?.hourlyOutflows || {};
    const times = Array.from(new Set([...Object.keys(inflows), ...Object.keys(outflows)])).sort();
    const hourlyCombinedData: HourlyCombinedData[] = times.map((time) => ({
      time,
      inflow: inflows[time] || 0,
      outflow: outflows[time] || 0,
    }));
    setHourlyCombined(hourlyCombinedData);

    setChartData(data.cashOutflows?.outflowGroups ?? []);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment.utc();
      const openTime = moment.utc().startOf("day").add(9, "hours");
      const closeTime = moment.utc().startOf("day").add(17, "hours");

      if (now.isBefore(openTime)) {
        setTimeOpen("0 hours, 0 minutes, 0 seconds");
        setTimeClose("0 hours, 0 minutes, 0 seconds");
      } else if (now.isAfter(closeTime)) {
        setTimeOpen("8 hours, 0 minutes, 0 seconds");
        setTimeClose("0 hours, 0 minutes, 0 seconds");
      } else {
        const durationOpen = moment.duration(now.diff(openTime));
        const durationClose = moment.duration(closeTime.diff(now));

        setTimeOpen(
          `${Math.max(0, durationOpen.hours())} hours, ${Math.max(0, durationOpen.minutes())} minutes, ${Math.max(
            0,
            durationOpen.seconds()
          )} seconds`
        );

        setTimeClose(
          `${Math.max(0, durationClose.hours())} hours, ${Math.max(
            0,
            durationClose.minutes()
          )} minutes, ${Math.max(0, durationClose.seconds())} seconds`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  let es: EventSource | undefined;
  let retryTimeout: NodeJS.Timeout;
  let isSSESetup = false;

  const setupSSE = () => {
    if (isSSESetup) return;
    isSSESetup = true;

    es = overviewDataSSE(
      (data: OverviewData) => {
        try {
          processData(data);
        } catch (err: unknown) {
          console.error("Error processing SSE data:", err);
        }
      },
      () => {
        console.log("SSE connection established");
      },
      (error: Event) => {
        console.warn("SSE connection error:", error);
        isSSESetup = false;
        retryTimeout = setTimeout(() => setupSSE(), 5000);
      }
    );
  };

  fetchOverviewDataOptimized()
    .then((response: { data?: OverviewData[] | OverviewData; error?: unknown }) => {
      if (response?.data && !response.error) {
        const dataToProcess = Array.isArray(response.data) ? response.data[0] : response.data;
        processData(dataToProcess);
        setupSSE();
      }
    })
    .catch((error: unknown) =>
      console.error("Failed to fetch initial overview data:", error)
    );

  return () => {
    isSSESetup = false;
    if (es) es.close();
    if (retryTimeout) clearTimeout(retryTimeout);
  };
}, []);


  const memoizedHourlyCombined = useMemo(() => hourlyCombined, [hourlyCombined]);
  const memoizedChartData = useMemo(() => chartData, [chartData]);
  const memoizedLiquidityLevel = useMemo(() => liquidityLevel, [liquidityLevel]);

  return (
    <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", color: "white", position: "relative", overflow: "hidden", p: 2, gap: 2 }}>
      <Box sx={{ flexShrink: 0, height: "110px", position: "relative", zIndex: 1 }}>
        <InsightCarousel
          items={[
            <AIInsightCard key="ai" netCashFlow={netCashFlow} title="AI Insight: Projected Net Cash Flow (Today)" />,
            <LiquidityLevelCard key="liq" liquidityLevel={memoizedLiquidityLevel} BarChart={BarChart} />,
            <RiskAssessmentCard key="risk" riskLevel={riskAssessment.riskLevel} riskScore={riskAssessment.riskScore} />,
            <MarketTrendsCard key="market" trend={marketTrend.trend} change={marketTrend.change} />,
          ]}
          autoPlayDelay={6000}
          showIndicators
          showNavigation
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0, position: "relative", zIndex: 1 }}>
        <Box sx={{ flex: 1, background: "linear-gradient(135deg, rgba(245, 245, 245, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)", backdropFilter: "blur(10px)", borderRadius: 3, border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25), inset 1px 1px 5px rgba(255, 255, 255, 0.1)", borderColor: "rgba(66, 165, 245, 0.3)" } }}>
          <Box sx={{ p: 2, pb: 1, borderBottom: "1px solid rgba(255, 255, 255, 0.1)", background: "linear-gradient(90deg, rgba(223, 129, 22, 0.1) 0%, rgba(187, 154, 102, 0.05) 100%)" }}>
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600,color: "rgba(30, 58, 95, 0.95)", display: "flex", alignItems: "center", gap: 1 }}>
              Hourly Liquidity Forecast
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1, minHeight: 0 }}>
            <AreaChartContainer data={memoizedHourlyCombined} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, background: "linear-gradient(135deg, rgba(245, 245, 245, 0.95) 0%, rgba(245, 245, 245, 0.95) 100%)", backdropFilter: "blur(10px)", borderRadius: 3, border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25), inset 1px 1px 5px rgba(255, 255, 255, 0.1)", borderColor: "rgba(66, 165, 245, 0.3)" } }}>
          <Box sx={{ p: 2, pb: 1, borderBottom: "1px solid rgba(255, 255, 255, 0.1)", background: "linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.05) 100%)" }}>
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600, color: "rgba(30, 58, 95, 0.95)", display: "flex", alignItems: "center", gap: 1 }}>
              Cash Outflows
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1, minHeight: 320 }}>
            <SunburstChart data={memoizedChartData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Snapshot;
