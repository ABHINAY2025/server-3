"use client";

import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Input, Select, Drawer } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { fetchCashFlowData } from "@/lib/api/liquidity";

import "./Customtable.css";

interface CashFlowRecord {
  id: number;
  msgId: string;
  debtorName: string;
  creditorName: string;
  clearingNetwork: string;
  cashFlow: string;
  status: string;
  creationDateTime: string;
  creditorNetworkType?: string;
  debtorNetworkType?: string;
  tier?: string;
  amount?: number;
}

interface FormValues {
  msgId: string;
  debtorName: string;
  creditorName: string;
  clearingNetwork: string;
  cashFlow: string;
  status: string;
  amount: string;
}

const allColumns: ColumnsType<CashFlowRecord> = [
  { title: "Msg ID", dataIndex: "msgId", align: "center" as const, key: "msgId" },
  {
    title: "Debtor Name",
    dataIndex: "debtorName",
    key: "debtorName",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Creditor Name",
    dataIndex: "creditorName",
    key: "creditorName",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Clearing Network",
    dataIndex: "clearingNetwork",
    key: "clearingNetwork",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Cash Inflow/Outflow",
    dataIndex: "cashFlow",
    key: "cashFlow",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Settlement Date",
    dataIndex: "creationDateTime",
    key: "Settlement Date",
    align: "center" as const,
    render: (text: string) => (text ? new Date(text).toLocaleString() : "N/A"),
  },
];

const CashFlowTable: React.FC = () => {
  const [data, setData] = useState<CashFlowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cash flow data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCashFlowData();
      setData(response);
    } catch (err) {
      console.error("Failed to fetch cash flow data:", err);
      setError("Failed to load cash flow data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Column selection and ordering

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    allColumns.map((col) => col.key as string)
  );
  const [columnsOrder, setColumnsOrder] = useState(allColumns);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [form] = Form.useForm<FormValues>();

  // Function to filter data based on filters state
  const getFilteredData = () => {
    return data.filter((record) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        if (typeof filters[key] === "string") {
          const recordValue = record[key as keyof CashFlowRecord];
          return String(recordValue)
            .toLowerCase()
            .includes(filters[key].toLowerCase());
        }
        return record[key as keyof CashFlowRecord] === filters[key];
      });
    });
  };

  // Filtered data for the table
  const filteredData = getFilteredData();

  // Reset to default
  const resetToDefault = () => {
    setSelectedColumns(allColumns.map((col) => col.key as string));
    setColumnsOrder(allColumns);
  };

  // Handle column toggle
  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Handle column reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columnsOrder.findIndex((col) => col.key === active.id);
      const newIndex = columnsOrder.findIndex((col) => col.key === over.id);
      setColumnsOrder(arrayMove(columnsOrder, oldIndex, newIndex));
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Replace with your API call
      console.log("Submitting values:", values);
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to save cash flow:", error);
    }
  };

  // Filter visible columns
  const filteredColumns = useMemo(
    () => columnsOrder.filter((col) => selectedColumns.includes(col.key as string)),
    [columnsOrder, selectedColumns]
  );

  return (
    <div
      style={{
        padding: 20,
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
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
          className="custom-table-button"
          icon={<FilterOutlined />}
          onClick={() => setFilterDrawerVisible(true)}
        >
          Filter
        </Button>

        <Button
          className="custom-table-button"
          icon={<SettingOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Customize
        </Button>
      </div>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Records"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              onClick={() => {
                form.resetFields();
                setFilters({});
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() => setFilterDrawerVisible(false)}
            >
              Apply
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues: any, allValues: any) => setFilters(allValues)}
        >
          <Form.Item label="Message ID" name="msgId">
            <Input placeholder="Enter Message ID" />
          </Form.Item>
          <Form.Item label="Creditor Name" name="creditorName">
            <Input placeholder="Enter Creditor Name" />
          </Form.Item>
          <Form.Item label="Debtor Name" name="debtorName">
            <Input placeholder="Enter Debtor Name" />
          </Form.Item>
          <Form.Item label="Clearing Network" name="clearingNetwork">
            <Select
              placeholder="Select Clearing Network"
              allowClear
              options={[
                { value: "ACH", label: "ACH" },
                { value: "SWIFT", label: "SWIFT" },
                { value: "RTGS", label: "RTGS" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Tier" name="tier">
            <Select
              placeholder="Select Tier"
              allowClear
              options={[
                { value: "Tier1", label: "Tier1" },
                { value: "Tier2", label: "Tier2" },
                { value: "Tier3", label: "Tier3" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select Status"
              allowClear
              options={[
                { value: "Processing", label: "Processing" },
                { value: "Completed", label: "Completed" },
                { value: "Failed", label: "Failed" },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Customization Modal */}
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
            key={column.key?.toString()}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              marginBottom: "5px",
              borderRadius: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={column.key !== undefined && selectedColumns.includes(column.key.toString())}
              onChange={() => column.key && handleColumnToggle(column.key.toString())}
            />
            <span style={{ marginLeft: "10px" }}>{typeof column.title === 'function' ? column.title({}) : column.title}</span>
          </div>
        ))}
      </Modal>

      {/* create modal */}
      <Modal
        title="Create Cash Flow"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Message ID"
            name="msgId"
            rules={[{ required: true, message: "Please enter Message ID" }]}
          >
            <Input placeholder="Enter Message ID" />
          </Form.Item>

          <Form.Item
            label="Creditor Name"
            name="creditorName"
            rules={[{ required: true, message: "Please enter Creditor Name" }]}
          >
            <Input placeholder="Enter Creditor Name" />
          </Form.Item>

          <Form.Item
            label="Debtor Name"
            name="debtorName"
            rules={[{ required: true, message: "Please enter Debtor Name" }]}
          >
            <Input placeholder="Enter Debtor Name" />
          </Form.Item>

          <Form.Item
            label="Clearing Network"
            name="clearingNetwork"
            rules={[
              { required: true, message: "Please select Clearing Network" },
            ]}
          >
            <Select
              placeholder="Select Clearing Network"
              options={[
                { value: "ACH", label: "ACH" },
                { value: "SWIFT", label: "SWIFT" },
                { value: "RTGS", label: "RTGS" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Cash Flow"
            name="cashFlow"
            rules={[{ required: true, message: "Please enter Cash Flow" }]}
          >
            <Input placeholder="Enter Cash Flow (e.g., Inflow or Outflow)" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a Status" }]}
          >
            <Select
              placeholder="Select Status"
              options={[
                { value: "Processing", label: "Processing" },
                { value: "Completed", label: "Completed" },
                { value: "Failed", label: "Failed" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Transaction Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter Transaction Amount" },
            ]}
          >
            <Input placeholder="Enter Transaction Amount" />
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => form.resetFields()}
              style={{ marginRight: 10 }}
            >
              Reset
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      {/* Transactions Table */}
      <Table
        className="custom-ant-table"
        columns={filteredColumns}
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        loading={loading}
      />
    </div>
  );
};

export default CashFlowTable;