"use client";

import React, { useState } from "react";
import {
  Table,
  Modal,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  message,
} from "antd";
import dayjs from 'dayjs';
import {
  SettingOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import axios from "axios";
import "./Customtable.css";

interface ReserveRecord {
  id: number;
  reserve_name: string;
  master_account: string;
  currency: string;
  reserved_amount: number;
  minimum_required: number;
  status: string;
  last_updated: number[] | null;
  auto_refill: string;
  key?: string | number;
}

interface FormValues {
  reserve_name: string;
  master_account: string;
  currency: string;
  reserved_amount: string;
  minimum_required: string;
  status: string;
  auto_refill: string;
}

import type { ColumnsType } from "antd/es/table";

const allColumns: ColumnsType<ReserveRecord> = [
  {
    title: "Reserve Name",
    dataIndex: "reserve_name",
    key: "reserve_name",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Master Account",
    dataIndex: "master_account",
    key: "master_account",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Currency",
    dataIndex: "currency",
    key: "currency",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Reserved Amount",
    dataIndex: "reserved_amount",
    key: "reserved_amount",
    align: "center" as const,
    render: (text: number) => text || "--",
  },
  {
    title: "Minimum Required",
    dataIndex: "minimum_required",
    key: "minimum_required",
    align: "center" as const,
    render: (text: number) => text || "--",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Last Updated",
    dataIndex: "last_updated",
    key: "last_updated",
    align: "center" as const,
    render: (arr: number[] | null) => {
      if (!arr || !Array.isArray(arr)) return "--";
      const [y, m, d, h, mm] = arr;
      const date = new Date(
        Number(y) || 0,
        typeof m === "number" ? Number(m) - 1 : 0,
        Number(d) || 1,
        Number(h) || 0,
        Number(mm) || 0
      );
      return date.toLocaleString();
    },
  },
  {
    title: "Auto Refill",
    dataIndex: "auto_refill",
    key: "auto_refill",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    align: "center" as const,
    render: (text: string) => text || "--",
  },
];

const ReservesTable: React.FC = () => {
  const staticData: ReserveRecord[] = [
    {
      id: 1,
      reserve_name: "Corporate Reserve",
      master_account: "Global Trust Bank - 101",
      currency: "USD",
      reserved_amount: 500000,
      minimum_required: 10000,
      status: "Active",
      last_updated: [2025, 3, 19, 14, 30],
      auto_refill: "Yes",
    },
    {
      id: 2,
      reserve_name: "Emergency Fund",
      master_account: "Deutsche Bank - 202",
      currency: "USD",
      reserved_amount: 10000,
      minimum_required: 7000,
      status: "Active",
      last_updated: null,
      auto_refill: "yes",
    },
    {
      id: 3,
      reserve_name: "Emergency Reserve",
      master_account: "Deutsche Bank - 303",
      currency: "USD",
      reserved_amount: 10000,
      minimum_required: 5000,
      status: "InActive",
      last_updated: [2025, 3, 19, 16, 13],
      auto_refill: "yes",
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
  const [data, setData] = useState<ReserveRecord[]>(staticData);

  // Toggle column visibility
  const handleColumnToggle = (key: string) => {
    setSelectedColumns(
      (prevSelectedColumns) =>
        prevSelectedColumns.includes(key)
          ? prevSelectedColumns.filter((colKey) => colKey !== key)
          : [...prevSelectedColumns, key]
    );
  };

  // Reset to default
  const resetToDefault = () => {
    setSelectedColumns(allColumns.map((col) => col.key));
    setColumnsOrder(allColumns);
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

  // Filter visible columns
  const filteredColumns = columnsOrder.filter((col) =>
    selectedColumns.includes(col.key)
  );

  const [form] = Form.useForm<FormValues>();

  const fetchData = async () => {
    try {
      // Replace URL with your API endpoint
      // const response = await axios.get(URL);
      // setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data!");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Replace with your API call
      // await axios.post(URL, values);
      message.success("Cash Reserves saved successfully!");
      setCreateModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error("Failed to save cash reserve!");
    }
  };

  // Function to reset from default values
  const resetReserveToDefault = () => {
    form.resetFields();
  };

  // Filter data based on applied filters
  const getFilteredData = () => {
    return data.filter((record) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        if (key === "last_updated") {
          if (!value || !record.last_updated) return true;
          const recordDate = dayjs(record.last_updated.join("-"));
          return recordDate.isSame(dayjs(value), 'day');
        }

        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(record[key as keyof ReserveRecord]);
        }

        const recordValue = String(record[key as keyof ReserveRecord]).toLowerCase();
        return recordValue.includes(String(value).toLowerCase());
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
          onValuesChange={(changedValues: any, allValues: any) =>
            setFilters(allValues)
          }
        >
          <Form.Item label="Reserve Name" name="reserve_name">
            <Input placeholder="Enter Reserve Name" />
          </Form.Item>
          <Form.Item label="Master Account" name="master_account">
            <Input placeholder="Enter Master Account" />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              placeholder="Select Status"
              allowClear
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Auto Refill" name="auto_refill">
            <Select
              placeholder="Select Auto Refill"
              allowClear
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
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
            key={typeof column.key === 'string' ? column.key : 'col'}
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
            <span style={{ marginLeft: "10px" }}>{String(column.title)}</span>
          </div>
        ))}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Create Cash Reserves"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Reserve Name"
            name="reserve_name"
            rules={[{ required: true, message: "please enter reserve name" }]}
          >
            <Input placeholder="Enter reserve name" />
          </Form.Item>

          <Form.Item
            label="Master Account"
            name="master_account"
            rules={[{ required: true, message: "please enter Master Account" }]}
          >
            <Input placeholder="Enter master account" />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: "please enter Currency " }]}
          >
            <Input placeholder="Enter currency " />
          </Form.Item>

          <Form.Item
            label="Reserved Amount"
            name="reserved_amount"
            rules={[
              { required: true, message: "please enter Reserved Amount " },
            ]}
          >
            <Input placeholder="Enter reserved amount " />
          </Form.Item>

          <Form.Item
            label="Minimum Required"
            name="minimum_required"
            rules={[
              { required: true, message: "please enter Minimum Required" },
            ]}
          >
            <Input placeholder="Enter minimum required" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "please select a Status " }]}
          >
            <Select
              showSearch
              placeholder="Select an option"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { value: "Active", label: "Active" },
                { value: "InActive", label: "InActive" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Auto Refill"
            name="auto_refill"
            rules={[{ required: true, message: "please enter Auto Refill" }]}
          >
            <Select
              showSearch
              placeholder="Select an option"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button onClick={resetReserveToDefault} style={{ marginRight: 10 }}>
              Reset to Default
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transactions Table */}
      <Table
        className="custom-ant-table"
        columns={filteredColumns}
        dataSource={data
          .filter((record) => {
            return Object.entries(filters).every(([key, value]) => {
              if (!value || value === '') return true;
              const recordValue = String(record[key as keyof ReserveRecord]).toLowerCase();
              const filterValue = String(value).toLowerCase();
              return recordValue.includes(filterValue);
            });
          })
          .map((record, index) => ({
            ...record,
            key: record.id || index,
          }))}
        rowKey="key"
      />
    </div>
  );
};

export default ReservesTable;
