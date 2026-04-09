import type { ProductsParams } from '../types/productTypes'

export const initialProductsFormState = (): ProductsParams => ({
  pid: 0,
  categoryId: 0,
  nameZh: '',
  nameEn: '',
  productPrice: 0,
  stock: 0,
  salesCondition: '上架中',
  productImg: '',
})

