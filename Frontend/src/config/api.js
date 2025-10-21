const API_BASE = import.meta.env.VITE_API_BASE;

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
  GHL_OTP: `${API_BASE}/ghl/get-ghl-otp`,

  GET_USER: `${API_BASE}/admin/users`,
  CREATE_USER: `${API_BASE}/admin/create-user`,
  UPDATE_USER: `${API_BASE}/admin/update-user`,
  DELETE_USER: `${API_BASE}/admin/delete-user`,
  RESET_USER: `${API_BASE}/admin/reset-user`,
};

const SHARED_KEY = import.meta.env.VITE_SHARED_KEY;
const encodedKey = btoa(SHARED_KEY);

export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      "X-APP-KEY": encodedKey,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    // if (!response.ok) {
    //   throw new Error(data.message || `HTTP error! status: ${response.status}`);
    // }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(data.message || "Invalid email or password");
      }
      if (response.status === 404) {
        throw new Error(data.message || "User not found");
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request failed:", error.message);
    throw error;
  }
};
