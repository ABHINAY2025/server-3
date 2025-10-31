"use client";
 
import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Table,
  Button,
  Progress,
  Badge,
  Space,
  Tooltip,
  Tag,
  Empty,
} from "antd";
import { Box } from "@mui/material";
// import { useTheme } from "next-themes";
import axios from "axios";
import {
  WarningOutlined,
  AlertOutlined,
  CopyOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
  ExclamationOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
 
// Type definitions
interface SuspiciousTransaction {
  key: string;
  messageId: string;
  creditorName: string;
  debtorName: string;
  transactionAmount: number;
  network: string;
  fraudStatus: string;
  riskScore: number;
  timestamp: string;
  flaggedReason: string;
  mlDetected?: boolean;
  mlConfidence?: number;
  autoRuleCreated?: boolean;
  autoRuleId?: string;
  ruleDetails?: string;
  mlAnalysis?: string;
  amlRiskScore?: number;
  amlScreeningStatus?: string;
  sanctionsMatch?: boolean;
  sanctionsList?: string;
  pep?: boolean;
  adverseMedia?: boolean;
  structuring?: boolean;
  highRiskCountry?: boolean;
  countryName?: string;
  kycStatus?: string;
  sourceOfFundsVerified?: string;
  transactionPattern?: string;
  amlAction?: string;
}
 
interface ApiResponse {
  fraudCount: number;
  suspiciousCount: number;
  suspiciousFiles: SuspiciousTransaction[];
}
 
const API_URL = "http://10.30.0.21:8088/api";
 
export const fetchTop5FraudTransactions = async (): Promise<ApiResponse> => {
  try {
    console.log("Attempting to fetch from:", `${API_URL}/transactions/top5`);
    const response = await axios.get(`${API_URL}/transactions/top5`);
    console.log("Top 5 Fraud API response:", response);
 
    if (!response) {
      console.error("No response received from API");
    } else if (!response.data) {
      console.error("Response received but no data:", response);
    }
 
    if (response && response.data) {
      return response.data;
    } else {
      console.warn("Unexpected response format from top 5 fraud API:", response);
      return { fraudCount: 0, suspiciousCount: 0, suspiciousFiles: [] };
    }
  } catch (error) {
    console.error("Error fetching top 5 fraud transactions:", error);
    return { fraudCount: 0, suspiciousCount: 0, suspiciousFiles: [] };
  }
};
 
const FraudDashboardTable = () => {
  const [loading, setLoading] = useState(false);
  const [fraudCount, setFraudCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [suspiciousFiles, setSuspiciousFiles] = useState<SuspiciousTransaction[]>([]);
  const [amlCaseCount, setAmlCaseCount] = useState(0);
  const [pepCaseCount, setPepCaseCount] = useState(0);
  const [sanctionsCount, setSanctionsCount] = useState(0);
  const [mlRules, setMlRules] = useState<any[]>([]);
  const [showRuleCreated, setShowRuleCreated] = useState(false);
  const [lastCreatedRule, setLastCreatedRule] = useState<any>(null);
  const isDarkMode = false; // Force light theme
 
  useEffect(() => {
    console.log("Dashboard useEffect - fetching initial data");
    fetchData();
 
    const interval = setInterval(() => {
      console.log("Dashboard polling - fetching new data");
      fetchData();
    }, 30000);
 
    return () => clearInterval(interval);
  }, []);
 
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchTop5FraudTransactions();
      setFraudCount(response.fraudCount);
      setSuspiciousCount(response.suspiciousCount);
      setSuspiciousFiles(response.suspiciousFiles);
 
      // Calculate AML statistics
      const amlCount = response.suspiciousFiles.filter(
        (item) => item.amlRiskScore && item.amlRiskScore > 75
      ).length;
      const pepCount = response.suspiciousFiles.filter((item) => item.pep).length;
      const sanctionsMatch = response.suspiciousFiles.filter(
        (item) => item.sanctionsMatch
      ).length;
 
      setAmlCaseCount(amlCount);
      setPepCaseCount(pepCount);
      setSanctionsCount(sanctionsMatch);
 
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleCreateRuleFromML = (record: SuspiciousTransaction) => {
    if (record.mlDetected && !record.autoRuleCreated) {
      setLoading(true);
 
      setTimeout(() => {
        const newRuleId = `FR-ML-2025-${String(mlRules.length + 1).padStart(3, "0")}`;
        const ruleDetails = generateRuleDetails(record);
 
        const newRule = {
          id: newRuleId,
          details: ruleDetails,
          createdAt: new Date().toISOString(),
          transactionId: record.messageId,
          confidence: record.mlConfidence,
        };
 
        setMlRules([...mlRules, newRule]);
        setLastCreatedRule(newRule);
        setShowRuleCreated(true);
 
        setTimeout(() => {
          setShowRuleCreated(false);
        }, 5000);
 
        setLoading(false);
      }, 1500);
    }
  };
 
  const generateRuleDetails = (transaction: SuspiciousTransaction) => {
    const patterns = [
      `Block transactions from this ${transaction.network} network when amount exceeds $${Math.round(transaction.transactionAmount * 0.9)}`,
      `Flag transactions with similar patterns to ${transaction.creditorName} within 48 hours`,
      `Block transactions from this geo-location for accounts less than 30 days old`,
      `Verify identity for high-value transactions from this device ID`,
      `Implement 2-factor authentication for transactions matching this velocity pattern`,
    ];
 
    return patterns[Math.floor(Math.random() * patterns.length)];
  };
 
  const combinedTableColumns = [
    {
      title: "Message ID",
      dataIndex: "messageId",
      key: "messageId",
      className: "message-id-column",
      render: (id: string) => <span style={{ fontWeight: "600" }}>{id}</span>,
    },
    {
      title: "Customer",
      key: "parties",
      className: "creditor-column",
      render: (_: any, record: SuspiciousTransaction) => (
        <div className="truncate-text">
          <div>{record.creditorName}</div>
          <div style={{ fontSize: "0.85em", color: isDarkMode ? "#aaa" : "#666" }}>
            → {record.debtorName}
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "transactionAmount",
      key: "transactionAmount",
      className: "amount-column",
      render: (amount: number) => (
        <span style={{ fontWeight: "bold" }}>
          ${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      key: "riskScore",
      className: "risk-score-column",
      render: (score: number) => {
        let riskLevel = score > 90 ? "High" : score > 80 ? "Medium" : "Low";
        let icon =
          score > 90 ? (
            <WarningOutlined />
          ) : score > 80 ? (
            <ExclamationOutlined />
          ) : (
            <CheckCircleOutlined />
          );
 
        return (
          <Tooltip
            title={
              <div className="risk-tooltip">
                <div className="risk-tooltip-title">
                  {icon} {riskLevel} Risk Level
                </div>
                <div className="risk-tooltip-details">
                  <div>Score: {score}/100</div>
                  <div>
                    Threshold:{" "}
                    {score > 90 ? "90+" : score > 80 ? "80+" : "< 80"}
                  </div>
                  <div>
                    Action:{" "}
                    {score > 90
                      ? "Immediate Review"
                      : score > 80
                        ? "Monitor Closely"
                        : "Routine Check"}
                  </div>
                </div>
              </div>
            }
            color={isDarkMode ? "#001529" : "#fff"}
          >
            <div className={`risk-level ${riskLevel.toLowerCase()}`}>
              <div className="risk-score-header">
                <span className="risk-level-text">{riskLevel}</span>
                <span className="risk-score-value">{score}</span>
              </div>
            </div>
          </Tooltip>
        );
      },
      sorter: (a: SuspiciousTransaction, b: SuspiciousTransaction) =>
        b.riskScore - a.riskScore,
    },
    {
      title: "AML Risk",
      dataIndex: "amlRiskScore",
      key: "amlRiskScore",
      render: (score?: number) => {
        if (!score) return <span style={{ color: "#999" }}>N/A</span>;
        let color = score > 90 ? "#c0392b" : score > 80 ? "#e74c3c" : "#f39c12";
        return (
          <Progress
            percent={score}
            size="small"
            strokeColor={color}
            format={(percent) => (
              <span style={{ color: isDarkMode ? "#fff" : "#000", fontSize: "12px" }}>
                {percent}
              </span>
            )}
          />
        );
      },
    },
    {
      title: "Type & Status",
      key: "typeStatus",
      className: "reason-column",
      render: (_: any, record: SuspiciousTransaction) => (
        <div className="truncate-text">
          <Tag color="volcano" style={{ fontSize: "0.85em", marginBottom: "4px" }}>
            {record.flaggedReason || "Fraud Alert"}
          </Tag>
          {record.mlDetected && (
            <Tag color="purple" style={{ fontSize: "0.85em" }}>
              ML Detected
            </Tag>
          )}
          {record.amlRiskScore && record.amlRiskScore > 75 && (
            <Tag color="orange" style={{ fontSize: "0.85em", marginTop: "2px" }}>
              AML Risk
            </Tag>
          )}
          {record.sanctionsMatch && (
            <Tag color="red" style={{ fontSize: "0.85em", marginTop: "2px" }}>
              Sanctions
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      className: "action-column",
      render: (_: any, record: SuspiciousTransaction) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            // danger={record.sanctionsMatch}
            href={`/fraudtransactions/${record.messageId}${record.amlRiskScore ? "?tab=aml" : ""}`}
          >
            Review
          </Button>
          {record.mlDetected && !record.autoRuleCreated && (
            <Button
              type="primary"
              size="small"
              ghost
              icon={<ThunderboltOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleCreateRuleFromML(record);
              }}
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(138, 43, 226, 0.3)"
                  : "rgba(138, 43, 226, 0.1)",
                borderColor: isDarkMode ? "rgba(138, 43, 226, 0.7)" : undefined,
                color: isDarkMode ? "rgba(200, 150, 255, 1)" : undefined,
              }}
            >
              Create Rule
            </Button>
          )}
          <Button type="text" size="small" danger>
            Block
          </Button>
        </Space>
      ),
    },
  ];
 
  return (
    <Box className={`dashboard-container ${isDarkMode ? "dark-theme" : ""}`}>
      <Row className="stats-row" gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable loading={loading} className="stat-card fraud-card" variant="outlined">
            <div className="card-icon">
              <AlertOutlined />
            </div>
            <div className="stat-value-large">{fraudCount}</div>
            <div className="stat-label font-weight-bold">Fraud Cases</div>
          </Card>
        </Col>
 
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable loading={loading} className="stat-card suspicious-card" variant="outlined">
            <div className="card-icon">
              <WarningOutlined />
            </div>
            <div className="stat-value-large">{suspiciousCount}</div>
            <div className="stat-label">Suspicious Cases</div>
          </Card>
        </Col>
 
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable loading={loading} className="stat-card aml-card" variant="outlined">
            <div className="card-icon">
              <ExclamationOutlined />
            </div>
            <div className="stat-value-large">{amlCaseCount}</div>
            <div className="stat-label">AML Cases</div>
          </Card>
        </Col>
 
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable loading={loading} className="stat-card pep-card" variant="outlined">
            <div className="card-icon">
              <UnlockOutlined />
            </div>
            <div className="stat-value-large">{pepCaseCount}</div>
            <div className="stat-label">PEP Cases</div>
          </Card>
        </Col>
 
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable loading={loading} className="stat-card sanctions-card" variant="outlined">
            <div className="card-icon">
              <CopyOutlined />
            </div>
            <div className="stat-value-large">{sanctionsCount}</div>
            <div className="stat-label">Sanctions Matches</div>
          </Card>
        </Col>
      </Row>
 
      <div className="table-section">
        <Card
          variant="outlined"
          className="table-card"
          title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>
                <Badge status="error" />
                <span style={{ marginLeft: 8, fontWeight: 600 }}>Fraud & AML Cases</span>
              </span>
             
            </div>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table
            className="custom-ant-table fraud-table"
            columns={combinedTableColumns}
            dataSource={suspiciousFiles}
            loading={loading}
            locale={{
              emptyText: <Empty description="No suspicious transactions found" />,
            }}
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
 
      {showRuleCreated && lastCreatedRule && (
        <div className="rule-notification">
          <div className="notification-header">
            <ThunderboltOutlined className="notification-icon" />
            <span className="notification-title">ML Rule Created</span>
          </div>
          <div className="notification-content">
            <div className="rule-id">{lastCreatedRule.id} has been created.</div>
            <div className="rule-details">{lastCreatedRule.details}</div>
            <div className="rule-meta">
              Based on transaction {lastCreatedRule.transactionId} with{" "}
              {lastCreatedRule.confidence}% confidence
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};
 
export default FraudDashboardTable;
 