<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Button as AButton, message } from 'ant-design-vue'
import { getProducts, deleteProduct as deleteProductApi } from '../../../api/productApi'
import type { ProductsParams } from '../../../types/productTypes'
import { getImagePath } from '../../../utils/productImage'

const emit = defineEmits<{
  add: []
  edit: [pid: number]
}>()

// 分頁：目前頁碼，變更時會重新拉取商品列表
const page = ref(1)
// 商品列表資料（rows）
const products = ref<{ rows: ProductsParams[] }>({ rows: [] })
// 總頁數，供 v-pagination 使用
const totalPagesValue = ref(0)
// 已勾選要批次刪除的商品 pid
const selectedProducts = reactive(new Set<number>())

// 向後端取得商品列表並更新表格
const init = async () => {
  const response = await getProducts({ page: page.value })
  products.value.rows = (response as { rows: ProductsParams[] }).rows
  totalPagesValue.value = Number((response as { totalPages: number }).totalPages) || 1
}

// 切換單一列的勾選狀態
const toggleSelect = (pid: number) => {
  if (selectedProducts.has(pid)) selectedProducts.delete(pid)
  else selectedProducts.add(pid)
}

// 刪除所有已勾選商品並刷新列表
const deleteSelected = async () => {
  const pids = [...selectedProducts]
  if (!pids.length) {
    message.warning('請先選取要刪除的商品')
    return
  }
  const results = await Promise.all(pids.map((pid) => deleteProductApi(pid)))
  const failed = results.filter((r) => !r).length
  if (failed === pids.length) return
  if (failed > 0) message.warning(`部分刪除失敗 (${failed}/${pids.length})`)
  else message.success('刪除商品成功')
  pids.forEach((pid) => selectedProducts.delete(pid))
  await init()
}

onMounted(init)
watch(page, init)

defineExpose({ init })
</script>

<template>
  <div class="p-6 w-full">
    <div class="flex justify-end mb-4">
      <AButton type="primary" @click="emit('add')">＋</AButton>
    </div>
    <table class="overflow-x-auto shadow-lg shadow-slate-400/10 rounded-lg bg-white w-full">
      <thead>
        <tr class="bg-sky-200 rounded-lg">
          <th class="py-2 pl-4 text-left rounded-tl-lg">No,</th>
          <th class="p-2 text-left">Pic</th>
          <th class="p-2 pl-6 text-left">Products Name</th>
          <th class="p-2 text-left">Price</th>
          <th class="p-2 text-left">Status</th>
          <th class="p-2 text-left">Edit</th>
          <th class="p-2 text-left rounded-tr-lg">
            <font-awesome-icon
              :icon="['fas', 'trash']"
              class="inline-block size-4 cursor-pointer"
              @click="deleteSelected"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(product, index) in products.rows"
          :key="product.pid"
          :class="index % 2 === 1 ? 'bg-blue-50' : ''"
        >
          <td class="py-2 pl-4 border-b border-blue-100">{{ product.pid }}</td>
          <td class="p-2 border-b border-blue-100">
            <img
              :src="getImagePath(product.productImg)"
              alt="產品圖片"
              class="h-12 w-12 object-cover rounded"
            />
          </td>
          <td class="p-2 border-b border-blue-100">{{ product.nameZh }}</td>
          <td class="p-2 border-b border-blue-100">{{ product.price }}</td>
          <td class="py-2 pl-2 border-b border-blue-100">{{ product.salesCondition }}</td>
          <td class="p-2 border-b border-blue-100">
            <font-awesome-icon
              :icon="['fas', 'pen-to-square']"
              class="inline-block size-4 text-blue-500 cursor-pointer"
              @click="emit('edit', product.pid)"
            />
          </td>
          <td class="p-2 border-b border-blue-100">
            <div
              class="w-5 h-5 border-2 border-blue-500 hover:border-blue-700 rounded cursor-pointer flex items-center justify-center transition-colors"
              :class="selectedProducts.has(product.pid) ? 'bg-blue-500' : 'bg-white'"
              @click="toggleSelect(product.pid)"
            >
              <svg
                v-if="selectedProducts.has(product.pid)"
                class="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <v-pagination
      v-if="totalPagesValue > 0"
      v-model="page"
      :length="totalPagesValue"
      :total-visible="7"
      class="mt-4"
    />
  </div>
</template>
