<script setup lang="ts">
import { fetchDashboardData } from '~/services/dashboard'
import type { DashboardData } from '~/types/accounting'

const { data: dashboard, pending: loading } = await useAsyncData<DashboardData | null>('dashboard', () => fetchDashboardData())

const stats = computed(() => {
  const s = dashboard.value?.stats
  if (!s) return []
  
  return [
    { label: 'Total Transaksi', value: s.total_transactions?.toString() || '0', icon: 'i-heroicons-banknotes', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { label: 'Total Akun COA', value: s.total_coa?.toString() || '0', icon: 'i-heroicons-book-open', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { label: 'Total Kategori', value: s.total_categories?.toString() || '0', icon: 'i-heroicons-folder', bgColor: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  ]
})

const columns = [
  { accessorKey: 'date', header: 'Tanggal' },
  { accessorKey: 'coa_name', header: 'Akun' },
  { accessorKey: 'desc', header: 'Keterangan' },
  { accessorKey: 'debit', header: 'Debit' },
  { accessorKey: 'credit', header: 'Kredit' }
]

const formatCurrency = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num) || num === 0) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UDivider orientation="vertical" class="mx-2 h-4" />
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-squares-2x2" class="size-5 text-primary" />
            <h1 class="text-lg font-bold tracking-tight">Dashboard</h1>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6">
        <div>
          <h2 class="text-xl font-bold">Selamat Datang! 👋</h2>
          <p class="text-sm text-dimmed mt-1">
            {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard v-for="stat in stats" :key="stat.label">
            <div class="flex items-center gap-3">
              <div :class="['stat-icon-box', stat.bgColor]">
                <UIcon :name="stat.icon" :class="['size-5', stat.iconColor]" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-dimmed leading-none mb-1">{{ stat.label }}</p>
                <div class="flex items-baseline justify-between gap-2">
                  <h3 class="text-xl font-bold truncate">{{ stat.value }}</h3>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div class="px-4 sm:px-6 py-4 border-b border-default">
            <h3 class="font-semibold">Transaksi Terbaru</h3>
            <p class="text-xs text-dimmed mt-0.5">5 transaksi terakhir yang tercatat di sistem</p>
          </div>

          <div class="table-wrapper">
            <UTable :data="dashboard?.latest_transactions || []" :columns="columns" :loading="loading" class="w-full">
              <template #date-cell="{ row }">
                <span class="text-sm whitespace-nowrap">{{ formatDate(row.original.date) }}</span>
              </template>
              <template #debit-cell="{ row }">
                <span class="text-sm font-medium text-green-600 dark:text-green-400">{{ formatCurrency(row.original.debit) }}</span>
              </template>
              <template #credit-cell="{ row }">
                <span class="text-sm font-medium text-red-500 dark:text-red-400">{{ formatCurrency(row.original.credit) }}</span>
              </template>
            </UTable>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
