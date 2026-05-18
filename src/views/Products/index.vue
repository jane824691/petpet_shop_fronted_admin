<script setup lang="ts">
import { ref } from 'vue'
import ProductTable from './components/ProductTable.vue'
import ProductFormModal from './components/ProductFormModal.vue'

const tableRef = ref<InstanceType<typeof ProductTable> | null>(null)
const formModalRef = ref<InstanceType<typeof ProductFormModal> | null>(null)
</script>

<template>
  <div class="bg-gray-100 flex flex-col items-center justify-center" style="min-height: calc(100vh - 3rem)">
    <ProductTable
      ref="tableRef"
      @add="formModalRef?.openModal('add')"
      @edit="(pid) => formModalRef?.openModal('edit', pid)"
    />
    <ProductFormModal ref="formModalRef" @saved="tableRef?.init()" />
  </div>
</template>
