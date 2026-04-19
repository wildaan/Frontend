<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CoaCategory, CoaCategoryForm } from '~/types/accounting'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'update'
  data?: CoaCategory | null
}>()

const emit = defineEmits(['update:open', 'saved', 'close'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const formData = ref<CoaCategoryForm>({
  ms_coa_category_name: '',
  ms_coa_category_desc: ''
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.mode === 'update' && props.data) {
      formData.value = {
        ms_coa_category_id: props.data.ms_coa_category_id,
        ms_coa_category_name: props.data.ms_coa_category_name,
        ms_coa_category_desc: props.data.ms_coa_category_desc || ''
      }
    } else {
      formData.value = {
        ms_coa_category_name: '',
        ms_coa_category_desc: ''
      }
    }
  }
})

const validate = (state: any) => {
  const errors = []
  if (!state.ms_coa_category_name) errors.push({ path: 'ms_coa_category_name', message: 'Nama Kategori wajib diisi' })
  return errors
}

const submit = () => {
  emit('saved', formData.value)
}

const hiddenSubmitRef = ref<HTMLButtonElement | null>(null)

const triggerSubmit = () => {
  hiddenSubmitRef.value?.click()
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="mode === 'create' ? 'Tambah Kategori COA' : 'Edit Kategori COA'">
    <template #body>
      <UForm id="coaCategoryForm" :state="formData" :validate="validate" class="space-y-4" @submit="submit">
        <UFormField name="ms_coa_category_name" label="Nama Kategori" required>
          <UInput v-model="formData.ms_coa_category_name" placeholder="cth: Aset Lancar" class="w-full" />
        </UFormField>

        <UFormField name="ms_coa_category_desc" label="Deskripsi">
          <UTextarea v-model="formData.ms_coa_category_desc" :rows="3" placeholder="Deskripsi kategori (opsional)" class="w-full" />
        </UFormField>

        <button ref="hiddenSubmitRef" type="submit" class="hidden" style="display: none;"></button>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" color="neutral" @click="isOpen = false">Batal</UButton>
        <UButton color="primary" @click="triggerSubmit">
          {{ mode === 'create' ? 'Simpan' : 'Perbarui' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
