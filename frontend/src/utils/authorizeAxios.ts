import axios from "axios";
import { logoutAPI } from "@/redux/slices/userSlice";
import { toast } from "sonner";
import type { AppDispatch } from "@/redux/store";

let axiosReduxStore: {
  dispatch: AppDispatch;
};

export const injectStore = (mainStore: { dispatch: AppDispatch }) => {
  axiosReduxStore = mainStore;
};

const authorizeAxiosInstance = axios.create({
  withCredentials: true,
  timeout: 1000 * 60 * 10,
});

authorizeAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios error:", error);
    if (error.response?.status === 401) {
      console.log("Phiên đăng nhập đã hết hạn, đang đăng xuất...");
      axiosReduxStore?.dispatch(logoutAPI());
    }

    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Đã xảy ra lỗi";

    const translatedMessage =
      backendMessage === "Network Error"
        ? "Không thể kết nối đến máy chủ"
        : backendMessage;

    toast.error(translatedMessage);
    return Promise.reject(error);
  },
);

export default authorizeAxiosInstance;
