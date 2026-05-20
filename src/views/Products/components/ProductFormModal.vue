<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Modal as AModal,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Select as ASelect,
  SelectOption as ASelectOption,
  Upload as AUpload,
  message,
} from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue/es/upload/interface'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'
import { getProduct, addProduct, editProduct } from '../../../api/productApi'
import type { ProductDetailParams, AddProductParams, EditProductParams, ProductImages } from '../../../types/productTypes'
import { initialProductFormState } from '../../../states/productForm'
import {
  imagesToUploadFileList,
  productImgToUploadFileList,
  getPreviewSrc,
  keepFilename,
  buildUploadFile,
  dbImageToUploadFile,
  getDbPhotoPath,
  attachUploadPreviews,
  revokeUploadPreview,
} from '../../../utils/productImage'

const emit = defineEmits<{ saved: [] }>()

// Modal 顯示與模式（新增 / 編輯）
const isModalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingProduct = ref<ProductDetailParams | null>(null)
// 表單欄位狀態
const formState = reactive(initialProductFormState())
const mainImageRequiredError = ref('')
const mainFileList = ref<UploadFile[]>([])
const galleryFileList = ref<UploadFile[]>([])
const productFormRef = ref()
const submitLoading = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
const initialMainImg = ref('')
const initialGalleryPaths = ref<string[]>([])

// 上傳元件：略過實際 HTTP，僅保留檔案於 fileList
const customRequest: UploadProps['customRequest'] = (options) => {
  const { onSuccess } = options
  setTimeout(() => onSuccess?.({}), 0)
}

// 將圖牆 fileList 同步回 formState.images
function syncGalleryImagesToForm() {
  formState.images = galleryFileList.value.map((file, i) => ({
    photoPath: file.url || file.name,
    sortOrder: i + 1,
  }))
}

const handleMainChange: UploadProps['onChange'] = ({ fileList }) => {
  mainImageRequiredError.value = ''
  mainFileList.value.forEach(revokeUploadPreview)
  mainFileList.value = attachUploadPreviews(fileList.slice(-1))
}

const handleGalleryChange: UploadProps['onChange'] = ({ fileList }) => {
  const prev = galleryFileList.value
  galleryFileList.value = attachUploadPreviews(fileList.slice(0, 3))
  prev.forEach((f) => {
    if (!galleryFileList.value.some((n) => n.uid === f.uid)) revokeUploadPreview(f)
  })
  syncGalleryImagesToForm()
}

const removeGalleryImage = (uid: string) => {
  const removed = galleryFileList.value.find((f) => f.uid === uid)
  if (removed) revokeUploadPreview(removed)
  galleryFileList.value = galleryFileList.value.filter((file) => file.uid !== uid)
  syncGalleryImagesToForm()
}

const onGallerySortEnd = () => syncGalleryImagesToForm()

function pathsEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((p, i) => p === b[i])
}

// 依多圖變更情境組裝編輯 API 的 existingImages / imageFiles
function buildEditGalleryPayload(files: UploadFile[], initialPaths: string[]) {
  const existingImages: ProductImages[] = []
  const imageFiles: File[] = []

  files.forEach((file, sortOrder) => {
    if (file.uid.startsWith('existing-')) {
      // 現存欄位, 放進 existingImages（JSON，帶 dbPhotoPath）
      const photoPath = getDbPhotoPath(file)
      if (photoPath) existingImages.push({ photoPath, sortOrder })
    } else if (file.originFileObj) {
      // 新檔案，放進 imageFiles（File 上傳）
      imageFiles.push(file.originFileObj as File)
    }
  })

  const currentExistingPaths = existingImages.map((i) => i.photoPath as string)

  if (imageFiles.length === 0 && pathsEqual(currentExistingPaths, initialPaths)) {
    return {}
  }
  if (existingImages.length === 0 && imageFiles.length > 0) {
    return { imageFiles }
  }
  if (imageFiles.length === 0) {
    return { existingImages }
  }
  return { existingImages, imageFiles }
}

// 主圖：新檔用 File；未換則送 DB 的檔名或 url 字串
function buildEditMainPayload(mainFile: UploadFile, initialMain: string) {
  if (mainFile.originFileObj && mainFile.uid !== 'main-existing') {
    return { productImgFile: mainFile.originFileObj as File }
  }
  const path = getDbPhotoPath(mainFile) || initialMain
  return path ? { productImg: path } : {}
}

// 重置為空白表單
const resetForm = () => {
  editingProduct.value = null
  Object.assign(formState, initialProductFormState())
  mainFileList.value.forEach(revokeUploadPreview)
  galleryFileList.value.forEach(revokeUploadPreview)
  mainFileList.value = []
  galleryFileList.value = []
  mainImageRequiredError.value = ''
}

