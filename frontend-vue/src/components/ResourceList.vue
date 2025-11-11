<template>
  <div>
    <div class="toolbar">
      <input v-model="filters.q" placeholder="Pesquisar por título/autor..." @input="fetchList" />
      <input type="date" v-model="filters.from" @change="fetchList" />
      <input type="date" v-model="filters.to" @change="fetchList" />
      <select v-model="filters.status" @change="fetchList">
        <option value="">Todos status</option>
        <option value="ativo">ativo</option>
        <option value="inativo">inativo</option>
      </select>
      <button @click="openCreate">Novo</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-else>
      <div v-if="resources.length === 0" class="empty">Nenhum recurso encontrado.</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id" :class="{ selected: selected && selected.id === r.id }">
            <td>{{ r.titulo }}</td>
            <td>{{ r.autor }}</td>
            <td>{{ formatDate(r.data) }}</td>
            <td>{{ r.status }}</td>
            <td>
              <button @click="select(r)">Abrir</button>
              <button @click="edit(r)">Editar</button>
              <button @click="confirmDelete(r)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <resource-form
      v-if="showForm"
      :model="editingModel"
      @save="onSaved"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import resourceService from '@/services/resourceService'
import ResourceForm from './ResourceForm.vue'
import { formatISO, parseISO } from 'date-fns' // optional; if not installed remove date-fns and use basic formatting

const resources = ref([])
const loading = ref(false)
const selected = ref(null)

const showForm = ref(false)
const editingModel = ref(null)

const filters = reactive({
  q: '',
  from: '',
  to: '',
  status: ''
})

const notif = ref(null)

onMounted(() => {
  fetchList()
})

function buildParams() {
  const params = {}
  if (filters.q) {
    // json-server: use q for full-text
    params.q = filters.q
  }
  if (filters.status) params.status = filters.status
  // date range - json-server doesn't support range natively; filter client side if needed.
  return params
}

async function fetchList() {
  loading.value = true
  try {
    const { data } = await resourceService.list(buildParams())
    // apply date range filter client-side
    let arr = data || []
    if (filters.from) {
      const fromIso = new Date(filters.from).toISOString()
      arr = arr.filter(i => new Date(i.data) >= new Date(fromIso))
    }
    if (filters.to) {
      const toIso = new Date(filters.to).toISOString()
      arr = arr.filter(i => new Date(i.data) <= new Date(new Date(toIso).setHours(23,59,59)))
    }
    resources.value = arr
  } catch (err) {
    console.error(err)
    // show notification via event on window or console
    alert('Erro ao buscar recursos. Verifique o servidor.')
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

function select(r) {
  selected.value = r
  // emit para o pai
  const e = new CustomEvent('selectResource', { detail: r })
  window.dispatchEvent(e) // fallback if parent doesn't use prop events
  // também emita com $emit local (componente emit)
  // no setup, não temos emit — usar $emit via defineEmits se necessário
  emitToParent(r)
}

function emitToParent(resource) {
  // emit via DOM custom event for App.vue listener
  const event = new CustomEvent('selectResource', { detail: resource })
  window.dispatchEvent(event)
  // também tentar emitir do componente em runtime (compatibility)
  // there is no direct emit here; parent uses component events in template via @selectResource, so below:
  // We'll use $emit via defineEmits:
}

import { getCurrentInstance } from 'vue'
const internal = getCurrentInstance()
const emit = internal?.emit || (() => {})

function edit(r) {
  editingModel.value = { ...r }
  showForm.value = true
}

function openCreate() {
  editingModel.value = null
  showForm.value = true
}

async function confirmDelete(r) {
  if (!confirm(`Confirmar exclusão de "${r.titulo}"?`)) return
  try {
    await resourceService.remove(r.id)
    alert('Excluído com sucesso.')
    fetchList()
  } catch (err) {
    console.error(err)
    alert('Erro ao excluir.')
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
  // emitir refresh para pai
  const ev = new CustomEvent('refresh')
  window.dispatchEvent(ev)
}
</script>

<style>
.toolbar { display:flex; gap:.5rem; margin-bottom:.5rem; align-items:center }
.table { width:100%; border-collapse: collapse }
.table th, .table td { border:1px solid #eee; padding:.5rem }
.selected { background:#f9fafb }
.empty { padding:1rem; color:#666 }
</style>
