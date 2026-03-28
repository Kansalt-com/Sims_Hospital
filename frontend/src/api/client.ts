import axios from "axios";

const normalizeBasePath = (value?: string) => {
  if (!value || value === "/") {
    return "";
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isLocalDevUrl = (value?: string) =>
  Boolean(value && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value));

type ApiErrorPayload = {
  error?: boolean;
  message?: string;
  code?: string;
};

const getRuntimeBase = () => {
  if (import.meta.env.VITE_API_BASE_URL && (import.meta.env.DEV || !isLocalDevUrl(import.meta.env.VITE_API_BASE_URL))) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:4000/api";
  }

  const basePath = normalizeBasePath(import.meta.env.BASE_URL);
  return `${basePath}/api`;
};

const baseURL = getRuntimeBase();
const AUTH_EVENT = "auth:unauthorized";

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

const isTokenExpired = (token: string) => {
  try {
    const [, payload] = token.split(".");
    const parsed = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return parsed.exp ? parsed.exp * 1000 <= Date.now() : false;
  } catch {
    return false;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sims_token");
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem("sims_token");
      window.dispatchEvent(new CustomEvent(AUTH_EVENT));
      throw new axios.Cancel("Session expired");
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError<ApiErrorPayload>(error) && error.response?.status === 401) {
      localStorage.removeItem("sims_token");
      window.dispatchEvent(
        new CustomEvent(AUTH_EVENT, {
          detail: {
            message: error.response.data?.message ?? "Session expired",
            code: error.response.data?.code ?? "UNAUTHORIZED",
          },
        }),
      );
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export type { ApiErrorPayload };
export const authEventName = AUTH_EVENT;