// 開啟 Modal；編輯時向後端取得商品詳情並填入表單
const openModal = async (mode: 'add' | 'edit', pid?: number) => {
  modalMode.value = mode
  if (mode === 'edit' && pid != null) {
    const detail = await getProduct(pid)
    editingProduct.value = detail
    Object.assign(formState, detail)
    mainFileList.value = productImgToUploadFileList(formState.productImg)
    galleryFileList.value = imagesToUploadFileList(formState.images)
    initialMainImg.value = detail.productImg
    initialGalleryPaths.value = (detail.images ?? [])
      .map((img) => (img.photoPath ?? '').trim())
      .filter(Boolean)
  } else {
    resetForm()
    initialMainImg.value = ''
    initialGalleryPaths.value = []
  }
  isModalVisible.value = true
}

const handleCancel = () => {
  isModalVisible.value = false
}

// 驗證並送出（新增呼叫 API；編輯暫為 console）
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
  const mainFile = mainFileList.value[0]
  const productImgFile = mainFile.originFileObj as File | undefined
  const imageFiles = galleryFileList.value
    .map((f) => f.originFileObj)
    .filter((f) => f != null) as File[]

  if (modalMode.value === 'add') {
    const mainSrc = await getPreviewSrc(mainFile)
    formState.productImg = mainFile.url || mainSrc || mainFile.name || ''
    syncGalleryImagesToForm()
    if (formState.productImg) formState.productImg = keepFilename(formState.productImg)
    if (formState.images?.length) {
      formState.images = formState.images.map((img) => ({
        ...img,
        photoPath: typeof img.photoPath === 'string' ? keepFilename(img.photoPath) : img.photoPath,
      }))
    }
    const newProduct: AddProductParams = {
      ...formState,
      productImgFile,
      imageFiles,
    }
    submitLoading.value = true
    try {
      const result = await addProduct(newProduct)
      if (!result) return
      message.success('新增商品成功')
      emit('saved')
    } finally {
      submitLoading.value = false
    }
  } else {
    if (!editingProduct.value?.pid) return
    const galleryPayload = buildEditGalleryPayload(galleryFileList.value, initialGalleryPaths.value)
    const mainPayload = buildEditMainPayload(mainFile, initialMainImg.value)
    const payload: EditProductParams = {
      pid: editingProduct.value.pid,
      categoryId: formState.categoryId,
      nameZh: formState.nameZh,
      nameEn: formState.nameEn,
      price: formState.price,
      stock: formState.stock,
      descriptionZh: formState.descriptionZh,
      descriptionEn: formState.descriptionEn,
      salesCondition: formState.salesCondition,
      ...mainPayload,
      ...galleryPayload,
    }
    submitLoading.value = true
    try {
      const result = await editProduct(payload)
      if (!result) return
      message.success('編輯商品成功')
      emit('saved')
    } finally {
      submitLoading.value = false
    }
  }
  isModalVisible.value = false
}

const handlePreview = async (file: UploadFile | string
) => {
  if (typeof file === 'string') {
    previewImage.value = file
    previewVisible.value = true
    previewTitle.value = file.includes('/') ? file.slice(file.lastIndexOf('/') + 1) : file
    return
  }
  previewImage.value = await getPreviewSrc(file)
  previewVisible.value = true
  const src = file.url || previewImage.value || ''
  previewTitle.value =
    file.name || (src.includes('/') ? src.slice(src.lastIndexOf('/') + 1) : src) || ''
}

// 開發用：快速填入測試資料
const sampleData = async () => {
  formState.nameZh = '測試商品'
  formState.nameEn = 'Test Product'
  formState.price = 100
  formState.stock = 100
  formState.salesCondition = '上架中'
  formState.descriptionZh = '測試商品描述'
  formState.descriptionEn = 'Test Product Description'
  const [main, ...gallery] = await Promise.all([
    buildUploadFile('main-existing', 'cheer.png'),
    buildUploadFile('gallery-1', 'star_slash.png'),
    buildUploadFile('gallery-2', 'like_blue.png'),
    buildUploadFile('gallery-3', 'liked_blue.png'),
  ])
  mainFileList.value = [main]
  galleryFileList.value = gallery
}

const clearData = () => {
  formState.nameZh = ''
  formState.nameEn = ''
  formState.price = 0
  formState.stock = 0
  formState.salesCondition = '上架中'
  formState.descriptionZh = ''
  formState.descriptionEn = ''
  mainFileList.value.forEach(revokeUploadPreview)
  galleryFileList.value.forEach(revokeUploadPreview)
  mainFileList.value = []
  galleryFileList.value = []
}

