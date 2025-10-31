import React, { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { IoBulbOutline } from "react-icons/io5";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { formatAmount } from "../../utils/formatAmount";



// -------------------- TYPES --------------------
interface AIInsightCardProps {
  netCashFlow: number;
  title?: string;
}

interface LiquidityLevelCardProps {
  liquidityLevel: number;
  BarChart: React.FC<{ liquidityLevel: number }>;
}

interface RiskAssessmentCardProps {
  riskLevel?: "Low" | "Medium" | "High";
  riskScore?: number;
  recommendations?: string[];
}

interface MarketData {
  price?: number;
  volume?: number;
  [key: string]: number | string | undefined;
}

interface MarketTrendsCardProps {
  trend?: "Bullish" | "Bearish";
  change?: string;
  marketData?: MarketData;
}


// -------------------- COMPONENTS --------------------
export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  netCashFlow,
  title = "AI Insight: Projected Net Cash Flow (Today)",
}) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(135deg, rgba(162, 172, 232, 0.95) 0%, rgba(149, 155, 188, 0.95) 100%)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow:
          "0 8px 16px rgba(0, 0, 0, 0.3), inset 2px 2px 10px rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(211, 240, 247, 0.4)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #d3d6e7ff 0%, #5c6bc0 100%)",
        borderRadius: "3px 3px 0 0",
      },
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontSize: "12px",
        fontWeight: 600,
        color: "rgba(255, 255, 255, 1)",
        mb: 0.5,
        textAlign: "center",
        letterSpacing: "0.5px",
      }}
    >
      {title}
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <IoBulbOutline size={24} color="#ffffffff" />
      <Typography
        variant="h4"
        sx={{
          fontSize: "22px",
          fontWeight: 700,
          color: netCashFlow >= 0 ? "#4c56afff" : "#f44336",
        }}
      >
        {netCashFlow >= 0 ? "+" : ""}
        {formatAmount(netCashFlow, 1, "$")}
      </Typography>
      {netCashFlow >= 0 ? (
        <CaretUpOutlined style={{ color: "#4c56afff", fontSize: "18px" }} />
      ) : (
        <CaretDownOutlined style={{ color: "#f44336", fontSize: "18px" }} />
      )}
    </Box>
  </Box>
);

export const LiquidityLevelCard: React.FC<LiquidityLevelCardProps> = ({
  liquidityLevel,
  BarChart,
}) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(135deg, rgba(0, 188, 212, 0.95) 0%, rgba(26, 188, 156, 0.95) 100%)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      p: 1.5,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow:
          "0 8px 16px rgba(0, 0, 0, 0.3), inset 2px 2px 10px rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #d2e4e7ff 0%, #91dceaff 100%)",
        borderRadius: "3px 3px 0 0",
      },
    }}
  >
    <BarChart liquidityLevel={liquidityLevel} />
  </Box>
);

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  riskLevel = "Medium",
  riskScore = 65,
}) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(135deg, rgba(183, 155, 238, 0.95) 0%, rgba(132, 83, 184, 0.95) 100%)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow:
          "0 8px 16px rgba(0, 0, 0, 0.3), inset 2px 2px 10px rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #ece5eeff 0%, #ba68c8 100%)",
        borderRadius: "3px 3px 0 0",
      },
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontSize: "12px",
        fontWeight: 600,
        color: "#ffffff",
        mb: 0.5,
        textAlign: "center",
        letterSpacing: "0.5px",
      }}
    >
      Risk Assessment
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography
        variant="h4"
        sx={{
          fontSize: "20px",
          fontWeight: 700,
          color:
            riskLevel === "Low"
              ? "#89eb8cff"
              : riskLevel === "Medium"
              ? "#ff9800"
              : "#f44336",
        }}
      >
        {riskLevel}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: "16px",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {riskScore}%
      </Typography>
    </Box>
  </Box>
);

export const MarketTrendsCard: React.FC<MarketTrendsCardProps> = ({
  trend = "Bullish",
  change = "+2.3",
}) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(135deg, rgba(167, 235, 186, 0.95) 0%, rgba(201, 233, 141, 0.95) 100%)",
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow:
          "0 8px 16px rgba(0, 0, 0, 0.3), inset 2px 2px 10px rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.4)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #cdd1ccff 0%, #cee2aade 100%)",
        borderRadius: "3px 3px 0 0",
      },
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontSize: "12px",
        fontWeight: 600,
        color: "rgba(0, 0, 0, 0.8)",
        mb: 0.5,
        textAlign: "center",
        letterSpacing: "0.5px",
      }}
    >
      Market Trends
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography
        variant="h4"
        sx={{
          fontSize: "20px",
          fontWeight: 700,
          color: trend === "Bullish" ? "#2e7d32" : "#c62828",
        }}
      >
        {trend}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: "14px",
          color: "rgba(0, 0, 0, 0.7)",
        }}
      >
        {change}
      </Typography>
    </Box>
  </Box>
);
