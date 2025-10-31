import React, { useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  Stack,
  Button,
  Paper,
  Chip,
  Fade,
  Collapse,
  useTheme,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Delete,
  Add,
  AccountTree,
  MonetizationOn,
  Warning,
} from "@mui/icons-material";

export interface TreeNodeData {
  key: string;
  name: string;
  amount?: number;
  type?: "payment_operator" | "network" | "bank_level" | "customer";
  hierarchyLevel?: number;
  children?: TreeNodeData[];
}

interface TreeNodeProps {
  node: TreeNodeData;
  handleAddNode: (key: string) => void;
  handleRemoveNode: (key: string) => void;
  handleAmountChange: (key: string, value: string | number) => void;
  editable?: boolean;
  isRoot?: boolean;
  expandedKeys: string[];
  onExpand: (key: string) => void;
  level?: number;
  handleEditNode?: (key: string, value: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  handleAddNode,
  handleRemoveNode,
  handleAmountChange,
  editable = false,
  isRoot = false,
  expandedKeys,
  onExpand,
  level = 0,
  handleEditNode = () => {},
}) => {
  const expanded = expandedKeys.includes(node.key);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const childrenTotal =
    node.children?.reduce((sum, child) => sum + (Number(child.amount) || 0), 0) || 0;
  const hasAmountError = childrenTotal > (node.amount || 0);

  const theme = useTheme();
  const isDarkMode = false; // Force light mode

  const nodeColors = false // Always use light mode colors
    ? {
        bg: "transparent",
        border: isRoot ? "rgba(66, 165, 245, 0.3)" : "rgba(255,255,255,0.1)",
        icon: isRoot ? "#42a5f5" : "#90caf9",
        text: "rgba(255,255,255,0.95)",
        textSecondary: "rgba(255,255,255,0.7)",
        background: "transparent",
      }
    : {
        bg: "transparent",
        border: isRoot ? "rgba(25, 118, 210, 0.3)" : "rgba(0,0,0,0.12)",
        icon: isRoot ? "#1976d2" : "#2196f3",
        text: "rgba(0,0,0,0.87)",
        textSecondary: "rgba(0,0,0,0.6)",
        background: "transparent",
      };

  const canHaveChildren = (node: TreeNodeData) => {
    if (node.type) {
      return node.type !== "customer";
    }
    return (node.hierarchyLevel || 0) < 3;
  };

  return (
    <Box sx={{ mb: 0.5 }}>
      <Paper
        elevation={isHovered ? 3 : 1}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          p: 1.5,
          ml: level * 2,
          background: hasAmountError ? "rgba(244,67,54,0.08)" : nodeColors.background,
          border: `1px solid ${hasAmountError ? "rgba(244,67,54,0.5)" : nodeColors.border}`,
          borderRadius: 2,
          transition: "all 0.3s ease",
          transform: isHovered ? "translateY(-1px)" : "translateY(0)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {node.children && node.children.length > 0 && (
            <IconButton size="small" onClick={() => onExpand(node.key)} sx={{ color: nodeColors.icon }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `linear-gradient(45deg, ${nodeColors.icon} 30%, ${nodeColors.border} 90%)`,
              color: "white",
            }}
          >
            {isRoot ? <AccountTree fontSize="small" /> : <MonetizationOn fontSize="small" />}
          </Box>

          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ minWidth: 180, flex: 1 }}>
              {editable ? (
                <TextField
                  size="small"
                  value={node.name}
                  onChange={(e) => handleEditNode(node.key, e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              ) : (
                <Box>
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: nodeColors.text }}>
                    {node.name}
                  </Typography>
                  {node.children && node.children.length > 0 && (
                    <Chip
                      size="small"
                      label={`${node.children.length} child${node.children.length !== 1 ? "ren" : ""}`}
                      sx={{
                        background: nodeColors.bg,
                        color: nodeColors.icon,
                        fontSize: "0.7rem",
                        border: `1px solid ${nodeColors.border}`,
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ width: 140 }}>
              <TextField
                size="small"
                type="number"
                value={node.amount || 0}
                onChange={(e) => handleAmountChange(node.key, e.target.value)} // string | number accepted
                fullWidth
                disabled={isRoot}
                variant="outlined"
                label="Amount ($)"
                InputProps={{
                  startAdornment: <MonetizationOn sx={{ color: hasAmountError ? "#f44336" : "#42a5f5", mr: 0.5, fontSize: 16 }} />,
                }}
                error={hasAmountError}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              {canHaveChildren(node) && (
                <Tooltip title={`Add child to "${node.name}"`} arrow>
                  <IconButton size="small" onClick={() => handleAddNode(node.key)} sx={{ color: "#4caf50" }}>
                    <Add />
                  </IconButton>
                </Tooltip>
              )}

              {!isRoot && (
                <Tooltip title={`Remove "${node.name}" and its children`} arrow>
                  <IconButton size="small" onClick={() => setConfirmDelete(true)} sx={{ color: "#f44336" }}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {node.children && node.children.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              background: nodeColors.bg,
              borderRadius: 1,
              border: `1px solid ${nodeColors.border}`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: nodeColors.textSecondary }}>
              Children Total: ${childrenTotal.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: nodeColors.textSecondary }}>
              Available: ${(Math.max(0, (node.amount || 0) - childrenTotal)).toLocaleString()}
            </Typography>
          </Box>
        )}

        <Collapse in={confirmDelete}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              background: "rgba(244,67,54,0.05)",
              border: "1px solid rgba(244,67,54,0.3)",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: nodeColors.text, mb: 2 }}>
              <Warning sx={{ verticalAlign: "middle", mr: 1, color: "#f44336" }} />
              {`Are you sure you want to delete "${node.name}" and all its children? This action cannot be undone.`}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  handleRemoveNode(node.key);
                  setConfirmDelete(false);
                }}
              >
                Delete
              </Button>
              <Button variant="outlined" size="small" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      <Collapse in={expanded} timeout={300}>
        <Box sx={{ mt: 0.5 }}>
          {node.children?.map((child) => (
            <Fade in={expanded} timeout={400} key={child.key}>
              <Box>
                <TreeNode
                  node={child}
                  handleAddNode={handleAddNode}
                  handleRemoveNode={handleRemoveNode}
                  handleAmountChange={handleAmountChange}
                  editable={editable}
                  isRoot={false}
                  expandedKeys={expandedKeys}
                  onExpand={onExpand}
                  level={level + 1}
                  handleEditNode={handleEditNode}
                />
              </Box>
            </Fade>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default TreeNode;
