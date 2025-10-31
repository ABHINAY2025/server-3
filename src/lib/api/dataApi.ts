import axios from "axios";

const JAVA_URL = "https://server-1-xk8a.onrender.com/api";

export const getISOStandardDataFields = async () => {
  const response = await axios.get(`${JAVA_URL}/isoStandardFields`);
  return response.data;
};

export const getCompanies = async () => {
  const response = await axios.get(`${JAVA_URL}/getAll/customerNames`);
  return response.data;
};

export const getBanks = async () => {
  const response = await axios.get(`${JAVA_URL}/getAll/companies`);
  return response.data;
};

export const getEntityRegulations = async (entityType: string, entityName: string) => {
  if (!entityType || !entityName) {
    throw new Error("Both entityType and entityName are required.");
  }

  const endpoint = entityType === "customer"
    ? `/stpConfigurations/${entityName}`
    : `/bankRules/${entityName}`;
  const response = await axios.get(`${JAVA_URL}${endpoint}`);
  return response.data;
};

export const updateEntityRegulations = async (
  entityType: string,
  entityId: string,
  updatedRegulations: any
) => {
  const typePath = entityType === "customer" ? "customer" : "banks";
  const response = await axios.post(
    `${JAVA_URL}/rule_mapping/${typePath}/${entityId}`,
    { regulations: updatedRegulations }
  );
  return response.data;
};

export const sendForApproval = async (userKey: string, updatedMsg: string) => {
  const response = await axios.post(
    `${JAVA_URL}/approve/paymentFile/${userKey}`,
    { updatedXml: updatedMsg }
  );
  return response.data;
};

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${JAVA_URL}/views/dashboard`);
    return response;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }   
};

export const fetchTransactionsData = async (status: string) => {
  try {
    const response = await axios.get(
      `${JAVA_URL}/transactionPage?fileStatus=${status}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching repair data:", error);
    throw error;
  }
};

export const fetchTransactionById = async (id: string) => {
  try {
    const response = await axios.get(`${JAVA_URL}/paymentFile/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    console.error("Error details:", error);
    throw error;
  }
};

export const getBankRulesByIds = async (ruleIds: string[]) => {
  try {
    const response = await axios.post(`${JAVA_URL}/bankRules/batch`, {
      ruleIds: ruleIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bank rules by IDs:", error);
    throw error;
  }
};

export const getCustomerRulesByIds = async (ruleIds: string[]) => {
  try {
    const response = await axios.post(`${JAVA_URL}/customerRules/batch`, {
      ruleIds: ruleIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer rules by IDs:", error);
    throw error;
  }
};