import { PRODUCTS, ONE_PRODUCT, PRODUCTS_ADD } from './config'
import type {
    AddProductParams,
    ProductsRaw,
    ProductsParams,
    ProductsListPageRaw,
    Images,
    ProductDetailParams,
    ProductOneRaw,
    SearchProductParams,
} from '../types/productTypes'

const mapProductImageDto = (image: Images) => ({
    photoPath: image.photo_path,
    sortOrder: image.sort_order,
})

const productDetail = (data: ProductOneRaw): ProductDetailParams => ({
    pid: data.pid,
    nameZh: data.product_name,
    nameEn: data.product_name_en,
    stock: data.stock,
    salesCondition: data.sales_condition,
    price: data.product_price,
    descriptionZh: data.product_description,
    descriptionEn: data.product_description_en,
    productImg: data.product_img,
    editTime: data.edit_time,
    images: Array.isArray(data.images) ? data.images.map(mapProductImageDto) : [],
})

const products = (data: ProductsRaw): ProductsParams => ({
    pid: data.pid,
    categoryId: data.category_id,
    nameZh: data.product_name,
    nameEn: data.product_name_en,
    productPrice: data.product_price,
    stock: data.stock,
    salesCondition: data.sales_condition,
    productImg: data.product_img,
})

export const getProducts = async (params: SearchProductParams = {}) => {
    const {
        page = 1,
        searchWord = '',
        priceLow = '',
        priceHigh = '',
        sortBy = '',
        tag = '',
        lang = 'zh-TW'
    } = params

    const queryParams = new URLSearchParams({
        page: String(page),
        searchWord: String(searchWord),
        priceLow: String(priceLow),
        priceHigh: String(priceHigh),
        sortBy: String(sortBy),
        tag: String(tag)
    })

    const response = await fetch(
        PRODUCTS + `?${queryParams.toString()}`,
        {
            headers: {
                'Accept-Language': lang,
            },
        }
    )

    const data = (await response.json()) as ProductsListPageRaw

    return {
        page: data.page,
        totalPages: data.totalPages,
        totalRows: data.totalRows,
        rows: data.rows.map((row) => products(row)),
    }
}

export const getProduct = async (pid: number): Promise<ProductDetailParams> => {
    const response = await fetch(
        ONE_PRODUCT + `/${pid}`,
        {
            headers: {
                'Accept-Language': 'zh-TW',
            },
        }
    )
    const data = (await response.json()) as ProductOneRaw
    return productDetail(data)
}

export const addProduct = async (params: AddProductParams) => {
    const {
        categoryId = 3,
        productName = '',
        productPrice = 0,
        stock = 0,
        productDescription = '',
        productNameEn = '',
        productDescriptionEn = '',
        product_img = '',
        images = [],
        lang = 'zh-TW'
    } = params

    const formData = new FormData();

    formData.append('category_id', String(categoryId));
    formData.append('product_name', productName);
    formData.append('product_price', String(productPrice));
    formData.append('stock', String(stock));
    formData.append('product_description', productDescription);
    formData.append('product_name_en', productNameEn);
    formData.append('product_description_en', productDescriptionEn);

    if (product_img)
        formData.append('product_img', product_img);

    const response = await fetch(
        PRODUCTS_ADD,
        {
            method: 'POST',
            body: formData,
            headers: {
                'Accept-Language': lang,
            }
        }
    )

    const data = await response.json()
    return data
}
