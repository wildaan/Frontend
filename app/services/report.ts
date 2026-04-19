import type { ProfitLossReport } from "~/types/accounting"
import { apiRequest } from "./api"

const API_ENDPOINT = `report/profit-loss`

export async function fetchProfitLossReport(dateFrom: string, dateTo: string): Promise<ProfitLossReport | null> {
  const query = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
  }).toString()

  return await apiRequest<ProfitLossReport>(`${API_ENDPOINT}/listdata?${query}`)
}

export async function exportProfitLossReport(dateFrom: string, dateTo: string): Promise<void> {
  const query = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
  }).toString()

  const res = await apiRequest<Response>(`${API_ENDPOINT}/export?${query}`)

  if (res && res instanceof Response) {
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report-${dateFrom}-to-${dateTo}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
