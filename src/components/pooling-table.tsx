"use client";

import React, { useState } from "react";
import {
  Table,
  Modal,
  Button,
  Form,
  message,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Drawer,
} from "antd";
import {
  SettingOutlined,
  FilterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { arrayMove } from "@dnd-kit/sortable";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./Customtable.css";

// Reusable render helper
const renderValue = (value: any) => (value ?? "--");
const renderArray = (arr: any) =>
  Array.isArray(arr) && arr.length ? arr.join(", ") : "--";
const renderDate = (arr: any) => {
  if (!Array.isArray(arr)) return "--";
  // Expecting an array like [year, month, day, hour, minute]
  const [y, m, d, h, mm] = arr;
  const date = new Date(
    Number(y) || 0,
    typeof m === "number" ? Number(m) - 1 : 0,
    Number(d) || 1,
    Number(h) || 0,
    Number(mm) || 0
  );
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

// Column definitions
const allColumns = [
  {
    title: "Pool Name",
    dataIndex: "pool_name",
    key: "pool_name",
    align: "center",
    render: renderValue,
  },
  {
    title: "Master Account",
    dataIndex: "master_account",
    key: "master_account",
    align: "center",
    render: renderValue,
  },
  {
    title: "Currency",
    dataIndex: "currency",
    key: "currency",
    align: "center",
    render: renderValue,
  },
  {
    title: "Participating Accounts",
    dataIndex: "participating_accounts",
    key: "participating_accounts",
    align: "center",
    render: renderArray,
  },
  { title: "Status", dataIndex: "status", key: "status", render: renderValue },
  {
    title: "Next Execution",
    dataIndex: "next_execution",
    key: "next_execution",
    align: "center",
    render: renderDate,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "center",
    render: renderValue,
  },
  {
    title: "Liquidity Threshold",
    dataIndex: "liquidity_threshold",
    key: "liquidity_threshold",
    align: "center",
    render: (value: any) => (value !== undefined ? value : "--"),
  },
  {
    title: "Interest Rate (%)",
    dataIndex: "interest",
    key: "interest",
    align: "center",
    render: renderValue,
  },
  {
    title: "Auto-Rebalancing",
    dataIndex: "auto_rebalancing",
    key: "auto_rebalancing",
    align: "center",
    render: (val: any) =>
      typeof val === "string"
        ? val.charAt(0).toUpperCase() + val.slice(1)
        : "--",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    align: "center",
    render: (text: any) => text ?? "View",
  },
];

const PoolingTable: React.FC = () => {
  const staticData = [
    {
      id: 1,
      pool_name: "Global Treasury Pool",
      master_account: "Amazon Main USD",
      currency: "USD",
      participating_accounts: [
        "Amazon US Operations",
        "Amazon Payments",
        "AWS Billing",
      ],
      status: "Active",
      next_execution: [2025, 4, 19, 9, 0],
      balance: 4500000,
      liquidity_threshold: 1000000,
      interest: "3.5",
      auto_rebalancing: "Yes",
      action: "View",
    },
    {
      id: 2,
      pool_name: "EMEA Liquidity Pool",
      master_account: "Amazon Europe Treasury",
      currency: "EUR",
      participating_accounts: ["Amazon Germany", "Amazon France", "Amazon UK"],
      status: "Pending",
      next_execution: [2025, 4, 20, 14, 45],
      balance: 2300000,
      liquidity_threshold: 800000,
      interest: "2.9",
      auto_rebalancing: "No",
      action: "Approve",
    },
    {
      id: 3,
      pool_name: "Asia Pacific Pool",
      master_account: "Amazon Asia Treasury",
      currency: "JPY",
      participating_accounts: [
        "Amazon Japan",
        "Amazon Singapore",
        "Amazon India",
      ],
      status: "Active",
      next_execution: [2025, 4, 21, 11, 30],
      balance: 650000000,
      liquidity_threshold: 500000000,
      interest: "1.75",
      auto_rebalancing: "Yes",
      action: "View",
    },
    {
      id: 4,
      pool_name: "LatAm Consolidated Pool",
      master_account: "Amazon LatAm Treasury",
      currency: "BRL",
      participating_accounts: ["Amazon Brazil", "Amazon Chile"],
      status: "Inactive",
      next_execution: [2025, 4, 25, 16, 0],
      balance: 0,
      liquidity_threshold: 250000,
      interest: "4.1",
      auto_rebalancing: "No",
      action: "Enable",
    },
    {
      id: 5,
      pool_name: "North America Operations Pool",
      master_account: "Amazon NA Treasury",
      currency: "USD",
      participating_accounts: [
        "Amazon Canada",
        "Amazon Logistics",
        "Amazon Advertising",
      ],
      status: "Active",
      next_execution: [2025, 4, 22, 10, 15],
      balance: 3750000,
      liquidity_threshold: 1200000,
      interest: "3.2",
      auto_rebalancing: "Yes",
      action: "View",
    },
    {
      id: 6,
      pool_name: "Middle East Cash Pool",
      master_account: "Amazon MENA Hub",
      currency: "AED",
      participating_accounts: ["Amazon UAE", "Amazon Saudi Arabia"],
      status: "Pending",
      next_execution: [2025, 4, 23, 13, 0],
      balance: 1120000,
      liquidity_threshold: 500000,
      interest: "2.4",
      auto_rebalancing: "No",
      action: "Approve",
    },
    {
      id: 7,
      pool_name: "Amazon Crypto Reserve",
      master_account: "Amazon Blockchain Fund",
      currency: "BTC",
      participating_accounts: ["Amazon Web3", "Amazon NFT Storefront"],
      status: "Active",
      next_execution: [2025, 4, 24, 8, 0],
      balance: 75,
      liquidity_threshold: 50,
      interest: "0.5",
      auto_rebalancing: "Yes",
      action: "View",
    },
  ];

  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.map((col) => col.key)
  );
  const [columnsOrder, setColumnsOrder] = useState(allColumns);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const resetToDefault = () => {
    setSelectedColumns(allColumns.map((col) => col.key));
    setColumnsOrder(allColumns);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columnsOrder.findIndex((col) => col.key === active.id);
      const newIndex = columnsOrder.findIndex((col) => col.key === over.id);
      setColumnsOrder(arrayMove(columnsOrder, oldIndex, newIndex));
    }
  };

  const filteredColumns = columnsOrder.filter((col) =>
    selectedColumns.includes(col.key)
  );

  const handleSubmit = async (values: any) => {
    try {
      message.success("Pool saved successfully!");
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save pool!");
    }
  };

  const resetConfigToDefault = () => {
    form.resetFields();
  };

  const getFilteredData = () => {
    return staticData.filter((record) => {
      const rec: Record<string, any> = record as Record<string, any>;
      return Object.keys(filters).every((key) => {
        const filterVal = filters[key];
        if (!filterVal) return true;
        if (Array.isArray(filterVal)) {
          return filterVal.some((value: any) =>
            String(rec[key] ?? "").toLowerCase().includes(String(value).toLowerCase())
          );
        }
        if (typeof filterVal === "string") {
          return String(rec[key] ?? "")
            .toLowerCase()
            .includes(filterVal.toLowerCase());
        }
        if (key === "next_execution") {
          const selectedDate = dayjs(filterVal);
          const re = rec[key];
          if (!Array.isArray(re)) return false;
          const [y, m, d] = re;
          const recordDate = dayjs(new Date(Number(y), Number(m) - 1, Number(d)));
          return selectedDate.isSame(recordDate, "day");
        }
        return rec[key] === filterVal;
      });
    });
  };

  const filteredData = getFilteredData();

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

        {/* <Button
          className="custom-table-button"
          icon={<EditOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create
        </Button> */}

        <Button
          className="custom-table-button"
          icon={<SettingOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Customize
        </Button>
      </div>

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
              padding: 10,
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.key)}
              onChange={() => handleColumnToggle(column.key)}
            />
            <span style={{ marginLeft: 10 }}>{column.title}</span>
          </div>
        ))}
      </Modal>

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
            <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
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
          <Form.Item label="Pool Name" name="pool_name">
            <Input placeholder="Enter Pool Name" />
          </Form.Item>
          <Form.Item label="Master Account" name="master_account">
            <Input placeholder="Enter Master Account" />
          </Form.Item>
          <Form.Item label="Currency" name="currency">
            <Select
              placeholder="Select Currency"
              allowClear
              options={[
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "AED", label: "AED" },
                { value: "JPY", label: "JPY" },
                { value: "BTC", label: "BTC" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select Status"
              allowClear
              options={[
                { value: "Active", label: "Active" },
                { value: "Pending", label: "Pending" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Next Execution (YYYY-MM-DD)" name="next_execution">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Select Date" allowClear />
          </Form.Item>
          <Form.Item label="Liquidity Threshold" name="liquidity_threshold">
            <InputNumber placeholder="Enter Liquidity Threshold"  style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Auto Rebalancing" name="auto_rebalancing">
            <Select
              placeholder="Select Auto Rebalancing"
              allowClear
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal title="Create Pool" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Pool Name" name="pool_name" rules={[{ required: true, message: "Enter pool name" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Master Account" name="master_account" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Currency" name="currency" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Participating Accounts" name="participating_accounts" rules={[{ required: true }]}>
            <Select mode="tags" tokenSeparators={[","]} />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}> 
            <Select options={[{ value: "Active" }, { value: "InActive" }]} />
          </Form.Item>
          <Form.Item label="Next Execution" name="next_execution" rules={[{ required: true }]}> 
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} disabledDate={(current: any) => current && current < dayjs().startOf("day")} />
          </Form.Item>
          <Form.Item label="Liquidity Threshold" name="liquidity_threshold" rules={[{ required: true }]}> 
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Interest (%)" name="interest" rules={[{ required: true }]}> 
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item label="Auto Rebalancing" name="auto_rebalancing" rules={[{ required: true }]}> 
            <Select
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={resetConfigToDefault} style={{ marginRight: 10 }}>Reset</Button>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        columns={filteredColumns}
        dataSource={filteredData.map((item, index) => ({ ...item, key: item.id ?? index }))}
        rowKey="key"
        className="custom-ant-table"
        rowClassName={() => "no-hover-row"}
      />
    </div>
  );
};

export default PoolingTable;
