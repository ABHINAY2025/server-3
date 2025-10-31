 
"use client";
 
import { useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  Space,
} from "antd";
import {
  SettingOutlined,
  FilterOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
 
const useTheme = (): { isDarkMode: boolean } => {
  // local fallback implementation if ../../context/ThemeContext is not present
  // change this to your actual ThemeContext implementation or replace with a proper import.
  return { isDarkMode: false };
};
 
const { Title } = Typography;
 
const allColumns = [
  { title: "Network Name", dataIndex: "name", key: "name", align: "center" as "center" },
  {
    title: "Bank Name",
    dataIndex: "companyName",
    key: "companyName",
    align: "center" as "center",
  },
  { title: "Type", dataIndex: "type", key: "type", align: "center" as "center" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center" as "center",
    render: (status: string) => (
      <Tag color={status === "Active" ? "green" : "red"}>
        {status.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Additional Information",
    dataIndex: "additionalInfo",
    key: "additionalInfo",
    align: "center" as "center",
  },
];
 
const NetworkResolutionPage = () => {
  const networks: Array<{
    _id: string;
    name: string;
    status: string;
    additionalInfo: string;
    type: string;
    companyName: string;
    [key: string]: string;
  }> = [
    {
      _id: "67448270de0805626422af6e",
      name: "TCH",
      status: "Active",
      additionalInfo: "",
      type: "Secondary",
      companyName: "Wells Fargo & Co.",
    },
    {
      _id: "67448270de0805626422af6d",
      name: "FED",
      status: "Active",
      additionalInfo: "FedNow Service is operational. No issues reported.",
      type: "Primary",
      companyName: "Wells Fargo & Co.",
    },
  ];
 
  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.map((col) => col.key)
  );
  const [columnsOrder, setColumnsOrder] = useState(allColumns);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [form] = Form.useForm();
  const { isDarkMode } = useTheme();
 
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
 
  const filteredColumns = columnsOrder.filter((col) =>
    selectedColumns.includes(col.key)
  );
 
  const filteredData = networks.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return item[key]
        ?.toString()
        .toLowerCase()
        .includes(filters[key].toLowerCase());
    });
  });
 
  const handleCreateSubmit = (values: any) => {
    message.success("Network created successfully!");
    form.resetFields();
    setCreateModalVisible(false);
  };
 
  return (
    <div
      style={{
        padding: 20,
        maxWidth: "100%",
        overflowX: "auto",
        backgroundColor: isDarkMode ? "#0c1f3c" : "background: #f0f2f5",
        height: "100%",
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
        title="Filter Networks"
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
            <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
              Apply
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => setFilters(allValues)}
        >
          <Form.Item label="Network Name" name="name">
            <Input placeholder="Enter network name" />
          </Form.Item>
          <Form.Item label="Bank Name" name="companyName">
            <Input placeholder="Enter bank name" />
          </Form.Item>
          <Form.Item label="Type" name="type">
            <Select
              placeholder="Select type"
              allowClear
              options={[
                { value: "Primary", label: "Primary" },
                { value: "Secondary", label: "Secondary" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select status"
              allowClear
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
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
 
      <Card
        style={{
          width: "100%",
          margin: "20px auto",
          backgroundColor: isDarkMode ? "#0c1f3c" : "background: #f0f2f5",
        }}
      >
        <Title
          style={{
            color: isDarkMode ? "#ffffff" : "#000000",
          }}
          level={4}
        >
          Network Status
        </Title>
        <Table
          columns={filteredColumns}
          dataSource={filteredData}
          className="custom-ant-table"
          pagination={false}
          bordered
          rowKey="_id"
          style={{
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
      </Card>
    </div>
  );
};
 
export default NetworkResolutionPage;
 
 
 