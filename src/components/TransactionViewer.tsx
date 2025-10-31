import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Table,
  ConfigProvider,
  Spin,
  Alert,
  Button,
  Tooltip,
  Space,
} from "antd";
import { BsFileEarmarkCheck } from "react-icons/bs";
import { useRouter } from "next/navigation";
import {
  getISOStandardDataFields,
  sendForApproval,
  getBankRulesByIds,
  getCustomerRulesByIds,
} from "@/lib/api/dataApi";
import { XmlDiffViewer } from "@/components/XMLDiffViewer";
import { XMLSchemaViewer } from "@/components/XMLSchemaViewer";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "next-themes";

interface ISOField {
  field: string;
  label: string;
}

interface RuleGroup {
  type: string;
  bank_rules: string[];
  customer_rules: string[];
}

interface Rule {
  _id: string;
  ruleName: string;
  ruleType: string;
  ruleSubType: string;
  entityType: "Bank" | "Customer";
  when: Array<{
    ISOWhenField: string;
    ISOWhenOperator: string;
    ISOWhenValue: string;
  }>;
  then?: Array<Record<string, string>>;
  ruleDescription: string;
  isActive: boolean;
  key: string;
  applicationType: string;
}

interface Transaction {
  _id: string;
  msgId: string;
  amount: number;
  fileStatus: string;
  createdAt: string;
  originalXml: string;
  updatedXml: string;
  ruleIDs: RuleGroup[];
  dbtrMlSuggestion?: {
    MLScore: number;
    MLSuggestion: string;
  };
  cdtrMlSuggestion?: {
    MLScore: number;
    MLSuggestion: string;
  };
}

interface TransactionViewerProps {
  transaction: Transaction;
}

