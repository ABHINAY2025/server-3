import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Tooltip,
  Spin,
  Alert,
} from "antd";
import { FilterOutlined, SettingOutlined, RightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { fetchTransactionsData } from "@/lib/api/dataApi";
import { useTheme } from "next-themes";

interface PaymentFile {
  _id: string;
  debtor?: {
    debtorName: string;
  };
  initialDebtor?: {
    debtorName: string;
  };
  debtorName?: string;
  amount?: number;
  transactionAmount?: number;
  rulesIDs?: string[];
  ruleIDs?: string[];
  fileStatus?: string;
}

interface TableRecord {
  key: string | number;
  _id: string;
  debtorName: string;
  amount: string | number;
  rulesIDs: string[];
  fileStatus: string;
}

interface WorkFlowData {
  paymentFiles: PaymentFile[];
  totalAmount: number;
  totalTransactions: number;
}

interface WorkFlowTableProps {
  status: string;
}

const WorkFlowTable: React.FC<WorkFlowTableProps> = ({ status }) => {
  const allColumns = [
    {
      title: "Transaction Id",
      dataIndex: "_id",
      key: "_id",
      align: "center" as const,
      render: (text: string) => (
        <Tooltip title="Click to view details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>{text}</span>
            <RightOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "debtorName",
      key: "debtorName",
      align: "center" as const,
      render: (text: string) => (
        <Tooltip title="Click to view details">
          <div style={{
            color: '#1890ff',
            fontWeight: '500',
          }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Transaction Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center" as const,
      render: (amount: number) => (
        <Tooltip title="Click to view details">
          <div style={{
            fontFamily: 'monospace',
            fontWeight: '500',
          }}>
            ${typeof amount === 'number' ? amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : amount}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Applied Rule IDs",
      dataIndex: "rulesIDs",
      key: "rulesIDs",
      align: "center" as const,
      render: (rulesIDs: any[], record: any) => (
        <Tooltip title="Click to view details">
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            border: '1px solid rgba(24, 144, 255, 0.2)',
          }}>
            {`${rulesIDs?.length || 0} rules applied`}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "fileStatus",
      key: "fileStatus",
      align: "center" as const,
      render: (status: string) => (
        <span style={{
          color: status === "To Be Repaired"
            ? "#ca3a3b"
            : status === "Auto Corrected"
              ? "#2d6213"
              : "inherit",
          fontWeight: "500",
        }}>
          {status}
        </span>
      ),
    },
  ];

  const [data, setData] = useState<WorkFlowData>({
    paymentFiles: [],
    totalAmount: 0,
    totalTransactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.map((col) => col.key)
  );
  const [columnsOrder, setColumnsOrder] = useState(allColumns);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [form] = Form.useForm();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prevSelectedColumns) =>
      prevSelectedColumns.includes(key)
        ? prevSelectedColumns.filter((colKey) => colKey !== key)
        : [...prevSelectedColumns, key]
    );
  };

  const resetToDefault = () => {
    setSelectedColumns(allColumns.map((col) => col.key));
    setColumnsOrder(allColumns);
  };

  const paymentFilesArr: PaymentFile[] = Array.isArray(data.paymentFiles)
    ? data.paymentFiles
    : data.paymentFiles && typeof data.paymentFiles === "object"
      ? Object.values(data.paymentFiles)
      : [];

  const filteredData = paymentFilesArr.filter((item: PaymentFile) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      if (key === "amount") {
        return item.amount == filters[key];
      }
      if (key === "rulesIDs") {
        const input = filters[key]?.trim().toLowerCase();
        if (!input) return true;
        const match = input.match(/^\d+/);
        if (match) {
          const ruleCount = parseInt(match[0], 10);
          if (!Array.isArray(item.rulesIDs)) return false;
          return item.rulesIDs.length === ruleCount;
        }
        return true;
      }
      if (key === "debtorName") {
        return item.debtor?.debtorName
          ?.toLowerCase()
          .includes(filters[key].toLowerCase());
      }
      const itemValue = item[key as keyof PaymentFile];
      if (typeof itemValue === "string") {
        return itemValue.toLowerCase().includes(filters[key].toLowerCase());
      }
      return itemValue === filters[key];
    });
  });

  const tableData = filteredData.map((record: PaymentFile, index) => ({
    key: record._id || index,
    _id: record._id ?? "--",
    debtorName:
      record.debtor?.debtorName ||
      record.initialDebtor?.debtorName ||
      record.debtorName ||
      (record.debtor && typeof record.debtor === "string"
        ? record.debtor
        : "--"),
    amount:
      record.amount !== undefined
        ? record.amount
        : record.transactionAmount !== undefined
          ? record.transactionAmount
          : "--",
    rulesIDs: Array.isArray(record.rulesIDs)
      ? record.rulesIDs
      : Array.isArray(record.ruleIDs)
        ? record.ruleIDs
        : [],
    fileStatus: record.fileStatus || status,
  }));

  const handleRowClick = (record: TableRecord) => {
    const baseRoute = status === "Auto Corrected" ? "autocorrected-flow" : "repair-flow";
    const recordId = record._id?.toString().trim();
    if (recordId) {
      router.push(`/${baseRoute}/${recordId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchTransactionsData(status);
        if (result && result.data) {
          setData({
            paymentFiles: result.data.paymentFiles || result.data || [],
            totalAmount: result.data.totalAmount || 0,
            totalTransactions:
              result.data.totalTransactions ||
              (result.data.paymentFiles
                ? result.data.paymentFiles.length
                : Array.isArray(result.data)
                  ? result.data.length
                  : 0),
          });
        } else {
          setData({
            paymentFiles: [],
            totalAmount: 0,
            totalTransactions: 0,
          });
        }
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        setData({
          paymentFiles: [],
          totalAmount: 0,
          totalTransactions: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  if (loading) {
    return (
      <div
        style={{
          padding: 20,
          maxWidth: "100%",
          overflowX: "auto",
           backgroundColor: "#ffffffff",
          position: "relative",
          textAlign: "center",
        }}
      >
        <Spin size="large">
          <div style={{ padding: '50px' }}>Loading data...</div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          maxWidth: "100%",
          overflowX: "auto",
           backgroundColor: "#ffffffff",
          position: "relative",
        }}
      >
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: "100%",
        overflowX: "auto",
        backgroundColor: "#ffffffff",
        position: "relative",
      }}
    >
      {/* Summary Statistics Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "20px",
          justifyContent: "space-between",
        }}
      >
        {/* Transaction Count Card */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            backgroundColor: isDarkMode ? "#1a365d" : "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${isDarkMode ? "#2d4a77" : "#e2e8f0"}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "500",
              color: isDarkMode ? "#8abbff" : "#2a5885",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Total Transactions
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: isDarkMode ? "#ffffff" : "#0a3b66",
              textAlign: "center",
            }}
          >
            {data.totalTransactions.toLocaleString()}
          </div>
        </div>

        {/* Total Amount Card */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            backgroundColor: isDarkMode ? "#1a365d" : "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${isDarkMode ? "#2d4a77" : "#e2e8f0"}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "500",
              color: isDarkMode ? "#8abbff" : "#2a5885",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Total Amount
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: isDarkMode ? "#ffffff" : "#0a3b66",
              textAlign: "center",
            }}
          >
            $
            {data.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Status Card */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            backgroundColor: isDarkMode ? "#1a365d" : "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${isDarkMode ? "#2d4a77" : "#e2e8f0"}`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "500",
              color: isDarkMode ? "#8abbff" : "#2a5885",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Status
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: isDarkMode ? "#ffffff" : "#0a3b66",
              textAlign: "center",
              padding: "0 15px",
            }}
          >
            {status}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <Button
          icon={<FilterOutlined />}
          className="custom-table-button"
          onClick={() => setFilterDrawerVisible(true)}
        >
          Filter
        </Button>
        <Button
          icon={<SettingOutlined />}
          className="custom-table-button"
          style={{ marginLeft: "10px" }}
          onClick={() => setModalVisible(true)}
        >
          Customize
        </Button>
      </div>

      <Drawer
        title="Filter Records"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => setFilters(allValues)}
          initialValues={filters}
          preserve={false}
        >
          <Form.Item label="Customer Name" name="debtorName">
            <Input placeholder="Enter Customer Name" />
          </Form.Item>
          <Form.Item label="Transaction Amount " name="amount">
            <Input type="number" placeholder="Enter Amount" />
          </Form.Item>
          <Form.Item label="Applied Rule IDs" name="rulesIDs">
            <Input placeholder="Enter applied rule IDs" />
          </Form.Item>
          <Form.Item label="Status" name="fileStatus">
            <Select
              placeholder="Select Status"
              allowClear
              options={[
                { value: "To Be Repaired", label: "To Be Repaired" },
                { value: "Auto Corrected", label: "Auto Corrected" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="default"
              onClick={() => {
                form.resetFields();
                setFilters({});
                // Force a re-render by setting initial values
                form.setFieldsValue({
                  debtorName: undefined,
                  amount: undefined,
                  rulesIDs: undefined,
                  fileStatus: undefined
                });
              }}
              style={{ marginRight: "10px" }}
            >
              Reset Filters
            </Button>
            <Button
              type="primary"
              onClick={() => setFilterDrawerVisible(false)}
            >
              Apply Filters
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Customize Columns"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="reset" onClick={resetToDefault}>
            Reset to Default
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setModalVisible(false)}
          >
            Done
          </Button>,
        ]}
      >
        {columnsOrder.map((column) => (
          <div
            key={column.key}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              marginBottom: "5px",
              borderRadius: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.key)}
              onChange={() => handleColumnToggle(column.key)}
            />
            <span style={{ marginLeft: "10px" }}>{column.title}</span>
          </div>
        ))}
      </Modal>

      <Table
        columns={columnsOrder.filter((col) =>
          selectedColumns.includes(col.key)
        )}
        dataSource={tableData}
        className="custom-ant-table"
        rowKey="key"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: {
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#1a365d' : '#f0f7ff';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        })}
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      />
    </div>
  );
};

export default WorkFlowTable;