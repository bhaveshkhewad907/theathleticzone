import api from "./api";
import type { AthleteDashboardData } from "../types/athlete";

interface DashboardResponse {
  success: boolean;
  data: AthleteDashboardData;
}

export const getAthleteDashboard = async (): Promise<AthleteDashboardData> => {
  const response = await api.get<DashboardResponse>("/athlete/dashboard");

  if (!response.data.success) {
    throw new Error("Failed to fetch athlete dashboard");
  }

  return response.data.data;
};
