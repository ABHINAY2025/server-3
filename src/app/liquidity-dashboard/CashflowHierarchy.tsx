import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { ExpandMore, ChevronRight, AccountBalance, Security } from "@mui/icons-material";
import { formatAmount } from "../../utils/formatAmount";
import { useTheme } from "@/context/theme-provider";

// ---------------------- Types ----------------------
export interface Node {
  key: string;
  name?: string;
  title?: string;  // optional
  amount?: number;
  used?: number;
  children?: Node[];
  level?: number;
  expanded?: boolean;
  control?: boolean;
}

interface CashFlowHierarchyProps {
  rawData: Node[];
  type: "control" | "status";
  controlStatuses: Record<string, boolean>;
  onSwitchChange?: (key: string, value: boolean) => void;
  onTitleClick?: (key: string) => void;
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
}

// ---------------------- Flatten Tree ----------------------
const nodeLevelMap: Record<string, Node> = {};

const flattenTree = (
  nodes: Node[],
  expandedKeys: string[],
  controlStatuses: Record<string, boolean>,
  level = 0
): Node[] => {
  return nodes.reduce<Node[]>((acc, node) => {
    const isExpanded = expandedKeys.includes(node.key);
    nodeLevelMap[node.key] = { ...node, level };
    acc.push({
      ...node,
      level,
      expanded: isExpanded,
      control: controlStatuses[node.key] !== undefined ? controlStatuses[node.key] : true,
    });

    if (isExpanded && node.children) {
      acc.push(...flattenTree(node.children, expandedKeys, controlStatuses, level + 1));
    }

    return acc;
  }, []);
};

// ---------------------- CashFlowHierarchy Component ----------------------
const CashFlowHierarchy: React.FC<CashFlowHierarchyProps> = ({
  rawData,
  type,
  controlStatuses,
  onSwitchChange,
  onTitleClick,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const { isDarkMode } = useTheme(); // Will always be false now

  // Normalize nodes to ensure keys are always strings
  const normalizedRawData = useMemo(() => {
    const normalizeNodes = (nodes: Node[], parentIndex = 0): Node[] => {
      return nodes.map((node, idx) => ({
        ...node,
        key: node.key || node.title || `node-${parentIndex}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        children: node.children ? normalizeNodes(node.children, idx) : undefined,
      }));
    };
    return normalizeNodes(rawData);
  }, [rawData]);

  // Helper to check if parent node is enabled
  const isParentEnabled = (record: Node): boolean => {
    if (record.level === 0) return true;

    const findParent = (nodes: Node[], target: Node): boolean | null => {
      for (const node of nodes) {
        if (node.children) {
          for (const child of node.children) {
            if (child.key === target.key) {
              return controlStatuses[node.key] !== false;
            }
          }
          const parentFound = findParent(node.children, target);
          if (parentFound !== null) return parentFound;
        }
      }
      return null;
    };

    return findParent(normalizedRawData, record) !== false;
  };

  useEffect(() => {
    if (normalizedRawData && normalizedRawData.length > 0) setTabIndex(0);
  }, [normalizedRawData]);

  const toggleExpand = (key: string, level: number) => {
    setExpandedKeys((prev) => {
      const isExpanded = prev.includes(key);
      if (isExpanded) return prev.filter((k) => k !== key);

      // Remove other keys at same level
      const filtered = prev.filter((k) => nodeLevelMap[k]?.level !== level);
      return [...filtered, key];
    });
  };

  const toggleControl = (key: string) => {
    if (onSwitchChange) {
      const newValue = !controlStatuses[key];
      onSwitchChange(key, newValue);
    }
  };

  const renderTable = (treeRoot: Node) => {
    const flattenedData = flattenTree([treeRoot], expandedKeys, controlStatuses);

    const columns = [
      {
        label: "Entity",
        render: (record: Node) => (
          <Box
            display="flex"
            alignItems="center"
            style={{ paddingLeft: `${record.level! * 1.5}rem` }}
            onClick={() => onTitleClick?.(record.key)}
          >
            {record.children?.length ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(record.key, record.level!);
                }}
              >
                {record.expanded ? <ExpandMore /> : <ChevronRight />}
              </IconButton>
            ) : (
              <Box width={32} />
            )}
            <Typography variant="body2">{record.name || record.title}</Typography>
          </Box>
        ),
      },
      {
        label: "Available Balance",
        render: (record: Node) => {
          const amount = record.amount || 0;
          const used = record.used || 0;
          const availableValue = amount - used;
          const formattedAvailable = formatAmount(availableValue);

          const color =
            availableValue <= 0
              ? "#f44336"
              : availableValue < amount * 0.2
              ? "#ff9800"
              : "#4caf50";

          return (
            <Typography variant="body2" style={{ color }}>
              ${formattedAvailable.toLocaleString()}
            </Typography>
          );
        },
      },
    ];

    if (type === "control") {
      columns.push({
        label: "Liquidity Control",
        render: (record: Node) => {
          const isParentOff = record.level! > 0 && !isParentEnabled(record);
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Switch
                size="small"
                checked={record.control!}
                disabled={isParentOff}
                onChange={() => toggleControl(record.key)}
              />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.7rem", opacity: isParentOff ? 0.6 : 1 }}
              >
                {isParentOff ? "PARENT OFF" : record.control ? "ON" : "OFF"}
              </Typography>
            </Box>
          );
        },
      });
    }

    return (
      <Box>
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.label}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {flattenedData.map((record) => (
                <TableRow key={record.key}>
                  {columns.map((col) => (
                    <TableCell key={`${record.key}-${col.label}`}>
                      {col.render(record)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Card elevation={3} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Security sx={{ fontSize: "1rem" }} />
            <Typography variant="h6">Liquidity Controls</Typography>
          </Box>
          <Chip
            label={`${normalizedRawData?.length || 0} Operator${normalizedRawData?.length !== 1 ? "s" : ""}`}
            size="small"
          />
        </Box>

        {normalizedRawData && normalizedRawData.length > 0 && (
          <Tabs
            value={Math.min(tabIndex, normalizedRawData.length - 1)}
            onChange={(_, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {normalizedRawData.map((entry) => (
              <Tab key={entry.key} label={entry.name || entry.title || "Operator"} />
            ))}
          </Tabs>
        )}

        {normalizedRawData &&
        normalizedRawData.length > 0 &&
        normalizedRawData[Math.min(tabIndex, normalizedRawData.length - 1)] ? (
          renderTable(normalizedRawData[Math.min(tabIndex, normalizedRawData.length - 1)])
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <AccountBalance />
            <Typography>No payment operators configured</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowHierarchy;
