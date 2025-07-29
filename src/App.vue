
<template>
  <div id="app">
    <nav v-if="showNav" class="h-12  bg-gray-800 text-white flex items-center">
      <router-link to="/">Login</router-link> |
      <router-link to="/members">Members</router-link> |
      <router-link to="/products">Products</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.path !== '/login')
</script>