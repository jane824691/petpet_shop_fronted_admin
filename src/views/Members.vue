<script setup lang="ts">
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'Mike', price: 999, category: 'Electronics' },
  { id: 2, name: 'Mary', price: 79, category: 'Home Appliance' },
  { id: 3, name: 'Tom', price: 149, category: 'Furniture' },
  { id: 4, name: 'Bruce', price: 49, category: 'Audio' },
  { id: 5, name: 'Cate', price: 199, category: 'Wearables' }
])



</script>

<template>
  <div class="bg-gray-100 flex items-center justify-center" style="min-height: calc(100vh - 3rem);">
    <div class="p-6 w-full">
      <table class="overflow-x-auto shadow-lg shadow-slate-10/40 rounded-lg bg-white w-full">
        <thead>
          <tr class=" bg-sky-200 rounded-lg">
            <th class="py-2 pl-4 text-left rounded-tl-lg">Name</th>
            <th class="p-2 text-left">No.</th>
            <th class="p-2 text-left rounded-tr-lg">Desc</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td class="py-2 pl-4 border-b border-blue-100">{{ product.name }}</td>
            <td class="p-2 border-b border-blue-100">{{ product.price }}</td>
            <td class="p-2 border-b border-blue-100">{{ product.category }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
