// export const API_SERVER = 'http://localhost:3002'
export const API_SERVER = 'https://petpet-shop-backend.zeabur.app'

export const LOGIN = API_SERVER + '/login-jwt' // method: POST, 登入
export const LOGOUT = API_SERVER + '/logout' // method: POST, 登出
export const AUTH_CHECK = API_SERVER + '/auth/check' // method: GET, 驗證登入

export const PRODUCTS = API_SERVER + '/product/api' // method: GET, 商品總列表
export const ONE_PRODUCT = API_SERVER + '/product/one' // method: GET, 單一商品
export const PRODUCTS_ADD = API_SERVER + '/product/add-v2' // method: POST, 新增商品

