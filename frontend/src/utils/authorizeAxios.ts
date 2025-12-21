import axios from 'axios'

/**
 * Không thẻ import {store} from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp InJect store là kỹ thuật khi cần sử dụng biến redux store từ file ngoài phạm vi component
 * Hiều đơn giản khi ứng dụng bắt đầu chạy lên code sẽ chạy vào main.jsx, từ bên đố chúng ta gọi injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore
export const injectStore = (mainStore) => {
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

    return response
  },
  (error) => {
    //Kỹ thuật chặn spam click
    /**Xử lý refresh token tự động */
    //TH1: Nếu nhận mã 401 từ be thì call api đăng xuất
    // if (error.response?.status === 401) {
    //   axiosReduxStore.dispatch(logoutUserAPI(false))
    // }
  }

  //Mọi mã status code nằm ngoài khoảng 200-299 đều coi là lỗi
  //console.log error ra là sẽ thấy cấu trúc data dẫn đến message lỗi
)

export default authorizeAxiosInstance
