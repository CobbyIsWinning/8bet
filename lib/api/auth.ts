import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

export const register = async ({ phone, email, dob, idType, idNumber, password }: {
  phone?: string;
  email?: string;
  dob?: string;
  idType?: string;
  idNumber?: string;
  password: string;
}) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
    phone,
    email,
    dob,
    idType,
    idNumber,
    password,
  });
  return response.data;
};

export const login = async ({ identifier, password }: { identifier: string; password: string }) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { identifier, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get(ENDPOINTS.AUTH.ME);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};
