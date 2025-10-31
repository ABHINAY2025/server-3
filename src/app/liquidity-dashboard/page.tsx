"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { BankingSpinner } from "../../components/ui/EnhancedLoadingSpinner";
import { getOverviewData } from "../../lib/api/liquidity";
import { useTheme } from "../../context/theme-provider";
import { useLoadingStates } from "../../hooks/useLoading";

const Snapshot = dynamic(() => import("./Snapshot"), { ssr: false });
const Orchestration = dynamic(() => import("./Orchestration"), { ssr: false });

interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  index: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ height: value === index ? "100%" : "auto" }}>
    {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
  </div>
);

const tabOptions = ["snapshot", "orchestration"] as const;

interface OverviewOptions {
  activeTab?: string;
  forceRefresh?: boolean;
  skipSetupSSE?: boolean;
  skipFetch?: boolean;
}

const LiquidityDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = (searchParams.get("tab") as string) || "snapshot";

  const [value, setValue] = useState<string>(tabParam);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const isDarkMode = false; // Force light mode
  const { setLoading, isLoading } = useLoadingStates({
    dashboard: false,
    refresh: false,
    export: false,
  });

  useEffect(() => {
    if (tabOptions.includes(tabParam as typeof tabOptions[number]) && tabParam !== value) {
      setValue(tabParam);
    }
  }, [tabParam, value]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(`?tab=${newValue}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading("refresh", true, 2500);

    try {
      const data = await getOverviewData(
        (loading: boolean) => {
          if (loading) setIsRefreshing(true);
        },
        {
          activeTab: value,
          forceRefresh: true,
          skipSetupSSE: true,
        } as OverviewOptions
      );

      if (data) {
        setRefreshKey((prev) => prev + 1);
        setTimeout(() => setIsRefreshing(false), 800);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setTimeout(() => {
        setIsRefreshing(false);
        setLoading("refresh", false);
      }, 2000);
    }
  };

  const handleExport = async () => {
    const currentTab = value;
    setIsRefreshing(true);
    setLoading("export", true, 1200);

    try {
      const data = await getOverviewData(
        undefined,
        {
          activeTab: value,
          skipFetch: value !== "snapshot",
        } as OverviewOptions
      );

      if (data) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentTab}-data-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        setTimeout(() => {
          setIsRefreshing(false);
          setLoading("export", false);
        }, 500);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      setTimeout(() => {
        setIsRefreshing(false);
        setLoading("export", false);
      }, 1000);
    }
  };

  const snapshotPanel = useMemo(() => <Snapshot key={`snapshot-${refreshKey}`} />, [refreshKey]);
  const orchestrationPanel = useMemo(
    () => <Orchestration key={`orchestration-${refreshKey}`} />,
    [refreshKey]
  );

  return (
    <Box
      className="dashboard-container"
      sx={{
        width: "100%",
        height: "100vh",
        p: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {(isRefreshing || isLoading("refresh") || isLoading("export")) && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: (theme) => `${theme.palette.background.default}CC`,
            zIndex: 1000,
            backdropFilter: "blur(2px)",
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <BankingSpinner
            message={isLoading("export") ? "Preparing export..." : "Refreshing data..."}
          />
        </Box>
      )}

      <Tabs
        sx={{ flexShrink: 0 }}
        value={value}
        onChange={handleTabChange}
        aria-label="dashboard tabs"
        TabIndicatorProps={{ style: { display: "none" } }}
        variant="scrollable"
        scrollButtons="auto"
        className="dashboard-tabs"
      >
        <Tab
          label="SNAPSHOT"
          value="snapshot"
          className={`dashboard-tab ${value === "snapshot" ? "dashboard-tab-selected" : ""}`}
          sx={{
            textTransform: "none",
            fontWeight: "normal",
            minWidth: 80,
            padding: "4px 8px",
            fontSize: "11px",
            "&.Mui-selected": {
              fontWeight: 500,
              fontSize: "10px",
            },
          }}
        />
        <Tab
          label="ORCHESTRATION"
          value="orchestration"
          className={`dashboard-tab ${value === "orchestration" ? "dashboard-tab-selected" : ""}`}
          sx={{
            textTransform: "none",
            minWidth: 80,
            padding: "4px 8px",
            fontSize: "10px",
            "&.Mui-selected": {
              fontWeight: "bold",
              fontSize: "10px",
            },
          }}
        />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <TabPanel value={value} index="snapshot">
          {snapshotPanel}
        </TabPanel>
        <TabPanel value={value} index="orchestration">
          {orchestrationPanel}
        </TabPanel>
      </Box>
    </Box>
  );
};

// Wrap in Suspense for Next.js App Router compatibility
const LiquidityDashboardWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LiquidityDashboard />
  </Suspense>
);

export default React.memo(LiquidityDashboardWithSuspense);
