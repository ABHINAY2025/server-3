import React, { useState, useEffect, MouseEvent } from "react";
import { Box } from "@mui/material";
import CashFlowHierarchy from "./CashflowHierarchy";
import {
  createNode,
  fetchHierarchyOptimized,
  updateNode,
  deleteNode,
  fetchCounterpartyDataOptimized,
  counterpartyData ,
  preloadDashboardData,
  startBackgroundRefresh,
  apiCache,
} from "@/lib/api/liquidity";
import { useLoadingStates, useAsyncOperation } from "@/hooks/useLoading";
// import FundsAllocation from "./Insights/FundsAllocation";
import CounterPartyPositions from "./Insights/CounterPartyPositions";
import FundsAllocation, { fundsAllocationColumns } from "./Insights/FundsAllocation";
import CurrentPosition from "./Insights/CurrentPosition";
import AllocateFundsModal from "./Insights/modals/AllocateFundsModal";
import AddChildNodeModal from "./Insights/modals/AddChildNodeModal";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { formatAmount } from "../../utils/formatAmount";
import { useTheme } from "@/context/theme-provider";


// ---------------------------
// Types
// ---------------------------
interface Node {
  nodeKey: string;
  key?: string;
  originalKey?: string;
  backendKey?: string;
  name: string;
  amount?: number;
  inflow?: number;
  outflow?: number;
  used?: number;
  status?: string;
  type?: string | null;
  children?: Node[];
  hierarchyPath?: string[];
  hierarchyLevel?: number;
}

interface FundRow {
  key: string | number;
  name: string;
  amount?: number;
  status?: string;
  type?: string | null;
  parentKey?: string | null;
  children?: FundRow[];
}

interface CurrentPositionItem {
  key: string;
  cashFlow: string;
  amount: number;
  inflow?: number;
  outflow?: number;
  availableBalance?: number;
  utilization?: number;
  status?: string;
  level: number;
  children?: Node[];
}

interface CounterpartyData {
  [key: string]: {
    opening: string;
    current: string;
    updatedAt: string;
    institutionType: string;
    creditRating: string;
    creditLimit: string;
    riskLevel: string;
    lastTransactionDate: string;
    inflowAmount: number;
    outflowAmount: number;
    status: string;
  };
}

interface SwitchStates {
  [key: string]: boolean;
}

// ---------------------------
// Constants
// ---------------------------
const currentPositionColumnsDefault = [
  {
    title: "Entity",
    dataIndex: "cashFlow",
    key: "cashFlow",
    align: "left",
  },
  {
    title: "Inflow",
    dataIndex: "inflow",
    key: "inflow",
    align: "right",
    render: (inflow: number) => `$${(inflow || 0).toLocaleString()}`,
  },
  {
    title: "Outflow",
    dataIndex: "outflow",
    key: "outflow",
    align: "right",
    render: (amount: number) => `$${(amount || 0).toLocaleString()}`,
  },
  {
    title: "Net Position",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (amount: number) => {
      const value = amount || 0;
      const color = value >= 0 ? "#4caf50" : "#f44336";
      return (
        <span style={{ color, fontWeight: "bold" }}>
          ${formatAmount(value).toLocaleString()}
        </span>
      );
    },
  },
  {
    title: "Trend",
    dataIndex: "amount",
    key: "trend",
    align: "center",
    render: (amount: number) => {
      const isPositive = amount >= 0;
      return (
        <span style={{ fontWeight: "bold", fontSize: "0.8rem" }}>
          {isPositive ? <CaretUpOutlined style={{ color: "green" }} /> : <CaretDownOutlined style={{ color: "red" }} />}
        </span>
      );
    },
  },
];