const TEST_MAIN_URL =
  'https://storage.googleapis.com/petpet-shop.appspot.com/productsImg/b37c9c4e-1a91-4293-948a-aeed61618c48.png?GoogleAccessId=firebase-adminsdk-pftw9%40petpet-shop.iam.gserviceaccount.com&Expires=16447017600&Signature=SGuY2gqm8HIvOn22grGldxvSn3y%2BMBP%2FcNZEG%2BE6UVFLq%2FdWDHAdoe%2B5DHufZp33RDPe0fDiRR9yOAGTUZa%2FGw7c1enosWyxd1O36lipFfP2pMdApo8BsE5XeoLn6GHEwcwx%2FBIy2mzwYfa3YrCWs56cIplhh01Ijk1I0s5I6txuAJBvlcA2A5D0YbJ6tu4sd8QQzrGTYTjgNuWQN5BL1diaM5kot6xTQeCl%2BGPMKqMMwIlXQ%2FdSljtvNybGPP7inpiLvJadQlAKhzEYAH2vupINOWqYwL9Dg9Xb9N1lxqFxP25urYuAKy1%2BrCpAnSBBrE%2BCBq3okTObCSHAfCkXJw%3D%3D'  
const TEST_GALLERY_URL =
  'https://storage.googleapis.com/petpet-shop.appspot.com/productsImg/4a13bc50-6d57-4ba7-930b-bc14e853798c.png?GoogleAccessId=firebase-adminsdk-pftw9%40petpet-shop.iam.gserviceaccount.com&Expires=16447017600&Signature=Ee0ELym%2Bi5UbEVtEJNXKz549fff4vY6PKpN7KtpRDgzEgy7N5E11ffNy5a%2BSFRYa4Dk3T5j4Xz411sL08OJV3%2BtTcaoX8IWaQf11hlDXdNfiwUBOsSd1ZkVhFloMSQ3CxZzsvCIKLDOWmiAVxPcXSoEm1x37b9b3RPFUF2Kl%2FTe%2FV3MooCfA4DBQkFR%2FxOwOTQkktExCRIabmGnUDnY1buLTUK8rxQI8osF2Bs8s1eFi%2BlKvpdPBu0n9kM0KgUt5To%2FBOLSWE7YiQw2xsYZ175d2lnU%2BJTtG97h5LZCCmodaUDQpiC3gzktJEasytRtk96GWQkAmJflT7B%2F66OqpGw%3D%3D'  
const TEST_GALLERY_2_URL =
  'https://storage.googleapis.com/petpet-shop.appspot.com/productsImg/4a13bc50-6d57-4ba7-930b-bc14e853798c.png?GoogleAccessId=firebase-adminsdk-pftw9%40petpet-shop.iam.gserviceaccount.com&Expires=16447017600&Signature=Ee0ELym%2Bi5UbEVtEJNXKz549fff4vY6PKpN7KtpRDgzEgy7N5E11ffNy5a%2BSFRYa4Dk3T5j4Xz411sL08OJV3%2BtTcaoX8IWaQf11hlDXdNfiwUBOsSd1ZkVhFloMSQ3CxZzsvCIKLDOWmiAVxPcXSoEm1x37b9b3RPFUF2Kl%2FTe%2FV3MooCfA4DBQkFR%2FxOwOTQkktExCRIabmGnUDnY1buLTUK8rxQI8osF2Bs8s1eFi%2BlKvpdPBu0n9kM0KgUt5To%2FBOLSWE7YiQw2xsYZ175d2lnU%2BJTtG97h5LZCCmodaUDQpiC3gzktJEasytRtk96GWQkAmJflT7B%2F66OqpGw%3D%3D'  
  
// 編輯測試：主圖沿用 DB url；多圖 2 舊 + 1 新（existingImages + images File）
const changeData = async () => {
  if (modalMode.value !== 'edit' || !editingProduct.value) {
    message.warning('請先開啟編輯模式')
    return
  }
  formState.nameZh = '狗狗粗來玩'
  formState.nameEn = "Dog's Toy"
  formState.price = 333
  formState.stock = 22
  formState.salesCondition = '上架中'
  formState.descriptionZh = '玩具玩具玩玩'
  formState.descriptionEn = 'everthing you can imagine about the pets toy'
  formState.productImg = TEST_MAIN_URL
  mainFileList.value = productImgToUploadFileList(TEST_MAIN_URL)
  const [newGallery] = await Promise.all([buildUploadFile('gallery-new', 'liked_blue.png')])
  galleryFileList.value = [
    dbImageToUploadFile(TEST_GALLERY_URL, 0),
    dbImageToUploadFile(TEST_GALLERY_2_URL, 1),
    newGallery,
  ]
}

