<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Transaction, TransactionForm, Coa } from '~/types/accounting'
import { fetchAllCoas } from '~/services/master/master_coa'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'update'
  data?: Transaction | null
  loading?: boolean
}>()

const emit = defineEmits(['update:open', 'saved', 'close'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const coas = ref<{ label: string, value: string }[]>([])
const loadingCoas = ref(false)

const formData = ref<TransactionForm>({
  tr_transaction_ms_coa_uuid: '',
  tr_transaction_date: '',
  tr_transaction_desc: '',
  tr_transaction_debit: 0,
  tr_transaction_credit: 0
})

const loadCoas = async () => {
  loadingCoas.value = true
  try {
    const rawData = await fetchAllCoas()
    coas.value = rawData.map(c => ({
      label: `${c.ms_coa_code} - ${c.ms_coa_name}`,
      value: c.ms_coa_uuid
    }))
  } catch (error) {
    console.error('Gagal memuat data COA', error)
  } finally {
    loadingCoas.value = false
  }
}

onMounted(() => {
  loadCoas()
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.mode === 'update' && props.data) {
      formData.value = {
        tr_transaction_id: props.data.tr_transaction_id,
        tr_transaction_ms_coa_uuid: props.data.tr_transaction_ms_coa_uuid,
        tr_transaction_date: String(props.data.tr_transaction_date).substring(0, 10),
        tr_transaction_desc: props.data.tr_transaction_desc || '',
        tr_transaction_debit: Number(props.data.tr_transaction_debit),
        tr_transaction_credit: Number(props.data.tr_transaction_credit)
      }
    } else {
      formData.value = {
        tr_transaction_ms_coa_uuid: '',
        tr_transaction_date: new Date().toISOString().substring(0, 10),
        tr_transaction_desc: '',
        tr_transaction_debit: 0,
        tr_transaction_credit: 0
      }
    }
  }
})

const displayDebit = computed({
  get: () => {
    if (!formData.value.tr_transaction_debit) return ''
    return String(formData.value.tr_transaction_debit).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  },
  set: (val: string) => {
    const numeric = val.replace(/[^\d]/g, '')
    formData.value.tr_transaction_debit = numeric ? Number(numeric) : 0
  }
})

const displayCredit = computed({
  get: () => {
    if (!formData.value.tr_transaction_credit) return ''
    return String(formData.value.tr_transaction_credit).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  },
  set: (val: string) => {
    const numeric = val.replace(/[^\d]/g, '')
    formData.value.tr_transaction_credit = numeric ? Number(numeric) : 0
  }
})

// const isConflicting = computed(() => {
//   return formData.value.tr_transaction_debit > 0 && formData.value.tr_transaction_credit > 0
// })

const validate = (state: any) => {
  const errors = []
  if (!state.tr_transaction_ms_coa_uuid) errors.push({ path: 'tr_transaction_ms_coa_uuid', message: 'Coa wajib dipilih' })
  if (!state.tr_transaction_date) errors.push({ path: 'tr_transaction_date', message: 'Tanggal Transaksi wajib diisi' })
  
  const debit = Number(state.tr_transaction_debit) || 0
  const credit = Number(state.tr_transaction_credit) || 0
  
  if (debit <= 0 && credit <= 0) {
    errors.push({ path: 'tr_transaction_debit', message: 'Minimal Debit atau Kredit harus diisi' })
    errors.push({ path: 'tr_transaction_credit', message: 'Minimal Debit atau Kredit harus diisi' })
  }
  
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
  <UModal v-model:open="isOpen" :title="mode === 'create' ? 'Tambah Transaksi' : 'Edit Transaksi'">
    <template #body>
      <UForm id="transactionForm" :state="formData" :validate="validate" class="space-y-4" @submit="submit">
        <UFormField name="tr_transaction_ms_coa_uuid" label="Coa" required>
          <USelectMenu
            v-model="formData.tr_transaction_ms_coa_uuid"
            value-key="value"
            :items="coas"
            placeholder="Pilih Coa"
            class="w-full"
          />
        </UFormField>

        <UFormField name="tr_transaction_date" label="Tanggal Transaksi" required>
          <UInput type="date" v-model="formData.tr_transaction_date" class="w-full" />
        </UFormField>

        <UFormField name="tr_transaction_desc" label="Keterangan">
          <UTextarea v-model="formData.tr_transaction_desc" :rows="3" placeholder="Detail transaksi..." class="w-full" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField name="tr_transaction_debit" label="Debit (Rp)">
            <UInput type="text" v-model="displayDebit" class="w-full" />
          </UFormField>

          <UFormField name="tr_transaction_credit" label="Kredit (Rp)">
            <UInput type="text" v-model="displayCredit" class="w-full" />
          </UFormField>
        </div>

        <!-- <UAlert
          v-if="isConflicting"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          title="Tidak Valid"
          description="Debit dan Kredit tidak boleh terisi bersamaan lebih dari 0."
        /> -->

        <button ref="hiddenSubmitRef" type="submit" class="hidden" style="display: none;"></button>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" color="neutral" @click="isOpen = false">Batal</UButton>
        <UButton color="primary" @click="triggerSubmit" :loading="loading" :disabled="loading">
          {{ loading ? 'Loading...' : (mode === 'create' ? 'Simpan' : 'Perbarui') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
