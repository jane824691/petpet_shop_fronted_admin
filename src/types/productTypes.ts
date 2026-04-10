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
export interface ProductsRaw {
    pid: number;
    category_id: number;
    product_name: string;
    product_price: number;
    stock: number;
    sales_condition: string;
    product_img: string;
    edit_time: string;
    product_name_en: string;
}

export interface ProductsParams {
    pid: number;
    categoryId: number;
    nameZh: string;
    nameEn: string;
    productPrice: number;
    stock: number;
    salesCondition: string;
    productImg: string;
}
export interface ProductsListPageRaw {
    page: number;
    totalPages: number;
    totalRows: number;
    rows: ProductsRaw[];
}
export interface Images {
    photo_path?: string
    sort_order?: number
}


//* Single product in details
export interface ProductOneRaw {
    pid: number
    product_name: string
    product_name_en: string
    stock: number
    category_id: number // no use, temporarily
    sales_condition: string
    product_price: number
    product_description: string
    product_description_en: string
    product_img: string
    edit_time: string
    images?: Images[]
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
    productName?: string
    productPrice?: number
    stock?: number
    productDescription?: string
    productNameEn?: string
    productDescriptionEn?: string
    product_img: string
    images: Images[]
    lang?: string
}
