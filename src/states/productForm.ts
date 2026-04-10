import type { ProductDetailParams } from '../types/productTypes'

export const initialProductFormState = (): ProductDetailParams => ({
  pid: 0,
  categoryId: 3,
  nameZh: '',
  nameEn: '',
  stock: 0,
  salesCondition: '上架中',
  price: 0,
  descriptionZh: '',
  descriptionEn: '',
  productImg: '',
  editTime: '',
  images: [],
})

