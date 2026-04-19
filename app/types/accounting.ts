export interface CoaCategory {
  ms_coa_category_id: number
  ms_coa_category_uuid: string
  ms_coa_category_name: string
  ms_coa_category_desc: string | null
  ms_coa_category_status: number
  ms_coa_category_created_date: string
  ms_coa_category_updated_date: string
}

export interface CoaCategoryForm {
  ms_coa_category_id?: number
  ms_coa_category_name: string
  ms_coa_category_desc: string
}

export interface Coa {
  ms_coa_id: number
  ms_coa_uuid: string
  ms_coa_category_id: number
  ms_coa_code: string
  ms_coa_name: string
  ms_coa_type: string | null
  ms_coa_desc: string | null
  ms_coa_status: number
  ms_coa_created_date: string
  ms_coa_updated_date: string
  ms_coa_category_name?: string
}

export interface CoaForm {
  ms_coa_id?: number
  ms_coa_category_id?: number
  ms_coa_code: string
  ms_coa_name: string
  ms_coa_type: string
  ms_coa_desc: string
}

export interface Transaction {
  tr_transaction_id: number
  tr_transaction_uuid: string
  tr_transaction_ms_coa_uuid: string
  tr_transaction_date: string
  tr_transaction_desc: string | null
  tr_transaction_debit: number
  tr_transaction_credit: number
  tr_transaction_status: number
  tr_transaction_created_date: string
  tr_transaction_updated_date: string
  ms_coa_code?: string
  ms_coa_name?: string
  ms_coa_category_name?: string
}

export interface TransactionForm {
  tr_transaction_id?: number
  tr_transaction_ms_coa_uuid: string
  tr_transaction_date: string
  tr_transaction_desc: string
  tr_transaction_debit: number
  tr_transaction_credit: number
}

export interface ProfitLossPivotCategory {
  category_name: string
  amounts: Record<string, number>
}

export interface ProfitLossReport {
  months: string[]
  income: ProfitLossPivotCategory[]
  expense: ProfitLossPivotCategory[]
  total_income: Record<string, number>
  total_expense: Record<string, number>
  net: Record<string, number>
  grand_total_income: number
  grand_total_expense: number
  grand_net: number
}

export interface DashboardStats {
  total_transactions: number
  total_categories: number
  total_coa: number
}

export interface DashboardRecentTransaction {
  id: number
  date: string
  coa_name: string
  desc: string
  debit: string | number
  credit: string | number
}

export interface DashboardData {
  stats: DashboardStats
  latest_transactions: DashboardRecentTransaction[]
}