// ---------------------------
// Component
// ---------------------------
const Orchestration: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [isSwitchChecked, setIsSwitchChecked] = useState<SwitchStates>({});
  const [controlStatuses, setControlStatuses] = useState<SwitchStates>({});
  const [currentPositionData, setCurrentPositionData] = useState<CurrentPositionItem[]>([]);
  const [isAllocateModalVisible, setIsAllocateModalVisible] = useState<boolean>(false);
  const [currentPositionColumns, setCurrentPositionColumns] = useState(currentPositionColumnsDefault);
  const [allocateExpandedKeys, setAllocateExpandedKeys] = useState<string[]>([]);
  const [isAddRootModalOpen, setIsAddRootModalOpen] = useState<boolean>(false);
  const [newRootName, setNewRootName] = useState<string>("");
  const [counterpartyTableData, setCounterpartyTableData] = useState<CounterpartyData>({});
 
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [rawData, setRawData] = useState<Node[]>([]);
  const { isDarkMode } = useTheme(); // Will always be false now

  const normalizedCurrentPositionData = currentPositionData.map(item => ({
    ...item,
    amount: item.amount || 0,
    inflow: item.inflow || 0,
    outflow: item.outflow || 0,
  }));

  const { loadingStates, setLoading, isLoading } = useLoadingStates({
    hierarchy: false,
    nodeCreation: false,
    saveAllocation: false,
    counterparty: false,
  });

  const hierarchyOperation = useAsyncOperation();
  const counterpartyOperation = useAsyncOperation();

  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState<boolean>(false);
 const [selectedParentNode, setSelectedParentNode] = useState<Node | null>(null);


  // ---------------------------
  // Mouse hover handlers
  // ---------------------------
  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(-5px)";
    target.style.boxShadow =
      "0 12px 24px rgba(0, 0, 0, 0.3), inset 2px 2px 10px rgba(255, 255, 255, 0.1)";
    target.style.borderColor = "rgba(66, 165, 245, 0.5)";
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = "translateY(0)";
    target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
    target.style.borderColor = "rgba(255, 255, 255, 0.1)";
  };

  // ---------------------------
  // Load hierarchy data
  // ---------------------------
  const loadData = async () => {
    await hierarchyOperation.execute(
      async () => {
        const response = await fetchHierarchyOptimized();
        const data: Node[] = Array.isArray(response?.data) ? response.data : [];
        setRawData(data);
        return data;
      },
      {
        minLoadingTime: 300,
        onError: (error: Error) => {
          console.error("Error loading hierarchy data:", error);
          setRawData([]);
        },
      }
    );
  };

  const loadCounterpartyData = async () => {
  try {
    const response = await counterpartyData();
    console.log("✅ Counterparty positions loaded:", response.data);
    setCounterpartyTableData(response.data || []);
  } catch (error) {
    console.error("❌ Error loading counterparty positions:", error);
    setCounterpartyTableData([]);
  }
};

