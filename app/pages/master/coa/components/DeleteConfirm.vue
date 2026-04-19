<script setup lang="ts">
import type { Coa } from '~/types/accounting'

const props = defineProps<{
  open: boolean
  data?: Coa | null
  loading?: boolean
}>()

const emit = defineEmits(['update:open', 'confirm', 'close'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const onConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Hapus COA?">
    <template #body>
      <div class="flex flex-col items-center justify-center text-center space-y-4 py-4">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 w-8 h-8" />
        </div>
        <p class="text-sm text-dimmed max-w-xs">
          Apakah Anda yakin ingin menghapus <strong>{{ data?.ms_coa_code }} — {{ data?.ms_coa_name }}</strong>?
          <br />Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center gap-3">
        <UButton color="neutral" variant="soft" @click="isOpen = false">Batal</UButton>
        <UButton color="error" @click="onConfirm" :loading="loading" :disabled="loading">
          {{ loading ? 'Loading...' : 'Ya, Hapus' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
