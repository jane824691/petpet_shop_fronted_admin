<script setup lang="ts">
import { ref, computed, reactive,onMounted } from 'vue'
import { Collapse, CollapsePanel, Modal as AModal, Form as AForm, FormItem as AFormItem, Input as AInput, InputNumber as AInputNumber, Button as AButton, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getProducts } from '../api/product'
// Define the interface for a single product
interface Product {
  pid: number;
  category_id: number;
  product_name: string;
  product_price: number;
  stock: number;
  sales_condition: string;
  product_img: string;
  edit_time: string;
  product_description: string;
  product_description_en: string;
  product_name_en: string;
  product_name_zh: string;
  product_description_zh?: string; // Optional property
}

// const products = ref<Product[]>([
//   {
//     "pid": 204,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜經典尼龍帶系列 雙色標準款多功能牽繩",
//     "product_price": 550,
//     "stock": 50,
//     "sales_condition": "上架中",
//     "product_img": "d2a9f8e12b76b2aff433f62946427ab895c2de81.jpg",
//     "edit_time": "2020-12-27T13:50:05.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_en": "tails&me ｜Classic Nylon Series Dual Color Standard Multi-functional Leash",
//     "product_name_zh": "tails&me 尾巴與我｜經典尼龍帶系列 雙色標準款多功能牽繩",

//   },
//   {
//     "pid": 203,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜自然概念革系列 胸背帶",
//     "product_price": 580,
//     "stock": 23,
//     "sales_condition": "已下架",
//     "product_img": "24b9cfd85b5f451aa542835c1456b5a292f5760f.jpg",
//     "edit_time": "2021-01-11T10:26:03.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Natural Concept Leather Series Harness",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜自然概念革系列 胸背帶",

//   },
//   {
//     "pid": 202,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜自然概念革系列 牽繩",
//     "product_price": 390,
//     "stock": 62,
//     "sales_condition": "上架中",
//     "product_img": "42589cf62b06e9d10b6d08da0db8c1a655334b64.jpg",
//     "edit_time": "2019-08-09T07:03:45.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Natural Concept Leather Series Leash",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜自然概念革系列 牽繩",

//   },
//   {
//     "pid": 201,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜自然概念革系列 項圈",
//     "product_price": 390,
//     "stock": 28,
//     "sales_condition": "上架中",
//     "product_img": "080e7d0df144896234bbe2d2119d9a9efb332b2a.jpg",
//     "edit_time": "2018-11-25T17:20:05.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Natural Concept Leather Series Collar",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜自然概念革系列 項圈",

//   },
//   {
//     "pid": 200,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜經典尼龍帶系列 雙色項圈 (共5色)",
//     "product_price": 280,
//     "stock": 90,
//     "sales_condition": "上架中",
//     "product_img": "49854e3e2835780b44240ec7d5c699dc0a275c9b.jpg",
//     "edit_time": "2019-04-22T19:58:29.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Classic Nylon Series Dual Color Collar (5 colors)",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜經典尼龍帶系列 雙色項圈 (共5色)",

//   },
//   {
//     "pid": 199,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜自然概念革系列 配件-狗",
//     "product_price": 199,
//     "stock": 23,
//     "sales_condition": "上架中",
//     "product_img": "90d6b348e9fde6b4d61045c8faf3d344b100062e.jpg",
//     "edit_time": "2019-07-29T00:06:33.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Natural Concept Leather Series Accessory-Dog",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜自然概念革系列 配件-狗",

//   },
//   {
//     "pid": 198,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜經典尼龍帶系列 單色一對二牽繩 (共10色)",
//     "product_price": 330,
//     "stock": 95,
//     "sales_condition": "上架中",
//     "product_img": "f6817a5daacced9be22f1b989673ea46dd7eadf7.jpg",
//     "edit_time": "2019-12-12T03:35:05.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Classic Nylon Series Single Color One-to-Two Leash (10 colors)",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜經典尼龍帶系列 單色一對二牽繩 (共10色)",

