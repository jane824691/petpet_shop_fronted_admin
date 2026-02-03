import { PRODUCTS, PRODUCTS_ADD } from './config'

interface SearchProductParams {
    page?: number
    searchWord?: string
    priceLow?: number
    priceHigh?: number
    sortBy?: string
    tag?: number
    lang?: string
}

interface ProductFile {
    productImg?: File
    photoContentMain?: File
    photoContentSecondary?: File
    photoContent?: File
}

interface AddProductParams {
    categoryId?: number,
    productName?: string,
    productPrice?: number,
    stock?: number,
    productDescription?: string,
    productNameEn?: string,
    productDescriptionEn?: string,
    files?: ProductFile,
    lang?: string
}

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
            cache: 'no-store',
        }
    )

    const data = await response.json()
    return data
}

export const addProducts = async (params: AddProductParams = {}) => {
    const {
        categoryId = 3,
        productName = '',
        productPrice = 0,
        stock = 0,
        productDescription = '',
        productNameEn = '',
        productDescriptionEn = '',
        files = {},
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

    // 圖片（多張）
    if (files.productImg)
        formData.append('productImg', files.productImg);

    if (files.photoContentMain)
        formData.append('photoContentMain', files.photoContentMain);

    if (files.photoContentSecondary)
        formData.append('photoContentSecondary', files.photoContentSecondary);

    if (files.photoContent)
        formData.append('photoContent', files.photoContent);


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
