
<template>
  <div id="app">
    <nav v-if="showNav" class="h-12  bg-gray-800 text-white flex items-center gap-2">
      <router-link class="hover:text-sky-400" to="/">Login</router-link> |
      <router-link class="hover:text-sky-400" to="/members">Members</router-link> |
      <router-link class="hover:text-sky-400" to="/products">Products</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue' // like useMemo
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.path !== '/login')
</script>