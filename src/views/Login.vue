<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLogin } from '../api/memberApi'
import { message } from 'ant-design-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const account = ref('')
const password = ref('')
const isLoading = ref(false)
const handleLogin =  async () => {
  isLoading.value = true
  try {
    const response = await getLogin({ account: account.value, password: password.value })
    if (response.success === true) {
      userStore.login(account.value)
      message.success('Login successful')
      router.push('/')
      return
    } else if ( response.success === false){
      message.error('account or password is incorrect')
      return
    }
  } finally {
    isLoading.value = false
  }
}

const quickSample = () => {
  account.value = 'FANG'
  password.value = 'LH123456'
}


</script>

<template>
  <div class="flex min-h-screen items-center w-screen justify-center bg-gray-100">
    <div class="w-full max-w-md">
      <div class="text-center font-bold pb-2">Admin</div>
      <div class="text-center font-bold pb-2">登入 <span @click="quickSample" class="text-red-500">*</span></div>
      <!-- <div class="text-center font-bold pb-2 text-gray-500" @click="quickSample">快速帶入測試用帳密</div> -->

      <form class="mt-4 space-y-5" @submit.prevent="handleLogin">
        <div class="-space-y-px rounded-md shadow-md">
          <div>
            <input v-model="account" type="text" required
              class="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 sm:text-sm"
              placeholder="帳號" />
          </div>
          <div>
            <input v-model="password" type="password" autocomplete="current-password" required
              class="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 sm:text-sm"
              placeholder="密碼" />
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading"
            class="relative flex w-full justify-center rounded-md  border border-transparent bg-sky-300 py-3 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:bg-sky-400">
            <span v-if="isLoading">
              <svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
            </span>
            登入
          </button>
        </div>
      </form>
    </div>
  </div>

</template>