import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Timeline,
  TrendingUp,
  Refresh,
  Info,
} from "@mui/icons-material";
import { formatAmount } from "../../../utils/formatAmount";

// Column definition interface
interface ColumnType<T> {
  key?: string;
  dataIndex: keyof T;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
}

// Row type interface
export interface CurrentPositionRow {
  key?: string;
  id?: string | number;
  inflow: number;
  outflow: number;
  amount: number;
  [key: string]: any; // For additional dynamic columns
}

interface CurrentPositionProps {
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
  currentPositionColumns: ColumnType<CurrentPositionRow>[];
  currentPositionData: CurrentPositionRow[];
  handleRowClick?: (row: CurrentPositionRow) => void;
}

const CurrentPosition: React.FC<CurrentPositionProps> = ({
  handleMouseEnter,
  handleMouseLeave,
  currentPositionColumns,
  currentPositionData,
  handleRowClick,
}) => {
  // Calculate totals for summary
  const totals = currentPositionData.reduce(
    (acc, row) => ({
      inflow: acc.inflow + (row.inflow || 0),
      outflow: acc.outflow + (row.outflow || 0),
      netPosition: acc.netPosition + (row.amount || 0),
    }),
    { inflow: 0, outflow: 0, netPosition: 0 }
  );

  return (
    <Card
      className="position-snapshot-section"
      sx={{
        borderRadius: 3,
        transition: "all 0.3s ease",
        height: "100%",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent sx={{ p: 0, height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            py: 1,
            px: 1.5,
            background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>\') repeat',
              backgroundSize: "20px 20px",
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Timeline sx={{ color: "white", fontSize: 16 }} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    color: "white",
                    mb: 0.2,
                    fontSize: "0.85rem",
                    display: "flex",
                    gap: 0.5,
                    alignItems: "center",
                  }}
                >
                  Position Snapshot
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 12 }} />}
                  label={`${currentPositionData.length} Entities`}
                  size="small"
                  sx={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "bold",
                    backdropFilter: "blur(10px)",
                    height: 18,
                    fontSize: "0.65rem",
                  }}
                />
                <Chip
                  label="Real-time"
                  size="small"
                  sx={{
                    background: "rgba(76, 255, 76, 0.3)",
                    color: "white",
                    fontWeight: "bold",
                    backdropFilter: "blur(10px)",
                    height: 18,
                    fontSize: "0.65rem",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Refresh data">
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                    width: 20,
                    height: 20,
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                      transform: "rotate(180deg)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Refresh sx={{ fontSize: 12 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Position details">
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                    width: 20,
                    height: 20,
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  <Info sx={{ fontSize: 12 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Summary Row */}
          <Box
            sx={{
              mt: 1,
              display: "flex",
              gap: 1,
              p: 0,
              position: "relative",
            }}
          >
            <Box
              sx={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 1.5,
                p: 0,
                backdropFilter: "blur(10px)",
                flex: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.65rem" }}
              >
                Total Inflow
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "white", fontSize: "0.85rem" }}
              >
                ${formatAmount(totals.inflow).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 1.5,
                p: 0.5,
                backdropFilter: "blur(10px)",
                flex: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.65rem" }}
              >
                Total Outflow
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "white", fontSize: "0.85rem" }}
              >
                ${formatAmount(totals.outflow).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 1.5,
                p: 0.8,
                backdropFilter: "blur(10px)",
                flex: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.65rem" }}
              >
                Net Position
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: totals.netPosition >= 0 ? "#fff" : "#f44336",
                  fontSize: "0.85rem",
                }}
              >
                ${formatAmount(totals.netPosition).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Table Content */}
        <Box
          sx={{
            p: 1.5,
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {currentPositionData.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                background: "transparent",
                borderRadius: 2,
                overflow: "auto",
                flex: 1,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "3px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                    }}
                  >
                    {currentPositionColumns.map((col) => (
                      <TableCell
                        key={col.key || col.dataIndex.toString()}
                        sx={{
                          color: "#90caf9",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          border: "none",
                          py: 0.5,
                        }}
                      >
                        {col.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPositionData.map((row, rowIndex) => (
                    <TableRow
                      key={row.key || row.id || `row-${rowIndex}`}
                      onClick={() => handleRowClick?.(row)}
                      sx={{
                        background:
                          rowIndex % 2 === 0
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.02)",
                        cursor: handleRowClick ? "pointer" : "default",
                        "&:hover": {
                          background: "rgba(76, 175, 80, 0.1)",
                          transform: "scale(1.01)",
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      {currentPositionColumns.map((col, colIndex) => (
                        <TableCell
                          key={col.key || col.dataIndex.toString() || `col-${colIndex}`}
                          sx={{
                            color: "white",
                            border: "none",
                            py: 0.5,
                            fontSize: "0.8rem",
                            fontWeight:
                              col.dataIndex === "amount" ? "bold" : "normal",
                          }}
                        >
                          {col.render
                            ? col.render(row[col.dataIndex], row)
                            : row[col.dataIndex]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "#90caf9",
              }}
            >
              <Timeline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                No Position Data
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Select an entity from the hierarchy to view position details
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CurrentPosition;
