<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Modal as AModal, Form as AForm, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Button as AButton, Select as ASelect, SelectOption as ASelectOption, Upload as AUpload } from 'ant-design-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getProducts, getProduct } from '../api/productApi'
import type { ProductsParams, ProductDetailParams } from '../types/productTypes'
import { initialProductFormState } from '../states/productForm'
import { PlusOutlined } from '@ant-design/icons-vue';
import type { UploadProps } from 'ant-design-vue';
import type { UploadFile } from 'ant-design-vue/es/upload/interface';
import type { ProductImages } from '../types/productTypes'
import draggable from 'vuedraggable'


const isModalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const editingProduct = ref<ProductDetailParams | null>(null);
const page = ref(1) // Vue用ref雙向綁定資料, 1為預設頁數
const products = ref<{ rows: ProductsParams[] }>({ rows: [] }); // 等同React： const [products, setProducts] = useState({ rows: [] })
const productDetail = ref<ProductDetailParams | null>(null);
const totalPagesValue = ref<number>(0);
const formState = reactive(initialProductFormState());

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const mainImageRequiredError = ref('');
const mainFileList = ref<UploadFile[]>([]);
const galleryFileList = ref<UploadFile[]>([]);
const productFormRef = ref();

const customRequest: UploadProps['customRequest'] = (options) => {
  const { onSuccess } = options
  setTimeout(() => {
    onSuccess?.({})
  }, 0)
}

function imagesToUploadFileList(images: ProductImages[] | undefined): UploadFile[] {
  if (!images?.length) return []
  return images
    .filter((img) => typeof img.photoPath === 'string' && img.photoPath.trim() !== '')
    .map((img, i) => {
      const path = (img.photoPath as string).trim()
    const name = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path || `image-${i + 1}`
    return {
      uid: `existing-${img.sortOrder ?? i}-${i}`,
      name,
      status: 'done',
      url: getImagePath(path),
    }
    })
}

function productImgToUploadFileList(productImg?: string): UploadFile[] {
  if (!productImg) return []
  return [
    {
      uid: 'main-existing',
      name: productImg.includes('/') ? productImg.slice(productImg.lastIndexOf('/') + 1) : productImg,
      status: 'done',
      url: getImagePath(productImg),
    }
  ]
}

async function getPreviewSrc(file: UploadFile): Promise<string> {
  if (file.url) return file.url
  if (typeof file.preview === 'string') return file.preview
  if (file.originFileObj) {
    const base64 = await getBase64(file.originFileObj as File)
    file.preview = base64
    return base64
  }
  return ''
}

function syncGalleryImagesToForm() {
  formState.images = galleryFileList.value.map((file, i) => ({
    photoPath: file.url || file.name,
    sortOrder: i + 1,
  }))
}

// 主預覽圖
const handleMainChange: UploadProps['onChange'] = ({ fileList }) => {
  mainImageRequiredError.value = ''
  mainFileList.value = fileList.slice(-1)
}

// 多圖牆
const handleGalleryChange: UploadProps['onChange'] = ({ fileList }) => {
  galleryFileList.value = fileList.slice(0, 3)
  syncGalleryImagesToForm()
}

const removeGalleryImage = (uid: string) => {
  galleryFileList.value = galleryFileList.value.filter((file) => file.uid !== uid)
  syncGalleryImagesToForm()
}

const onGallerySortEnd = () => {
  syncGalleryImagesToForm()
}


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
      mainFileList.value = productImgToUploadFileList(formState.productImg)
      galleryFileList.value = imagesToUploadFileList(formState.images)
    }
  } else {
    editingProduct.value = null;
    Object.assign(formState, initialProductFormState());
    mainFileList.value = []
    galleryFileList.value = []
  }
  mainImageRequiredError.value = ''
  isModalVisible.value = true;
};

const handleOk = async () => {
  try {
    await productFormRef.value?.validate()
  } catch {
    return
  }
  if (!mainFileList.value.length) {
    mainImageRequiredError.value = '主圖為必填'
    return
  }
  const mainSrc = await getPreviewSrc(mainFileList.value[0])
  formState.productImg = mainFileList.value[0].url || mainSrc || mainFileList.value[0].name || ''
  syncGalleryImagesToForm()
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


function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read failed'));
  });
}

const handleImgCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadFile) => {
  previewImage.value = await getPreviewSrc(file);
  previewVisible.value = true;
  const src = file.url || previewImage.value || '';
  previewTitle.value = file.name || (src.includes('/') ? src.slice(src.lastIndexOf('/') + 1) : src) || '';
};

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
      <AForm ref="productFormRef" :model="formState" layout="vertical">
        <AFormItem v-if="modalMode === 'edit'" label="Product ID">
          <div>{{ editingProduct?.pid }}</div>
        </AFormItem>
        <AFormItem label="Category" name="categoryId" required :rules="[{ required: true, message: '請選擇分類' }]">
          <ASelect v-model:value="formState.categoryId" placeholder="請選擇商品分類">
            <ASelectOption :value="1">狗狗</ASelectOption>
            <ASelectOption :value="2">貓咪</ASelectOption>
            <ASelectOption :value="3">其他</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="Products Name (ZH)" name="nameZh" required :rules="[{ required: true, message: '請輸入中文商品名稱' }]">
          <AInput v-model:value="formState.nameZh" placeholder="請輸入中文商品名稱" />
        </AFormItem>
        <AFormItem label="Products Name (EN)" name="nameEn" required :rules="[{ required: true, message: '請輸入英文商品名稱' }]">
          <AInput v-model:value="formState.nameEn" placeholder="請輸入英文商品名稱" />
        </AFormItem>
        <AFormItem label="Price" name="price" required :rules="[{ required: true, message: '請輸入商品價格' }]">
          <AInputNumber v-model:value="formState.price" :min="0" style="width: 100%" placeholder="請輸入商品價格" />
        </AFormItem>
        <AFormItem label="Stock" name="stock" required :rules="[{ required: true, message: '請輸入庫存數量' }]">
          <AInputNumber v-model:value="formState.stock" :min="0" style="width: 100%" placeholder="請輸入庫存數量" />
        </AFormItem>
        <AFormItem label="Sales Condition" required>
          <ASelect v-model:value="formState.salesCondition">
            <ASelectOption value="上架中">上架中</ASelectOption>
            <ASelectOption value="已下架">已下架</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="Products Description (ZH)" name="descriptionZh" required :rules="[{ required: true, message: '請輸入中文商品描述' }]">
          <AInput.TextArea v-model:value="formState.descriptionZh" :rows="4" placeholder="請輸入中文商品描述" />
        </AFormItem>
        <AFormItem label="Products Description (EN)" name="descriptionEn" required :rules="[{ required: true, message: '請輸入英文商品描述' }]">
          <AInput.TextArea v-model:value="formState.descriptionEn" :rows="4" placeholder="請輸入英文商品描述" />
        </AFormItem>
        <AFormItem label="主預覽圖" required>
          <AUpload :file-list="mainFileList" :max-count="1" list-type="picture-card" :custom-request="customRequest"
            @change="handleMainChange" @preview="handlePreview">
            <div v-if="mainFileList.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </AUpload>
          <div v-if="mainImageRequiredError" class="text-red-500 text-sm mt-1">{{ mainImageRequiredError }}</div>
        </AFormItem>

        <AFormItem label="其他圖片（選填，最多3張，可拖曳排序）">
          <AUpload :file-list="galleryFileList" :max-count="3" list-type="picture-card" :custom-request="customRequest"
            @change="handleGalleryChange" @preview="handlePreview">
            <div v-if="galleryFileList.length < 3">
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </AUpload>
          <draggable v-model="galleryFileList" item-key="uid" class="grid grid-cols-3 gap-3 mt-3" @end="onGallerySortEnd">
            <template #item="{ element, index }">
              <div class="border rounded p-2 bg-white">
                <div class="text-xs mb-2">排序 {{ index + 1 }}</div>
                <img :src="element.url || element.thumbUrl || element.preview || ''" class="w-full h-28 object-cover rounded cursor-pointer"
                  @click="handlePreview(element)" />
                <AButton class="mt-2" danger block @click="removeGalleryImage(element.uid)">刪除</AButton>
              </div>
            </template>
          </draggable>
          <AModal v-model:open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleImgCancel">
            <img alt="" style="width: 100%" :src="previewImage" />
          </AModal>
        </AFormItem>
      </AForm>
    </AModal>

  </div>
</template>
