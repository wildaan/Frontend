<script setup lang="ts">
import type { Transaction } from '~/types/accounting'

const props = defineProps<{
  open: boolean
  data?: Transaction | null
}>()

const emit = defineEmits(['update:open', 'confirm', 'close'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const onConfirm = () => {
  emit('confirm')
}

const formattedDate = computed(() => {
  if (!props.data?.tr_transaction_date) return ''
  return new Date(props.data.tr_transaction_date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <UModal v-model:open="isOpen" title="Hapus Transaksi?">
    <template #body>
      <div class="flex flex-col items-center justify-center text-center space-y-4 py-4">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 w-8 h-8" />
        </div>
        <p class="text-sm text-dimmed max-w-xs">
          Apakah Anda yakin ingin menghapus transaksi tanggal <strong>{{ formattedDate }}</strong>?
          <br />Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center gap-3">
        <UButton color="neutral" variant="soft" @click="isOpen = false">Batal</UButton>
        <UButton color="error" @click="onConfirm">Ya, Hapus</UButton>
      </div>
    </template>
  </UModal>
</template>
