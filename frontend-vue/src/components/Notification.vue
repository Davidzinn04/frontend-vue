<template>
  <div class="notif-container" v-if="visible">
    <div class="notif" :class="type">
      <strong v-if="title">{{ title }}</strong>
      <div>{{ message }}</div>
      <button class="close" @click="hide">✕</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'Notification',
  setup(_, { expose }) {
    const visible = ref(false)
    const message = ref('')
    const title = ref('')
    const type = ref('info')
    let timer = null

    function show(msg, opts = {}) {
      message.value = msg
      title.value = opts.title || ''
      type.value = opts.type || 'info'
      visible.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(hide, opts.duration || 4000)
    }
    function hide() {
      visible.value = false
    }
    expose({ show, hide })
    return { visible, message, title, type, hide }
  }
}
</script>

<style>
.notif-container { position: fixed; right: 1rem; bottom: 1rem; z-index: 999 }
.notif { background: #fff; border:1px solid #ddd; padding: 0.75rem 1rem; border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); min-width:200px; position:relative }
.notif.info { border-left:4px solid #3b82f6 }
.notif.success { border-left:4px solid #16a34a }
.notif.error { border-left:4px solid #ef4444 }
.notif .close { position:absolute; top:6px; right:6px; background:transparent; border:0; cursor:pointer }
</style>
