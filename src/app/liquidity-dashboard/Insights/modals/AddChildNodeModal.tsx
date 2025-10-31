import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AccountTree, Close, Add as AddIcon } from "@mui/icons-material";
import { LoadingButton } from "@/components/ui/LoadingSpinner";
import { useTheme } from "@/context/theme-provider";

// Define node type
export type NodeType = "payment_operator" | "network" | "bank_level" | "customer";

// Define Node interface
export interface Node {
  key: string;
  name: string;
  type?: NodeType;
  hierarchyLevel?: number;
}

// Props for the modal
interface AddChildNodeModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (nodeData: { name: string; type: NodeType; amount: number }) => void;
  parentNode?: Node;
  loading?: boolean;
}

const AddChildNodeModal: React.FC<AddChildNodeModalProps> = ({
  open,
  onClose,
  onAdd,
  parentNode,
  loading = false,
}) => {
  const [nodeName, setNodeName] = useState<string>("");
  const [nodeType, setNodeType] = useState<NodeType | "">("");
  const [amount, setAmount] = useState<string>("");

  const { isDarkMode } = useTheme(); // Will always be false now

  // Helper function to get level from UI key structure
  const getNodeLevelFromKey = (key?: string): number => {
    if (!key) return 0;

    const keyParts = key.split("-");
    if (keyParts.length === 1 || key === "fed" || key === "tch") return 0;

    let calculatedLevel = 0;
    if ((keyParts[0] === "fed" || keyParts[0] === "tch") && keyParts.length >= 2) {
      calculatedLevel = Math.min(keyParts.length - 1, 3);
    } else {
      calculatedLevel = Math.min(keyParts.length - 1, 3);
    }

    return calculatedLevel;
  };

  const getNodeTypeByLevel = (node: Node): NodeType => {
    if (node.type) return node.type;
    if (typeof node.hierarchyLevel === "number") {
      const typesByLevel: NodeType[] = ["payment_operator", "network", "bank_level", "customer"];
      return typesByLevel[node.hierarchyLevel] || "customer";
    }
    const level = getNodeLevelFromKey(node.key);
    const typesByLevel: NodeType[] = ["payment_operator", "network", "bank_level", "customer"];
    return typesByLevel[level] || "customer";
  };

  const getDefaultChildType = (): NodeType | null => {
    if (!parentNode) return "network";

    const parentType = parentNode.type || getNodeTypeByLevel(parentNode);
    switch (parentType) {
      case "payment_operator":
        return "network";
      case "network":
        return "bank_level";
      case "bank_level":
        return "customer";
      case "customer":
      default:
        return null;
    }
  };

  const getNodeTypeOptions = (): { value: NodeType; label: string }[] => {
    if (!parentNode) return [];
    const parentType = parentNode.type || getNodeTypeByLevel(parentNode);
    switch (parentType) {
      case "payment_operator":
        return [{ value: "network", label: "Network Level" }];
      case "network":
        return [{ value: "bank_level", label: "Bank Level" }];
      case "bank_level":
        return [{ value: "customer", label: "Customer Level" }];
      case "customer":
      default:
        return [];
    }
  };

  const nodeTypeOptions = getNodeTypeOptions();

  useEffect(() => {
    if (open && parentNode) {
      const defaultType = getDefaultChildType();
      setNodeType(defaultType || "");
    }
  }, [open, parentNode]);

  const handleSubmit = () => {
    if (!nodeName.trim()) return;
    if (nodeTypeOptions.length === 0) return;

    const defaultType = getDefaultChildType();
    if (!defaultType) return;

    const nodeData = {
      name: nodeName.trim(),
      type: (nodeType || defaultType) as NodeType,
      amount: parseFloat(amount) || 0,
    };

    onAdd(nodeData);
    handleClose();
  };

  const getPlaceholderText = () => {
    const childType = nodeType || getDefaultChildType();
    switch (childType) {
      case "network":
        return "e.g., FedWire, ACH Network, SWIFT, RTP";
      case "bank_level":
        return "e.g., Mortgage Payments, Utility Bills, Salary Credits";
      case "customer":
        return "e.g., John Doe Corp, ABC Bank, XYZ Utilities";
      default:
        return "Enter entity name...";
    }
  };

  const getHelperText = () => {
    const childType = nodeType || getDefaultChildType();
    switch (childType) {
      case "network":
        return "Network-level entities handle payment routing and processing";
      case "bank_level":
        return "Bank-level entities group similar transaction types or services";
      case "customer":
        return "Customer-level entities represent individual participants or organizations";
      default:
        return "Choose an appropriate name for this entity";
    }
  };

  const handleClose = () => {
    setNodeName("");
    setNodeType("");
    setAmount("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          background: "#fff", // Always light mode
          color: "#000",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AccountTree sx={{ fontSize: 28, color: "white" }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                Add Child Entity
              </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: "white", mt: 0.5 }}>
                Add a new entity under &quot;{parentNode?.name}&quot;
                </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Alert
          severity="info"
          sx={{
            mb: 3,
            background: "rgba(76, 175, 80, 0.08)", // Always light mode
            border: "1px solid rgba(76, 175, 80, 0.3)",
            color: "rgba(0,0,0,0.87)",
            "& .MuiAlert-icon": { color: "#4caf50" },
          }}
        >
          This will create a new entity in the hierarchy. Choose an appropriate
          name and type based on the payment system structure.
        </Alert>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            autoFocus
            label="Entity Name"
            fullWidth
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            variant="outlined"
            placeholder={getPlaceholderText()}
            helperText={getHelperText()}
          />

          {nodeTypeOptions.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select value={nodeType} onChange={(e) => setNodeType(e.target.value as NodeType)}>
                {nodeTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="warning">
              This entity cannot have children. Customer level is the final level.
            </Alert>
          )}

          <TextField
            label="Initial Amount (Optional)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="outlined"
            placeholder="0.00"
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          variant="contained"
          disabled={!nodeName.trim() || nodeTypeOptions.length === 0}
          startIcon={<AddIcon />}
        >
          Add Entity
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddChildNodeModal;
