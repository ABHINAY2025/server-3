import React, { ReactNode } from "react";
import { SxProps, Theme, ButtonProps as MuiButtonProps } from "@mui/material";
import {
  Box,
  Typography,
  CircularProgress,
  Skeleton,
  Button,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Animation keyframes
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ----------------- Types -----------------
interface BankingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
  variant?: "primary" | "secondary" | "minimal";
}

interface BankingSkeletonLoaderProps {
  variant?: "table" | "card" | "dashboard";
  rows?: number;
  columns?: number;
}

interface MiniLoaderProps {
  size?: number;
  color?: string;
}

interface LoadingButtonProps extends Omit<MuiButtonProps, 'children'> {
  children: ReactNode;
  loading?: boolean;
  sx?: SxProps<Theme>; // ✅ replace any
}

// ----------------- Components -----------------

// Modern Banking Theme Loading Spinner
export const BankingSpinner: React.FC<BankingSpinnerProps> = ({
  size = 40,
  message = "Loading...",
  fullScreen = false,
  variant = "primary",
}) => {
  const spinnerColors: Record<string, string> = {
    primary: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
    secondary: "linear-gradient(45deg, #c6d6c6ff 30%, #ccdacdff 90%)",
    minimal: "rgba(255, 255, 255, 0.8)",
  };

  const Container: React.FC<{ children: ReactNode }> = ({ children }) =>
    fullScreen ? (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(11, 29, 58, 0.95)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          flexDirection: "column",
          gap: 3,
        }}
      >
        {children}
      </Box>
    ) : (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          p: 3,
        }}
      >
        {children}
      </Box>
    );

  return (
    <Container>
      {/* Main Spinner */}
      <Box sx={{ position: "relative" }}>
        {/* Outer Ring */}
        <Box
          sx={{
            width: size + 20,
            height: size + 20,
            borderRadius: "50%",
            background: spinnerColors[variant],
            animation: `${rotate} 2s linear infinite`,
            opacity: 0.3,
            position: "absolute",
            top: -10,
            left: -10,
          }}
        />

        {/* Inner Spinner */}
        <CircularProgress
          size={size}
          thickness={3}
          sx={{
            color: variant === "minimal" ? "white" : "#42a5f5",
            animation: `${float} 3s ease-in-out infinite`,
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />

        {/* Center Dot */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: variant === "minimal" ? "#eaf2fc" : "#1976d2",
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
      </Box>

      {/* Loading Message */}
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: "white",
            fontWeight: 500,
            textAlign: "center",
            animation: `${pulse} 2s ease-in-out infinite`,
            letterSpacing: "0.5px",
          }}
        >
          {message}
        </Typography>
      )}
    </Container>
  );
};

// ----------------- Skeleton Loader -----------------
export const BankingSkeletonLoader: React.FC<BankingSkeletonLoaderProps> = ({
  variant = "table",
  rows = 5,
  columns = 4,
}) => {
  if (variant === "table") {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={32}
              sx={{
                flex: 1,
                borderRadius: 1,
                background: `linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0.1) 25%,
                  rgba(255, 255, 255, 0.2) 50%,
                  rgba(255, 255, 255, 0.1) 75%
                )`,
                backgroundSize: "200% 100%",
                animation: `${shimmer} 1.5s infinite`,
              }}
            />
          ))}
        </Box>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                height={24}
                sx={{
                  flex: 1,
                  borderRadius: 0.5,
                  background: `linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.05) 25%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.05) 75%
                  )`,
                  backgroundSize: "200% 100%",
                  animation: `${shimmer} 1.5s infinite`,
                  animationDelay: `${(rowIndex + colIndex) * 0.1}s`,
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === "card") {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          background: "linear-gradient(135deg, #142B4D 0%, #1e3a5f 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{
              background: `linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.1) 25%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.1) 75%
              )`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.5s infinite`,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="text"
              width="60%"
              height={24}
              sx={{
                background: `linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0.1) 25%,
                  rgba(255, 255, 255, 0.2) 50%,
                  rgba(255, 255, 255, 0.1) 75%
                )`,
                backgroundSize: "200% 100%",
                animation: `${shimmer} 1.5s infinite`,
                mb: 1,
              }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={16}
              sx={{
                background: `linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0.05) 25%,
                  rgba(255, 255, 255, 0.15) 50%,
                  rgba(255, 255, 255, 0.05) 75%
                )`,
                backgroundSize: "200% 100%",
                animation: `${shimmer} 1.5s infinite`,
                animationDelay: "0.2s",
              }}
            />
          </Box>
        </Box>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={20}
            sx={{
              mb: 1.5,
              borderRadius: 0.5,
              background: `linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.05) 25%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(255, 255, 255, 0.05) 75%
              )`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.5s infinite`,
              animationDelay: `${i * 0.1}s`,
              width:
                i === 0 ? "90%" : i === 1 ? "70%" : i === 2 ? "85%" : "60%",
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === "dashboard") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 3,
          p: 2,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <BankingSkeletonLoader key={i} variant="card" />
        ))}
      </Box>
    );
  }

  return null;
};

// ----------------- Mini Loader -----------------
export const MiniLoader: React.FC<MiniLoaderProps> = ({
  size = 16,
  color = "#42a5f5",
}) => (
  <CircularProgress
    size={size}
    sx={{
      color,
      "& .MuiCircularProgress-circle": {
        strokeLinecap: "round",
      },
    }}
  />
);

// ----------------- Loading Button -----------------
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  variant = "contained",
  ...props
}) => {
  return (
    <Button
      {...props}
      variant={variant}
      disabled={loading || props.disabled}
      startIcon={loading ? <MiniLoader size={16} color="white" /> : props.startIcon}
      sx={{
        ...props.sx,
        opacity: loading ? 0.8 : 1,
        transition: "all 0.3s ease",
      }}
    >
      {loading ? "Loading..." : children}
    </Button>
  );
};


export default BankingSpinner;
