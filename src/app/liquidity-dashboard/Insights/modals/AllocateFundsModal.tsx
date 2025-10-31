import React, { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  Alert,
  LinearProgress,
  Backdrop,
} from "@mui/material";
import {
  AccountBalance,
  Close,
  Add as AddIcon,
  TrendingUp,
  MonetizationOn,
} from "@mui/icons-material";
import TreeNode, { TreeNodeData as TreeNodeType } from "../TreeNode";

import { LoadingButton, BankingSpinner } from "@/components/ui/LoadingSpinner";
import { useTheme } from "@/context/theme-provider";

// Define Props interface
interface AllocateFundsModalProps {
  isAllocateModalVisible: boolean;
  handleAllocateModalClose: () => void;
  editableRawData: TreeNodeType[];
  handleAddNode: (parentKey: string) => void;
  handleRemoveNode: (key: string) => void;
  handleAmountChange: (key: string, value: string | number) => void;
  allocateExpandedKeys: string[];
  handleAllocateExpand: (key: string) => void;
  handleSaveAllocation: () => void;
  handleOpenAddRootModal: () => void;
  isAddRootModalOpen: boolean;
  handleCloseAddRootModal: () => void;
  newRootName: string;
  setNewRootName: (name: string) => void;
  handleAddRoot: (operatorName: string) => Promise<void>;  // Update this line
  loading?: boolean;
  saveLoading?: boolean;
  hierarchyLoading?: boolean;
}

const AllocateFundsModal: React.FC<AllocateFundsModalProps> = ({
  isAllocateModalVisible,
  handleAllocateModalClose,
  editableRawData,
  handleAddNode,
  handleRemoveNode,
  handleAmountChange,
  allocateExpandedKeys,
  handleAllocateExpand,
  handleSaveAllocation,
  handleOpenAddRootModal,
  isAddRootModalOpen,
  handleCloseAddRootModal,
  newRootName,
  setNewRootName,
  handleAddRoot,
  loading = false,
  saveLoading = false,
  hierarchyLoading = false,
}) => {
  const { isDarkMode } = useTheme(); // Will always be false now

  const totalAllocated = editableRawData.reduce(
    (total, node) => total + (node.amount || 0),
    0
  );

  const hasData = editableRawData.length > 0 && totalAllocated > 0;

  return (
    <>
      <Dialog
        open={isAllocateModalVisible}
        onClose={handleAllocateModalClose}
        fullWidth
        maxWidth="lg"
        className="allocate-funds-modal"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            minHeight: "80vh",
            color: "inherit", // Always light mode
            "& .MuiTypography-root": {
              color: "inherit",
            },
            "& .MuiDialogContent-root": {
              color: "inherit",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          className="modal-header"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance className="modal-icon" sx={{ fontSize: 24 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "1rem" }}>
                Payment Operator & Network Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                Manage liquidity allocation hierarchy
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddRootModal}
              size="small"
            >
              Add Root
            </Button>
            <IconButton onClick={handleAllocateModalClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Summary Section */}
        <Box sx={{ px: 2, py: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Chip
                icon={<MonetizationOn />}
                label={`Total: $${totalAllocated.toLocaleString()}`}
                size="small"
                sx={{
                  background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                icon={<TrendingUp />}
                label={`${editableRawData.length} Roots`}
                size="small"
                sx={{
                  background: "linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              />
            </Box>

            <Box sx={{ minWidth: 300 }}>
              <Typography
                variant="caption"
                sx={{ mb: 0.5, color: "#2397f5ff", fontSize: "0.7rem", display: "block" }}
              >
                Distribution
              </Typography>

              {hasData ? (
                <Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 0.5 }}>
                    {editableRawData.map((root, index) => {
                      const percentage =
                        totalAllocated > 0 ? ((root.amount || 0) / totalAllocated) * 100 : 0;
                      const colors = [
                        { primary: "#4caf50", secondary: "#66bb6a" },
                        { primary: "#2196f3", secondary: "#42a5f5" },
                        { primary: "#ff9800", secondary: "#ffb74d" },
                        { primary: "#9c27b0", secondary: "#ba68c8" },
                        { primary: "#f44336", secondary: "#ef5350" },
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <Box key={root.key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: `linear-gradient(45deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: "#2397f5ff", fontSize: "0.65rem" }}>
                            {root.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64b2f3ff", fontWeight: "bold", fontSize: "0.65rem" }}
                          >
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
                    {editableRawData.map((root, index) => {
                      const percentage =
                        totalAllocated > 0 ? ((root.amount || 0) / totalAllocated) * 100 : 0;
                      const colors = [
                        { primary: "#4caf50", secondary: "#66bb6a" },
                        { primary: "#2196f3", secondary: "#42a5f5" },
                        { primary: "#ff9800", secondary: "#ffb74d" },
                        { primary: "#9c27b0", secondary: "#ba68c8" },
                        { primary: "#f44336", secondary: "#ef5350" },
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <Box
                          key={root.key}
                          sx={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                            height: "100%",
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#90caf9", mt: 0.5 }}>
                    No allocation data
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        <DialogContent dividers sx={{ maxHeight: "calc(80vh - 120px)", overflow: "auto", position: "relative", p: 1.5 }}>
          {hierarchyLoading && (
            <Backdrop open sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <BankingSpinner size={60} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Loading hierarchy data...
              </Typography>
            </Backdrop>
          )}

          {editableRawData.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <AccountBalance sx={{ fontSize: 40, color: "#42a5f5", mb: 1.5 }} />
              <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }}>
                No Entities Found
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Start by adding a root entity to begin fund allocation
              </Typography>
              <LoadingButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddRootModal}
                loading={loading}
                sx={{ fontWeight: "bold" }}
              >
                Add First Root Entity
              </LoadingButton>
            </Paper>
          ) : (
            <Box sx={{ mt: 0.5 }}>
            {editableRawData.map(node => (
                <TreeNode
                key={node.key}
                node={node}
                editable={false}
                handleAddNode={handleAddNode}
                handleRemoveNode={handleRemoveNode}
                handleAmountChange={handleAmountChange} // ✅ here
                isRoot
                expandedKeys={allocateExpandedKeys}
                onExpand={handleAllocateExpand} // ✅ here
                />
            ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 2 }}>
          <Button onClick={handleAllocateModalClose} variant="outlined">
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSaveAllocation}
            loading={saveLoading}
            disabled={editableRawData.length === 0}
            sx={{ fontWeight: "bold", px: 4 }}
          >
            Save Allocation
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Add Root Modal */}
      <Dialog open={isAddRootModalOpen} onClose={handleCloseAddRootModal} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Add New Root Entity
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Create a new top-level entity for fund allocation
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Root entities serve as the top-level containers for fund allocation.
            They cannot be deleted once child entities are added.
          </Alert>

          <TextField
            autoFocus
            margin="dense"
            label="Entity Name"
            fullWidth
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            variant="outlined"
            placeholder="e.g., Federal Reserve, Treasury..."
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={handleCloseAddRootModal} variant="outlined">
            Cancel
          </Button>
          <LoadingButton
              onClick={() => handleAddRoot(newRootName)}
              loading={loading}
              variant="contained"
              disabled={!newRootName.trim() || loading}
              sx={{ fontWeight: "bold", px: 4 }}
            >
              Add Entity
            </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AllocateFundsModal;
