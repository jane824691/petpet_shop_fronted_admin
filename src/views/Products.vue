<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Modal as AModal, Form as AForm, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Button as AButton, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getProducts, getProduct } from '../api/productApi'
import type { ProductsParams, ProductDetailParams } from '../types/productTypes'
import { initialProductFormState } from '../states/productForm'


const isModalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const editingProduct = ref<ProductDetailParams | null>(null);
const page = ref(1) // Vue用ref雙向綁定資料, 1為預設頁數
const products = ref<{ rows: ProductsParams[] }>({ rows: [] }); // 等同React： const [products, setProducts] = useState({ rows: [] })
const productDetail = ref<ProductDetailParams | null>(null);
const totalPagesValue = ref<number>(0);
const formState = reactive(initialProductFormState());

// 呼叫api: 商品總清單
const init = async () => {
  const response = await getProducts({ page: page.value })
  products.value.rows = (response as { rows: ProductsParams[] }).rows
  totalPagesValue.value = Number((response as { totalPages: number }).totalPages) || 1
}
const DEFAULT_IMG = '@public/images/product/638348807730300000 (1).jfif'

// 商品圖可能存在專案路徑裡，也可能存在Firebase的連結
const getImagePath = (image?: string | null) => {
  if (!image) return DEFAULT_IMG
  if (image.startsWith('http')) return image
  return `/images/product/${image}`
}

const getProductDetail = async (pid: number) => {
  const response = await getProduct(pid);
  productDetail.value = response;
  console.log('productDetail======', productDetail.value);
}

onMounted(init);

// 監聽page的變化，如果page的變化，則重新初始化，類似useEffect
watch(page, init)

const openModal = async (mode: 'add' | 'edit', pid?: number) => {
  modalMode.value = mode;
  if (mode === 'edit' && pid != null) {
    await getProductDetail(pid);
    if (productDetail.value) {
      editingProduct.value = productDetail.value;
      Object.assign(formState, productDetail.value);
    }
  }
  isModalVisible.value = true;
};

const handleOk = () => {
  if (modalMode.value === 'add') {
    // 新增邏輯
    // const newProduct = { ...formState, edit_time: new Date().toISOString() };
    // products.value.rows.unshift(newProduct);
    // console.log('Adding:', newProduct);
  } else {
    // 編輯邏輯
    if (editingProduct.value) {
      const index = products.value.rows.findIndex(p => p.pid === editingProduct.value!.pid);
      if (index !== -1) {
        // products.value.rows[index] = { ...formState, edit_time: new Date().toISOString() };
      }
    }
    console.log('Saving:', formState);
  }
  isModalVisible.value = false;
};

const handleCancel = () => {
  isModalVisible.value = false;
};


// 記錄哪些產品被選取
const selectedProducts = reactive(new Set())

// 點擊切換狀態
const toggleSelect = (pid: number) => {
  if (selectedProducts.has(pid)) {
    selectedProducts.delete(pid); // 取消選取
  } else {
    selectedProducts.add(pid); // 增加選取
  }
}

</script>