//   },
//   {
//     "pid": 197,
//     "category_id": 13,
//     "product_name": "tails&me 尾巴與我｜寵物拾便袋八入 (3盒裝)",
//     "product_price": 495,
//     "stock": 26,
//     "sales_condition": "上架中",
//     "product_img": "c788e13a82d7994e10f357425b2ea145caf4a963.jpg",
//     "edit_time": "2020-04-17T07:00:05.000Z",
//     "product_description": "抽取式設計，易撕易取\r\n小巧便攜，可固定於寵物牽繩、包包\r\n讓每一次遛寵更從容自在\r\n附贈外出拾便袋一捲",
//     "product_name_en": "【Value Bulk Set】tails&me ｜Pet Poop Bags Eight Pack (3 Box Set)",
//     "product_description_en": "Pull-out design, easy to tear and take. Compact and portable, can be attached to pet leash, bag. Makes every pet walk more relaxed and comfortable. Includes one roll of outdoor poop bags.",
//     "product_name_zh": "tails&me 尾巴與我｜寵物拾便袋八入 (3盒裝)",
//     "product_description_zh": "抽取式設計，易撕易取\r\n小巧便攜，可固定於寵物牽繩、包包\r\n讓每一次遛寵更從容自在\r\n附贈外出拾便袋一捲"
//   },
//   {
//     "pid": 196,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜經典尼龍帶系列 雙色一對二牽繩 (共7色)",
//     "product_price": 330,
//     "stock": 73,
//     "sales_condition": "上架中",
//     "product_img": "513947fbaca8802583cbfa1ec71233d1d9721611.jpg",
//     "edit_time": "2020-08-22T10:25:05.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Classic Nylon Series Dual Color One-to-Two Leash (7 colors)",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜經典尼龍帶系列 雙色一對二牽繩 (共7色)",

//   },
//   {
//     "pid": 195,
//     "category_id": 12,
//     "product_name": "tails&me 尾巴與我｜經典尼龍帶系列 加強款多功能牽繩 (共6色)",
//     "product_price": 640,
//     "stock": 37,
//     "sales_condition": "上架中",
//     "product_img": "ab954cd0ec555ee48bde605eb4d16c4b845d0b5f.jpg",
//     "edit_time": "2020-12-27T13:50:05.000Z",
//     "product_description": "百搭簡約色系，毛孩出門也可以美美的 \r\n工字型胸背設計，快速穿脫，分散壓力不壓迫毛孩氣管 \r\n100%尼龍織材，強韌耐磨，柔軟度極佳 \r\n厚織密實織帶，滑順質感，強韌抗拉超耐用 \r\n車工強化零死角，兼具美觀與韌度",
//     "product_name_en": "tails&me ｜Classic Nylon Series Enhanced Multi-functional Leash (6 colors)",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我｜經典尼龍帶系列 加強款多功能牽繩 (共6色)",

//   },
//   {
//     "pid": 194,
//     "category_id": 11,
//     "product_name": "tails&me 尾巴與我 | 二合一寵物床提袋",
//     "product_price": 2380,
//     "stock": 35,
//     "sales_condition": "上架中",
//     "product_img": "fcb188434f18f48edc947e19872cf53a7a3121f6.jpg",
//     "edit_time": "2021-04-21T09:25:29.000Z",
//     "product_description": "面料柔軟親膚，中小型猫犬皆適用!\n提把拉起可俐落肩背，防滑透氣底部，用得安心睡得放心",
//     "product_name_en": "tails&me ｜Classic Nylon Series Single Color Standard Multi-functional Leash (8 colors)",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我 | 二合一寵物床提袋",
//     "product_description_zh": "面料柔軟親膚，中小型猫犬皆適用!\n提把拉起可俐落肩背，防滑透氣底部，用得安心睡得放心"
//   },
//   {
//     "pid": 193,
//     "category_id": 11,
//     "product_name": "tails&me 尾巴與我 | 兩用懶骨頭寵物床",
//     "product_price": 1080,
//     "stock": 75,
//     "sales_condition": "上架中",
//     "product_img": "4Gfn2Scm7li4nac7lqkYNA00.jpg",
//     "edit_time": "2021-10-01T23:11:33.000Z",
//     "product_description": "面料柔軟親膚，中小型猫犬皆適用! \n是床~ 也可以是懶骨頭! \n枕套可輕鬆卸除，方便清洗!!",
//     "product_name_en": "tails&me ｜APUJAN Tail Adventure Ink Dot Cat Leash-Blue",
//     "product_description_en": "Versatile simple color scheme, pets can also look beautiful when going out. I-shaped harness design, quick on and off, disperses pressure without compressing pets' trachea. 100% nylon woven material, strong and wear-resistant, excellent softness. Thick woven dense webbing, smooth texture, strong and tensile super durable. Reinforced stitching zero dead corners, combines beauty and toughness.",
//     "product_name_zh": "tails&me 尾巴與我 | 兩用懶骨頭寵物床",
//     "product_description_zh": "面料柔軟親膚，中小型猫犬皆適用! \n是床~ 也可以是懶骨頭! \n枕套可輕鬆卸除，方便清洗!!"
//   }
// ])

// Modal state
const isModalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const editingProduct = ref<Product | null>(null);

const initialFormState = {
  pid: 0,
  category_id: 0,
  product_name: '',
  product_price: 0,
  stock: 0,
  sales_condition: '上架中',
  product_img: '',
  edit_time: '',
  product_description: '',
  product_description_en: '',
  product_name_en: '',
  product_name_zh: '',
  product_description_zh: '',
};

const formState = reactive({ ...initialFormState });

