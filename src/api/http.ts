import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

async function get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
  const response: AxiosResponse<TResponse> = await httpClient.get<TResponse>(url, config);

  return response.data;
}

async function post<TResponse, TRequest = unknown>(
  url: string,
  body: TRequest,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const response: AxiosResponse<TResponse> = await httpClient.post<TResponse>(url, body, config);

  return response.data;
}

async function put<TResponse, TRequest = unknown>(
  url: string,
  body: TRequest,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const response: AxiosResponse<TResponse> = await httpClient.put<TResponse>(url, body, config);

  return response.data;
}

async function remove<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
  const response: AxiosResponse<TResponse> = await httpClient.delete<TResponse>(url, config);

  return response.data;
}

export const http = {
  get,
  post,
  put,
  delete: remove,
};

export function getHttpErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Bilinmeyen bir hata oluştu.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'API isteği zaman aşımına uğradı.';
  }

  if (!error.response) {
    return 'API sunucusuna bağlanılamadı. JSON Server çalışıyor mu?';
  }

  if (error.response.status >= 500) {
    return 'Sunucuda beklenmeyen bir hata oluştu.';
  }

  if (error.response.status === 404) {
    return 'İstenen API kaynağı bulunamadı.';
  }

  return `API isteği başarısız oldu. Hata kodu: ${error.response.status}`;
}
