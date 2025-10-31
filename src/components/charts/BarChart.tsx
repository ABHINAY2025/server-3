import React from "react";
import { Box, Typography } from "@mui/material";
import { TrendingUp, TrendingDown, Warning } from "@mui/icons-material";

interface LiquidityLevel {
  liquidityLevel?: string | number;
  liquidityThreshold?: number;
  netCashflow?: number;
  currency?: string;
  predictionHour?: string;
  confidenceLevel?: string | number;
  confidence?: string | number;
  volatility?: string | number;
  riskScore?: number;
  lastUpdated?: string;
  updatedAt?: string;
  source?: string;
  dataSource?: string;
}

interface BarChartProps {
  liquidityLevel: LiquidityLevel;
}

// Helper to clamp a number between min and max
const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));

const BarChart: React.FC<BarChartProps> = ({ liquidityLevel }) => {
  const valueRaw = parseFloat(`${liquidityLevel?.liquidityLevel}`) || 0;
  const value = clamp(valueRaw, 0, 100);
  const liquidityThreshold = liquidityLevel?.liquidityThreshold ?? 50;
  const isHealthy = value > liquidityThreshold;
  const barColor = isHealthy ? "#4caf50" : "#f44336";

  // Extract additional data
  const netCashflow = liquidityLevel?.netCashflow ?? 0;
  const currency = liquidityLevel?.currency ?? "USD";
  const predictionHour = liquidityLevel?.predictionHour;
  const confidenceLevel = liquidityLevel?.confidenceLevel ?? liquidityLevel?.confidence;
  const volatility = liquidityLevel?.volatility;
  const riskScore = liquidityLevel?.riskScore;
  const lastUpdated = liquidityLevel?.lastUpdated ?? liquidityLevel?.updatedAt;
  const source = liquidityLevel?.source ?? liquidityLevel?.dataSource;

  // Format prediction time
  const formatPredictionTime = (dateTime?: string) => {
    if (!dateTime) return "";
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatConfidence = (confidence?: string | number) => {
    if (confidence == null) return "";
    const conf = parseFloat(`${confidence}`);
    if (isNaN(conf)) return "";
    return `${conf.toFixed(1)}%`;
  };

  const getConfidenceColor = (confidence?: string | number) => {
    if (confidence == null) return "rgba(255, 255, 255, 0.6)";
    const conf = parseFloat(`${confidence}`);
    if (isNaN(conf)) return "rgba(255, 255, 255, 0.6)";
    if (conf >= 80) return "#4caf50";
    if (conf >= 60) return "#ff9800";
    return "#f44336";
  };

  const formatVolatility = (vol?: string | number) => {
    if (vol == null) return "";
    const volatilityNum = parseFloat(`${vol}`);
    if (isNaN(volatilityNum)) return "";
    return `${volatilityNum.toFixed(2)}%`;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.9)",
          mb: 2,
          textAlign: "center",
          letterSpacing: "0.5px",
        }}
      >
        Current Liquidity Level
      </Typography>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mb: 1,
        }}
      >
        {isHealthy ? (
          <TrendingUp sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 24 }} />
        ) : (
          <TrendingDown sx={{ color: "rgba(255, 193, 7, 0.95)", fontSize: 24 }} />
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: isHealthy
                ? "rgba(255, 255, 255, 0.9)"
                : value < liquidityThreshold * 0.8
                ? "rgba(255, 193, 7, 0.95)"
                : "rgba(255, 152, 0, 0.95)",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {!isHealthy && value < liquidityThreshold * 0.8 && (
              <Warning sx={{ fontSize: 18 }} />
            )}
            {isHealthy
              ? "Healthy"
              : value < liquidityThreshold * 0.8
              ? "Critical"
              : "Warning"}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontSize: "28px",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.95)",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            {valueRaw.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BarChart;
