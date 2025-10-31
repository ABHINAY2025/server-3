"use client"

import React, { useState } from "react"
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Select,
  message,
  Drawer,
} from "antd"
import {
  SettingOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons"
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import dayjs from "dayjs"

interface SweepData {
  id: number
  sweep_name: string
  master_account: string
  sweep_direction: string
  frequency: string
  status: string
  threshold_limit: number
  currency: string
  action: string | null
  enable_auto_transfer: string
  next_execution: number[]
  last_sweep_date?: string
}

const allColumns = [
  {
    title: "Sweep Name",
    dataIndex: "sweep_name",
    align: "center",
    key: "sweep_name",
  },
  {
    title: "Master Account",
    dataIndex: "master_account",
    key: "master_account",
    align: "center",
    render: (text: string) => text || "--",
  },
  {
    title: "Currency",
    dataIndex: "currency",
    key: "currency",
    align: "center",
    render: (text: string) => text || "--",
  },
  {
    title: "Sweep Direction",
    dataIndex: "sweep_direction",
    key: "sweep_direction",
    align: "center",
    render: (text: string) => text || "--",
  },
  {
    title: "Frequency",
    dataIndex: "frequency",
    key: "frequency",
    align: "center",
    render: (text: string) => text || "--",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (text: string) => text || "N/A",
  },
  {
    title: "Next Execution",
    dataIndex: "next_execution",
    key: "next_execution",
    align: "center",
    render: (text: number[]) => text ? dayjs(text.join("-")).format("YYYY-MM-DD HH:mm") : "--",
  },
  {
    title: "Threshold Limit",
    dataIndex: "threshold_limit",
    key: "threshold_limit",
    align: "center",
    render: (text: number) => text || "--",
  },
  {
    title: "Last Sweep Date",
    dataIndex: "last_sweep_date",
    key: "last_sweep_date",
    align: "center",
    render: (text: string) => text || "--",
  },
  {
    title: "Enable Auto Transfer",
    dataIndex: "enable_auto_transfer",
    key: "enable_auto_transfer",
    align: "center",
    render: (text: string) => text || "--",
  },
  { title: "Action", dataIndex: "action", align: "center", key: "action" },
]

export default function CashSweepingPage() {
  const data: SweepData[] = [
    {
      id: 1,
      sweep_name: "Main Sweep",
      master_account: "Global Trust Bank - 1001",
      sweep_direction: "Bi-Directional",
      frequency: "Daily",
      status: "Active",
      threshold_limit: 150000,
      currency: "USD",
      action: "View",
      enable_auto_transfer: "YES",
      next_execution: [2025, 10, 29, 9, 30],
    },
    {
      id: 2,
      sweep_name: "Europe Sweep",
      master_account: "Deutsche Bank - EU212",
      sweep_direction: "One-Way",
      frequency: "Weekly",
      status: "Active",
      threshold_limit: 100000,
      currency: "EUR",
      action: "Edit",
      enable_auto_transfer: "YES",
      next_execution: [2025, 11, 2, 17, 0],
    },
    {
      id: 3,
      sweep_name: "Reserve Sweep",
      master_account: "ICICI Bank - 4421",
      sweep_direction: "One-Way",
      frequency: "Monthly",
      status: "Active",
      threshold_limit: 50000,
      currency: "INR",
      action: null,
      enable_auto_transfer: "NO",
      next_execution: [2025, 11, 5, 10, 15],
    },
    {
      id: 4,
      sweep_name: "Treasury Sweep",
      master_account: "HSBC Bank - 2021",
      sweep_direction: "Bi-Directional",
      frequency: "Weekly",
      status: "Inactive",
      threshold_limit: 250000,
      currency: "GBP",
      action: "View",
      enable_auto_transfer: "YES",
      next_execution: [2025, 11, 1, 14, 45],
    },
    {
      id: 5,
      sweep_name: "Vendor Sweep",
      master_account: "Axis Bank - 5534",
      sweep_direction: "One-Way",
      frequency: "Daily",
      status: "Active",
      threshold_limit: 20000,
      currency: "INR",
      action: "Edit",
      enable_auto_transfer: "YES",
      next_execution: [2025, 10, 30, 9, 0],
    },
    {
      id: 6,
      sweep_name: "Investment Sweep",
      master_account: "Citi Bank - 7765",
      sweep_direction: "Bi-Directional",
      frequency: "Monthly",
      status: "Suspended",
      threshold_limit: 750000,
      currency: "USD",
      action: "View",
      enable_auto_transfer: "NO",
      next_execution: [2025, 11, 10, 11, 45],
    },
    {
      id: 7,
      sweep_name: "Subsidiary Sweep",
      master_account: "HDFC Bank - 8899",
      sweep_direction: "One-Way",
      frequency: "Weekly",
      status: "Active",
      threshold_limit: 60000,
      currency: "INR",
      action: "Edit",
      enable_auto_transfer: "YES",
      next_execution: [2025, 11, 3, 13, 30],
    },
    {
      id: 8,
      sweep_name: "Emergency Sweep",
      master_account: "Standard Chartered - 9921",
      sweep_direction: "One-Way",
      frequency: "Quarterly",
      status: "Inactive",
      threshold_limit: 1000000,
      currency: "USD",
      action: "View",
      enable_auto_transfer: "NO",
      next_execution: [2025, 12, 31, 17, 0],
    },
  ];
  

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    allColumns.map((col: any) => col.key as string)
  )
  const [columnsOrder, setColumnsOrder] = useState<any[]>(allColumns)
  const [modalVisible, setModalVisible] = useState(false)
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()

  // Toggle column visibility
  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prevSelectedColumns) =>
      prevSelectedColumns.includes(key)
        ? prevSelectedColumns.filter((colKey) => colKey !== key)
        : [...prevSelectedColumns, key]
    )
  }

  // Reset to default
  const resetToDefault = () => {
    setSelectedColumns(allColumns.map((col: any) => col.key as string))
    setColumnsOrder(allColumns)
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  // Handle column reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = columnsOrder.findIndex((col: any) => col.key === active.id)
      const newIndex = columnsOrder.findIndex((col: any) => col.key === over.id)
      setColumnsOrder(arrayMove(columnsOrder, oldIndex, newIndex))
    }
  }

  // Filter visible columns
  const filteredColumns = columnsOrder.filter((col: any) =>
    selectedColumns.includes(col.key as string)
  )

  // Filter data based on applied filters
  const getFilteredData = () => {
    return data.filter((record) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        if (key === "next_execution" && value && typeof value === 'string') {
          const recordDate = dayjs(record.next_execution.join("-"));
          const filterDate = dayjs(value);
          return recordDate.isSame(filterDate, 'day');
        }

        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(record[key as keyof SweepData]);
        }

        const recordValue = String(record[key as keyof SweepData]).toLowerCase();
        return recordValue.includes(String(value).toLowerCase());
      });
    });
  };

  const filteredData = getFilteredData();

  const handleSubmit = async (values: any) => {
    try {
      message.success("Sweeping saved successfully!")
      setCreateModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error("Failed to save sweeping!")
    }
  }

  const resetSweepToDefault = () => {
    form.setFieldsValue({
      sweep_name: "",
      master_account: "",
      currency: "",
      sweep_direction: "",
      frequency: "",
      status: "",
      next_execution: "",
      threshold_limit: "",
      enable_auto_transfer: "",
    })
  }

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
          icon={<FilterOutlined />}
          onClick={() => setFilterDrawerVisible(true)}
        >
          Filter
        </Button>

        {/* <Button
          icon={<EditOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Create
        </Button> */}

        <Button
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
                form.resetFields()
                setFilters({})
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
          <Form.Item label="Sweep Name" name="sweep_name">
            <Input placeholder="Enter Sweep Name" />
          </Form.Item>
          <Form.Item label="Master Account" name="master_account">
            <Input placeholder="Enter Master Account" />
          </Form.Item>
          <Form.Item label="Next Execution (YYYY-MM-DD)" name="next_execution">
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              placeholder="Select Date"
            />
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
          <Form.Item label="Threshold Limit" name="threshold_limit">
            <InputNumber
              placeholder="Enter Threshold Limit"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>
          <Form.Item label="Sweep Direction" name="sweep_direction">
            <Select
              placeholder="Select Sweep Direction"
              allowClear
              options={[
                { value: "One-Way", label: "One-Way" },
                { value: "Bi-Directional", label: "Bi-Directional" },
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
        {columnsOrder.map((column: any) => (
          <div
            key={column.key as string}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              marginBottom: "5px",
              borderRadius: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.key as string)}
              onChange={() => handleColumnToggle(column.key as string)}
            />
            <span style={{ marginLeft: "10px" }}>{column.title}</span>
          </div>
        ))}
      </Modal>

      {/* create modal */}
      <Modal
        title="Create Cash Sweeping"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Sweep Name"
            name="sweep_name"
            rules={[{ required: true, message: "Enter sweep name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Master Account"
            name="master_account"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Sweep Direction"
            name="sweep_direction"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "One-Way", label: "One-Way" },
                { value: "Bi-Directional", label: "Bi-Directional" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "please select a Status " }]}
          >
            <Select
              showSearch
              placeholder="Select an option"
              filterOption={(input: string, option: any) =>
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
            label="Next Execution"
            name="next_execution"
            rules={[{ required: true }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              disabledDate={(current: any) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
          <Form.Item
            label="Threshold Limit"
            name="threshold_limit"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            label="Last Sweep Date"
            name="last_sweep_date"
            rules={[{ required: true }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              disabledDate={(current: any) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            label="Enable Auto Transfer"
            name="enable_auto_transfer"
            rules={[{ required: true, message: "please enter Auto Refill" }]}
          >
            <Select
              showSearch
              placeholder="Select an option"
              filterOption={(input: string, option: any) =>
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
            <Button onClick={resetSweepToDefault} style={{ marginRight: 10 }}>
              Reset to Default
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Sweeping Table */}
      <Table
        columns={filteredColumns}
        dataSource={data
          .filter((record) => {
            return Object.entries(filters).every(([key, value]) => {
              if (!value || value === '') return true;
              
              if (key === 'next_execution' && typeof value === 'string') {
                const recordDate = dayjs(record.next_execution.join('-')).format('YYYY-MM-DD');
                return recordDate === value;
              }
              
              const recordValue = String(record[key as keyof SweepData]).toLowerCase();
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
  )
}
