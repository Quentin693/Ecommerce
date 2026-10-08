import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Types pour l'API
export interface Car {
  id: string;
  name: string;
  brand: string;
  model?: string;
  year?: number;
  pricePerDay: number;
  category: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  features?: string[];
  specs?: {
    engine?: string;
    power?: string;
    acceleration?: string;
    topSpeed?: string;
    transmission?: string;
    seats?: number;
  };
  available: boolean;
  seats?: number;
  transmission?: "automatic" | "manual" | string;
}

export interface CarInput {
  name: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  pricePerDay: number;
  category: "supercar" | "luxury" | "suv" | "convertible";
  imageUrl?: string;
  images?: string[];
  available?: boolean;
  features?: string[];
  seats?: number;
  transmission?: "automatic" | "manual";
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type DeliveryStatus =
  | "to_schedule"
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "returned";

export interface Reservation {
  id: string;
  carId: string;
  car?: Car;
  userId: string;
  user?: User;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryStatus?: DeliveryStatus;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "admin" | "user";
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "handled";
  createdAt: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  user: User;
}

// API calls
export const carsApi = {
  getAll: (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    page?: number;
  }) => api.get<{ data: Car[]; total: number; page: number }>("/cars", { params }),

  getById: (id: string) => api.get<Car>(`/cars/${id}`),
};

export const reservationsApi = {
  create: (data: {
    carId: string;
    startDate: string;
    endDate: string;
  }) => api.post<Reservation>("/bookings", data),

  getMyReservations: () => api.get<Reservation[]>("/bookings"),

  cancel: (id: string) => api.patch<Reservation>(`/bookings/${id}/cancel`),
};

export const contactApi = {
  send: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => api.post<ContactMessage>("/contact", data),
};

export const adminApi = {
  getBookings: () => api.get<Reservation[]>("/bookings/admin/all"),
  updateBookingStatus: (id: string, status: BookingStatus) =>
    api.patch<Reservation>(`/bookings/${id}/status`, { status }),
  updateDelivery: (
    id: string,
    data: {
      deliveryStatus?: DeliveryStatus;
      deliveryAddress?: string;
      deliveryCity?: string;
    }
  ) => api.patch<Reservation>(`/bookings/${id}/delivery`, data),
  getUsers: () => api.get<User[]>("/users"),
  updateRole: (id: string, role: "admin" | "user") =>
    api.patch<User>(`/users/${id}/role`, { role }),
  getCars: () =>
    api.get<{ data: Car[]; total: number }>("/cars", { params: { limit: 100 } }),
  createCar: (data: CarInput) => api.post<Car>("/cars", data),
  updateCar: (id: string, data: CarInput) => api.patch<Car>(`/cars/${id}`, data),
  deleteCar: (id: string) => api.delete(`/cars/${id}`),
  getMessages: () => api.get<ContactMessage[]>("/contact"),
  updateMessageStatus: (id: string, status: ContactMessage["status"]) =>
    api.patch<ContactMessage>(`/contact/${id}`, { status }),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post<AuthResponse>("/auth/register", data),

  me: () => api.get<User>("/auth/me"),
};
