import type { PaginationMeta } from "~/types/api"
import type { Transaction, TransactionForm } from "~/types/accounting"
import { apiRequest } from "./api"

const API_ENDPOINT = `transaction`

export async function fetchTransactionList(
  perPage = 10,
  page = 1,
  search = '',
  sortField = 'tr_transaction_date',
  sortOrder: 'asc' | 'desc' = 'desc',
  filters: { coa_uuid?: string, date_from?: string, date_to?: string } = {}
): Promise<{ data: Transaction[] } & PaginationMeta> {
  const queryParams: Record<string, string> = {
    per_page: String(perPage),
    page: String(page),
    search,
    sort_field: sortField,
    sort_order: sortOrder,
  }

  if (filters.coa_uuid) queryParams.coa_uuid = filters.coa_uuid;
  if (filters.date_from) queryParams.date_from = filters.date_from;
  if (filters.date_to) queryParams.date_to = filters.date_to;

  const query = new URLSearchParams(queryParams).toString()

  const data = await apiRequest<{ data: Transaction[] } & PaginationMeta>(`${API_ENDPOINT}/listdata?${query}`)
  return data ?? { data: [], current_page: 1, per_page: perPage, total: 0, last_page: 1 }
}

export async function fetchTransactionCreate(formData: TransactionForm): Promise<Transaction | null> {
  return await apiRequest<Transaction>(`${API_ENDPOINT}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
}

export async function fetchTransactionUpdate(formData: TransactionForm): Promise<Transaction | null> {
  if (!formData.tr_transaction_id) return null
  return await apiRequest<Transaction>(`${API_ENDPOINT}/update/${formData.tr_transaction_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
}

export async function fetchTransactionDelete(id: number | string): Promise<boolean> {
  const res = await apiRequest<null>(`${API_ENDPOINT}/delete/${id}`, { method: 'DELETE' })
  return res !== null
}

export async function fetchTransactionDetail(id: number | string): Promise<Transaction | null> {
  return await apiRequest<Transaction>(`${API_ENDPOINT}/detail/${id}`)
}
