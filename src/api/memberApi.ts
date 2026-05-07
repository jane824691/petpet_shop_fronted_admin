import { LOGIN } from './config'
import type {
    LoginParams,
    LoginResponse
} from '../types/memberTypes'

export const getLogin = async (params: Partial<LoginParams> = {
    account: '',
    password: ''
}) => {
    const response = await fetch(LOGIN, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return (await response.json()) as LoginResponse
}
