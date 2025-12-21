import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import type { LoginData } from './types'

export const loginAPI = async (data: LoginData) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}user/login`,
    data
  )
  return response.data
}
