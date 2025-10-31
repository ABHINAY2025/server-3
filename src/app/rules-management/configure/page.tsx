'use client';

import { useState, useEffect } from "react";
import type { ChangeEvent } from 'react';
import {
  Typography,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Divider,
  Modal,
  Row,
  Col,
  Tabs,
  message,
} from "antd";
import { useRouter } from 'next/navigation';
import dayjs from "dayjs";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api/client";

const { Option } = Select;
const { Text } = Typography;

interface WhenRule {
  field: string;
  operator: string;
  value: string;
}

interface ThenRule {
  [key: string]: string;
}

interface NetworkWhenRule {
  field: string;
  operator: string;
  value: string;
}

interface NetworkThenRule {
  [key: string]: string;
}

interface FormDataType {
  customerName?: string;
  fileType: string;
  networkName: string;
  ruleName: string;
  ruleType: string;
  ruleSubType: string;
  ruleDescription: string;
  selectedStartDate?: dayjs.Dayjs;
  selectedEndDate?: dayjs.Dayjs;
  when: WhenRule[];
  then: ThenRule[];
}

interface NetworkFormDataType {
  networkRuleName: string;
  fileType: string;
  networkRuleType: string;
  networkRuleSubType: string;
  networkRuleDescription: string;
  networkSelectedStartDate?: dayjs.Dayjs;
  networkSelectedEndDate?: dayjs.Dayjs;
  networkWhen: NetworkWhenRule[];
  networkThen: NetworkThenRule[];
}

const initialFormData = {
  customerName: "",
  fileType: "",
  networkName: "",
  ruleName: "",
  ruleType: "",
  ruleSubType: "",
  ruleDescription: "",
  selectedStartDate: undefined,
  selectedEndDate: undefined,
  when: [],
  then: []
};

const bankFormInitialState = {
  networkName: "",
  fileType: "",
  ruleName: "",
  ruleType: "",
  ruleSubType: "",
  ruleDescription: "",
  selectedStartDate: undefined,
  selectedEndDate: undefined,
  when: [],
  then: [],
};

const networkFormInitialState: NetworkFormDataType = {
  networkRuleName: "",
  fileType: "",
  networkRuleType: "",
  networkRuleSubType: "",
  networkRuleDescription: "",
  networkSelectedStartDate: undefined,
  networkSelectedEndDate: undefined,
  networkWhen: [],
  networkThen: [],
};

