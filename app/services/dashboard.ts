import { apiRequest } from "./api"
import type { DashboardData } from "~/types/accounting"

export const fetchDashboardData = async (): Promise<DashboardData | null> => {
  return await apiRequest<DashboardData>('dashboard/getdata')
}
