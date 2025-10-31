import React from "react";
import {
  Skeleton,
  Card,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Spin } from "antd";
import RefreshIcon from "@mui/icons-material/Refresh";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StatusIcon from "./StatusIcon";

/* -------------------------------------------------------------------------- */
/* 🌀 Banking Spinner                                                         */
/* -------------------------------------------------------------------------- */
interface BankingSpinnerProps {
  size?: number;
  message?: string;
}

export const BankingSpinner: React.FC<BankingSpinnerProps> = ({
  size = 40,
  message = "Loading...",
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      gap: "16px",
    }}
  >
    <div style={{ position: "relative" }}>
      <CircularProgress size={size} style={{ color: "#42a5f5" }} thickness={4} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <MonetizationOnIcon style={{ fontSize: "16px", color: "#42a5f5" }} />
      </div>
    </div>
    <Typography
      variant="body2"
      style={{
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "center",
        animation: "pulse 2s infinite",
      }}
      className="pulsing-text"
    >
      {message}
    </Typography>
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .pulsing-text {
            animation: pulse 2s infinite;
          }
        `,
      }}
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/* 💳 Skeleton Loader                                                         */
/* -------------------------------------------------------------------------- */
type SkeletonType = "card" | "table" | "chart" | "metric";

interface BankingSkeletonLoaderProps {
  type?: SkeletonType;
  count?: number;
}

export const BankingSkeletonLoader: React.FC<BankingSkeletonLoaderProps> = ({
  type = "card",
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "table":
        return (
          <Card
            style={{
              background: "rgba(30, 58, 95, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <Skeleton
              variant="text"
              width="30%"
              height={24}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Box style={{ marginTop: "16px" }}>
              {[...Array(5)].map((_, i) => (
                <Box
                  key={i}
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "12px",
                    alignItems: "center",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={40}
                    height={40}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Box style={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={16}
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={14}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        marginTop: "4px",
                      }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width="20%"
                    height={16}
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        );

      case "chart":
        return (
          <Card
            style={{
              background: "rgba(30, 58, 95, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "16px",
              height: "300px",
            }}
          >
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={220}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            />
          </Card>
        );

      case "metric":
        return (
          <Card
            style={{
              background: "rgba(30, 58, 95, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "20px",
              height: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Skeleton
              variant="text"
              width="70%"
              height={16}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                style={{ backgroundColor: "rgba(66, 165, 245, 0.3)" }}
              />
              <Skeleton
                variant="text"
                width="50%"
                height={32}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              />
            </Box>
          </Card>
        );

      default:
        return (
          <Card
            style={{
              background: "rgba(30, 58, 95, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Skeleton
                variant="circular"
                width={50}
                height={50}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              />
              <Box style={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={16}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    marginTop: "8px",
                  }}
                />
              </Box>
            </Box>
          </Card>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🟢 Status Indicator                                                        */
/* -------------------------------------------------------------------------- */
type StatusType = "online" | "warning" | "error" | "offline";

interface StatusIndicatorProps {
  status?: StatusType;
  label?: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = "online",
  label = "System Status",
  size = "small",
  showLabel = true,
}) => {
  const colorMap: Record<StatusType, string> = {
    online: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    offline: "#9e9e9e",
  };

  const sizeMap = {
    small: { dot: 8, font: "0.75rem" },
    medium: { dot: 12, font: "0.85rem" },
    large: { dot: 16, font: "1rem" },
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: sizeMap[size].dot,
          height: sizeMap[size].dot,
          borderRadius: "50%",
          backgroundColor: colorMap[status],
          animation: status === "online" ? "pulse 2s infinite" : "none",
        }}
      />
      {showLabel && (
        <span
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: sizeMap[size].font,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🕒 Data Freshness Indicator                                                */
/* -------------------------------------------------------------------------- */
interface DataFreshnessIndicatorProps {
  lastUpdated: string | Date;
  threshold?: number;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  threshold = 5 * 60 * 1000,
}) => {
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diff = now.getTime() - updated.getTime();
  const isStale = diff > threshold;
  const minutesAgo = Math.floor(diff / (1000 * 60));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        borderRadius: "12px",
        backgroundColor: isStale
          ? "rgba(255, 152, 0, 0.2)"
          : "rgba(76, 175, 80, 0.2)",
        border: `1px solid ${isStale ? "#ff9800" : "#4caf50"}`,
      }}
    >
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isStale ? "#ff9800" : "#4caf50",
        }}
      />
      <span
        style={{
          fontSize: "0.7rem",
          color: isStale ? "#ff9800" : "#4caf50",
          fontWeight: 500,
        }}
      >
        {minutesAgo === 0 ? "Just now" : `${minutesAgo}m ago`}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ⏳ Progressive Loader                                                      */
/* -------------------------------------------------------------------------- */
interface ProgressiveLoaderProps {
  steps?: string[];
  currentStep?: number;
  progress?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  steps = ["Loading data...", "Processing...", "Almost done..."],
  currentStep = 0,
  progress = 0,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      gap: "16px",
    }}
  >
    <CircularProgress
      variant="determinate"
      value={progress}
      size={60}
      style={{ color: "#42a5f5" }}
      thickness={4}
    />
    <div style={{ textAlign: "center" }}>
      <Typography
        variant="body1"
        style={{
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "8px",
          fontWeight: 500,
        }}
      >
        {steps[currentStep] || "Loading..."}
      </Typography>
      <Typography
        variant="body2"
        style={{
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "0.8rem",
        }}
      >
        {Math.round(progress)}% complete
      </Typography>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* ❌ Error State                                                             */
/* -------------------------------------------------------------------------- */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
  showRetry = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      padding: "40px",
      textAlign: "center",
    }}
  >
    <div style={{ marginBottom: "16px" }}>
      <StatusIcon type="error" size="xlarge" />
    </div>
    <Typography
      variant="h6"
      style={{
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: "8px",
        fontWeight: 600,
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body2"
      style={{
        color: "rgba(255, 255, 255, 0.6)",
        marginBottom: "24px",
        maxWidth: "300px",
      }}
    >
      {message}
    </Typography>
    {showRetry && onRetry && (
      <button
        onClick={onRetry}
        style={{
          background: "linear-gradient(45deg, #42a5f5, #1976d2)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        <RefreshIcon
          style={{ marginRight: "4px", verticalAlign: "middle" }}
          fontSize="small"
        />{" "}
        Try Again
      </button>
    )}
  </div>
);

export default {
  BankingSpinner,
  BankingSkeletonLoader,
  StatusIndicator,
  DataFreshnessIndicator,
  ProgressiveLoader,
  ErrorState,
};