// const [counterpartyTableData, setCounterpartyTableData] = useState<CounterpartyData[]>([]);

  useEffect(() => {
    preloadDashboardData({ activeTab: "orchestration" });

    // Load both datasets initially
    loadData();
    loadCounterpartyData();

    // Refresh both every 30 seconds
    const cleanup = startBackgroundRefresh(() => {
      loadData();
      loadCounterpartyData();
    }, 30000);

    return () => cleanup();
  }, []);



  // ---------------------------
  // Generate unique keys and normalize
  // ---------------------------
  const generateUniqueKeys = (nodes: Node[], parentPath: string[] = []): Node[] => {
    return nodes.map((node) => {
      const currentPath = [...parentPath, node.nodeKey];
      const hierarchicalKey = currentPath.join("-");
      return {
        ...node,
        originalKey: node.nodeKey,
        key: hierarchicalKey,
        backendKey: node.nodeKey,
        hierarchyPath: currentPath,
        hierarchyLevel: currentPath.length - 1,
        children: node.children ? generateUniqueKeys(node.children, currentPath) : undefined,
      };
    });
  };

  const uniqueRawData = React.useMemo(() => generateUniqueKeys(rawData), [rawData]);
  const [editableRawData, setEditableRawData] = useState<Node[]>(uniqueRawData);

  useEffect(() => {
    setEditableRawData(uniqueRawData);
  }, [uniqueRawData]);

  // ---------------------------
  // Normalize rawData recursively to ensure 'key' exists
  // ---------------------------
 const normalizedRawData = uniqueRawData.map((node, idx) => {
  const generateKey = () => node.key || node.nodeKey || `node-${idx}-${Date.now()}`;
  
  const normalize = (n: any, i: number): Node => ({
    key: n.key || n.nodeKey || `node-${i}-${Date.now()}`,
    name: n.name,
    title: n.title || n.name,
    amount: n.amount || 0,
    children: n.children ? n.children.map((c: any, ci: number) => normalize(c, ci)) : undefined,
  });

  return normalize(node, idx);
});

  // ---------------------------
  // Convert Node[] to FundRow[] for FundsAllocation
  // ---------------------------
  const fundRows: FundRow[] = React.useMemo(() => {
    const mapNodesToFundRows = (nodes: Node[]): FundRow[] =>
      nodes.map((node) => ({
        key: node.key ?? node.nodeKey,
        name: node.name,
        amount: node.amount ?? 0,
        status: node.status ?? "Active",
        type: node.type ?? null,
        parentKey: node.hierarchyPath?.slice(-2, -1)[0] ?? null,
        children: node.children ? mapNodesToFundRows(node.children) : [],
      }));

    return mapNodesToFundRows(editableRawData);
  }, [editableRawData]);

  // ---------------------------
  // Allocate Funds modal
  // ---------------------------
  const handleAllocateModalOpen = () => setIsAllocateModalVisible(true);
  const handleAllocateModalClose = () => setIsAllocateModalVisible(false);

  // ---------------------------
  // Add Root Node
  // ---------------------------
