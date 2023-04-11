import { AxiosInstance, AxiosRequestConfig } from 'axios';

const generateService = (axiosInstance: AxiosInstance) => {
  return class {
    public static get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
      return axiosInstance.get(url, {
        params,
      });
    }

    public static post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.post(url, body, config);
    }

    public static put<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.put(url, body, config);
    }

    public static patch<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.patch(url, body, config);
    }

    public static delete<T>(url: string): Promise<T> {
      return axiosInstance.delete(url);
    }
  };
};

export default generateService;
