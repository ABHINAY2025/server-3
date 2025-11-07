import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Refresh,
} from "@mui/icons-material";
import { BankingSpinner } from "@/components/ui/LoadingSpinner";
import {
  counterpartyActivate,
  counterpartyDeactivate,
} from "@/lib/api/liquidity";
import { formatAmount } from "../../../utils/formatAmount";

// ---------------------- Type Definitions ----------------------
interface CounterpartyData {
  counterpartyName: string;
  status: string;
  inflowAmount: number;
  outflowAmount: number;
  netPosition: number;
  lastTransactionTime: string;
  [key: string]: any;
}



interface CounterPartyPositionsProps {
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
  counterpartyData: Record<string, CounterpartyData>;
  companies: string[];
  selectedCompany: string;
  setSelectedCompany: React.Dispatch<React.SetStateAction<string>>;
  isSwitchChecked: Record<string, boolean>;
  setIsSwitchChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  loading?: boolean;
}

// ---------------------- Component ----------------------
const CounterPartyPositions: React.FC<CounterPartyPositionsProps> = ({
  handleMouseEnter,
  handleMouseLeave,
  counterpartyData,
  companies,
  isSwitchChecked,
  setIsSwitchChecked,
  loading = false,
}) => {
  const [switchLoading, setSwitchLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return () => {
      setSwitchLoading({});
    };
  }, [companies]);

  // ---------------------- Toggle Handler ----------------------
  const handleCounterpartyToggle = async (counterpartyName: string, checked: boolean) => {
    if (switchLoading[counterpartyName]) return;

    const previousState = getCounterpartyStatus(counterpartyName);

    setSwitchLoading((prev) => ({ ...prev, [counterpartyName]: true }));

    try {
      const formattedName = counterpartyName.trim();
      if (!formattedName) throw new Error("Invalid counterparty name");

      let response;
      if (checked) {
        response = await counterpartyActivate(formattedName);
      } else {
        response = await counterpartyDeactivate(formattedName);
      }

      if (!response || (response.data && response.data.success === false)) {
        throw new Error(response?.data?.message || `Failed to ${checked ? "activate" : "deactivate"} counterparty`);
      }

      const newStatus = checked ? "Active" : "Inactive";

      setIsSwitchChecked((prev) => ({ ...prev, [counterpartyName]: checked }));

      if (counterpartyData[counterpartyName]) {
        counterpartyData[counterpartyName].status = newStatus;
      }

      // Update UI Chip
      setTimeout(() => {
        const statusChips = document.querySelectorAll(`[data-status-for="${counterpartyName}"]`);
        statusChips.forEach((chip) => {
          if (chip instanceof HTMLElement) {
            chip.textContent = newStatus;
            chip.style.backgroundColor = checked
              ? "rgba(76, 175, 80, 0.2)"
              : "rgba(244, 67, 54, 0.2)";
            chip.style.color = checked ? "#4caf50" : "#f44336";
            chip.style.border = `1px solid ${checked ? "#4caf50" : "#f44336"}`;
          }
        });
      }, 0);

        (window as any).antNotification?.success({
        message: "Status Updated",
        description: checked
            ? "Counterparty activated successfully"
            : "Counterparty deactivated successfully",
        placement: "topRight",
        duration: 3,
        });
    } catch (error) {
      console.error(error);
      setIsSwitchChecked((prev) => ({ ...prev, [counterpartyName]: previousState }));

        (window as any).antNotification?.error({
        message: "Operation Failed",
        description: `Failed to ${checked ? "activate" : "deactivate"} counterparty. Please try again.`,
        placement: "topRight",
        duration: 4,
        });
    } finally {
      setSwitchLoading((prev) => ({ ...prev, [counterpartyName]: false }));
    }
  };

  // ---------------------- Get Switch Status ----------------------
    const getCounterpartyStatus = (counterpartyName: string): boolean => {
        // First check the switch state
        if (isSwitchChecked && typeof isSwitchChecked === "object") {
            if (counterpartyName in isSwitchChecked) {
            return Boolean(isSwitchChecked[counterpartyName]);
            }
        }

        // Then check local counterparty data
        const counterparty = counterpartyData[counterpartyName];
        if (counterparty) {
            const status = counterparty.status?.toString().toLowerCase(); // normalize
            return status === "active";
        }

        // Default to inactive
        return false;
        };

  // ---------------------- Table Data ----------------------
  const tableData = Object.entries(counterpartyData).map(([key, data]) => {
    return {
      name: data.counterpartyName || key,
      inflow: data.inflowAmount || 0,
      outflow: data.outflowAmount || 0,
      netPosition: data.netPosition || 0,
      status: data.status || 'Inactive',
      lastTransactionTime: data.lastTransactionTime
    };
  });

  

  // ---------------------- Pagination ----------------------
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ---------------------- Loading ----------------------
  if (loading) {
    return (
      <Card
        className="counterparty-overview"
        sx={{
          borderRadius: 3,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              py: 1,
              px: 2,
              background: "linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Business sx={{ fontSize: 20, color: "white" }} />
            <Typography variant="h6" sx={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>
              Counterparty Overview
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BankingSpinner message="Loading counterparty data..." variant="secondary" size={50} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ---------------------- Render ----------------------
  return (
    <Card
      className="counterparty-overview"
      sx={{
        borderRadius: 3,
        transition: "all 0.3s ease",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": { transform: "translateY(-2px)" },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
<CardContent
        sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Enhanced Header */}
        <Box
          sx={{
            py: 1,
            px: 2,
            background: "linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)",
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
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Business sx={{ color: "white", fontSize: 16 }} />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    color: "white",
                    mb: 0,
                    lineHeight: 1.2,
                    fontSize: "0.9rem",
                  }}
                >
                  Counterparty Overview
                </Typography>
                <Chip
                  icon={<SwapHoriz sx={{ fontSize: 12 }} />}
                  label={`${companies.length} Partners`}
                  size="small"
                  sx={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "bold",
                    backdropFilter: "blur(10px)",
                    height: 18,
                    fontSize: "0.65rem",
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                    width: 24,
                    height: 24,
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                      transform: "rotate(180deg)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Refresh sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Data Table */}
          {tableData && tableData.length > 0 ? (
            <>
              <Paper
                elevation={0}
                sx={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 1,
                  border: "1px solid rgba(255,255,255,0.1)",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  "& .MuiTableCell-root": {
                    color: "#000000"
                  },
                  "& .MuiTableBody-root .MuiTableCell-root": {
                    color: "#000000"
                  }
                }}
              >
                {/* Table Container with Scroll */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "auto",
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
                        <TableCell
                          sx={{
                            color: "#90caf9",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            border: "none",
                            py: 0.5,
                          }}
                        >
                          Counterparty Name
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#90caf9",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            border: "none",
                            py: 0.5,
                          }}
                        >
                          Inflow
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#90caf9",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            border: "none",
                            py: 0.5,
                          }}
                        >
                          Outflow
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#90caf9",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            border: "none",
                            py: 0.5,
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#90caf9",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            border: "none",
                            py: 0.5,
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{
                              border: "none",
                              color: "white",
                              textAlign: "center",
                            }}
                          >
                            No counterparty data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((counterparty, index) => (
                          <TableRow
                            key={counterparty.name}
                            sx={{
                              background:
                                index % 2 === 0
                                  ? "rgba(255,255,255,0.02)"
                                  : "rgba(255,255,255,0.05)",
                              "&:hover": {
                                background: "rgba(255, 152, 0, 0.1)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                border: "none",
                                py: 0.5,
                                fontSize: "0.8rem",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Business
                                  sx={{ fontSize: 12, color: "#42a5f5" }}
                                />
                                {counterparty.name}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                border: "none",
                                py: 0.5,
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <TrendingUp
                                  sx={{ fontSize: 12, color: "#4caf50" }}
                                />
                                $
                                {formatAmount(
                                  counterparty.inflow
                                ).toLocaleString()}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                border: "none",
                                py: 0.5,
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <TrendingDown
                                  sx={{ fontSize: 12, color: "#f44336" }}
                                />
                                $
                                {formatAmount(
                                  counterparty.outflow
                                ).toLocaleString()}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                border: "none",
                                py: 0.5,
                              }}
                            >
                              <Chip
                                label={
                                  getCounterpartyStatus(counterparty.name)
                                    ? "Active"
                                    : "Inactive"
                                }
                                size="small"
                                component="span"
                                data-status-for={counterparty.name}
                                sx={{
                                  backgroundColor: getCounterpartyStatus(
                                    counterparty.name
                                  )
                                    ? "rgba(76, 175, 80, 0.2)"
                                    : "rgba(244, 67, 54, 0.2)",
                                  color: getCounterpartyStatus(
                                    counterparty.name
                                  )
                                    ? "#4caf50"
                                    : "#f44336",
                                  border: `1px solid ${
                                    getCounterpartyStatus(counterparty.name)
                                      ? "#4caf50"
                                      : "#f44336"
                                  }`,
                                  fontSize: "0.65rem",
                                  height: "20px",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                border: "none",
                                py: 0.5,
                              }}
                            >
                              {switchLoading[counterparty.name] ? (
                                <CircularProgress
                                  size={20}
                                  sx={{ color: "#42a5f5" }}
                                />
                              ) : (
                                <Switch
                                  size="small"
                                  checked={getCounterpartyStatus(
                                    counterparty.name
                                  )}
                                  onChange={(e) =>
                                    handleCounterpartyToggle(
                                      counterparty.name,
                                      e.target.checked
                                    )
                                  }
                                    inputProps={{
                                        "data-counterparty": counterparty.name,
                                    } as any}
                                  sx={{
                                    "& .MuiSwitch-switchBase": {
                                      color: "#f44336",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(244, 67, 54, 0.1)",
                                      },
                                      "&.Mui-checked": {
                                        color: "#4caf50",
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(76, 175, 80, 0.1)",
                                        },
                                        "& + .MuiSwitch-track": {
                                          backgroundColor: "#4caf50 !important",
                                          opacity: 1,
                                        },
                                        "& .MuiSwitch-thumb": {
                                          backgroundColor: "#ffffffff",
                                        },
                                      },
                                      "&:not(.Mui-checked)": {
                                        "& .MuiSwitch-thumb": {
                                          backgroundColor: "#f44336",
                                        },
                                      },
                                    },
                                    "& .MuiSwitch-track": {
                                      backgroundColor: "#ffffffff !important",
                                      opacity: 1,
                                    },
                                    "& .MuiSwitch-thumb": {
                                      boxShadow: "0 2px 4px 0 rgba(0,0,0,0.2)",
                                    },
                                    "& .Mui-disabled": {
                                      opacity: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination outside table */}
                  <TablePagination
                    component="div"
                    count={tableData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    sx={{
                      color: "white",
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255,255,255,0.02)",
                      "& .MuiTablePagination-toolbar": {
                        color: "white",
                        minHeight: "40px",
                        padding: "0 16px",
                        justifyContent: "space-between",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "nowrap",
                      },
                      "& .MuiTablePagination-spacer": {
                        display: "none",
                      },
                      "& .MuiTablePagination-selectLabel": {
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.75rem",
                        fontWeight: "400",
                        whiteSpace: "nowrap",
                        marginRight: "8px",
                      },
                      "& .MuiTablePagination-displayedRows": {
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.75rem",
                        fontWeight: "400",
                        whiteSpace: "nowrap",
                        marginLeft: "auto",
                      },
                      "& .MuiTablePagination-select": {
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        marginRight: "8px",
                        minWidth: "50px",
                        fontSize: "0.75rem",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                        },
                      },
                      "& .MuiTablePagination-actions": {
                        color: "white",
                        marginLeft: "12px",
                        "& .MuiIconButton-root": {
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          margin: "0 1px",
                          padding: "4px",
                          width: "28px",
                          height: "28px",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                          },
                          "&.Mui-disabled": {
                            color: "rgba(255, 255, 255, 0.3)",
                            backgroundColor: "rgba(255, 255, 255, 0.03)",
                          },
                        },
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
                        fontSize: "16px",
                      },
                      "& .MuiSelect-select": {
                        color: "white",
                      },
                      "& .MuiInputBase-root": {
                        color: "white",
                      },
                    }}
                  />
                </Box>
              </Paper>
            </>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                color: "#90caf9",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Business sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
              >
                No Counterparties Found
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.8, fontSize: "0.7rem" }}
              >
                No counterparty data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CounterPartyPositions;
