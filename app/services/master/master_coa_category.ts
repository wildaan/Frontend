import type { PaginationMeta } from "~/types/api"
import type { CoaCategory, CoaCategoryForm } from "~/types/accounting"
import { apiRequest } from "../api"

const API_ENDPOINT = `master/mastercoacategory`

export async function fetchCoaCategoryList(
    perPage = 10,
    page = 1,
    search = '',
    sortField = 'ms_coa_category_created_date',
    sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ data: CoaCategory[] } & PaginationMeta> {
    const query = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
        search,
        sort_field: sortField,
        sort_order: sortOrder,
    }).toString()

    const data = await apiRequest<{ data: CoaCategory[] } & PaginationMeta>(`${API_ENDPOINT}/listdata?${query}`)
    return data ?? { data: [], current_page: 1, per_page: perPage, total: 0, last_page: 1 }
}

export async function fetchAllCoaCategories(): Promise<CoaCategory[]> {
    const data = await apiRequest<any>(`${API_ENDPOINT}/listdata?all=true`)
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.data)) return data.data
    return []
}

export async function fetchCoaCategoryCreate(formData: CoaCategoryForm): Promise<CoaCategory | null> {
    return await apiRequest<CoaCategory>(`${API_ENDPOINT}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
}

export async function fetchCoaCategoryUpdate(formData: CoaCategoryForm): Promise<CoaCategory | null> {
    if (!formData.ms_coa_category_id) return null
    return await apiRequest<CoaCategory>(`${API_ENDPOINT}/update/${formData.ms_coa_category_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
}

export async function fetchCoaCategoryDelete(id: number | string): Promise<boolean> {
    const res = await apiRequest<null>(`${API_ENDPOINT}/delete/${id}`, { method: 'DELETE' })
    return res !== null
}

export async function fetchCoaCategoryDetail(id: number | string): Promise<CoaCategory | null> {
    return await apiRequest<CoaCategory>(`${API_ENDPOINT}/detail/${id}`)
}
