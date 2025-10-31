"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Empty } from "antd";
import axios from "axios";

// TypeScript interfaces
interface Transaction {
  msg_id: string;
  amount: number;
  debtor_name: string;
  creditor_name: string;
  debtor_network_type: string;
  transaction_date: string;
  fraud_status: string;
  original_fraud_status?: string;
  key?: number;
}

interface ApiResponse {
  data: Transaction[];
  totalCount: number;
  pageNo: number;
  offset: number;
}

// API functions
const API_URL = "http://10.30.0.21:8088/api";

const fetchFraudTransactions = async (page = 1, offset = 10): Promise<ApiResponse> => {
  try {
    console.log(`Fetching fraud transactions: page=${page}, offset=${offset}`);
    const response = await axios.get(
      `${API_URL}/transactions?pageNo=${page}&offset=${offset}`
    );
    console.log("Fraud API raw response:", response);

    if (response && response.data) {
      return response.data;
    } else {
      console.warn("Unexpected response format from fraud API:", response);
      return { data: [], totalCount: 0, pageNo: page, offset: offset };
    }
  } catch (error) {
    console.error("Error fetching fraud transactions:", error);
    return { data: [], totalCount: 0, pageNo: page, offset: offset };
  }
};

const AnomalyDetectionTable: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const handleButtonClick = (key: number, status: string) => {
    const updatedTransactions = transactions.map((transaction, index) => {
      if (index === key) {
        return { 
          ...transaction, 
          fraud_status: status 
        };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);
    // Save to local storage
    const statusChanges = JSON.parse(localStorage.getItem('fraudStatusChanges') || '{}');
    const transaction = transactions[key];
    if (transaction) {
      statusChanges[transaction.msg_id] = status;
      localStorage.setItem('fraudStatusChanges', JSON.stringify(statusChanges));
    }
  };

  const handleReset = (key: number) => {
    const updatedTransactions = transactions.map((transaction, index) => {
      if (index === key) {
        return {
          ...transaction,
          fraud_status: transaction.original_fraud_status || transaction.fraud_status
        };
      }
      return transaction;
    });
    setTransactions(updatedTransactions);
    // Remove from local storage
    const statusChanges = JSON.parse(localStorage.getItem('fraudStatusChanges') || '{}');
    const transaction = transactions[key];
    if (transaction) {
      delete statusChanges[transaction.msg_id];
      localStorage.setItem('fraudStatusChanges', JSON.stringify(statusChanges));
    }
  };

  const categoryColumns = [
    {
      title: "Message ID",
      dataIndex: "msg_id",
      key: "msg_id",
      align: "left" as const,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "left" as const,
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Debtor Name",
      dataIndex: "debtor_name",
      key: "debtor_name",
      align: "left" as const,
    },
    {
      title: "Creditor Name",
      dataIndex: "creditor_name",
      key: "creditor_name",
      align: "left" as const,
    },
    {
      title: "Network Type",
      dataIndex: "debtor_network_type",
      key: "network_type",
      align: "left" as const,
    },
    {
      title: "Transaction Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      align: "left" as const,
    },
    {
      title: "Fraud Status",
      dataIndex: "fraud_status",
      key: "fraud_status",
      align: "left" as const,
      render: (status: string) => (
        <span
          style={{
            color:
              status === "Suspicious"
                ? "#faad14"
                : status === "Legit"
                  ? "#52c41a"
                  : status === "Fraud"
                    ? "#f5222d"
                    : "#af7a82",
            fontWeight: "500",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "left" as const,
      render: (_: any, record: Transaction & { key: number }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            style={{
              background: "#ffefedff",
              color: "#9e2f0dff",
              borderColor: "#eba28fff",
            }}
            onClick={() => handleButtonClick(record.key, "Fraud")}
          >
            Fraud
          </Button>
          <Button
            style={{
              background: "#f6ffed",
              color: "#389e0d",
              borderColor: "#b7eb8f",
            }}
            onClick={() => handleButtonClick(record.key, "Legit")}
          >
            Legit
          </Button>
          {record.fraud_status !== record.original_fraud_status && (
            <Button
              style={{
                background: "#f0f0f0",
                color: "#666",
                borderColor: "#d9d9d9",
              }}
              onClick={() => handleReset(record.key)}
            >
              Reset
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchFraudTransactions(page, pageSize);
        console.log("Fraud API response:", result);

        if (result && result.data) {
          // Get saved status changes from localStorage
          const statusChanges = JSON.parse(localStorage.getItem('fraudStatusChanges') || '{}');
          
          // Apply saved changes to the transactions
          const updatedData = result.data.map(transaction => ({
            ...transaction,
            original_fraud_status: transaction.fraud_status,
            fraud_status: statusChanges[transaction.msg_id] || transaction.fraud_status
          }));
          
          setTransactions(updatedData);
          setTotalCount(result.totalCount || 0);
        } else if (Array.isArray(result)) {
          setTransactions(result);
          setTotalCount(result.length);
        } else {
          console.warn("Invalid fraud transaction data structure:", result);
          setTransactions([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching fraud data:", error);
        setTransactions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize]);

  return (
    <div style={{ padding: "10px" }}>
      <Table
        className="custom-ant-table"
        columns={categoryColumns}
        dataSource={(Array.isArray(transactions) ? transactions : []).map(
          (transaction, index) => ({
            key: index,
            ...transaction,
          })
        )}
        loading={loading}
        locale={{
          emptyText: <Empty description="No suspicious transactions found" />,
        }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          size: "small",
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: (current, size) => {
            setPage(current);
            setPageSize(size);
          },
        }}
        size="middle"
        style={{
          backgroundColor: "white",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

export default AnomalyDetectionTable;