function ConfigurePage() {
  const router = useRouter();
  // Avoid using `useSearchParams()` here to prevent the "should be wrapped in a suspense boundary"
  // prerender error during build. Instead, read URLSearchParams from window.location on mount.
  const [rowData, setRowData] = useState<any>(null);

  // default tab is "1"; we'll override on mount if activeTab is provided in the URL
  const [activeTab, setActiveTab] = useState<string>("1");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const rd = sp.get('rowData') ? JSON.parse(decodeURIComponent(sp.get('rowData') || '{}')) : null;
      const tab = sp.get('activeTab') || "1";
      setRowData(rd);
      setActiveTab(tab);
    }
  }, []);

  const [customerForm] = Form.useForm();
  const [bankForm] = Form.useForm();


  // State declarations
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [bankFormData, setBankFormData] = useState<FormDataType>(bankFormInitialState);
  const [networkFormData, setNetworkFormData] = useState(networkFormInitialState);

  // State for fetched data
  const [ISOStandardFields, setISOStandardFields] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [ISOStandardFieldsError, setISOStandardFieldsError] = useState<Error | null>(null);
  const [CompaniesDataError, setCompaniesDataError] = useState<Error | null>(null);
  const [isISOStandardFieldsLoading, setIsISOStandardFieldsLoading] = useState(true);
  const [isCompaniesDataLoading, setIsCompaniesDataLoading] = useState(true);

  // Form state
  const [ISOWhenField, setISOWhenField] = useState("");
  const [ISOWhenOperator, setISOWhenOperator] = useState("");
  const [ISOWhenValue, setISOWhenValue] = useState("");
  const [ISOThenField, setISOThenField] = useState("");
  const [ISOThenValue, setISOThenValue] = useState("");
  const [ISOBankWhenField, setISOBankWhenField] = useState("");
  const [ISOBankWhenOperator, setISOBankWhenOperator] = useState("");
  const [ISOBankWhenValue, setISOBankWhenValue] = useState("");
  const [ISOBankThenField, setISOBankThenField] = useState("");
  const [ISOBankThenValue, setISOBankThenValue] = useState("");
  const [ISONetworkWhenField, setISONetworkWhenField] = useState("");
  const [ISONetworkWhenOperator, setISONetworkWhenOperator] = useState("");
  const [ISONetworkWhenValue, setISONetworkWhenValue] = useState("");
  const [ISONetworkThenField, setISONetworkThenField] = useState("");
  const [ISONetworkThenValue, setISONetworkThenValue] = useState("");
  const [fileType, setFileType] = useState("ISO");
  const [bankFileType, setBankFileType] = useState("ISO");
  const [networkFileType, setNetworkFileType] = useState("ISO");
  const [resMessage, setResMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [isNetworkModalVisible, setIsNetworkModalVisible] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Load initial data
  useEffect(() => {
    const fetchISOStandardFields = async () => {
      try {
        setIsISOStandardFieldsLoading(true);
        const response = await fetch("https://server-1-xk8a.onrender.com/api/isoStandardFields");
        const data = await response.json();
        setISOStandardFields(data);
      } catch (error) {
        setISOStandardFieldsError(error as Error);
      } finally {
        setIsISOStandardFieldsLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        setIsCompaniesDataLoading(true);
        const response = await fetch("https://server-1-xk8a.onrender.com/api/getAll/customerNames");
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        setCompaniesDataError(error as Error);
      } finally {
        setIsCompaniesDataLoading(false);
      }
    };

    fetchISOStandardFields();
    fetchCompanies();
  }, []);

  // Handle form data from URL params
  useEffect(() => {
    if (rowData) {
      if (activeTab === "1") {
        // Update Customer Form
        customerForm.setFieldsValue({
          customerName: rowData.customerName || "",
          fileType: rowData.fileType || "ISO",
          networkName: rowData.networkName || "",
          ruleName: rowData.ruleName || "",
          ruleType: rowData.ruleType || "",
          ruleSubType: rowData.ruleSubType || "",
          ruleDescription: rowData.ruleDescription || "",
          selectedStartDate: rowData.selectedStartDate ? dayjs(rowData.selectedStartDate) : undefined,
          selectedEndDate: rowData.selectedEndDate ? dayjs(rowData.selectedEndDate) : undefined,
          when: rowData.when || [],
          then: rowData.then || [],
        });

        setFormData((prev) => ({
          ...prev,
          customerName: rowData.customerName || "",
          fileType: rowData.fileType || "ISO",
          networkName: rowData.networkName || "",
          ruleName: rowData.ruleName || "",
          ruleType: rowData.ruleType || "",
          ruleSubType: rowData.ruleSubType || "",
          ruleDescription: rowData.ruleDescription || "",
          selectedStartDate: rowData.selectedStartDate ? dayjs(rowData.selectedStartDate) : undefined,
          selectedEndDate: rowData.selectedEndDate ? dayjs(rowData.selectedEndDate) : undefined,
          when: rowData.when || [],
          then: rowData.then || [],
        }));
      } else if (activeTab === "2") {
        // Update Bank Form
        bankForm.setFieldsValue({
          networkName: rowData.networkName || "",
          fileType: rowData.fileType || "ISO",
          ruleName: rowData.ruleName || "",
          ruleType: rowData.ruleType || "",
          ruleSubType: rowData.ruleSubType || "",
          ruleDescription: rowData.ruleDescription || "",
          selectedStartDate: rowData.selectedStartDate ? dayjs(rowData.selectedStartDate) : undefined,
          selectedEndDate: rowData.selectedEndDate ? dayjs(rowData.selectedEndDate) : undefined,
          when: rowData.when || [],
          then: rowData.then || [],
        });

        setBankFormData((prev) => ({
          ...prev,
          networkName: rowData.networkName || "",
          fileType: rowData.fileType || "ISO",
          ruleName: rowData.ruleName || "",
          ruleType: rowData.ruleType || "",
          ruleSubType: rowData.ruleSubType || "",
          ruleDescription: rowData.ruleDescription || "",
          selectedStartDate: rowData.selectedStartDate ? dayjs(rowData.selectedStartDate) : undefined,
          selectedEndDate: rowData.selectedEndDate ? dayjs(rowData.selectedEndDate) : undefined,
          when: rowData.when || [],
          then: rowData.then || [],
        }));
      }
    }
  }, [rowData, activeTab, customerForm, bankForm]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    router.push(`/rules-management/configure?activeTab=${key}`);
  };

  const handleFormInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankFormInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNetworkFormInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ISONetworkWhenValue") setISONetworkWhenValue(value);
    else if (name === "ISONetworkThenValue") setISONetworkThenValue(value);
    else
      setNetworkFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const handleFormSelectChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBankFormSelectChange = (key: string, value: any) => {
    setBankFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNetworkFormSelectChange = (key: string, value: any) => {
    if (key === "ISONetworkWhenField") setISONetworkWhenField(value);
    else if (key === "ISONetworkWhenOperator") setISONetworkWhenOperator(value);
    else if (key === "ISONetworkWhenValue") setISONetworkWhenValue(value);
    else if (key === "ISONetworkThenField") setISONetworkThenField(value);
    else if (key === "fileType") {
      setNetworkFileType(value);
      setNetworkFormData((prev) => ({
        ...prev,
        fileType: value,
      }));
    } else
      setNetworkFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
  };

  const handleFormDateChange = (name: string, date: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleBankFormDateChange = (name: string, date: any) => {
    setBankFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleNetworkFormDateChange = (name: string, date: any) => {
    setNetworkFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const onclickWhenButton = () => {
    setFormData((prev) => ({
      ...prev,
      when: [...prev.when, { field: ISOWhenField, operator: ISOWhenOperator, value: ISOWhenValue }],
    }));

    setISOWhenField("");
    setISOWhenOperator("");
    setISOWhenValue("");
  };

  const onclickThenButton = () => {
    setFormData((prev) => ({
      ...prev,
      then: [...prev.then, { [ISOThenField]: ISOThenValue }],
    }));
    setISOThenField("");
    setISOThenValue("");
  };

  const onClickBankWhenButton = () => {
    setBankFormData((prev) => ({
      ...prev,
      when: [...prev.when, { field: ISOBankWhenField, operator: ISOBankWhenOperator, value: ISOBankWhenValue }],
    }));
    setISOBankWhenField("");
    setISOBankWhenOperator("");
    setISOBankWhenValue("");
  };

  const onClickBankThenButton = () => {
    setBankFormData((prev) => ({
      ...prev,
      then: [...prev.then, { [ISOBankThenField]: ISOBankThenValue }],
    }));
    setISOBankThenField("");
    setISOBankThenValue("");
  };

  const onClickNetworkWhenButton = () => {
    setNetworkFormData((prev) => ({
      ...prev,
      networkWhen: [...prev.networkWhen, { field: ISONetworkWhenField, operator: ISONetworkWhenOperator, value: ISONetworkWhenValue }],
    }));
    setISONetworkWhenField("");
    setISONetworkWhenOperator("");
    setISONetworkWhenValue("");
  };

  const onClickNetworkThenButton = () => {
    setNetworkFormData((prev) => ({
      ...prev,
      networkThen: [...prev.networkThen, { [ISONetworkThenField]: ISONetworkThenValue }],
    }));
    setISONetworkThenField("");
    setISONetworkThenValue("");
  };

  // Helper function for customer form submission
  const submitCustomerForm = (data: any, replace: boolean) => {
    return {
      url: `${getApiBaseUrl()}/create/stpConfigurations`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { ...data, replace },
    };
  };

  const handleFormSubmit = async () => {
    try {
      const requestObject = submitCustomerForm(formData, false);
      const response = await axios.post(requestObject.url, requestObject.body, {
        headers: requestObject.headers,
      });
      const data = response.data;

      if (data.success === "Duplicate") {
        setDuplicateData(data.data);
        setResMessage(data.message);
        setIsModalVisible(true);
      } else if (data.success) {
        setResMessage(data.message);
        setSuccessMessage(true);
        setFormData(initialFormData);
      } else {
        console.error("Problem while saving customer configuration!");
      }
    } catch (error) {
      console.error("Error during customer configuration submission:", error);
    }
  };

  const handleBankFormSubmit = async () => {
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/create/bankRules`,
        { ...bankFormData, replace: false },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;

      if (data.success === "Duplicate") {
        setDuplicateData(data.data);
        setResMessage(data.message);
        setIsBankModalVisible(true);
      } else if (data.success) {
        setResMessage(data.message);
        setSuccessMessage(true);
        setBankFormData(bankFormInitialState);
      } else {
        console.error("Problem while saving bank configuration!");
      }
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleNetworkFormSubmit = async () => {
    try {
      // Transform the networkWhen data to match API format
      const transformedWhen = networkFormData.networkWhen?.map((condition) => ({
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
      })) || [];

      // Transform the networkThen data to match API format
      const transformedThen = networkFormData.networkThen?.map((action) => {
        const field = Object.keys(action)[0];
        const value = action[field];
        return {
          field,
          value,
        };
      }) || [];

      const transformedData = {
        ...networkFormData,
        networkWhen: transformedWhen,
        networkThen: transformedThen,
        replace: false,
      };

      const response = await axios.post(
        `https://server-1-xk8a.onrender.com/api/create/networkRules`,
        transformedData,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;

      if (data.success === "Duplicate") {
        setDuplicateData(data.data);
        setResMessage(data.message);
        setIsNetworkModalVisible(true);
      } else if (data.success) {
        setResMessage(data.message);
        setSuccessMessage(true);
        setNetworkFormData(networkFormInitialState);
      } else {
        console.error("Problem while saving network configuration!");
      }
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleCustomerReplace = async () => {
    try {
      const requestObject = submitCustomerForm(formData, true);
      const response = await fetch(requestObject.url, {
        method: requestObject.method,
        headers: requestObject.headers,
        body: JSON.stringify(requestObject.body),
      });
      const data = await response.json();

      if (data.success) {
        setResMessage("Duplicate rule replaced successfully!");
        setIsModalVisible(false);
        setSuccessMessage(true);
        setFormData(initialFormData);
      } else {
        setResMessage("Error replacing duplicate rule.");
      }
    } catch (error) {
      console.error("Error replacing duplicate rule:", error);
    }
  };

  const handleBankReplace = async () => {
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/create/bankRules`,
        { ...bankFormData, replace: true },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;

      if (data.success) {
        setResMessage("Duplicate rule replaced successfully!");
        setIsBankModalVisible(false);
        setSuccessMessage(true);
        setBankFormData(bankFormInitialState);
      } else {
        setResMessage("Error replacing duplicate rule.");
      }
    } catch (error) {
      console.error("Error replacing duplicate rule:", error);
    }
  };

  const handleNetworkReplace = async () => {
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/create/networkRules`,
        { ...networkFormData, replace: true },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;

      if (data.success) {
        setResMessage("Duplicate rule replaced successfully!");
        setIsNetworkModalVisible(false);
        setSuccessMessage(true);
        setNetworkFormData(networkFormInitialState);
      } else {
        setResMessage("Error replacing duplicate rule.");
      }
    } catch (error) {
      console.error("Error replacing duplicate rule:", error);
    }
  };

  const handleSkip = () => {
    setIsModalVisible(false);
    setIsBankModalVisible(false);
    setIsNetworkModalVisible(false);
    setResMessage("Duplicate rule skipped.");
  };

  return (
    <div>
      {contextHolder}
      
      
      <Divider
        style={{
          margin: "0"
        }}
      />
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{
          color: "#000",
        }}
        items={[
          {
            label: (
              <span style={{ color: "#000", paddingLeft: "15px" }}>
                Customer Level
              </span>
            ),
            key: "1",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16} lg={18}>
                  <div
                    style={{
                      margin: "10px",
                      borderRadius: "5px"
                    }}
                  >
                    <Form
                      layout="vertical"
                      autoComplete="off"
                      onFinish={handleFormSubmit}
                      initialValues={formData}
                      style={{
                        margin: "10px",
                        padding: "10px"
                      }}
                      form={customerForm}
                    >
                      <Row
                        gutter={[16, 16]}
                        justify="end"
                        style={{ marginBottom: 0 }}
                      >
                        <Col>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                              type="primary"
                              htmlType="submit"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                                marginBottom: "5px",
                                marginRight: "15px",
                                padding: "5px",
                                fontSize: "16px",
                                borderColor: "#d9d9d9",
                              }}
                            >
                              Add Customer Rule
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Customer Name
                              </Text>
                            }
                            name="customerName"
                            rules={[
                              {
                                required: true,
                                message: "Please select a customer!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleFormSelectChange("customerName", value)
                              }
                            >
                              {companies?.map((c: any) => (
                                <Option key={c._id} value={c.customerName}>
                                  {c.customerName}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Element Type
                              </Text>
                            }
                            name="fileType"
                            rules={[
                              {
                                required: true,
                                message: "Please select file type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleFormSelectChange("fileType", value)
                              }
                            >
                              <Option value="ISO">ISO</Option>
                              <Option value="NON-ISO">NON-ISO</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Network Selection
                              </Text>
                            }
                            name="networkName"
                            rules={[
                              {
                                required: true,
                                message: "Please select a network!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleFormSelectChange("networkName", value)
                              }
                            >
                              {["All", "Fed", "TCH"].map((c) => (
                                <Option key={c} value={c}>
                                  {c}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Name
                              </Text>
                            }
                            name="ruleName"
                            rules={[
                              {
                                required: true,
                                message: "Please input rule name!",
                              },
                            ]}
                          >
                            <Input
                              name="ruleName"
                              onChange={handleFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Type
                              </Text>
                            }
                            name="ruleType"
                            rules={[
                              {
                                required: true,
                                message: "Please select rule type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleFormSelectChange("ruleType", value)
                              }
                            >
                              <Option value="Credit Side">Credit</Option>
                              <Option value="Debit Side">Debit</Option>
                              <Option value="Supplementary">
                                Supplementary
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Sub Type
                              </Text>
                            }
                            name="ruleSubType"
                            rules={[
                              {
                                required: true,
                                message: "Please select rule sub type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleFormSelectChange("ruleSubType", value)
                              }
                            >
                              <Option value="Insertion">Insertion</Option>
                              <Option value="Substitution">Substitution</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Description
                              </Text>
                            }
                            name="ruleDescription"
                          >
                            <Input
                              name="ruleDescription"
                              onChange={handleFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Start Date
                              </Text>
                            }
                            name="selectedStartDate"
                            rules={[
                              {
                                required: true,
                                message: "Please select rule start date!",
                              },
                            ]}
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleFormDateChange("selectedStartDate", date)
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule End Date
                              </Text>
                            }
                            name="selectedEndDate"
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleFormDateChange("selectedEndDate", date)
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        When
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Field
                              </Text>
                            }
                            name="ISOWhenField"
                            rules={[
                              {
                                required: true,
                                message: "Please input an Element",
                              },
                            ]}
                          >
                            {fileType === "ISO" ? (
                              <Select
                                value={ISOWhenField}
                                onChange={(value) => setISOWhenField(value)}
                              >
                                {ISOStandardFields?.map((field: any, index: number) => (
                                  <Option value={field.label} key={index}>
                                    {field.label}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                value={ISOWhenField}
                                onChange={(e) =>
                                  setISOWhenField(e.target.value)
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Operator
                              </Text>
                            }
                            name="ISOWhenOperator"
                            rules={[
                              {
                                required: true,
                                message: "Please select an Operator",
                              },
                            ]}
                          >
                            <Select
                              value={ISOWhenOperator}
                              onChange={(value) => setISOWhenOperator(value)}
                            >
                              <Option value="===">=</Option>
                              <Option value="!==">!=</Option>
                              <Option value=">">&gt;</Option>
                              <Option value="<">&lt;</Option>
                              <Option value=">=">&gt;=</Option>
                              <Option value="<=">&lt;=</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Value
                              </Text>
                            }
                            name="ISOWhenValue"
                          >
                            <Input
                              value={ISOWhenValue}
                              onChange={(e) => setISOWhenValue(e.target.value)}
                            />
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={6}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onclickWhenButton}
                            >
                              Add Rule Condition
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {formData.when.map((condition, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {condition.field}</div>
                          </Col>
                          <Col span={4}>
                            <div>Operator: {condition.operator}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {condition.value}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedWhen = formData.when.filter(
                                  (_, i) => i !== index
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  when: updatedWhen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        Then
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Action
                              </Text>
                            }
                            name="ISOThenField"
                          >
                            <Select
                              value={ISOThenValue}
                              onChange={(value) => {
                                setISOThenField("action");
                                setISOThenValue(value);
                              }}
                            >
                              <Option value="ONHOLD">ONHOLD</Option>
                              <Option value="SUSPICIOUS">SUSPICIOUS</Option>
                              <Option value="REJECT">REJECT</Option>
                              <Option value="IN PROGRESS">IN PROGRESS</Option>
                              <Option value="BLOCK">BLOCK</Option>
                              <Option value="APPROVAL_REQUIRED">
                                APPROVAL REQUIRED
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={4}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onclickThenButton}
                            >
                              Add Rule Action
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {formData.then.map((action, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {Object.keys(action)[0]}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {Object.values(action)[0]}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedThen = formData.then.filter(
                                  (_, i) => i !== index
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  then: updatedThen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </Form>
                  </div>
                </Col>
                <Col xs={24} md={8} lg={6}>
                  <div
                    style={{
                      border: "2px solid #babacdff",
                      padding: "10px",
                      borderRadius: "5px",
                      marginTop: "10px",
                      height: "100%",
                      overflowY: "auto",
                    }}
                  >
                    <Typography.Title
                      level={4}
                      style={{
                        display: "flex",
                        color: "#000",
                      }}
                    >
                      Customer Level Configurations Preview
                    </Typography.Title>
                    <Divider
                      style={{
                        margin: "0"
                      }}
                    />
                    <pre style={{ color: "#000" }}>
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                </Col>
              </Row>
            ),
          },
          {
            label: (
              <span style={{ color: "#000" }}>
                Bank Level
              </span>
            ),
            key: "2",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16} lg={18}>
                  <div
                    style={{
                     
                      margin: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <Form
                      layout="vertical"
                      onFinish={handleBankFormSubmit}
                      initialValues={bankFormData}
                      form={bankForm}
                      style={{
                        
                        margin: "15px",
                        padding: "10px",
                      }}
                    >
                      <Row
                        gutter={[16, 16]}
                        justify="end"
                        style={{ marginBottom: 0 }}
                      >
                        <Col>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                              type="primary"
                              htmlType="submit"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                                marginBottom: "5px",
                                marginRight: "15px",
                                fontSize: "16px",
                                padding: "5px",
                                borderColor: "#d9d9d9",
                              }}
                            >
                              Add Bank Rule
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Element Type
                              </Text>
                            }
                            name="fileType"
                            rules={[
                              {
                                required: true,
                                message: "Please select file type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleBankFormSelectChange("fileType", value)
                              }
                            >
                              <Option value="ISO">ISO</Option>
                              <Option value="NON-ISO">NON-ISO</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Network Selection
                              </Text>
                            }
                            name="networkName"
                            rules={[
                              {
                                required: true,
                                message: "Please select a Network!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleBankFormSelectChange("networkName", value)
                              }
                            >
                              {["All", "Fed", "TCH"].map((c) => (
                                <Option key={c} value={c}>
                                  {c}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Bank Rule Name
                              </Text>
                            }
                            name="ruleName"
                            rules={[
                              {
                                required: true,
                                message: "Please input rule name!",
                              },
                            ]}
                          >
                            <Input
                              name="ruleName"
                              onChange={handleBankFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Bank Rule Type
                              </Text>
                            }
                            name="ruleType"
                            rules={[
                              {
                                required: true,
                                message: "Please select Bank Rule type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleBankFormSelectChange("ruleType", value)
                              }
                            >
                              <Option value="Credit Side">Credit</Option>
                              <Option value="Debit Side">Debit</Option>
                              <Option value="Supplementary">
                                Supplementary
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Sub Type
                              </Text>
                            }
                            name="ruleSubType"
                            rules={[
                              {
                                required: true,
                                message: "Please select bank rule sub type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleBankFormSelectChange("ruleSubType", value)
                              }
                            >
                              <Option value="Insertion">Insertion</Option>
                              <Option value="Substitution">Substitution</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Description
                              </Text>
                            }
                            name="ruleDescription"
                          >
                            <Input
                              name="ruleDescription"
                              onChange={handleBankFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Start Date
                              </Text>
                            }
                            name="selectedStartDate"
                            rules={[
                              {
                                required: true,
                                message: "Please select rule start date!",
                              },
                            ]}
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleBankFormDateChange(
                                  "selectedStartDate",
                                  date
                                )
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule End Date
                              </Text>
                            }
                            name="selectedEndDate"
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleBankFormDateChange(
                                  "selectedEndDate",
                                  date
                                )
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        When
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Field
                              </Text>
                            }
                            name="ISOBankWhenField"
                            rules={[
                              {
                                required: true,
                                message: "Please input an Element",
                              },
                            ]}
                          >
                            {bankFileType === "ISO" ? (
                              <Select
                                value={ISOBankWhenField}
                                onChange={(value) => setISOBankWhenField(value)}
                              >
                                {ISOStandardFields?.map((field: any, index: number) => (
                                  <Option value={field.label} key={index}>
                                    {field.label}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                value={ISOBankWhenField}
                                onChange={(e) =>
                                  setISOBankWhenField(e.target.value)
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Operator
                              </Text>
                            }
                            name="ISOBankWhenOperator"
                            rules={[
                              {
                                required: true,
                                message: "Please select an Operator",
                              },
                            ]}
                          >
                            <Select
                              value={ISOBankWhenOperator}
                              onChange={(value) =>
                                setISOBankWhenOperator(value)
                              }
                            >
                              <Option value="===">=</Option>
                              <Option value="!==">!=</Option>
                              <Option value=">">&gt;</Option>
                              <Option value="<">&lt;</Option>
                              <Option value=">=">&gt;=</Option>
                              <Option value="<=">&lt;=</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Value
                              </Text>
                            }
                            name="ISOBankWhenValue"
                          >
                            <Input
                              value={ISOBankWhenValue}
                              onChange={(e) =>
                                setISOBankWhenValue(e.target.value)
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={6}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onClickBankWhenButton}
                            >
                              Add Rule Condition
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {bankFormData.when.map((condition, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {condition.field}</div>
                          </Col>
                          <Col span={4}>
                            <div>Operator: {condition.operator}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {condition.value}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedWhen = bankFormData.when.filter(
                                  (_, i) => i !== index
                                );
                                setBankFormData((prev) => ({
                                  ...prev,
                                  when: updatedWhen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        Then
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Action
                              </Text>
                            }
                            name="ISOBankThenField"
                          >
                            <Select
                              value={ISOBankThenValue}
                              onChange={(value) => {
                                setISOBankThenField("action");
                                setISOBankThenValue(value);
                              }}
                            >
                              <Option value="ONHOLD">ONHOLD</Option>
                              <Option value="SUSPICIOUS">SUSPICIOUS</Option>
                              <Option value="REJECT">REJECT</Option>
                              <Option value="IN PROGRESS">IN PROGRESS</Option>
                              <Option value="BLOCK">BLOCK</Option>
                              <Option value="APPROVAL_REQUIRED">
                                APPROVAL REQUIRED
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={4}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onClickBankThenButton}
                            >
                              Add Rule Action
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {bankFormData.then.map((action, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {Object.keys(action)[0]}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {Object.values(action)[0]}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedThen = bankFormData.then.filter(
                                  (_, i) => i !== index
                                );
                                setBankFormData((prev) => ({
                                  ...prev,
                                  then: updatedThen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </Form>
                  </div>
                </Col>
                <Col xs={24} md={8} lg={6}>
                  <div
                    style={{
                      border: "2px solid #babacdff",
                      padding: "10px",
                      borderRadius: "5px",
                      marginTop: "10px",
                      height: "100%",
                      overflowY: "auto",
                    }}
                  >
                    <Typography.Title
                      level={4}
                      style={{
                        display: "flex",
                        color: "#000",
                      }}
                    >
                      Bank Level Configurations Preview
                    </Typography.Title>
                    <Divider
                      style={{
                        margin: "0",
                        borderColor: "#d9d9d9",
                      }}
                    />
                    <pre style={{ color: "#000" }}>
                      {JSON.stringify(bankFormData, null, 2)}
                    </pre>
                  </div>
                </Col>
              </Row>
            ),
          },
          {
            label: (
              <span style={{ color: "#000" }}>
                Network Level
              </span>
            ),
            key: "3",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16} lg={18}>
                  <div
                    style={{
                      
                      margin: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <Form
                      layout="vertical"
                      onFinish={handleNetworkFormSubmit}
                      initialValues={networkFormData}
                      style={{
                       
                        margin: "15px",
                        padding: "10px",
                      }}
                    >
                      <Row
                        gutter={[16, 16]}
                        justify="end"
                        style={{ marginBottom: 0 }}
                      >
                        <Col>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                              type="primary"
                              htmlType="submit"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                                marginBottom: "5px",
                                marginRight: "15px",
                                padding: "5px",
                                fontSize: "16px",
                                borderColor: "#d9d9d9",
                              }}
                            >
                              Add Network Rule
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Element Type
                              </Text>
                            }
                            name="fileType"
                            rules={[
                              {
                                required: true,
                                message: "Please select file type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleNetworkFormSelectChange("fileType", value)
                              }
                            >
                              <Option value="ISO">ISO</Option>
                              <Option value="NON-ISO">NON-ISO</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Network Selection
                              </Text>
                            }
                            name="networkName"
                            rules={[
                              {
                                required: true,
                                message: "Please select a Network!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleNetworkFormSelectChange(
                                  "networkName",
                                  value
                                )
                              }
                            >
                              {["All", "Fed", "TCH"].map((c) => (
                                <Option key={c} value={c}>
                                  {c}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Network Rule Name
                              </Text>
                            }
                            name="networkRuleName"
                            rules={[
                              {
                                required: true,
                                message: "Please input rule name!",
                              },
                            ]}
                          >
                            <Input
                              name="networkRuleName"
                              onChange={handleNetworkFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Network Rule Type
                              </Text>
                            }
                            name="networkRuleType"
                            rules={[
                              {
                                required: true,
                                message: "Please select Network Rule type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleNetworkFormSelectChange(
                                  "networkRuleType",
                                  value
                                )
                              }
                            >
                              <Option value="Credit Side">Credit</Option>
                              <Option value="Debit Side">Debit</Option>
                              <Option value="Supplementary">
                                Supplementary
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Sub Type
                              </Text>
                            }
                            name="networkRuleSubType"
                            rules={[
                              {
                                required: true,
                                message: "Please select network rule sub type!",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleNetworkFormSelectChange(
                                  "networkRuleSubType",
                                  value
                                )
                              }
                            >
                              <Option value="Insertion">Insertion</Option>
                              <Option value="Substitution">Substitution</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Description
                              </Text>
                            }
                            name="networkRuleDescription"
                          >
                            <Input
                              name="networkRuleDescription"
                              onChange={handleNetworkFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule Start Date
                              </Text>
                            }
                            name="networkSelectedStartDate"
                            rules={[
                              {
                                required: true,
                                message: "Please select rule start date!",
                              },
                            ]}
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleNetworkFormDateChange(
                                  "networkSelectedStartDate",
                                  date
                                )
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Rule End Date
                              </Text>
                            }
                            name="networkSelectedEndDate"
                          >
                            <DatePicker
                              style={{ width: "100%" }}
                              onChange={(date) =>
                                handleNetworkFormDateChange(
                                  "networkSelectedEndDate",
                                  date
                                )
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        When
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Data Field
                              </Text>
                            }
                            name="ISONetworkWhenField"
                            rules={[
                              {
                                required: true,
                                message: "Please input an Element",
                              },
                            ]}
                          >
                            {networkFileType === "ISO" ? (
                              <Select
                                onChange={(value) =>
                                  handleNetworkFormSelectChange(
                                    "ISONetworkWhenField",
                                    value
                                  )
                                }
                              >
                                {ISOStandardFields?.map((field: any, index: number) => (
                                  <Option value={field.field} key={index}>
                                    {field.label}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                name="ISONetworkWhenField"
                                onChange={handleNetworkFormInputChange}
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Operator
                              </Text>
                            }
                            name="ISONetworkWhenOperator"
                            rules={[
                              {
                                required: true,
                                message: "Please select an Operator",
                              },
                            ]}
                          >
                            <Select
                              onChange={(value) =>
                                handleNetworkFormSelectChange(
                                  "ISONetworkWhenOperator",
                                  value
                                )
                              }
                            >
                              <Option value="===">=</Option>
                              <Option value="!==">!=</Option>
                              <Option value=">">&gt;</Option>
                              <Option value="<">&lt;</Option>
                              <Option value=">=">&gt;=</Option>
                              <Option value="<=">&lt;=</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={4}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Value
                              </Text>
                            }
                            name="ISONetworkWhenValue"
                          >
                            <Input
                              name="ISONetworkWhenValue"
                              value={ISONetworkWhenValue}
                              onChange={handleNetworkFormInputChange}
                            />
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={6}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onClickNetworkWhenButton}
                            >
                              Add Rule Condition
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {networkFormData.networkWhen.map((condition, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {condition.field}</div>
                          </Col>
                          <Col span={4}>
                            <div>Operator: {condition.operator}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {condition.value}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedWhen = networkFormData.networkWhen.filter(
                                  (_, i) => i !== index
                                );
                                setNetworkFormData((prev) => ({
                                  ...prev,
                                  networkWhen: updatedWhen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Divider style={{ margin: "0" }} />
                      <Typography.Title
                        level={4}
                        style={{
                          display: "flex",
                          color: "#000",
                        }}
                      >
                        Then
                      </Typography.Title>
                      <Row gutter={[16, 16]} justify="start" align="middle">
                        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
                          <Form.Item
                            label={
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  color: "#000",
                                }}
                              >
                                Action
                              </Text>
                            }
                            name="ISONetworkThenField"
                          >
                            <Select
                              value={ISONetworkThenValue}
                              onChange={(value) => {
                                setISONetworkThenField("action");
                                setISONetworkThenValue(value);
                              }}
                            >
                              <Option value="ONHOLD">ONHOLD</Option>
                              <Option value="SUSPICIOUS">SUSPICIOUS</Option>
                              <Option value="REJECT">REJECT</Option>
                              <Option value="IN PROGRESS">IN PROGRESS</Option>
                              <Option value="BLOCK">BLOCK</Option>
                              <Option value="APPROVAL_REQUIRED">
                                APPROVAL REQUIRED
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={6}
                          xl={4}
                          style={{ alignSelf: "end" }}
                        >
                          <Form.Item>
                            <Button
                              type="default"
                              style={{
                                backgroundColor: "#1e222759",
                                color: "#fff",
                              }}
                              onClick={onClickNetworkThenButton}
                            >
                              Add Rule Action
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      {networkFormData.networkThen.map((action, index) => (
                        <Row gutter={[16, 16]} key={index}>
                          <Col span={8}>
                            <div>Field: {Object.keys(action)[0]}</div>
                          </Col>
                          <Col span={8}>
                            <div>Value: {Object.values(action)[0]}</div>
                          </Col>
                          <Col span={4}>
                            <Button
                              danger
                              onClick={() => {
                                const updatedThen = networkFormData.networkThen.filter(
                                  (_, i) => i !== index
                                );
                                setNetworkFormData((prev) => ({
                                  ...prev,
                                  networkThen: updatedThen,
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </Form>
                  </div>
                </Col>
                <Col xs={24} md={8} lg={6}>
                  <div
                    style={{
                      border: "2px solid #babacdff",
                      padding: "10px",
                      borderRadius: "5px",
                      marginTop: "10px",
                      height: "100%",
                      overflowY: "auto",
                    }}
                  >
                    <Typography.Title
                      level={4}
                      style={{
                        display: "flex",
                        color: "#000",
                      }}
                    >
                      Network Level Configurations Preview
                    </Typography.Title>
                    <Divider
                      style={{
                        margin: "0"
                      }}
                    />
                    <pre style={{ color: "#000" }}>
                      {JSON.stringify(networkFormData, null, 2)}
                    </pre>
                  </div>
                </Col>
              </Row>
            ),
          },
        ]}
      />
      {successMessage && (
        <Modal
          open={successMessage}
          title="Successfully saved!"
          onCancel={() => setSuccessMessage(false)}
          footer={[
            <Button key="close" onClick={() => setSuccessMessage(false)}>
              Close
            </Button>,
          ]}
        >
          <div>{resMessage}</div>
        </Modal>
      )}
      <Modal
        title="Duplicate Customer Rule Detected"
        open={isModalVisible}
        onCancel={handleSkip}
        footer={[
          <Button key="skip" onClick={handleSkip}>
            Skip
          </Button>,
          <Button
            key="replaceCustomer"
            type="primary"
            onClick={handleCustomerReplace}
          >
            Replace
          </Button>,
        ]}
      >
        <p>{resMessage}</p>
        {duplicateData && (
          <div>
            <p>
              <strong>Rule Name:</strong> {duplicateData.ruleName}
            </p>
            <p>
              <strong>Original Rule Details:</strong>{" "}
              {JSON.stringify(duplicateData, null, 2)}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        title="Duplicate Bank Rule Detected"
        open={isBankModalVisible}
        onCancel={handleSkip}
        footer={[
          <Button key="skip" onClick={handleSkip}>
            Skip
          </Button>,
          <Button key="replace" type="primary" onClick={handleBankReplace}>
            Replace
          </Button>,
        ]}
      >
        <p>{resMessage}</p>
        {duplicateData && (
          <div>
            <p>
              <strong>Rule Name:</strong> {duplicateData.ruleName}
            </p>
            <p>
              <strong>Original Rule Details:</strong>{" "}
              {JSON.stringify(duplicateData, null, 2)}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        title="Duplicate Network Rule Detected"
        open={isNetworkModalVisible}
        onCancel={handleSkip}
        footer={[
          <Button key="skip" onClick={handleSkip}>
            Skip
          </Button>,
          <Button key="replace" type="primary" onClick={handleNetworkReplace}>
            Replace
          </Button>,
        ]}
      >
        <p>{resMessage}</p>
        {duplicateData && (
          <div>
            <p>
              <strong>Rule Name:</strong> {duplicateData.networkRuleName}
            </p>
            <p>
              <strong>Original Rule Details:</strong>{" "}
              {JSON.stringify(duplicateData, null, 2)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ConfigurePage;
