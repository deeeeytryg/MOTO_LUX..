<script setup lang="ts">
import { ref } from 'vue'
import { getToken, setToken } from '@/api'
import AdminLogin from '@/components/admin/AdminLogin.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'

// Con token guardado se muestra el panel; si el back responde 401 o el usuario sale, se borra y vuelve al login.
const logged = ref(Boolean(getToken()))
function logout() {
  setToken(null)
  logged.value = false
}
</script>

<template>
  <AdminDashboard v-if="logged" @logout="logout" />
  <AdminLogin v-else @done="logged = true" />
</template>
