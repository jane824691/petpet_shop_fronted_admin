import { PRODUCTS, ONE_PRODUCT, PRODUCTS_ADD } from './config'
import type {
    AddProductParams,
    ProductsParams,
    ProductsListPageRaw,
    ProductDetailParams,
    SearchProductParams,
} from '../types/productTypes'

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
            credentials: 'include',
            headers: {
                'Accept-Language': lang,
            },
        }
    )
    if (response.status === 401 || response.status === 403) location.assign('/login')

    const data = (await response.json()) as ProductsListPageRaw

    return {
        page: data.page,
        totalPages: data.totalPages,
        totalRows: data.totalRows,
        rows: data.rows,
    }
}

export const getProduct = async (pid: number): Promise<ProductDetailParams> => {
    const response = await fetch(
        ONE_PRODUCT + `/${pid}`,
        {
            credentials: 'include',
            headers: {
                'Accept-Language': 'zh-TW',
            },
        }
    )
    if (response.status === 401 || response.status === 403) location.assign('/login')
    return (await response.json()) as ProductDetailParams
}

export const addProduct = async (params: AddProductParams) => {
    const {
        categoryId = 3,
        nameZh = '',
        price = 0,
        stock = 0,
        descriptionZh = '',
        nameEn = '',
        descriptionEn = '',
        productImg = '',
        images = [],
        lang = 'zh-TW'
    } = params

    const formData = new FormData();

    formData.append('categoryId', String(categoryId));
    formData.append('nameZh', nameZh);
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('descriptionZh', descriptionZh);
    formData.append('nameEn', nameEn);
    formData.append('descriptionEn', descriptionEn);

    if (productImg)
        formData.append('productImg', productImg);

    const response = await fetch(
        PRODUCTS_ADD,
        {
            method: 'POST',
            credentials: 'include',
            body: formData,
            headers: {
                'Accept-Language': lang,
            }
        }
    )
    if (response.status === 401 || response.status === 403) location.assign('/login')

    const data = await response.json()
    return data
}
