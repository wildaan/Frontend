<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import {
  fetchCoaCategoryList,
  fetchCoaCategoryCreate,
  fetchCoaCategoryUpdate,
  fetchCoaCategoryDelete
} from '~/services/master/master_coa_category'
import type { CoaCategory } from '~/types/accounting'
import FormModal from './components/FormModal.vue'
import DeleteConfirm from './components/DeleteConfirm.vue'

const toast = useToast()

const items = ref<CoaCategory[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const total = ref(0)

const perPage = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
const sort = ref<{ id: string, desc: boolean }[]>([{ id: 'ms_coa_category_created_date', desc: true }])

const perPageOptions = [5, 10, 20, 50]

const showModal = ref(false)
const modalMode = ref<'create' | 'update'>('create')
const selectedData = ref<CoaCategory | null>(null)

const showDeleteModal = ref(false)
const dataToDelete = ref<CoaCategory | null>(null)

const columns: TableColumn<CoaCategory>[] = [
  { accessorKey: 'ms_coa_category_name', header: 'Nama Kategori' },
  { accessorKey: 'ms_coa_category_desc', header: 'Deskripsi' },
  { accessorKey: 'ms_coa_category_status', header: 'Status' },
  { accessorKey: 'ms_coa_category_created_date', header: 'Dibuat' },
  { id: 'actions', header: 'Aksi' }
]

const refreshData = async (showShimmer = false) => {
  if (showShimmer) initialLoading.value = true
  loading.value = true
  try {
    const sortField = sort.value[0]?.id || 'ms_coa_category_created_date'
    const sortOrder = sort.value[0]?.desc ? 'desc' : 'asc'

    const response = await fetchCoaCategoryList(
      perPage.value,
      currentPage.value,
      searchQuery.value,
      sortField,
      sortOrder
    )

    items.value = response.data
    total.value = response.total
  } catch (error) {
    console.error('Gagal mengambil data kategori COA:', error)
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

watch([currentPage, sort], () => refreshData())
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

const openUpdateModal = (row: CoaCategory) => {
  modalMode.value = 'update'
  selectedData.value = { ...row }
  showModal.value = true
}

const openDeleteModal = (row: CoaCategory) => {
  dataToDelete.value = row
  showDeleteModal.value = true
}

const handleSave = async (formData: any) => {
  loading.value = true
  try {
    let res
    if (modalMode.value === 'create') {
      res = await fetchCoaCategoryCreate(formData)
    } else {
      res = await fetchCoaCategoryUpdate(formData)
    }

    if (res) {
      toast.add({ title: `Kategori berhasil ${modalMode.value === 'create' ? 'dibuat' : 'diperbarui'}!`, color: 'success' })
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
      const success = await fetchCoaCategoryDelete(dataToDelete.value.ms_coa_category_id)
      if (success) {
        toast.add({ title: 'Kategori berhasil dihapus!', color: 'success' })
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

const showingFrom = computed(() => (currentPage.value - 1) * perPage.value + 1)
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, total.value))
</script>

<template>
  <UDashboardPanel id="coa-category">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UDivider orientation="vertical" class="mx-2 h-4" />
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-folder" class="size-5 text-primary" />
            <h1 class="text-lg font-bold tracking-tight">Kategori COA</h1>
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
              placeholder="Cari kategori..."
              icon="i-heroicons-magnifying-glass"
              class="w-full sm:max-w-xs"
              :disabled="initialLoading"
            />
            
            <div class="flex items-center gap-3">
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                @click="openCreateModal"
              >
                Tambah Kategori
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
              <template #ms_coa_category_status-cell="{ row }">
                <UBadge
                  :color="row.original.ms_coa_category_status === 1 ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ row.original.ms_coa_category_status === 1 ? 'Aktif' : 'Nonaktif' }}
                </UBadge>
              </template>

              <template #ms_coa_category_created_date-cell="{ row }">
                <span class="text-sm text-dimmed">
                  {{ new Date(row.original.ms_coa_category_created_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
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
            <UPagination
              v-model="currentPage"
              :items-per-page="perPage"
              :total="total"
            />
          </div>
        </UCard>
      </div>

      <ClientOnly>
        <FormModal
          v-model:open="showModal"
          :mode="modalMode"
          :data="selectedData"
          @saved="handleSave"
          @close="showModal = false"
        />

        <DeleteConfirm
          v-model:open="showDeleteModal"
          :data="dataToDelete"
          @confirm="handleDelete"
          @close="showDeleteModal = false"
        />
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
