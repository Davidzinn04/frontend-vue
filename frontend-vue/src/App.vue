<template>
  <div class="app">
    <header>
      <h1>CRUD Vue 3 — Recursos e Subrecursos</h1>
    </header>

    <main>
      <section class="left">
        <resource-list
          @selectResource="handleSelectResource"
          @refresh="refreshAll"
        />
      </section>

      <section class="right" v-if="selectedResource">
        <h2>Sub-itens de: {{ selectedResource.titulo }}</h2>
        <sub-resource-list
          :resourceId="selectedResource.id"
        />
      </section>

      <section class="right placeholder" v-else>
        <p>Selecione um recurso à esquerda para ver seus sub-itens.</p>
      </section>
    </main>

    <notification ref="notif" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ResourceList from './components/ResourceList.vue'
import SubResourceList from './components/SubResourceList.vue'
import Notification from './components/Notification.vue'

const selectedResource = ref(null)
const notif = ref(null)

function handleSelectResource(resource) {
  selectedResource.value = resource
}

function refreshAll() {
  // optional: we could emit events to refresh children; keep simple
  selectedResource.value = selectedResource.value ? { ...selectedResource.value } : null
}
</script>

<style>
/* simples layout */
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width:1200px; margin:auto }
header { margin-bottom: 1rem }
main { display: flex; gap: 1rem }
.left { flex: 1 1 50% }
.right { flex: 1 1 50%; border-left: 1px solid #ddd; padding-left:1rem }
.placeholder { display:flex; align-items:center; justify-content:center; color:#666 }
</style>
