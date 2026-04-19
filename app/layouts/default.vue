<script setup lang="ts">
/**
 * Layout utama aplikasi.
 * Berisi sidebar navigasi dan area konten utama.
 * Sidebar mendukung collapse, resize, dan pencarian menu.
 */
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const searchQuery = ref('')

// Definisi menu navigasi sidebar
const links = computed(() => {
  const allLinks = [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-squares-2x2',
      to: '/',
      onSelect: () => { open.value = false }
    },
    {
      label: 'Transactions',
      icon: 'i-heroicons-banknotes',
      to: '/transaction',
      onSelect: () => { open.value = false }
    },
    {
      label: 'Reports',
      icon: 'i-heroicons-document-chart-bar',
      to: '/report',
      onSelect: () => { open.value = false }
    },
    {
      label: 'Master Data',
      icon: 'i-heroicons-circle-stack',
      children: [
        { label: 'COA Category', to: '/master/coa-category', onClick: () => { open.value = false } },
        { label: 'Chart of Accounts', to: '/master/coa', onClick: () => { open.value = false } }
      ]
    },
  ]

  // Filter menu berdasarkan pencarian
  if (!searchQuery.value) return allLinks
  return allLinks.filter(link =>
    link.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Grup pencarian untuk UDashboardSearch
const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed }">
        <!-- Input pencarian menu -->
        <UInput
          v-if="!collapsed"
          v-model="searchQuery"
          placeholder="Cari menu..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          variant="none"
          class="bg-transparent ring-1 ring-default mb-2"
        />
        <UButton
          v-else
          icon="i-heroicons-magnifying-glass"
          color="neutral"
          variant="ghost"
          square
          class="mb-2"
          @click="open = true"
        />

        <!-- Menu navigasi vertikal -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          popover
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- Area konten utama — harus bisa scroll -->
    <div class="flex flex-col flex-1 min-w-0 overflow-y-auto">
      <slot />
    </div>
  </UDashboardGroup>
</template>
