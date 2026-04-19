import type { PaginationMeta } from "~/types/api"
import type { Coa, CoaForm } from "~/types/accounting"
import { apiRequest } from "../api"

const API_ENDPOINT = 'master/mastercoa'

export async function fetchCoaList(
    perPage = 10,
    page = 1,
    search = '',
    sortField = 'ms_coa_created_date',
    sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ data: Coa[] } & PaginationMeta> {
    const query = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
        search,
        sort_field: sortField,
        sort_order: sortOrder,
    }).toString()

    const data = await apiRequest<{ data: Coa[] } & PaginationMeta>(`${API_ENDPOINT}/listdata?${query}`)
    return data ?? { data: [], current_page: 1, per_page: perPage, total: 0, last_page: 1 }
}

export async function fetchAllCoas(): Promise<Coa[]> {
    const data = await apiRequest<any>(`${API_ENDPOINT}/listdata?all=true`)
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.data)) return data.data
    return []
}

export async function fetchCoaCreate(formData: CoaForm): Promise<Coa | null> {
    return await apiRequest<Coa>(`${API_ENDPOINT}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
}

export async function fetchCoaUpdate(formData: CoaForm): Promise<Coa | null> {
    if (!formData.ms_coa_id) return null
    return await apiRequest<Coa>(`${API_ENDPOINT}/update/${formData.ms_coa_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
}

export async function fetchCoaDelete(id: number | string): Promise<boolean> {
    const res = await apiRequest<null>(`${API_ENDPOINT}/delete/${id}`, { method: 'DELETE' })
    return res !== null
}

export async function fetchCoaDetail(id: number | string): Promise<Coa | null> {
    return await apiRequest<Coa>(`${API_ENDPOINT}/detail/${id}`)
}