const TransactionViewer: React.FC<TransactionViewerProps> = ({ transaction }) => {
  const [selectedDiffs, setSelectedDiffs] = useState(new Set<number>());
  const [pageLoad, setPageLoad] = useState(false);
  const [xmlDiffs, setXmlDiffs] = useState<any[]>([]);
  const [ISOStandardFields, setISOStandardFields] = useState<any>(null);
  const [ISOStandardFieldsError, setISOStandardFieldsError] = useState<any>(null);
  const [isISOStandardFieldsLoading, setIsISOStandardFieldsLoading] =
    useState(true);
  const [resMessage, setResMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [status, setStatus] = useState(transaction.fileStatus);
  const [appliedRules, setAppliedRules] = useState<any[]>([]);
  const [appliedRulesLoading, setAppliedRulesLoading] = useState(false);
  const [appliedRulesError, setAppliedRulesError] = useState<any>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const userKey = transaction._id;
  const updatedMsg = transaction.updatedXml;

  useEffect(() => {
    const fetchISOStandardFields = async () => {
      try {
        const data = await getISOStandardDataFields();
        setISOStandardFields(data);
      } catch (error) {
        setISOStandardFieldsError(error);
      } finally {
        setIsISOStandardFieldsLoading(false);
      }
    };

    fetchISOStandardFields();
  }, []);

  const fetchAppliedRules = async () => {
    setAppliedRulesLoading(true);
    setAppliedRulesError(null);

    try {
      if (!transaction.ruleIDs || !Array.isArray(transaction.ruleIDs)) {
        setAppliedRules([]);
        return;
      }

      const bankRuleIds: string[] = [];
      const customerRuleIds: string[] = [];
      const ruleMetadata = new Map();

      transaction.ruleIDs.forEach((ruleGroup: any) => {
        const { type, bank_rules, customer_rules } = ruleGroup;

        bank_rules.forEach((ruleId: string) => {
          bankRuleIds.push(ruleId);
          ruleMetadata.set(ruleId, {
            entityType: "Bank",
            applicationType: type,
          });
        });

        customer_rules.forEach((ruleId: string) => {
          customerRuleIds.push(ruleId);
          ruleMetadata.set(ruleId, {
            entityType: "Customer",
            applicationType: type,
          });
        });
      });

      const [bankRules, customerRules] = await Promise.all([
        bankRuleIds.length > 0 ? getBankRulesByIds(bankRuleIds) : [],
        customerRuleIds.length > 0 ? getCustomerRulesByIds(customerRuleIds) : [],
      ]);

      const allRules = [
        ...bankRules.map((rule: any) => ({
          ...rule,
          ...ruleMetadata.get(rule._id),
          entityType: "Bank",
          key: rule._id,
        })),
        ...customerRules.map((rule: any) => ({
          ...rule,
          ...ruleMetadata.get(rule._id),
          entityType: "Customer",
          key: rule._id,
        })),
      ];

      setAppliedRules(allRules);
    } catch (error) {
      console.error("Error fetching applied rules:", error);
      setAppliedRulesError(error);
    } finally {
      setAppliedRulesLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(xmlDiffs)) {
      const allIndices = new Set(xmlDiffs.map((_, index) => index));
      setSelectedDiffs(allIndices);
    }
  }, [xmlDiffs]);

  const handleRepairClick = async () => {
    setPageLoad(true);
    try {
      const resData = await sendForApproval(userKey, updatedMsg);
      if (resData?.message) {
        setResMessage(resData?.message);
        setSuccessMessage(true);
        setStatus("Approved");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      alert("Failed to approve the transaction");
    } finally {
      setPageLoad(false);
    }
  };

  const handleDiffExtracted = useCallback((diffs: any[]) => {
    setXmlDiffs(diffs);
  }, []);

  const hasValidMessages = transaction.originalXml && transaction.updatedXml;
  const dataSource = xmlDiffs.map((diff, index) => {
    let mlSuggestion = diff.mlSuggestion;
    if (!mlSuggestion) {
      if (
        diff.element.includes("Dbtr") &&
        transaction.dbtrMlSuggestion?.MLSuggestion
      ) {
        mlSuggestion = transaction.dbtrMlSuggestion.MLSuggestion;
      } else if (
        diff.element.includes("Cdtr") &&
        transaction.cdtrMlSuggestion?.MLSuggestion
      ) {
        mlSuggestion = transaction.cdtrMlSuggestion.MLSuggestion;
      }
    }

    return {
      key: index,
      element: diff.element.split("/").pop(),
      originalValue: diff.originalValue || "N/A",
      mlSuggestion: mlSuggestion || "No suggestion",
      MLScore: diff.element.includes("Dbtr")
        ? transaction.dbtrMlSuggestion?.MLScore
          ? `${(transaction.dbtrMlSuggestion.MLScore * 100).toFixed(1)}%`
          : "95.0%"
        : diff.element.includes("Cdtr")
          ? transaction.cdtrMlSuggestion?.MLScore
            ? `${(transaction.cdtrMlSuggestion.MLScore * 100).toFixed(1)}%`
            : "90.0%"
          : "N/A",
    };
  });

  const cardData = useMemo(
    () => [
      { title: "Transaction ID", value: transaction._id || "N/A" },
      { title: "Message ID", value: transaction.msgId || "N/A" },
      { title: "Source Message Type", value: "ISO 20022" },
      { title: "ISO Message Type", value: "pacs 008" },
      {
        title: "Amount",
        value: transaction.amount
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(transaction.amount)
          : "N/A",
      },
      { title: "Status", value: status },
      { title: "Transaction Value", value: "Tier 1" },
      {
        title: "Transaction Date",
        value: transaction.createdAt
          ? new Date(transaction.createdAt).toLocaleString()
          : "N/A",
      },
    ],
    [transaction, status]
  );

  const columns = [
    {
      title: "Element",
      dataIndex: "element",
      key: "element",
      align: "left" as const,
    },
    {
      title: "Original Value",
      dataIndex: "originalValue",
      key: "originalValue",
      align: "left" as const,
    },
    {
      title: "ML Suggestion",
      dataIndex: "mlSuggestion",
      key: "mlSuggestion",
      align: "left" as const,
    },
    {
      title: "ML Score",
      dataIndex: "MLScore",
      key: "MLScore",
      align: "left" as const,
    },
  ];

  const detailsTabsItems = [
    {
      key: "1",
      label: "Corrections",
      children: (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <div
              style={{
                height: "500px",
                overflow: "auto",
                borderRadius: "0.375rem",
                padding: "1rem",
                background: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#ffffff",
                border: `1px solid ${
                  isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"
                }`,
                fontFamily: "monospace",
                fontSize: "0.875rem",
                color: isDarkMode ? "#ffffff" : "#1a1a1a",
              }}
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "#2d3748",
                }}
              >
                XML Differences
              </h3>
              {hasValidMessages && (
                <XmlDiffViewer
                  originalXml={transaction.originalXml}
                  updatedXml={transaction.updatedXml}
                  onDiffExtracted={handleDiffExtracted}
                />
              )}
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: "2",
      label: "Applied Rules",
      children: (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            {appliedRulesLoading ? (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Spin />
                <p>Loading applied rules...</p>
              </div>
            ) : appliedRulesError ? (
              <Alert
                message="Error"
                description="Failed to load applied rules. Please try again later."
                type="error"
                showIcon
                action={
                  <Button size="small" onClick={fetchAppliedRules}>
                    Retry
                  </Button>
                }
              />
            ) : appliedRules.length === 0 ? (
              <Alert
                message="No Applied Rules Found"
                description="There are no applied rules to display for this transaction."
                type="info"
                showIcon
              />
            ) : (
              <Table
                style={{
                  position: "relative",
                  top: "-15px",
                }}
                columns={(() => {
                  const baseColumns = [
                    {
                      title: "Rule Name",
                      dataIndex: "ruleName",
                      key: "ruleName",
                      render: (text: string) => <strong>{text}</strong>,
                      align: "left" as const,
                      width: 200,
                    },
                    {
                      title: "Rule Type",
                      dataIndex: "ruleType",
                      key: "ruleType",
                      align: "left" as const,
                      width: 120,
                    },
                    {
                      title: "Rule Sub Type",
                      dataIndex: "ruleSubType",
                      key: "ruleSubType",
                      align: "left" as const,
                      width: 120,
                    },
                    {
                      title: "Entity Type",
                      dataIndex: "entityType",
                      key: "entityType",
                      align: "left" as const,
                      width: 100,
                      render: (entityType: string) => (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              entityType === "Bank" ? "#e6f7ff" : "#f6ffed",
                            color: entityType === "Bank" ? "#1890ff" : "#52c41a",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {entityType}
                        </span>
                      ),
                    },
                    {
                      title: "When",
                      dataIndex: "when",
                      key: "when",
                      align: "left" as const,
                      width: 250,
                      render: (when: any[]) => (
                        <>
                          {when?.map((item, index) => {
                            const matchingField = ISOStandardFields?.find(
                              (fieldObj: any) => fieldObj.field === item.ISOWhenField
                            );
                            const label =
                              matchingField?.label || item?.ISOWhenField;
                            return (
                              <div key={index} style={{ marginBottom: "4px" }}>
                                {label} {item?.ISOWhenOperator}{" "}
                                {item?.ISOWhenValue}
                              </div>
                            );
                          })}
                        </>
                      ),
                    },
                  ];

                  if (transaction.fileStatus === "Auto Corrected") {
                    baseColumns.push({
                      title: "Then",
                      dataIndex: "then",
                      key: "then",
                      align: "left" as const,
                      width: 250,
                      render: (then: any[]) => (
                        <>
                          {then?.map((item, index) => (
                            <div key={index} style={{ marginBottom: "4px" }}>
                              {Object.entries(item).map(([key, value]) => {
                                const matchingField = ISOStandardFields?.find(
                                  (fieldObj: any) => fieldObj.field === key
                                );
                                const label = matchingField?.label || key;
                                return (
                                  <div key={key}>
                                    <span style={{ fontWeight: "500" }}>
                                      {label}: {value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </>
                      ),
                    } as any);
                  }

                  baseColumns.push(
                    {
                      title: "Description",
                      dataIndex: "ruleDescription",
                      key: "ruleDescription",
                      align: "left" as const,
                      width: 200,
                      render: (text: string) => (
                        <Tooltip title={text}>
                          <span>
                            {text && text.length > 50
                              ? `${text.substring(0, 50)}...`
                              : text}
                          </span>
                        </Tooltip>
                      ),
                    },
                    {
                      title: "Status",
                      dataIndex: "isActive",
                      key: "isActive",
                      align: "left" as const,
                      width: 80,
                      render: (value: any) => {
                        const isActive = Boolean(value);
                        return (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              backgroundColor: isActive ? "#f6ffed" : "#fff2f0",
                              color: isActive ? "#52c41a" : "#ff4d4f",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        );
                      },
                    }
                  );

                  return baseColumns;
                })()}
                dataSource={appliedRules}
                rowKey="_id"
                bordered
                pagination={false}
                scroll={{ x: "max-content" }}
              />
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: "3",
      label: "XML Schema",
      children: (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <XMLSchemaViewer xml={transaction.originalXml} />
          </Col>
        </Row>
      ),
    },
  ];

  return pageLoad ? (
    <Spin tip="Approving...">
      <Alert message="Message is being approved" type="info" />
    </Spin>
  ) : (
    <div
      className="p-6 space-y-4"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #0b1d3a 0%, #142b4d 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        minHeight: "100vh",
        color: isDarkMode ? "#ffffff" : "#1a1a1a",
        position: "relative",
      }}
    >
      <BackButton
        position="top-left"
        variant="floating"
        fallbackPath={transaction.fileStatus === "Auto Corrected" ? "/autocorrected-flow" : "/repair-flow"}
      />

      <Row gutter={[4, 8]}>
        {cardData.map((card, index) => (
          <Col
            key={index}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "12px",
            }}
          >
            <Card
              style={{
                background: isDarkMode
                  ? "linear-gradient(135deg, rgba(30, 58, 95, 0.95), rgba(20, 43, 77, 0.95))"
                  : "linear-gradient(135deg, #ffffff, #f8fafc)",
                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
                boxShadow: isDarkMode
                  ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                  : "0 4px 12px rgba(148, 163, 184, 0.08)",
                borderRadius: "12px",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = isDarkMode
                  ? "0 8px 16px rgba(0, 0, 0, 0.3)"
                  : "0 8px 16px rgba(148, 163, 184, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = isDarkMode
                  ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                  : "0 4px 12px rgba(148, 163, 184, 0.08)";
              }}
            >
              <div className="p-2">
                <p
                  className="text-sm text-muted-foreground"
                  style={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  {card.title}
                </p>
                <h3
                  className="font-semibold"
                  style={{
                    color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "#2d3748",
                    margin: 0,
                  }}
                >
                  {card.value}
                </h3>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ paddingLeft: "8px", paddingRight: "8px", marginTop: "10px" }}>
        <Row gutter={[8, 8]}>
          {!["Auto Corrected", "Approved", "Publish", "STP"].includes(
            transaction.fileStatus
          ) && (
            <Col span={24} style={{ textAlign: "right" }}>
              <Space>
                <Tooltip placement="bottom" title="Approve Message">
                  <Button
                    type="text"
                    onClick={handleRepairClick}
                    disabled={pageLoad}
                    style={{
                      background: isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.1)"
                      }`,
                      borderRadius: "8px",
                      color: isDarkMode ? "#ffffff" : "#1a1a1a",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? "#42a5f5"
                        : "#1976d2";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.color = isDarkMode
                        ? "#ffffff"
                        : "#1a1a1a";
                    }}
                  >
                    <BsFileEarmarkCheck />
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          )}
          <Col span={24}>
            <ConfigProvider
              theme={{
                token: {
                  colorBgContainer: isDarkMode ? "#1d385c" : "#ffffff",
                  colorText: isDarkMode ? "#ffffff" : "#1a1a1a",
                  colorBorder: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "#e2e8f0",
                },
              }}
            >
              <Table
                style={{
                  background: isDarkMode
                    ? "linear-gradient(135deg, rgba(30, 58, 95, 0.95), rgba(20, 43, 77, 0.95))"
                    : "linear-gradient(135deg, #ffffff, #f8fafc)",
                  border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
                  borderRadius: "12px",
                  boxShadow: isDarkMode
                    ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                    : "0 4px 12px rgba(148, 163, 184, 0.08)",
                }}
                columns={columns}
                dataSource={dataSource && dataSource.length ? dataSource : []}
                bordered
                pagination={false}
              />
            </ConfigProvider>
          </Col>
        </Row>
      </div>

      <div style={{ paddingLeft: "8px", paddingRight: "8px", marginTop: "10px" }}>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: isDarkMode ? "#1d385c" : "#ffffff",
              colorText: isDarkMode ? "#ffffff" : "#1a1a1a",
              colorBorder: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "#e2e8f0",
            },
          }}
        >
          <Card
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(30, 58, 95, 0.95), rgba(20, 43, 77, 0.95))"
                : "linear-gradient(135deg, #ffffff, #f8fafc)",
              border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
              borderRadius: "12px",
              boxShadow: isDarkMode
                ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                : "0 4px 12px rgba(148, 163, 184, 0.08)",
            }}
          >
            <Tabs
              defaultActiveKey="1"
              items={detailsTabsItems}
              style={{
                color: isDarkMode ? "#ffffff" : "#1a1a1a",
              }}
              onChange={(key) => {
                if (key === "2") {
                  fetchAppliedRules();
                }
              }}
            />
          </Card>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default TransactionViewer;