
<template>
  <div id="app">
    <nav v-if="showNav" class="h-12  bg-gray-800 text-white flex items-center gap-2 px-6">
      <router-link class="hover:text-sky-400" to="/members">Members</router-link> |
      <router-link class="hover:text-sky-400" to="/products">Products</router-link>
      <button class="hover:text-sky-400 ml-auto" type="button" @click="handleLogout">Logout</button>
    </nav>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue' // like useMemo
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { message } from 'ant-design-vue'
import { postLogout } from './api/memberApi'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const showNav = computed(() => route.path !== '/login')

const handleLogout = async () => {
  try {
    await postLogout()
  } finally {
    userStore.logout()
    router.push('/login')
    message.success('Logout successful')
  }
}
</script>