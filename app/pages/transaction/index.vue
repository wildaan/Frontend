<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import {
  fetchTransactionList,
  fetchTransactionCreate,
  fetchTransactionUpdate,
  fetchTransactionDelete
} from '~/services/transaction'
import { fetchAllCoas } from '~/services/master/master_coa'
import type { Transaction } from '~/types/accounting'
import FormModal from './components/FormModal.vue'
import DeleteConfirm from './components/DeleteConfirm.vue'

const toast = useToast()

const items = ref<Transaction[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const total = ref(0)

const perPage = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
const sort = ref<{ id: string, desc: boolean }[]>([{ id: 'tr_transaction_date', desc: true }])
const perPageOptions = [5, 10, 20, 50]

const filters = ref({
  coa_uuid: '',
  date_from: '',
  date_to: ''
})


const showFilters = ref(false)

const showModal = ref(false)
const modalMode = ref<'create' | 'update'>('create')
const selectedData = ref<Transaction | null>(null)
const showDeleteModal = ref(false)
const dataToDelete = ref<Transaction | null>(null)

const columns: TableColumn<Transaction>[] = [
  { accessorKey: 'tr_transaction_date', header: 'Tanggal' },
  { accessorKey: 'ms_coa_code', header: 'Kode COA' },
  { accessorKey: 'ms_coa_name', header: 'Nama Akun' },
  { accessorKey: 'tr_transaction_desc', header: 'Keterangan' },
  { accessorKey: 'tr_transaction_debit', header: 'Debit' },
  { accessorKey: 'tr_transaction_credit', header: 'Kredit' },
  { id: 'actions', header: 'Aksi' }
]

const refreshData = async (showShimmer = false) => {
  if (showShimmer) initialLoading.value = true
  loading.value = true
  try {
    const sortField = sort.value[0]?.id || 'tr_transaction_date'
    const sortOrder = sort.value[0]?.desc ? 'desc' : 'asc'

    const response = await fetchTransactionList(
      perPage.value,
      currentPage.value,
      searchQuery.value,
      sortField,
      sortOrder,
      filters.value
    )

    items.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('Gagal mengambil data transaksi:', error)
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

watch([currentPage, sort, filters], () => refreshData(), { deep: true })
watch(perPage, () => {
  currentPage.value = 1
  refreshData()
})
watchDebounced(searchQuery, () => {
  currentPage.value = 1
  refreshData()
}, { debounce: 300 })

onMounted(() => {
  refreshData(true)
})

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedData.value = null
  showModal.value = true
}

const openUpdateModal = (row: Transaction) => {
  modalMode.value = 'update'
  selectedData.value = { ...row }
  showModal.value = true
}

const openDeleteModal = (row: Transaction) => {
  dataToDelete.value = row
  showDeleteModal.value = true
}

const handleSave = async (formData: any) => {
  loading.value = true
  try {
    let res
    if (modalMode.value === 'create') {
      res = await fetchTransactionCreate(formData)
    } else {
      res = await fetchTransactionUpdate(formData)
    }

    if (res) {
      toast.add({ title: `Transaksi berhasil ${modalMode.value === 'create' ? 'dibuat' : 'diperbarui'}!`, color: 'success' })
      await refreshData()
    }
    showModal.value = false
  } catch (err: any) {
    toast.add({ title: 'Gagal menyimpan', description: err.message || '', color: 'error' })
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (dataToDelete.value) {
    loading.value = true
    try {
      const success = await fetchTransactionDelete(dataToDelete.value.tr_transaction_id)
      if (success) {
        toast.add({ title: 'Transaksi berhasil dihapus!', color: 'success' })
        await refreshData()
      }
      showDeleteModal.value = false
      dataToDelete.value = null
    } catch (err: any) {
      toast.add({ title: 'Gagal menghapus', description: err.message || '', color: 'error' })
    } finally {
      loading.value = false
    }
  }
}

const resetFilters = () => {
  filters.value = { coa_uuid: '', date_from: '', date_to: '' }
  searchQuery.value = ''
  currentPage.value = 1
}

const formatCurrency = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num) || num === 0) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

const showingFrom = computed(() => (currentPage.value - 1) * perPage.value + 1)
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, total.value))

const hasActiveFilters = computed(() => {
  return filters.value.coa_uuid || filters.value.date_from || filters.value.date_to || searchQuery.value
})
</script>

