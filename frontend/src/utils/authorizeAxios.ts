import { logoutAPI, type UserState } from '@/redux/slices/userSlice'
import type {
  AsyncThunkAction,
  AsyncThunkConfig,
  EnhancedStore,
  StoreEnhancer,
  ThunkDispatch,
  Tuple,
  UnknownAction,
} from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import { interceptorLoadingElements } from '.'
import { toast } from 'sonner'

/**
 * Không thẻ import {store} from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp InJect store là kỹ thuật khi cần sử dụng biến redux store từ file ngoài phạm vi component
 * Hiều đơn giản khi ứng dụng bắt đầu chạy lên code sẽ chạy vào main.jsx, từ bên đố chúng ta gọi injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore: {
  dispatch: (arg0: AsyncThunkAction<void, void, AsyncThunkConfig>) => void
}
export const injectStore = (
  mainStore: EnhancedStore<
    { user: UserState },
    UnknownAction,
    Tuple<
      [
        StoreEnhancer<{
          dispatch: ThunkDispatch<{ user: UserState }, undefined, UnknownAction>
        }>,
        StoreEnhancer
      ]
    >
  >
) => {
  axiosReduxStore = mainStore
}

//Khời tạo 1 đối tượng axios (authorizeAxiosInstance) mục đích để custom vè cấu hình chung cho dự án
const authorizeAxiosInstance = axios.create()

//Thời gian chờ tối đa 10 phút
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: sẽ cho phép làm việc với cookie và bên backend dùng httpOnly thì sẽ tự động gửi kèm cookie trong req và k phải cấu hình req để gửi cookie nữa
authorizeAxiosInstance.defaults.withCredentials = true

//https://axios-http.com/docs/interceptors
authorizeAxiosInstance.interceptors.request.use(
  (config) => {
    interceptorLoadingElements(true)

    const accessToken = localStorage.getItem('token')

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

//Xử lý refreshToken
/**
 * Tạo 1 cái promise cho việc gọi api refreshToken
 * Sau khi refresh token xong xuôi mới retry lại nhiều api bị lỗi trước đó
 */

authorizeAxiosInstance.interceptors.response.use(
  (response) => {
    //Kỹ thuật chặn spam click
    interceptorLoadingElements(false)

    return response
  },
  (error: AxiosError) => {
    //Kỹ thuật chặn spam click
    /**Xử lý refresh token tự động */
    //TH1: Nếu nhận mã 401 từ be thì call api đăng xuất
    interceptorLoadingElements(false)
    console.log(error)
    if (error.response?.status === 401) {
      axiosReduxStore?.dispatch(logoutAPI())
    }

    let errorMessage = error?.message
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      errorMessage = (error.response.data as { message: string }).message
    }

    toast.error(`Error: ${errorMessage}`)

    return Promise.reject(error)
  }

  //Mọi mã status code nằm ngoài khoảng 200-299 đều coi là lỗi
  //console.log error ra là sẽ thấy cấu trúc data dẫn đến message lỗi
)

export default authorizeAxiosInstance
