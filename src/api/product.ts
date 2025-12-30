import { PRODUCT } from './config'

interface ProductParams {
    page?: number
    searchWord?: string
    priceLow?: number
    priceHigh?: number
    sortBy?: string
    tag?: number
    lang?: string
}

export const getProducts = async (params: ProductParams = {}) => {
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
        PRODUCT + `?${queryParams.toString()}`,
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

