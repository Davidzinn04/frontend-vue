<template>
  <div>
    <div class="toolbar">
      <input v-model="q" placeholder="Pesquisar comentário..." @input="fetchList" />
      <button @click="openCreate">Novo comentário</button>
    </div>

    <div v-if="loading">Carregando sub-itens...</div>
    <div v-else>
      <div v-if="subresources.length === 0" class="empty">Nenhum sub-item para este recurso.</div>

      <ul v-else>
        <li v-for="s in subresources" :key="s.id">
          <div>
            <strong>{{ s.autor }}</strong> - {{ formatDate(s.data) }}
          </div>
          <div>{{ s.conteudo }}</div>
          <div class="actions">
            <button @click="edit(s)">Editar</button>
            <button @click="confirmDelete(s)">Excluir</button>
          </div>
        </li>
      </ul>
    </div>

    <sub-resource-form
      v-if="showForm"
      :model="editingModel"
      :resourceId="resourceId"
      @save="onSaved"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import subresourceService from '@/services/subresourceService'
import SubResourceForm from './SubResourceForm.vue'

const props = defineProps({
  resourceId: { type: [String, Number], required: true }
})

const subresources = ref([])
const loading = ref(false)
const q = ref('')

const showForm = ref(false)
const editingModel = ref(null)

onMounted(() => fetchList())
watch(() => props.resourceId, () => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const { data } = await subresourceService.list({ resourceId: props.resourceId })
    let arr = data || []
    if (q.value) {
      arr = arr.filter(i => i.conteudo?.toLowerCase().includes(q.value.toLowerCase()) || i.autor?.toLowerCase().includes(q.value.toLowerCase()))
    }
    subresources.value = arr
  } catch (err) {
    console.error(err)
    alert('Erro ao buscar subrecursos.')
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString()
}

function openCreate() {
  editingModel.value = null
  showForm.value = true
}

function edit(s) {
  editingModel.value = { ...s }
  showForm.value = true
}

async function confirmDelete(s) {
  if (!confirm('Confirmar exclusão?')) return
  try {
    await subresourceService.remove(s.id)
    alert('Excluído.')
    fetchList()
  } catch (err) {
    console.error(err)
    alert('Erro ao excluir subrecurso.')
  }
}

function onCancel() {
  showForm.value = false
  editingModel.value = null
}

function onSaved() {
  showForm.value = false
  editingModel.value = null
  fetchList()
}
</script>

<style>
.toolbar { display:flex; gap:.5rem; margin-bottom:.5rem }
ul { list-style:none; padding:0 }
li { border:1px solid #eee; padding:.5rem; margin-bottom:.5rem; border-radius:6px }
.actions { margin-top:.5rem; display:flex; gap:.5rem }
.empty { color:#666; padding:1rem }
</style>
