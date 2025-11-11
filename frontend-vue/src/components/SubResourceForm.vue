<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? 'Editar Sub-item' : 'Novo Sub-item' }}</h3>
      <form @submit.prevent="submit">
        <div>
          <label>Conteúdo</label>
          <textarea v-model="form.conteudo"></textarea>
          <div v-if="errors.conteudo" class="error">{{ errors.conteudo }}</div>
        </div>
        <div>
          <label>Autor</label>
          <input v-model="form.autor" />
        </div>
        <div>
          <label>Data</label>
          <input type="datetime-local" v-model="form.data" />
        </div>

        <div class="actions">
          <button type="submit">{{ isEdit ? 'Salvar' : 'Criar' }}</button>
          <button type="button" @click="$emit('cancel')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import subresourceService from '@/services/subresourceService'

const props = defineProps({
  model: { type: Object, default: null },
  resourceId: { type: [String, Number], required: true }
})
const emit = defineEmits(['save', 'cancel'])

const isEdit = computed(() => !!props.model)

const form = reactive({
  conteudo: '',
  autor: '',
  data: ''
})
const errors = reactive({})

watch(() => props.model, (m) => {
  if (m) {
    form.conteudo = m.conteudo || ''
    form.autor = m.autor || ''
    form.data = m.data ? new Date(m.data).toISOString().slice(0,16) : ''
  } else {
    form.conteudo = ''
    form.autor = ''
    form.data = ''
  }
}, { immediate: true })

function validate() {
  errors.conteudo = ''
  if (!form.conteudo || form.conteudo.trim().length < 3) {
    errors.conteudo = 'Conteúdo mínimo 3 caracteres.'
  }
  return !errors.conteudo
}

async function submit() {
  if (!validate()) return
  const payload = {
    resourceId: Number(props.resourceId),
    conteudo: form.conteudo,
    autor: form.autor,
    data: new Date(form.data).toISOString()
  }
  try {
    if (isEdit.value && props.model.id) {
      await subresourceService.update(props.model.id, payload)
      alert('Sub-item atualizado.')
    } else {
      await subresourceService.create(payload)
      alert('Sub-item criado.')
    }
    emit('save')
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar sub-item.')
  }
}
</script>

<style>
.modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.25) }
.modal-content { background:#fff; padding:1rem; border-radius:8px; min-width:320px }
.error { color:#b91c1c; font-size:0.9rem }
.actions { display:flex; gap:.5rem; margin-top:1rem }
</style>
