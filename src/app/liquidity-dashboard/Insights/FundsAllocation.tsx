import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { AccountBalance, TrendingUp, MonetizationOn } from "@mui/icons-material";

// ------------------ Types ------------------
export interface FundRow {
  key: string | number;
  amount?: number;
  status?: string;
  [key: string]: any; // dynamic fields
}

export interface FundColumn {
  key?: string | number;
  dataIndex: string;
  title: string;
  render?: (value: any, row: FundRow) => React.ReactNode;
}

export interface FundsAllocationProps {
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
  fundsAllocationColumns: FundColumn[];
  rootData: FundRow[];
  handleAllocateModalOpen: () => void;
  hierarchyLoading?: boolean;
}

// ------------------ Dynamic Columns ------------------
export const fundsAllocationColumns: FundColumn[] = [
  {
    key: "name",
    dataIndex: "name",
    title: "Fund Name",
  },
  {
    key: "amount",
    dataIndex: "amount",
    title: "Amount",
    render: (value: number) => `$${(value || 0).toLocaleString()}`, // formatted currency
  },
  {
    key: "status",
    dataIndex: "status",
    title: "Status",
    render: (value: string) => {
      let color: "success" | "error" | "default" = "default";
      if (value === "Active") color = "success";
      else if (value === "Inactive") color = "error";
      return <Chip label={value || "Unknown"} color={color} size="small" />;
    },
  },
];

// ------------------ Component ------------------
const FundsAllocation: React.FC<FundsAllocationProps> = ({
  hovered,
  setHovered,
  fundsAllocationColumns,
  rootData,
  handleAllocateModalOpen,
  hierarchyLoading = false,
}) => {
  const totalAmount =
    rootData?.reduce((total, row) => total + (row.amount || 0), 0) || 0;

  return (
    <Card
      className="funds-allocation-section"
      elevation={hovered ? 8 : 3}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent
        sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <AccountBalance sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    color: "white",
                    mb: 0,
                    lineHeight: 1.2,
                    fontSize: "0.9rem",
                  }}
                >
                  Funds Allocation
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    alignItems: "center",
                    mt: 0.5,
                  }}
                >
                  <Chip
                    icon={<MonetizationOn sx={{ fontSize: 14 }} />}
                    label={`${totalAmount.toLocaleString()}`}
                    size="small"
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                      backdropFilter: "blur(10px)",
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                  <Chip
                    icon={<TrendingUp sx={{ fontSize: 14 }} />}
                    label={`${rootData?.length || 0} Entities`}
                    size="small"
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                      backdropFilter: "blur(10px)",
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button
                variant="contained"
                onClick={handleAllocateModalOpen}
                startIcon={<AccountBalance />}
                size="small"
                disabled={hierarchyLoading}
                sx={{
                  background: hierarchyLoading
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: hierarchyLoading ? "rgba(255,255,255,0.5)" : "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": {
                    background: hierarchyLoading
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.3)",
                    transform: hierarchyLoading ? "none" : "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {hierarchyLoading ? "Loading..." : "Manage"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Table Content */}
        <Box
          sx={{
            p: 0.5,
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {rootData && rootData.length > 0 ? (
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
                    {fundsAllocationColumns.map((col) => (
                      <TableCell
                        key={col.key || col.dataIndex}
                        sx={{
                          color: "#90caf9",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          border: "none",
                          py: 1,
                        }}
                      >
                        {col.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rootData.map((row, rowIndex) => (
                    <TableRow
                      key={row.key}
                      sx={{
                        background:
                          rowIndex % 2 === 0
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.02)",
                        "&:hover": {
                          background: "rgba(66, 165, 245, 0.1)",
                          transform: "scale(1.01)",
                          transition: "all 0.3s ease",
                        },
                        cursor: "pointer",
                      }}
                    >
                      {fundsAllocationColumns.map((col) => (
                        <TableCell
                          key={`${row.key}-${col.key || col.dataIndex}`}
                          sx={{
                            color: "black",
                            border: "none",
                            py: 1,
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
                p: 2,
                overflow: "hidden",
                minHeight: 0,
                textAlign: "center",
                color: "#90caf9",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AccountBalance sx={{ fontSize: 32, mb: 0.5, opacity: 0.5 }} />
              <Typography
                variant="body2"
                sx={{ mb: 0.3, fontWeight: "bold", fontSize: "0.8rem" }}
              >
                No Funds Allocated
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.8, fontSize: "0.5rem" }}
              >
                Create your first allocation
              </Typography>
              <Button
                variant="outlined"
                onClick={handleAllocateModalOpen}
                size="small"
                disabled={hierarchyLoading}
                sx={{
                  borderColor: hierarchyLoading
                    ? "rgba(66, 165, 245, 0.3)"
                    : "#42a5f5",
                  color: hierarchyLoading
                    ? "rgba(66, 165, 245, 0.3)"
                    : "#42a5f5",
                  fontSize: "0.7rem",
                  py: 0.5,
                  px: 1.5,
                  "&:hover": {
                    borderColor: hierarchyLoading
                      ? "rgba(66, 165, 245, 0.3)"
                      : "#90caf9",
                    background: hierarchyLoading
                      ? "transparent"
                      : "rgba(66, 165, 245, 0.1)",
                  },
                }}
              >
                {hierarchyLoading ? "Loading..." : "Create Allocation"}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FundsAllocation;