defineExpose({ openModal })
</script>

<template>
  <AModal
    v-model:open="isModalVisible"
    :title="modalMode === 'add' ? '新增商品' : '編輯商品'"
    :confirm-loading="submitLoading"
    width="800px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <span v-if="modalMode === 'add'" class="text-blue-500 cursor-pointer" @click="sampleData">快速帶入 New</span>
    <span v-if="modalMode === 'add'" class="text-gray-500 cursor-pointer" @click="clearData"> | 快速清空</span>
    <span v-if="modalMode === 'edit'" class="text-blue-500 cursor-pointer" @click="changeData">快速帶入 Edit</span>
    <AForm ref="productFormRef" :model="formState" layout="vertical">
      <AFormItem v-if="modalMode === 'edit'" label="Product ID">
        <div>{{ editingProduct?.pid }}</div>
      </AFormItem>
      <AFormItem
        label="Products Name (ZH)"
        name="nameZh"
        required
        :rules="[{ required: true, message: '請輸入中文商品名稱' }]"
      >
        <AInput v-model:value="formState.nameZh" placeholder="請輸入中文商品名稱" />
      </AFormItem>
      <AFormItem label="Products Name (EN)" name="nameEn">
        <AInput v-model:value="formState.nameEn" placeholder="請輸入英文商品名稱" />
      </AFormItem>
      <AFormItem label="Price" name="price" required :rules="[{ required: true, message: '請輸入商品價格' }]">
        <AInputNumber v-model:value="formState.price" style="width: 100%" placeholder="請輸入商品價格" />
      </AFormItem>
      <AFormItem label="Stock" name="stock" required :rules="[{ required: true, message: '請輸入庫存數量' }]">
        <AInputNumber v-model:value="formState.stock" style="width: 100%" placeholder="請輸入庫存數量" />
      </AFormItem>
      <AFormItem label="Sales Condition" required>
        <ASelect v-model:value="formState.salesCondition">
          <ASelectOption value="上架中">上架中</ASelectOption>
          <ASelectOption value="已下架">已下架</ASelectOption>
        </ASelect>
      </AFormItem>
      <AFormItem
        label="Products Description (ZH)"
        name="descriptionZh"
        required
        :rules="[{ required: true, message: '請輸入中文商品描述' }]"
      >
        <AInput.TextArea v-model:value="formState.descriptionZh" :rows="4" placeholder="請輸入中文商品描述" />
      </AFormItem>
      <AFormItem label="Products Description (EN)" name="descriptionEn">
        <AInput.TextArea v-model:value="formState.descriptionEn" :rows="4" placeholder="請輸入英文商品描述" />
      </AFormItem>
      <AFormItem label="主預覽圖" required>
        <AUpload
          :file-list="mainFileList"
          :max-count="1"
          list-type="picture-card"
          :custom-request="customRequest"
          @change="handleMainChange"
          @preview="handlePreview"
        >
          <div v-if="mainFileList.length < 1">
            <PlusOutlined />
            <div style="margin-top: 8px">Upload</div>
          </div>
        </AUpload>
        <div v-if="mainImageRequiredError" class="text-red-500 text-sm mt-1">{{ mainImageRequiredError }}</div>
      </AFormItem>
      <AFormItem label="其他圖片（選填，最多3張，可拖曳排序）">
        <div class="flex">
          <draggable v-model="galleryFileList" item-key="uid" class="flex gap-3" @end="onGallerySortEnd">
            <template #item="{ element }">
              <div class="border rounded p-2 bg-white relative w-24">
                <img
                  :src="element.url || element.thumbUrl || element.preview || ''"
                  class="w-24 h-full object-cover rounded cursor-pointer"
                  @click="handlePreview(element)"
                />
                <div
                  class="absolute top-0 right-2 text-gray-300 cursor-pointer"
                  @click="removeGalleryImage(element.uid)"
                >
                  <DeleteOutlined />
                </div>
              </div>
            </template>
          </draggable>
          <AUpload
            v-if="galleryFileList.length < 3"
            :file-list="galleryFileList"
            :max-count="3"
            list-type="picture-card"
            :show-upload-list="false"
            :custom-request="customRequest"
            :class="{ 'ml-3': galleryFileList.length > 0 }"
            style="margin-bottom: 0"
            @change="handleGalleryChange"
            @preview="handlePreview"
          >
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </AUpload>
        </div>
      </AFormItem>
    </AForm>
  </AModal>
</template>
