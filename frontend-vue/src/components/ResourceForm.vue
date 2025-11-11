<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? 'Editar Recurso' : 'Novo Recurso' }}</h3>

      <form @submit.prevent="submit">
        <div>
          <label>Título</label>
          <input v-model="form.titulo" />
          <div v-if="errors.titulo" class="error">{{ errors.titulo }}</div>
        </div>

        <div>
          <label>Autor</label>
          <input v-model="form.autor" />
        </div>

        <div>
          <label>Data</label>
          <input type="datetime-local" v-model="formLocalDate" />
          <div v-if="errors.data" class="error">{{ errors.data }}</div>
        </div>

        <div>
          <label>Status</label>
          <select v-model="form.status">
            <option value="ativo">ativo</option>
            <option value="inativo">inativo</option>
          </select>
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
import { reactive, computed, toRaw, watch } from 'vue'
import resourceService from '@/services/resourceService'

const props = defineProps({
  model: { type: Object, default: null }
})
const emit = defineEmits(['save', 'cancel'])

const isEdit = computed(() => !!props.model)

const form = reactive({
  titulo: '',
  autor: '',
  data: '',
  status: 'ativo'
})

const errors = reactive({})

watch(() => props.model, (m) => {
  if (m) {
    form.titulo = m.titulo || ''
    form.autor = m.autor || ''
    form.data = m.data ? new Date(m.data).toISOString().slice(0,16) : ''
    form.status = m.status || 'ativo'
  } else {
    form.titulo = ''
    form.autor = ''
    form.data = ''
    form.status = 'ativo'
  }
}, { immediate: true })

// we bind a local date value for input[type=datetime-local]
const formLocalDate = computed({
  get() { return form.data },
  set(v) { form.data = v }
})

function validate() {
  errors.titulo = ''
  errors.data = ''

  if (!form.titulo || form.titulo.trim().length < 3) {
    errors.titulo = 'Título mínimo 3 caracteres.'
  }
  if (!form.data) {
    errors.data = 'Data é obrigatória.'
  }
  return !errors.titulo && !errors.data
}

async function submit() {
  if (!validate()) {
    // exibir erro de validação
    return
  }
  const payload = {
    titulo: form.titulo,
    autor: form.autor,
    data: new Date(form.data).toISOString(),
    status: form.status
  }

  try {
    if (isEdit.value && props.model.id) {
      await resourceService.update(props.model.id, payload)
      alert('Atualizado com sucesso.')
    } else {
      await resourceService.create(payload)
      alert('Criado com sucesso.')
    }
    emit('save')
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar. Verifique o servidor.')
  }
}
</script>

<style>
.modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.25) }
.modal-content { background:#fff; padding:1rem; border-radius:8px; min-width:320px }
.error { color:#b91c1c; font-size:0.9rem }
.actions { display:flex; gap:.5rem; margin-top:1rem }
</style>
