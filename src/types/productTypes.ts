//* All products in list
export interface SearchProductParams {
    page?: number
    searchWord?: string
    priceLow?: number
    priceHigh?: number
    sortBy?: string
    tag?: number
    lang?: string
}
export interface ProductsParams {
    pid: number;
    categoryId: number;
    nameZh: string;
    nameEn: string;
    price: number;
    stock: number;
    salesCondition: string;
    productImg: string;
}
export interface ProductsListPageRaw {
    page: number;
    totalPages: number;
    totalRows: number;
    rows: ProductsParams[];
}
export interface ProductImages {
    photoPath?: string
    sortOrder?: number
}

export interface ProductDetailParams {
    pid: number
    categoryId: number
    nameZh: string
    nameEn: string
    stock: number
    salesCondition: string
    price: number
    descriptionZh: string
    descriptionEn: string
    productImg: string
    editTime: string
    images?: ProductImages[]
}

export interface AddProductParams {
    categoryId?: number
    nameZh?: string
    nameEn?: string
    price: number
    stock: number
    descriptionZh?: string
    descriptionEn?: string
    productImg: string
    images?: ProductImages[]
    lang?: string
}
