<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Coa, CoaForm, CoaCategory } from '~/types/accounting'
import { fetchAllCoaCategories } from '~/services/master/master_coa_category'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'update'
  data?: Coa | null
}>()

const emit = defineEmits(['update:open', 'saved', 'close'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const categories = ref<{ label: string, value: number }[]>([])
const loadingCategories = ref(false)

const formData = ref<CoaForm>({
  ms_coa_category_id: undefined,
  ms_coa_code: '',
  ms_coa_name: '',
  ms_coa_type: '',
  ms_coa_desc: ''
})

const typeOptions = [
  { label: 'Debit', value: 'debit' },
  { label: 'Kredit', value: 'credit' },
  { label: 'Keduanya', value: 'both' }
]

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const rawData = await fetchAllCoaCategories()
    categories.value = rawData.map(c => ({
      label: c.ms_coa_category_name,
      value: c.ms_coa_category_id
    }))
  } catch (error) {
    console.error('Gagal memuat kategori', error)
  } finally {
    loadingCategories.value = false
  }
}

onMounted(() => {
  loadCategories()
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.mode === 'update' && props.data) {
      formData.value = {
        ms_coa_id: props.data.ms_coa_id,
        ms_coa_category_id: props.data.ms_coa_category_id,
        ms_coa_code: props.data.ms_coa_code,
        ms_coa_name: props.data.ms_coa_name,
        ms_coa_type: props.data.ms_coa_type || 'debit',
        ms_coa_desc: props.data.ms_coa_desc || ''
      }
    } else {
      formData.value = {
        ms_coa_category_id: undefined,
        ms_coa_code: '',
        ms_coa_name: '',
        ms_coa_type: '',
        ms_coa_desc: ''
      }
    }
  }
})

const validate = (state: any) => {
  const errors = []
  if (!state.ms_coa_category_id) errors.push({ path: 'ms_coa_category_id', message: 'Kategori wajib dipilih' })
  if (!state.ms_coa_code) errors.push({ path: 'ms_coa_code', message: 'Kode Akun wajib diisi' })
  if (!state.ms_coa_type) errors.push({ path: 'ms_coa_type', message: 'Tipe Akun wajib dipilih' })
  if (!state.ms_coa_name) errors.push({ path: 'ms_coa_name', message: 'Nama Akun wajib diisi' })
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
  <UModal v-model:open="isOpen" :title="mode === 'create' ? 'Tambah COA' : 'Edit COA'">
    <template #body>
      <UForm id="coaForm" :state="formData" :validate="validate" class="space-y-4" @submit="submit">
        <UFormField name="ms_coa_category_id" label="Kategori" required>
          <USelectMenu
            v-model="formData.ms_coa_category_id"
            value-key="value"
            :items="categories"
            placeholder="Pilih kategori"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="ms_coa_code" label="Kode Akun" required>
            <UInput v-model="formData.ms_coa_code" placeholder="cth: 1001" class="w-full" />
          </UFormField>

          <UFormField name="ms_coa_type" label="Tipe Akun" required>
            <USelect
              v-model="formData.ms_coa_type"
              :items="typeOptions"
              placeholder="Pilih tipe akun"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField name="ms_coa_name" label="Nama Akun" required>
          <UInput v-model="formData.ms_coa_name" placeholder="cth: Kas di Bank" class="w-full" />
        </UFormField>

        <UFormField name="ms_coa_desc" label="Deskripsi">
          <UTextarea v-model="formData.ms_coa_desc" :rows="3" placeholder="Deskripsi akun (opsional)" class="w-full" />
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