onMounted(async () => {
  const response = await getProducts();
  console.log(response);
  products.value = response as { rows: Product[] };
})

// 等同React： const [products, setProducts] = useState({ rows: [] })
const products = ref<{ rows: Product[] }>({ rows: [] });

const openModal = (mode: 'add' | 'edit', product?: Product) => {
  modalMode.value = mode;
  if (mode === 'edit' && product) {
    editingProduct.value = product;
    Object.assign(formState, product);
  } else {
    editingProduct.value = null;
    Object.assign(formState, initialFormState);
    formState.pid = Math.floor(Math.random() * 1000) + 300; // 臨時的 pid
  }
  isModalVisible.value = true;
};

const handleOk = () => {
  if (modalMode.value === 'add') {
    // 新增邏輯
    const newProduct = { ...formState, edit_time: new Date().toISOString() };
    products.value.unshift(newProduct);
    console.log('Adding:', newProduct);
  } else {
    // 編輯邏輯
    if (editingProduct.value) {
      const index = products.value.findIndex(p => p.pid === editingProduct.value!.pid);
      if (index !== -1) {
        products.value[index] = { ...formState, edit_time: new Date().toISOString() };
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

// const page = ref(1)
// const itemsPerPage = 5

// const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))

// const paginatedProducts = computed(() => {
//   const startIndex = (page.value - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   return products.value.slice(startIndex, endIndex)
// })
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
            <th class="p-2 pl-6 text-left">Product Name</th>
            <th class="p-2 text-left">Price</th>
            <th class="p-2 text-left">Status</th>
            <th class="p-2 text-left ">Edit</th>
            <th class="p-2 text-left rounded-tr-lg"><font-awesome-icon :icon="['fas', 'trash']"
                class="inline-block size-4" /></th>
          </tr>
        </thead>
        <tbody>
          <!-- 臨時建立的變數 product, 做為單一產品-->
          <tr v-for="(product, index) in products.rows" :key="product.pid"
            :class="index % 2 === 1 ? 'bg-blue-50' : ''">
            <td class="py-2 pl-4 border-b border-blue-100">{{ product.pid }}</td>
            <td class="p-2 border-b border-blue-100">
              <img :src="`/images/product/${product.product_img}`" alt="產品圖片" class="h-12 w-12 object-cover rounded" />
            </td>
            <td class="p-2 border-b border-blue-100">
              <!-- 多包一個div避免預設的ant Collapse 直接撐爆 td -->
              <div class="max-w-lg break-words whitespace-pre-wrap">
                <Collapse :bordered="false" :style="{ backgroundColor: 'transparent' }">
                  <CollapsePanel :key="product.pid" :header="product.product_name">
                    <p>{{ product.product_description }}</p>
                  </CollapsePanel>
                </Collapse>
              </div>
            </td>
            <td class="p-2 border-b border-blue-100">{{ product.product_price }}</td>
            <td class="py-2 pl-2 border-b border-blue-100">{{ product.sales_condition }}</td>
            <td class="p-2 border-b border-blue-100"><font-awesome-icon :icon="['fas', 'pen-to-square']"
                class="inline-block size-4 text-blue-500" @click="openModal('edit', product)" /></td>

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

    <!-- <v-pagination v-model="page" :length="totalPages"></v-pagination> -->

    <!-- Add/Edit Product Modal -->
    <AModal 
      v-model:open="isModalVisible" 
      :title="modalMode === 'add' ? '新增商品' : '編輯商品'" 
      @ok="handleOk" 
      @cancel="handleCancel"
      width="800px"
    >
      <AForm :model="formState" layout="vertical">
        <AFormItem label="Product Name (ZH)">
          <AInput v-model:value="formState.product_name_zh" />
        </AFormItem>
        <AFormItem label="Product Name (EN)">
          <AInput v-model:value="formState.product_name_en" />
        </AFormItem>
        <AFormItem label="Price">
          <AInputNumber v-model:value="formState.product_price" :min="0" style="width: 100%" />
        </AFormItem>
        <AFormItem label="Stock">
          <AInputNumber v-model:value="formState.stock" :min="0" style="width: 100%" />
        </AFormItem>
        <AFormItem label="Sales Condition">
          <ASelect v-model:value="formState.sales_condition">
            <ASelectOption value="上架中">上架中</ASelectOption>
            <ASelectOption value="已下架">已下架</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="Product Description (ZH)">
          <AInput.TextArea v-model:value="formState.product_description" :rows="4" />
        </AFormItem>
        <AFormItem label="Product Description (EN)">
          <AInput.TextArea v-model:value="formState.product_description_en" :rows="4" />
        </AFormItem>
        <AFormItem label="Image Filename">
          <AInput v-model:value="formState.product_img" />
        </AFormItem>
      </AForm>
    </AModal>

  </div>
</template>