<!-- Vue <font-awesome-icon> 的 icon 屬性規則
Solid	fas	@fortawesome/free-solid-svg-icons
Regular	far	@fortawesome/free-regular-svg-icons
Brands	fab	@fortawesome/free-brands-svg-icons -->
<template>
  <div class="bg-gray-100 flex flex-col items-center justify-center" style="min-height: calc(100vh - 3rem);">
    <div class="p-6 w-full">
      <div class="flex justify-end mb-4">
        <AButton type="primary" @click="openModal('add')">＋</AButton>
      </div>
      <table class="overflow-x-auto shadow-lg shadow-slate-400/10 rounded-lg bg-white w-full">
        <thead>
          <tr class=" bg-sky-200 rounded-lg">
            <th class="py-2 pl-4 text-left rounded-tl-lg">No,</th>
            <th class="p-2 text-left">Pic</th>
            <th class="p-2 pl-6 text-left">Products Name</th>
            <th class="p-2 text-left">Price</th>
            <th class="p-2 text-left">Status</th>
            <th class="p-2 text-left ">Edit</th>
            <th class="p-2 text-left rounded-tr-lg"><font-awesome-icon :icon="['fas', 'trash']"
                class="inline-block size-4" /></th>
          </tr>
        </thead>
        <tbody>
          <!-- 臨時建立的變數 product, 做為單一產品, products是整個陣列, rows是陣列中的物件-->
          <tr v-for="(product, index) in products.rows" :key="product.pid" :class="index % 2 === 1 ? 'bg-blue-50' : ''">
            <td class="py-2 pl-4 border-b border-blue-100">{{ product.pid }}</td>
            <td class="p-2 border-b border-blue-100">
              <img :src=getImagePath(product.productImg) alt="產品圖片" class="h-12 w-12 object-cover rounded" />
            </td>
            <td class="p-2 border-b border-blue-100">{{ product.nameZh }}</td>
            <td class="p-2 border-b border-blue-100">{{ product.productPrice }}</td>
            <td class="py-2 pl-2 border-b border-blue-100">{{ product.salesCondition }}</td>
            <!-- 點擊click事件觸發openModal('edit', product)同時把product資料傳遞給openModal函式 -->
            <td class="p-2 border-b border-blue-100"><font-awesome-icon :icon="['fas', 'pen-to-square']"
                class="inline-block size-4 text-blue-500" @click="openModal('edit', product.pid)" /></td>

            <td class="p-2 border-b border-blue-100">
              <div @click="toggleSelect(product.pid)"
                class="w-5 h-5 border-2 border-blue-500 hover:border-blue-700 rounded cursor-pointer flex items-center justify-center transition-colors"
                :class="selectedProducts.has(product.pid) ? 'bg-blue-500' : 'bg-white'">
                <svg v-if="selectedProducts.has(product.pid)" class="w-3 h-3 text-white" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vuetify 組件 v-pagination 的 :length 為 0 時可能不渲染或報錯 -->
    <v-pagination v-if="totalPagesValue > 0" v-model="page" :length="totalPagesValue" :total-visible="7"></v-pagination>

    <!-- Add/Edit Products Modal -->
    <AModal v-model:open="isModalVisible" :title="modalMode === 'add' ? '新增商品' : '編輯商品'" @ok="handleOk"
      @cancel="handleCancel" width="800px">
      <AForm :model="formState" layout="vertical">
        <AFormItem label="Products Name (ZH)">
          <AInput v-model:value="formState.nameZh" />
        </AFormItem>
        <AFormItem label="Products Name (EN)">
          <AInput v-model:value="formState.nameEn" />
        </AFormItem>
        <AFormItem label="Price">
          <AInputNumber v-model:value="formState.price" :min="0" style="width: 100%" />
        </AFormItem>
        <AFormItem label="Stock">
          <AInputNumber v-model:value="formState.stock" :min="0" style="width: 100%" />
        </AFormItem>
        <AFormItem label="Sales Condition">
          <ASelect v-model:value="formState.salesCondition">
            <ASelectOption value="上架中">上架中</ASelectOption>
            <ASelectOption value="已下架">已下架</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="Products Description (ZH)">
          <AInput.TextArea v-model:value="formState.descriptionZh" :rows="4" />
        </AFormItem>
        <AFormItem label="Products Description (EN)">
          <AInput.TextArea v-model:value="formState.descriptionEn" :rows="4" />
        </AFormItem>
        <AFormItem label="Image Filename" encType="multipart/form-data">
          <i class="pi pi-images" style="font-size: 2rem"></i>
          <img v-if="modalMode === 'edit'" :src=getImagePath(formState.productImg)
            alt="產品圖片"
            class="h-64 w-64 object-cover rounded" />
        </AFormItem>
      </AForm>
    </AModal>

  </div>
</template>
