"use client";

import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Typography,
  CircularProgress,
  ButtonGroup,
  Button,
  Tooltip,
  useTheme as useMuiTheme,
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useTheme } from "@/context/theme-provider";


// ✅ Prevent SSR errors from ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AreaChartContainerProps {
  data?: { label: string; value: number }[];
  isLoading?: boolean;
}

const AreaChartContainer: React.FC<AreaChartContainerProps> = ({
  data = [],
  isLoading = false,
}) => {
  const muiTheme = useMuiTheme();
  const { themeMode } = useTheme();

  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [zoomLevel, setZoomLevel] = useState(1);

const chartOptions: ApexCharts.ApexOptions = {
  chart: {
    type: "area", // or "line", "bar", etc.
    zoom: { enabled: false },
    toolbar: { show: false },
  },
  theme: {
    // Explicitly cast themeMode to the allowed type
    mode: themeMode as "light" | "dark",
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    labels: { show: true },
  },
  yaxis: {
    labels: { show: true },
  },
  tooltip: {
    enabled: true,
  },
};

  const chartSeries = useMemo(
    () => [
      {
        name: "Value",
        data: data.map((d) => d.value),
      },
    ],
    [data]
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(z + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(z - 0.1, 0.5));
  }, []);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: muiTheme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Liquidity Overview
      </Typography>

      <ButtonGroup size="small" sx={{ mb: 2 }}>
        <Tooltip title="Area Chart">
          <Button
            onClick={() => setChartType("area")}
            variant={chartType === "area" ? "contained" : "outlined"}
          >
            <TimelineIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Bar Chart">
          <Button
            onClick={() => setChartType("bar")}
            variant={chartType === "bar" ? "contained" : "outlined"}
          >
            <BarChartIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Line Chart">
          <Button
            onClick={() => setChartType("line")}
            variant={chartType === "line" ? "contained" : "outlined"}
          >
            <ShowChartIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom In">
          <Button onClick={handleZoomIn}>
            <ZoomInIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button onClick={handleZoomOut}>
            <ZoomOutIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type={chartType}
          height={350 * zoomLevel}
        />
      )}
    </Box>
  );
};

export default AreaChartContainer;
