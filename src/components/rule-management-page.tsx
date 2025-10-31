'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  Input,
  Button,
  Typography,
  Card,
  Space,
  FloatButton,
  Modal,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  SendOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import type { InputRef } from "antd";
import { rulesResponse, fetchInitialRules, uploadFile } from "@/lib/api/liquidityApi";

const { Title } = Typography;

// Dynamic import for performance (optional, but recommended)
const ConfigurationTable = () => {
  // Theme detection (client-side only)
  // const [isDarkMode, setIsDarkMode] = useState(false);

  // useEffect(() => {
  //   const checkTheme = () => {
  //     const dark =
  //       !document.body.classList.contains("light-theme") &&
  //       (document.body.classList.contains("dark-theme") ||
  //         document.body.getAttribute("data-theme") === "dark" ||
  //         (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches));
  //     setIsDarkMode(dark);
  //   };

  //   checkTheme();
  //   const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  //   const handleChange = () => checkTheme();
  //   mediaQuery.addEventListener("change", handleChange);
  //   return () => mediaQuery.removeEventListener("change", handleChange);
  // }, []);

  const isDarkMode = false;

  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [existingRules, setExistingRules] = useState<any[]>([]);
  const [allRules, setAllRules] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<any>(null);

  const chatInputRef = useRef<InputRef>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load initial rules
  const loadInitialRules = async () => {
    try {
      setLoading(true);
      const response = await fetchInitialRules();
      if (response.data?.data?.response) {
        const responseMsg = response.data.data.response;
        const jsonMatch = responseMsg.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const rules = JSON.parse(jsonMatch[1]);
            if (Array.isArray(rules)) {
              setAllRules(rules);
              setExistingRules(rules);
            }
          } catch (parseError) {
            console.error("Error parsing rules:", parseError);
            message.error("Failed to parse rules");
          }
        }
      }
    } catch (error) {
      console.error("Error loading rules:", error);
      message.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialRules();
  }, []);

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      addToChatHistory({ type: "assistant", message: "Please upload only .txt files" });
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);
      const response = await uploadFile(file);
      addToChatHistory({ type: "user", message: `Uploaded file: ${file.name}` });

      if (response.data?.rules) {
        const formattedRules = response.data.rules.map((rule: any, index: number) => ({
          _id: `rule-${Date.now()}-${index}`,
          customer: rule.customer,
          when_field: rule.when_field,
          when_operator: rule.when_operator,
          when_value: rule.when_value,
          then_action: rule.then_action,
          then_value: rule.then_value,
          is_active: rule.is_active,
          file_type: rule.file_type,
          valid_from: rule.valid_from,
          valid_to: rule.valid_to,
          createdAt: new Date().toISOString(),
          level: "customer",
        }));
        setAllRules(formattedRules);
        addToChatHistory({
          type: "assistant",
          message: response.data.message || `Found ${formattedRules.length} rules.`,
        });
      } else {
        addToChatHistory({ type: "assistant", message: "File uploaded, no rules found." });
      }
    } catch (error: any) {
      addToChatHistory({ type: "assistant", message: `Error: ${error.message}` });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Parse natural language input
  const parseInput = (text: string) => {
    const lowerText = text.toLowerCase();
    const customerMatch = text.match(/(?:customer|for|^)\s*([A-Za-z0-9\s&]+?)(?:\s+when|\s+\.|$)/i);
    const whenFieldMatch = text.match(/when\s+field\s+(?:is\s+)?([A-Za-z]+)/i);
    const operatorMatch = text.match(/operator\s+(?:is\s+)?([=<>]+|==)/i);
    const valueMatch = text.match(/(?:value\s+(?:is\s+)?|and\s+value\s+(?:is\s+)?)([A-Za-z0-9]+)/i);
    const thenActionMatch = text.match(/then\s+(?:action\s+)?([A-Za-z]+)/i);
    const thenValueMatch = text.match(/(?:to|value)\s+([A-Za-z]+)/i);
    const isActiveMatch = text.match(/(?:is|set\s+to)\s+(active|inactive)/i);
    const fileTypeMatch = text.match(/file\s+type\s+(?:is\s+)?([A-Za-z0-9]+)/i);
    const validFromMatch = text.match(/valid\s+from\s+(\d{4}-\d{2}-\d{2})/i);
    const validToMatch = text.match(/(?:up\s+to|valid\s+to|until)\s+(\d{4}-\d{2}-\d{2})/i);
    const deleteMatch = text.match(/(?:delete|remove)\s+rule\s+for\s+([a-z0-9\s&]+)/i);
    const searchMatch = text.match(/(?:search|find|show|get)\s+rules?\s+for\s+([a-z0-9\s&]+)/i);

    return {
      customer: customerMatch?.[1].trim() || "",
      when_field: whenFieldMatch?.[1] || "",
      when_operator: operatorMatch?.[1] || "",
      when_value: valueMatch?.[1] || "",
      then_action: thenActionMatch?.[1] || "",
      then_value: thenValueMatch?.[1] || "",
      is_active: isActiveMatch ? isActiveMatch[1].toLowerCase() === "active" : null,
      file_type: fileTypeMatch?.[1] || "",
      valid_from: validFromMatch?.[1] || "",
      valid_to: validToMatch?.[1] || "",
      deleteAction: deleteMatch?.[1].trim() || "",
      searchAction: searchMatch?.[1].trim() || "",
    };
  };

  // Filter rules
  const filterRules = (parsed: any) => {
    if (parsed.searchAction) {
      const term = parsed.searchAction.toLowerCase();
      return allRules.filter((r) => r.customer.toLowerCase().includes(term));
    }
    if (parsed.deleteAction) {
      const term = parsed.deleteAction.toLowerCase();
      return allRules.filter((r) => r.customer.toLowerCase().includes(term));
    }
    return allRules.filter((rule) => {
      let matches = true;
      if (parsed.customer) {
        matches = matches && rule.customer.toLowerCase().includes(parsed.customer.toLowerCase());
      }
      if (parsed.when_field) {
        matches =
          matches &&
          rule.when_field.toLowerCase() === parsed.when_field.toLowerCase() &&
          rule.when_operator === parsed.when_operator &&
          rule.when_value == parsed.when_value;
      }
      if (parsed.then_value) {
        matches = matches && rule.then_value.toLowerCase() === parsed.then_value.toLowerCase();
      }
      return matches;
    });
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInput(text);
    if (text.trim()) {
      const parsed = parseInput(text);
      if (parsed.customer || parsed.searchAction || parsed.deleteAction) {
        setExistingRules(filterRules(parsed));
      } else {
        setExistingRules([]);
      }
    } else {
      setExistingRules([]);
    }
  };

  // Edit rule
  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    const msg = `update rule_id: ${rule._id} customer: ${rule.customer} when_field: ${rule.when_field} when_operator: ${rule.when_operator} when_value: ${rule.when_value} then_action: ${rule.then_action} then_value: ${rule.then_value} is_active: ${rule.is_active} file_type: ${rule.file_type} valid_from: ${rule.valid_from} valid_to: ${rule.valid_to}`;
    setInput(msg);
    chatInputRef.current?.focus();
  };

  // Delete rule
  const handleDeleteRule = (rule: any) => {
    setRuleToDelete(rule);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;
    setLoading(true);
    try {
      const deleteMessage = `delete rule_id ${ruleToDelete._id}`;
      const response = await rulesResponse(deleteMessage, "mysession1");
      if (response.data) {
        addToChatHistory({ type: "system", message: `Rule for ${ruleToDelete.customer} deleted.` });
        message.success("Rule deleted");
        await loadInitialRules();
        setExistingRules([]);
      }
    } catch (error) {
      message.error("Failed to delete rule");
      addToChatHistory({ type: "system", message: "Failed to delete rule." });
    } finally {
      setLoading(false);
      setDeleteConfirmVisible(false);
      setRuleToDelete(null);
    }
  };

  // Add to chat
  const addToChatHistory = (msg: { type: string; message: string }) => {
    setChatHistory((prev) => [...prev, { id: Date.now(), timestamp: new Date().toISOString(), ...msg }]);
  };

  // Submit chat
  const handleChatSubmit = async () => {
    if (!input.trim()) return;
    addToChatHistory({ type: "user", message: input });
    setInput("");
    setLoading(true);

    try {
      const response = await rulesResponse(input, "mysession1");
      if (response.data?.data?.response) {
        const msg = response.data.data.response;
        addToChatHistory({ type: "system", message: msg });

        const jsonMatch = msg.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          if (data.message?.includes("created")) {
            message.success("Rule created");
            await loadInitialRules();
          } else if (data.message?.includes("updated")) {
            message.success("Rule updated");
            setEditingRule(null);
            await loadInitialRules();
          } else if (data.message?.includes("deleted")) {
            message.success("Rule deleted");
            await loadInitialRules();
          }
        }
      }
    } catch (error) {
      message.error("Request failed");
      addToChatHistory({ type: "system", message: "Failed to process request." });
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
    chatInputRef.current?.focus();
  }, [chatHistory]);

  return (
    <>
      <div
        className="configuration-container"
        style={{
          backgroundColor: isDarkMode ? "#111827" : "#f5f7fa",
          minHeight: "100vh",
          padding: "15px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 16, color: isDarkMode ? "#e0e0e0" : "#142b4d" }}>
          Rule Management System
        </Title>

        <div
          style={{
            display: "flex",
            gap: 16,
            height: "calc(100vh - 120px)",
            maxWidth: "100%",
          }}
        >
          {/* Chat Panel */}
          <div
            style={{
              width: "30%",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${isDarkMode ? "#2c3e50" : "#e6e9ef"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Title level={4} style={{ margin: 0, color: isDarkMode ? "#e0e0e0" : "#142b4d" }}>
                Rule Assistant {editingRule && <span style={{ color: "#1890ff" }}>- Editing</span>}
              </Title>
              {editingRule && (
                <Button type="link" size="small" onClick={() => setEditingRule(null)}>
                  Cancel
                </Button>
              )}
            </div>

            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 12,
                backgroundColor: isDarkMode ? "#111827" : "#f8faff",
                borderRadius: 8,
                border: `1px solid ${isDarkMode ? "#2c3e50" : "#e6e9ef"}`,
                marginBottom: 12,
              }}
            >
              {chatHistory.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
                  <p>Start managing rules with natural language</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    style={{
                      padding: "8px 12px",
                      marginBottom: 8,
                      borderRadius: 12,
                      maxWidth: "90%",
                      backgroundColor: chat.type === "user" ? "rgba(24,144,255,0.1)" : "#E1F0FF",
                      color: isDarkMode ? "#e0e0e0" : "#333",
                      alignSelf: chat.type === "user" ? "flex-end" : "flex-start",
                      marginLeft: chat.type === "user" ? "auto" : 0,
                    }}
                  >
                    <div style={{ fontSize: 10, color: chat.type === "user" ? "#3b82f6" : "#9ca3af" }}>
                      {chat.type === "user" ? "You" : "Assistant"}
                    </div>
                    <div style={{ fontSize: 13 }}>{chat.message}</div>
                  </div>
                ))
              )}
            </div>

            {existingRules.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 100,
                  left: 16,
                  right: 16,
                  backgroundColor: "#f9f0ff",
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #d3adf7",
                  zIndex: 10,
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 12 }}>Matching Rules:</div>
                {existingRules.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ fontSize: 11, margin: "4px 0" }}>
                    {r.customer} → {r.when_field} {r.when_operator} {r.when_value}
                    <Button size="small" type="link" onClick={() => handleEditRule(r)}>Edit</Button>
                    <Button size="small" danger type="link" onClick={() => handleDeleteRule(r)}>Del</Button>
                  </div>
                ))}
                <Button size="small" type="link" onClick={() => setExistingRules([])}>Clear</Button>
              </div>
            )}

            <Space.Compact style={{ width: "100%" }}>
              <Input
                ref={chatInputRef}
                value={input}
                onChange={handleInputChange}
                onPressEnter={handleChatSubmit}
                placeholder={editingRule ? "Update rule..." : "Create, search, or manage rules..."}
                disabled={loading}
                style={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  color: isDarkMode ? "#e0e0e0" : "#333",
                }}
              />
              <Tooltip title="Upload .txt">
                <label htmlFor="file-upload" style={{ cursor: "pointer", padding: "0 8px" }}>
                  <UploadOutlined />
                  <input id="file-upload" type="file" accept=".txt" style={{ display: "none" }} onChange={handleFileUpload} />
                </label>
              </Tooltip>
              <Button type="primary" icon={<SendOutlined />} onClick={handleChatSubmit} loading={loading} />
            </Space.Compact>

            <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
              <span>Quick actions:</span>
              <Space size={4}>
                <Button size="small" type="link" onClick={() => setInput("Create rule for Qualcomm...")}>Create</Button>
                <Button size="small" type="link" onClick={() => setInput("Search rules for Apple")}>Search</Button>
                <Button size="small" type="link" onClick={() => setInput("Delete rule_id rule1")}>Delete</Button>
              </Space>
            </div>
          </div>

          {/* Rules Grid */}
          <div
            style={{
              width: "70%",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
              borderRadius: 12,
              padding: 16,
              overflowY: "auto",
              border: `1px solid ${isDarkMode ? "#2c3e50" : "#e6e9ef"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Title level={4} style={{ margin: 0 }}>
                {existingRules.length > 0 ? "Matching Rules" : "All Rules"}
              </Title>
              <Input.Search placeholder="Search..." style={{ width: 240 }} onSearch={(v) => setInput(`search rules for ${v}`)} />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <Spin size="large" />
                <p>Processing...</p>
              </div>
            ) : (existingRules.length > 0 ? existingRules : allRules).length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>
                <p>No rules found</p>
                <p>Use the assistant to create rules</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {(existingRules.length > 0 ? existingRules : allRules).map((rule, i) => {
                  const statusColor = rule.then_value === "OnHold" ? "#fa8c16" : rule.then_value === "Suspicious" ? "#ff4d4f" : "#52c41a";
                  return (
                    <Card
                      key={rule._id}
                      style={{ borderRadius: 8, background: isDarkMode ? "#0b1d3a" : "#fff" }}
                      hoverable
                      bodyStyle={{ padding: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{rule._id}</div>
                          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                            <UserOutlined style={{ color: "#1890ff", marginRight: 4 }} />
                            {rule.customer}
                          </div>
                        </div>
                        <Space>
                          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditRule(rule)} />
                          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRule(rule)} />
                        </Space>
                      </div>
                      <div style={{ margin: "8px 0", padding: "6px 8px", background: "rgba(250,173,20,0.04)", borderRadius: 6, fontSize: 13 }}>
                        <strong>Condition:</strong> {rule.when_field} {rule.when_operator} {rule.when_value}
                      </div>
                      <div style={{ padding: "6px 8px", background: "rgba(82,196,26,0.1)", borderRadius: 6, fontSize: 13 }}>
                        <strong>Action:</strong> <span style={{ color: statusColor }}>{rule.then_value}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                        <CalendarOutlined /> {rule.valid_from} → {rule.valid_to}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          title={<span style={{ color: "#ff4d4f" }}><DeleteOutlined /> Delete Rule</span>}
          open={deleteConfirmVisible}
          onOk={confirmDeleteRule}
          onCancel={() => setDeleteConfirmVisible(false)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Delete rule for <strong>{ruleToDelete?.customer}</strong>?</p>
          {ruleToDelete && (
            <div style={{ background: "rgba(255,77,79,0.05)", padding: 12, borderRadius: 8 }}>
              <p><strong>ID:</strong> {ruleToDelete._id}</p>
              <p><strong>Condition:</strong> {ruleToDelete.when_field} {ruleToDelete.when_operator} {ruleToDelete.when_value}</p>
              <p><strong>Action:</strong> {ruleToDelete.then_value}</p>
            </div>
          )}
        </Modal>

        <FloatButton.BackTop />
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ant-card { animation: slideDown 0.4s ease-out forwards; }
      `}</style>
    </>
  );
};

// Wrap in Suspense if needed
export default function RuleManagementPage() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: "block", margin: "100px auto" }} />}>
      <ConfigurationTable />
    </Suspense>
  );
}
