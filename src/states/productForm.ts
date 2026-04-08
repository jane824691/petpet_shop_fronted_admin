import type { Products } from '../types/productTypes'

export const initialProductsFormState = (): Products => ({
  pid: 0,
  category_id: 0,
  product_name: '',
  product_price: 0,
  stock: 0,
  sales_condition: '上架中',
  product_img: '',
  edit_time: '',
  product_name_en: '',
})

