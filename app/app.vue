<script setup lang="ts">
/**
 * Root komponen aplikasi.
 * Mengatur tema, font, dan meta SEO global.
 */
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    // Google Fonts — Inter untuk typography modern
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

useSeoMeta({
  title: 'Accounting Dashboard',
  description: 'Sistem Akuntansi — Kelola COA, Transaksi, dan Laporan Keuangan.'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="#00DC82" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
