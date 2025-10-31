"use client";

import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Progress,
  Tooltip,
  Alert,
} from "antd";
import { getInvestmentSuggestions } from "@/lib/api/liquidity";
import dayjs from "dayjs";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import "./Customtable.css";

const { Option } = Select;

// Utility function for consistent number formatting
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

interface InvestmentFund {
  id: string | number;
  name: string;
  type: string;
  marketTrend: string;
  trendAnalysis: string;
  minInvestment: number;
  expectedReturn: number;
  riskRating: string;
  liquidity: string;
  investedDate?: string;
  aiRecommendation: string;
  predictedFactors: string[];
  confidence: number;
  predictedGrowth: number;
  expectedTrend: string;
}

interface InvestmentRule {
  maxWithdrawal: number;
  preferredLiquidity: string;
  minHoldingDays: number;
}

interface PredictionConfidence {
  [key: string]: {
    confidence: number;
    growth: number;
    recommendation: string;
    factors: string[];
    riskRating: string;
  };
}

const InvestmentSuggestions: React.FC = () => {
  const [funds, setFunds] = useState<InvestmentFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [idleAmount, setIdleAmount] = useState(800000);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [rule, setRule] = useState<InvestmentRule | null>(null);
  const [investModalVisible, setInvestModalVisible] = useState(false);
  const [selectedFund, setSelectedFund] = useState<InvestmentFund | null>(null);
  const [investAmount, setInvestAmount] = useState(0);
  const [predictionConfidence, setPredictionConfidence] = useState<PredictionConfidence>({});
  const [showPredictionInfo, setShowPredictionInfo] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const responseData = await getInvestmentSuggestions();
      
      setIdleAmount(responseData.idleAmount);

      const filtered = responseData.data.filter(
        (f: InvestmentFund) =>
          f.type === "short-term" || f.type === "sweep" || f.type === "mid-term"
      );

      const sortedByPrediction = [...filtered].sort((a, b) => {
        const recommendationScore = (rec: string) => {
          if (rec === "Strong Buy") return 5;
          if (rec === "Buy") return 4;
          if (rec === "Recommended") return 3;
          if (rec === "Consider") return 2;
          if (rec === "Safe Choice") return 1;
          return 0;
        };

        const scoreA = recommendationScore(a.aiRecommendation);
        const scoreB = recommendationScore(b.aiRecommendation);

        if (scoreA !== scoreB) return scoreB - scoreA;

        return (
          b.confidence * b.predictedGrowth - a.confidence * a.predictedGrowth
        );
      });

      setFunds(sortedByPrediction);

      const confidenceData: PredictionConfidence = {};
      sortedByPrediction.forEach((fund) => {
        confidenceData[fund.id] = {
          confidence: fund.confidence,
          growth: fund.predictedGrowth,
          recommendation: fund.aiRecommendation,
          factors: fund.predictedFactors,
          riskRating: fund.riskRating,
        };
      });

      setPredictionConfidence(confidenceData);

      setShowPredictionInfo(true);
      setTimeout(() => setShowPredictionInfo(false), 8000);
    } catch (err) {
      console.error("Error fetching investment suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleWithdraw = (record: InvestmentFund) => {
    if (rule) {
      const investmentDuration = dayjs().diff(record.investedDate, "day");
      const isMature = investmentDuration >= rule.minHoldingDays;

      if (
        record.minInvestment <= rule.maxWithdrawal &&
        (record.liquidity === rule.preferredLiquidity ||
          rule.preferredLiquidity === "any") &&
        isMature
      ) {
        setIdleAmount((prev) => prev + record.minInvestment);
      }
    }
  };

  const showConfigureModal = () => {
    setIsModalVisible(true);
  };

  const handleConfigure = () => {
    form.validateFields().then((values) => {
      setRule(values);
      setIsModalVisible(false);
    });
  };

  const showInvestModal = (fund: InvestmentFund) => {
    setSelectedFund(fund);
    setInvestAmount(fund.minInvestment);
    setInvestModalVisible(true);
  };

  const handleConfirmInvest = () => {
    if (
      selectedFund &&
      investAmount >= selectedFund.minInvestment &&
      investAmount <= idleAmount
    ) {
      setIdleAmount((prev) => prev - investAmount);
      setFunds((prev) =>
        prev.map((f) =>
          f.id === selectedFund.id ? { ...f, investedDate: dayjs().format() } : f
        )
      );
      setInvestModalVisible(false);
      setSelectedFund(null);
    }
  };

  const getTrendArrow = (trend: string) => {
    const style = { fontSize: "16px", marginLeft: "8px", fontWeight: "bold" };

    if (trend.includes("upward") || trend.includes("volatile-positive")) {
      return <span style={{ ...style, color: "#52c41a" }}>▲</span>;
    } else if (trend.includes("normal")) {
      return <span style={{ ...style, color: "#595959" }}>―</span>;
    } else if (trend.includes("downward")) {
      return <span style={{ ...style, color: "#f5222d" }}>▼</span>;
    }
    return null;
  };

  const columns: ColumnsType<InvestmentFund> = [
    {
      title: "AI Recommendation",
      dataIndex: "aiRecommendation",
      render: (rec: string, record: InvestmentFund) => (
        <Tooltip title={`Based on ${record.predictedFactors.join(", ")}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontWeight: "bold",
                whiteSpace: "pre-line",
                textAlign: "left",
                color: "#4b5563",
                padding: "4px 0",
              }}
            >
              {rec}
            </div>
          </div>
        </Tooltip>
      ),
      sorter: (a: InvestmentFund, b: InvestmentFund) => {
        const score: Record<string, number> = {
          "Strong Buy": 5,
          Buy: 4,
          Recommended: 3,
          Consider: 2,
          "Safe Choice": 1,
        };
        return score[b.aiRecommendation] - score[a.aiRecommendation];
      },
    },
    { title: "Fund Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    {
      title: "Market Trend",
      dataIndex: "marketTrend",
      render: (trend: string, record: InvestmentFund) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                color: trend.includes("upward")
                  ? "#347813ff"
                  : trend.includes("downward")
                    ? "#f5222d"
                    : "#595959",
              }}
            >
              {trend.split("-").join(" ")}
            </span>
            {getTrendArrow(trend)}
          </div>
      ),
      sorter: (a: InvestmentFund, b: InvestmentFund) => a.marketTrend.localeCompare(b.marketTrend),
    },
    {
      title: "Trend Analysis",
      dataIndex: "trendAnalysis",
      render: (trend: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tag
            color={
              trend === "positive"
                ? "success"
                : trend === "negative"
                  ? "error"
                  : "warning"
            }
          >
            {trend}
          </Tag>
        </div>
      ),
    },
    {
      title: "Min Investment",
      dataIndex: "minInvestment",
      render: (val: number) => `$${formatNumber(val)}`,
    },
    {
      title: "Expected Return",
      dataIndex: "expectedReturn",
      render: (val: number) => `${formatNumber(val)}%`,
    },
    {
      title: "Risk",
      dataIndex: "riskRating",
      render: (risk: string) =>
        risk
          .split("-")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
      filters: [
        { text: "Very Low", value: "very-low" },
        { text: "Low", value: "low" },
        { text: "Medium Low", value: "medium-low" },
        { text: "Medium", value: "medium" },
        { text: "High", value: "high" },
      ],
      onFilter: (value: boolean | React.Key, record: InvestmentFund) => record.riskRating === value.toString(),
    },
    {
      title: "Liquidity",
      dataIndex: "liquidity",
      render: (liquidity: string) => (
        <Tag
          style={{
            color: "#795f21",
            background: "#fffbe6",
            borderColor: "#faad14",
          }}
        >
          {liquidity}
        </Tag>
      ),
    },
    {
      title: "Invested Date",
      dataIndex: "investedDate",
      render: (date?: string) =>
        date ? dayjs(date).format("YYYY-MM-DD") : "Not Invested",
    },
    {
      title: "Action",
      render: (_: any, record: InvestmentFund) => (
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}
        >
          <Button
            className="custom-table-button"
            onClick={() => showInvestModal(record)}
            disabled={idleAmount < record.minInvestment}
          >
            Invest
          </Button>
          <Button
            className="custom-table-button"
            onClick={() => handleWithdraw(record)}
          >
            Withdraw
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="AI-Powered Investment Suggestions"
      loading={loading}
      extra={
        <Button className="custom-table-button" onClick={fetchSuggestions}>
          Refresh Predictions
        </Button>
      }
    >
      {showPredictionInfo && (
        <Alert
          message="ML Prediction Updated"
          description="Investment suggestions have been refreshed with the latest market data. Our machine learning algorithm has analyzed current market trends, historical performance, and risk factors to provide these personalized recommendations."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      <p>
        <strong>Current Idle Amount (Holding Balance):</strong> ₹
        {formatNumber(idleAmount)}
      </p>
      <Table
        className="custom-ant-table"
        rowKey="id"
        columns={columns}
        dataSource={funds}
        pagination={false}
        expandable={{
          expandedRowRender: (record: InvestmentFund) => (
            <div style={{ padding: "10px 20px" }}>
              <h4>AI Prediction Details</h4>
              <p>
                <strong>Prediction Factors:</strong>
              </p>
              <ul>
                {record.predictedFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
              <p>
                <strong>ML Confidence Score:</strong> {record.confidence}%
              </p>
            </div>
          ),
          rowExpandable: (record) => true,
        }}
      />

      <Modal
        title="Configure Investment Rules"
        open={isModalVisible}
        onOk={handleConfigure}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Max Withdrawal Amount"
            name="maxWithdrawal"
            rules={[
              {
                required: true,
                message: "Please enter a max withdrawal amount",
              },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Preferred Liquidity Type"
            name="preferredLiquidity"
            rules={[
              { required: true, message: "Please select a liquidity type" },
            ]}
          >
            <Select>
              <Option value="instant">Instant</Option>
              <Option value="high">High</Option>
              <Option value="low">Low</Option>
              <Option value="any">Any</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Minimum Holding Days Before Withdrawal"
            name="minHoldingDays"
            rules={[{ required: true, message: "Please enter holding days" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Invest in ${selectedFund?.name}`}
        open={investModalVisible}
        onOk={handleConfirmInvest}
        onCancel={() => setInvestModalVisible(false)}
      >
        <p>Idle Amount Available: ₹{formatNumber(idleAmount)}</p>
        <Form name="investment-amount" layout="vertical">
          <Form.Item label="Amount to Invest" name="amountToInvest">
            <InputNumber
              min={selectedFund?.minInvestment}
              max={idleAmount}
              value={investAmount}
              onChange={(value) => setInvestAmount(value || 0)}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default InvestmentSuggestions;