const handleAddRoot = async (operatorName: string) => {
  if (!operatorName.trim() || isLoading("nodeCreation")) return;

  setLoading("nodeCreation", true);

  try {
    const timestamp = Date.now();
    const cleanNodeKey = `${operatorName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

    // Update locally for instant UI feedback
    const newNode: Node = {
      key: cleanNodeKey,
      name: operatorName,
      title: operatorName,
      amount: 0,
      children: [],
    };
    setRawData(prev => [...prev, newNode]);

    const createResponse = await createNode({
      nodeKey: cleanNodeKey,
      name: operatorName,
      amount: 0,
      parentKey: null,
      type: "payment_operator",
    });

    if (createResponse?.status !== 200 && createResponse?.status !== 201) {
      throw new Error("Node creation failed on server");
    }

    setIsAddRootModalOpen(false);
    setNewRootName("");
    apiCache.clear();
    await loadData();

  } catch (err: any) {
    console.error("Error adding payment operator:", err);
    alert("Failed to add payment operator: " + (err.message || "Unknown error"));
  } finally {
    setLoading("nodeCreation", false);
  }
};


  // ---------------------------
  // Add Child Node
  // ---------------------------
  const handleAddNode = (uiParentKey: string) => {
    const findNodeByKey = (nodes: Node[], key: string): Node | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findNodeByKey(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };

    const uiParentNode = findNodeByKey(uniqueRawData, uiParentKey);
    if (!uiParentNode) {
      alert("Parent node not found.");
      return;
    }
    setSelectedParentNode(uiParentNode);
    setIsAddChildModalOpen(true);
  };

  const handleAddChildNode = async (nodeData: { name: string; amount?: number; type?: string }) => {
    if (!selectedParentNode) return;

    const parentNodeKey = selectedParentNode.backendKey || selectedParentNode.originalKey || selectedParentNode.nodeKey;
    const timestamp = Date.now();
    const cleanNodeKey = `${nodeData.name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

    try {
      const createResponse = await createNode({
        nodeKey: cleanNodeKey,
        name: nodeData.name,
        amount: nodeData.amount || 0,
        parentKey: parentNodeKey,
        type: nodeData.type || "",
      });

      if (createResponse.data) {
        apiCache.clear();
        await loadData();
        setAllocateExpandedKeys((prev) => [...new Set([...prev, selectedParentNode.key!])]);
        setIsAddChildModalOpen(false);
        setIsAllocateModalVisible(true);
      }
    } catch (err: any) {
      console.error("Error creating node:", err);
      alert("Failed to add child node: " + (err.message || "Unknown error"));
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <Box
      className="orchestration-container"
      sx={{
        height: "100%",
        maxHeight: "calc(100vh - 136px)",
        width: "100%",
        paddingTop: "10px",
        paddingLeft: "10px",
        paddingRight: "10px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 1.5,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          height: "220px",
        }}
      >
        <Box sx={{ flex: 1, height: "100%" }}>
          <FundsAllocation
            hovered={hovered}
            setHovered={setHovered}
            fundsAllocationColumns={fundsAllocationColumns}
            rootData={fundRows}
            handleAllocateModalOpen={handleAllocateModalOpen}
            hierarchyLoading={isLoading("hierarchy")}
          />
        </Box>
        <Box sx={{ flex: 1, height: "100%" }}>
          <CounterPartyPositions
            counterpartyData={counterpartyTableData}
            loading={isLoading("counterparty")}
            companies={companies}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            isSwitchChecked={isSwitchChecked}
            setIsSwitchChecked={setIsSwitchChecked}
            handleMouseEnter={() => {}}
            handleMouseLeave={() => {}}
          />
        </Box>
      </Box>
      

      {/* Bottom Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flex: 1,
          minHeight: 0,
          maxHeight: "calc(100% - 240px)",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <CashFlowHierarchy
  rawData={normalizedRawData}
  type="control"
  controlStatuses={controlStatuses}
  onSwitchChange={() => {}}
  onTitleClick={() => {}}
  handleMouseEnter={()=>{}}
  handleMouseLeave={()=>{}}
/>

        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <CurrentPosition
            handleMouseEnter={() => {}}
            handleMouseLeave={() => {}}
            currentPositionColumns={currentPositionColumns}
            currentPositionData={normalizedCurrentPositionData}
            handleRowClick={() => {}}
          />
        </Box>
      </Box>

      {/* Allocate Funds Modal */}
      <AllocateFundsModal
        isAllocateModalVisible={isAllocateModalVisible}
        handleAllocateModalClose={handleAllocateModalClose}
        editableRawData={editableRawData}
        handleAddNode={handleAddNode}
        handleRemoveNode={() => {}}
        handleAmountChange={() => {}}
        allocateExpandedKeys={allocateExpandedKeys}
        handleAllocateExpand={(key: string) => {
          setAllocateExpandedKeys(prev => 
            prev.includes(key) 
              ? prev.filter(k => k !== key) 
              : [...prev, key]
          );
        }}
        handleSaveAllocation={() => {}}
        handleOpenAddRootModal={() => setIsAddRootModalOpen(true)}
        isAddRootModalOpen={isAddRootModalOpen}
        handleCloseAddRootModal={() => setIsAddRootModalOpen(false)}
        newRootName={newRootName}
        setNewRootName={setNewRootName}
        handleAddRoot={handleAddRoot}  // This function should accept a string parameter
        loading={isLoading("nodeCreation")}
        saveLoading={isLoading("saveAllocation")}
        hierarchyLoading={isLoading("hierarchy")}
      />

      {/* Add Child Node Modal */}
 <AddChildNodeModal
  open={isAddChildModalOpen}
  onClose={() => setIsAddChildModalOpen(false)}
  onAdd={handleAddChildNode}
  parentNode={selectedParentNode ?? undefined} // null → undefined
  loading={isLoading("nodeCreation")}
/>

    </Box>
  );
};

export default Orchestration;