<template>
  <UDashboardPanel id="transaction">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UDivider orientation="vertical" class="mx-2 h-4" />
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-banknotes" class="size-5 text-primary" />
            <h1 class="text-lg font-bold tracking-tight">Transaksi</h1>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-4">
        <UCard>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <UInput
              v-model="searchQuery"
              placeholder="Cari transaksi..."
              icon="i-heroicons-magnifying-glass"
              class="w-full sm:max-w-xs"
              :disabled="initialLoading"
            />
            
            <div class="flex items-center gap-2">
              <UButton
                :icon="showFilters ? 'i-heroicons-funnel-solid' : 'i-heroicons-funnel'"
                color="neutral"
                variant="ghost"
                @click="showFilters = !showFilters"
              >
                Filter
                <UBadge v-if="hasActiveFilters" color="primary" size="xs" class="ml-1">!</UBadge>
              </UButton>

              <UButton
                icon="i-heroicons-plus"
                color="primary"
                @click="openCreateModal"
              >
                Tambah
              </UButton>

              <UDivider orientation="vertical" class="mx-2 h-4" />

              <div class="flex items-center gap-2 text-sm">
                <span class="text-dimmed whitespace-nowrap">Per halaman:</span>
                <USelect
                  v-model="perPage"
                  :items="perPageOptions"
                  class="w-20"
                />
              </div>
            </div>
          </div>
        </UCard>

        <div v-show="showFilters" class="filter-panel-wrapper">
          <UCard class="bg-elevated/50 border-primary/20 shadow-sm mb-4">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap">

                <div class="w-full sm:w-auto">
                  <label class="block text-xs font-medium text-dimmed mb-1">Dari Tanggal</label>
                  <UInput type="date" v-model="filters.date_from" class="w-full sm:w-40" />
                </div>

                <div class="w-full sm:w-auto">
                  <label class="block text-xs font-medium text-dimmed mb-1">Sampai Tanggal</label>
                  <UInput type="date" v-model="filters.date_to" class="w-full sm:w-40" />
                </div>

                <UButton
                  v-if="hasActiveFilters"
                  icon="i-heroicons-x-mark"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  class="mb-0.5"
                  @click="resetFilters"
                >
                  Reset Filter
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div v-if="initialLoading" class="p-6 space-y-3">
            <USkeleton class="h-10 w-full rounded" />
            <USkeleton class="h-8 w-full rounded" v-for="i in 5" :key="i" />
          </div>

          <div v-else class="table-wrapper">
            <UTable
              v-model:sorting="sort"
              :data="items"
              :columns="columns"
              :loading="loading"
              class="w-full"
            >
              <template #tr_transaction_date-cell="{ row }">
                <span class="text-sm whitespace-nowrap">
                  {{ new Date(row.original.tr_transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
                </span>
              </template>

              <template #tr_transaction_debit-cell="{ row }">
                <span class="font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                  {{ formatCurrency(row.original.tr_transaction_debit) }}
                </span>
              </template>

              <template #tr_transaction_credit-cell="{ row }">
                <span class="font-medium text-red-500 dark:text-red-400 whitespace-nowrap">
                  {{ formatCurrency(row.original.tr_transaction_credit) }}
                </span>
              </template>

              <template #actions-cell="{ row }">
                <div class="flex items-center gap-1">
                  <UTooltip text="Edit">
                    <UButton
                      icon="i-heroicons-pencil-square"
                      size="xs"
                      color="primary"
                      variant="ghost"
                      @click="openUpdateModal(row.original)"
                    />
                  </UTooltip>
                  <UTooltip text="Hapus">
                    <UButton
                      icon="i-heroicons-trash"
                      size="xs"
                      color="error"
                      variant="ghost"
                      @click="openDeleteModal(row.original)"
                    />
                  </UTooltip>
                </div>
              </template>
            </UTable>
          </div>

          <div v-if="!initialLoading" class="pagination-footer px-4 sm:px-6 pb-4">
            <p class="text-sm text-dimmed">
              Menampilkan {{ showingFrom }}–{{ showingTo }} dari {{ total }} data
            </p>
            <div class="flex items-center gap-3">
              <div v-if="showFilters" class="flex items-center gap-2 text-sm">
                <span class="text-dimmed whitespace-nowrap">Per halaman:</span>
                <USelect
                  v-model="perPage"
                  :items="perPageOptions"
                  class="w-20"
                />
              </div>
              <UPagination
                v-model="currentPage"
                :items-per-page="perPage"
                :total="total"
              />
            </div>
          </div>
        </UCard>
      </div>

      <ClientOnly>
        <FormModal
          v-model:open="showModal"
          :mode="modalMode"
          :data="selectedData"
          :loading="loading"
          @saved="handleSave"
          @close="showModal = false"
        />
        <DeleteConfirm
          v-model:open="showDeleteModal"
          :data="dataToDelete"
          :loading="loading"
          @confirm="handleDelete"
          @close="showDeleteModal = false"
        />
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
