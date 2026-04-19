<script setup lang="ts">
import { ref } from 'vue'
import { fetchProfitLossReport, exportProfitLossReport } from '~/services/report'
import type { ProfitLossReport } from '~/types/accounting'

const toast = useToast()

const filters = ref({
  date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10),
  date_to: new Date().toISOString().substring(0, 10)
})

const loading = ref(false)
const isExporting = ref(false)
const reportData = ref<ProfitLossReport | null>(null)

const generateReport = async () => {
  if (!filters.value.date_from || !filters.value.date_to) {
    toast.add({ title: 'Validasi', description: 'Pilih tanggal awal dan akhir.', color: 'error' })
    return
  }

  loading.value = true
  try {
    const res = await fetchProfitLossReport(filters.value.date_from, filters.value.date_to)
    reportData.value = res
  } catch (error: any) {
    toast.add({ title: 'Gagal memuat laporan', description: error.message || '', color: 'error' })
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  if (!filters.value.date_from || !filters.value.date_to) return
  isExporting.value = true
  toast.add({ title: 'Sedang membuat file Excel...', color: 'info' })
  try {
    await exportProfitLossReport(filters.value.date_from, filters.value.date_to)
  } catch (error: any) {
    toast.add({ title: 'Gagal export', description: error.message || '', color: 'error' })
  } finally {
    isExporting.value = false
  }
}

const formatCurrency = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const netColor = computed(() => {
  if (!reportData.value) return ''
  return reportData.value.grand_net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
})

const netBgColor = computed(() => {
  if (!reportData.value) return ''
  return reportData.value.grand_net >= 0
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
})
</script>

<template>
  <UDashboardPanel id="profit-loss">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
          <UDivider orientation="vertical" class="mx-2 h-4" />
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-document-chart-bar" class="size-5 text-primary" />
            <h1 class="text-lg font-bold tracking-tight">Report</h1>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-4">
        <UCard>
          <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div>
                <label class="block text-xs font-medium text-dimmed mb-1">Periode Dari</label>
                <UInput type="date" v-model="filters.date_from" class="w-full sm:w-44" />
              </div>

              <div>
                <label class="block text-xs font-medium text-dimmed mb-1">Periode Sampai</label>
                <UInput type="date" v-model="filters.date_to" class="w-full sm:w-44" />
              </div>

              <UButton
                color="primary"
                icon="i-heroicons-arrow-path"
                :loading="loading"
                @click="generateReport"
              >
                Generate
              </UButton>
            </div>

            <div class="flex items-center gap-2">
              <UButton
                icon="i-heroicons-document-arrow-down"
                color="neutral"
                variant="soft"
                :loading="isExporting"
                :disabled="!reportData"
                @click="handleExport"
              >
                Export Excel
              </UButton>
            </div>
          </div>
        </UCard>

        <div v-if="reportData" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UCard class="border-l-4 border-green-500">
            <div class="flex items-center gap-3">
              <div class="stat-icon-box bg-green-500/10">
                <UIcon name="i-heroicons-arrow-trending-up" class="size-5 text-green-600" />
              </div>
              <div>
                <p class="text-xs text-dimmed">Total Pendapatan</p>
                <p class="text-lg font-bold text-green-600 dark:text-green-400">
                  {{ formatCurrency(reportData.grand_total_income) }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard class="border-l-4 border-red-500">
            <div class="flex items-center gap-3">
              <div class="stat-icon-box bg-red-500/10">
                <UIcon name="i-heroicons-arrow-trending-down" class="size-5 text-red-600" />
              </div>
              <div>
                <p class="text-xs text-dimmed">Total Biaya</p>
                <p class="text-lg font-bold text-red-600 dark:text-red-400">
                  {{ formatCurrency(reportData.grand_total_expense) }}
                </p>
              </div>
            </div>
          </UCard>

            <UCard :class="['border-l-4', reportData.grand_net >= 0 ? 'border-green-500' : 'border-red-500']">
              <div class="flex items-center gap-3">
                <div :class="['stat-icon-box', reportData.grand_net >= 0 ? 'bg-green-500/10' : 'bg-red-500/10']">
                  <UIcon
                    :name="reportData.grand_net >= 0 ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle'"
                    :class="['size-5', netColor]"
                  />
                </div>
                <div>
                  <p class="text-xs text-dimmed">Laba / Rugi Bersih</p>
                  <p :class="['text-lg font-bold', netColor]">
                    {{ formatCurrency(reportData.grand_net) }}
                  </p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard v-if="loading">
          <div class="space-y-4 p-2">
            <USkeleton class="h-6 w-1/3" />
            <USkeleton class="h-10 w-full" v-for="i in 6" :key="i" />
          </div>
        </UCard>

        <UCard v-else-if="reportData" :ui="{ body: 'p-0 sm:p-0' }">
          <div class="px-6 py-4 border-b border-default bg-elevated/50">
            <p class="text-sm text-dimmed">
              Periode: <strong>{{ formatDate(filters.date_from) }}</strong> s/d <strong>{{ formatDate(filters.date_to) }}</strong>
            </p>
          </div>

          <div class="overflow-x-auto rounded-lg border border-default">
            <table class="min-w-full text-sm text-left whitespace-nowrap">
              <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                <tr>
                  <th rowspan="2" class="px-4 py-3 font-semibold border-b border-r border-default align-middle min-w-[200px]">
                    Category
                  </th>
                  <th v-for="m in reportData.months" :key="m" class="px-4 py-2 font-semibold border-b border-r border-default text-center min-w-[140px]">
                    {{ m }}
                  </th>
                </tr>
                <tr>
                  <th v-for="m in reportData.months" :key="'amt-'+m" class="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b border-r border-default text-center bg-white dark:bg-gray-900/30">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-default bg-white dark:bg-transparent">
                <!-- Income Section -->
                <tr v-for="(cat, cIdx) in reportData.income" :key="'inc-'+cIdx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-4 py-3 border-r border-default text-gray-600 dark:text-gray-400 font-medium">{{ cat.category_name }}</td>
                  <td v-for="m in reportData.months" :key="'inc-'+cIdx+'-'+m" class="px-4 py-3 text-right border-r border-default tabular-nums">
                    <span v-if="cat.amounts[m]">{{ formatCurrency(cat.amounts[m]) }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
                <!-- Total Income -->
                <tr class="bg-gray-50/80 dark:bg-gray-900/80 font-semibold border-y-2 border-default">
                  <td class="px-4 py-3 border-r border-default text-gray-900 dark:text-gray-100 uppercase text-xs tracking-wide">Total Income</td>
                  <td v-for="m in reportData.months" :key="'tot-inc-'+m" class="px-4 py-3 text-right border-r border-default text-gray-900 dark:text-gray-100 tabular-nums">
                    <span v-if="reportData.total_income[m]">{{ formatCurrency(reportData.total_income[m]) }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>

                <!-- Expense Section -->
                <tr v-for="(cat, cIdx) in reportData.expense" :key="'exp-'+cIdx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors mt-2">
                  <td class="px-4 py-3 border-r border-default text-gray-600 dark:text-gray-400 font-medium">{{ cat.category_name }}</td>
                  <td v-for="m in reportData.months" :key="'exp-'+cIdx+'-'+m" class="px-4 py-3 text-right border-r border-default tabular-nums">
                    <span v-if="cat.amounts[m]">{{ formatCurrency(cat.amounts[m]) }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
                <!-- Total Expense -->
                <tr class="bg-gray-50/80 dark:bg-gray-900/80 font-semibold border-y-2 border-default">
                  <td class="px-4 py-3 border-r border-default text-gray-900 dark:text-gray-100 uppercase text-xs tracking-wide">Total Expense</td>
                  <td v-for="m in reportData.months" :key="'tot-exp-'+m" class="px-4 py-3 text-right border-r border-default text-gray-900 dark:text-gray-100 tabular-nums">
                    <span v-if="reportData.total_expense[m]">{{ formatCurrency(reportData.total_expense[m]) }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>

                <!-- Net Income -->
                <tr class="font-bold border-b-2 border-default bg-white dark:bg-gray-950">
                  <td class="px-4 py-4 border-r border-default text-[15px] uppercase tracking-wide" :class="netColor">Net Income</td>
                  <td v-for="m in reportData.months" :key="'net-'+m" class="px-4 py-4 text-right border-r border-default text-[15px] tabular-nums" :class="netColor">
                    <span>{{ formatCurrency(reportData.net[m] || 0) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>

        <UCard v-else>
          <div class="text-center py-16">
            <UIcon name="i-heroicons-document-chart-bar" class="size-16 mx-auto mb-4 text-dimmed opacity-30" />
            <h3 class="text-lg font-semibold mb-1">Belum Ada Laporan</h3>
            <p class="text-sm text-dimmed">Pilih periode dan klik "Generate Laporan" untuk melihat data.</p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
