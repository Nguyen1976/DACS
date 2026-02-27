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
      console.log("Unauthorized, logging out...");
      axiosReduxStore?.dispatch(logoutAPI());
    }

    toast.error(error.message);
    return Promise.reject(error);
  },
);

export default authorizeAxiosInstance;
