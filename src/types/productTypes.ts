export interface SearchProductParams {
    page?: number
    searchWord?: string
    priceLow?: number
    priceHigh?: number
    sortBy?: string
    tag?: number
    lang?: string
}

export interface Images {
    photo_path?: string
    sort_order?: number
}

// original data from api
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

export interface ProductDetailFormat {
    pid: number
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

export interface Products {
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
