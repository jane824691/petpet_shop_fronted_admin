export interface LoginParams {
    account: string
    password: string
}

export interface LoginResponse {
    success: boolean
    code: number
    sid: number
    account: string
}