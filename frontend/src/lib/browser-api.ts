import type {
  AccountProfile,
  AdminCategory,
  AdminCustomOrder,
  AdminProduct,
  AuthResponse,
  DashboardMetrics,
  OrderSummary,
  ProductReviewSummary,
  RazorpayOrderResponse,
  ReviewEligibility,
  TrackOrderResponse,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:5252";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  isFormData?: boolean;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (!options.isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body:
      options.body == null
        ? undefined
        : options.isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = "Something went wrong.";
    try {
      const json = (await response.json()) as { message?: string };
      message = json.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const browserApi = {
  signup: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => apiRequest<AuthResponse>("/api/auth/signup", { method: "POST", body: payload }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: payload }),

  getMe: (token: string) => apiRequest<AccountProfile>("/api/auth/me", { token }),

  getProfile: (token: string) => apiRequest<AccountProfile>("/api/account/profile", { token }),

  updateProfile: (token: string, payload: { fullName: string; phone: string }) =>
    apiRequest<AccountProfile["user"]>("/api/account/profile", {
      method: "PUT",
      token,
      body: payload,
    }),

  getAccountOrders: (token: string) => apiRequest<OrderSummary[]>("/api/account/orders", { token }),

  uploadImage: (formData: FormData) =>
    apiRequest<{ url: string }>("/api/store/uploads/image", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  createCustomOrder: (
    token: string | null,
    payload: {
      name: string;
      email: string;
      whatsAppNumber: string;
      occasion: string;
      size: string;
      colorPreference: string;
      characterDescription?: string;
      photoUrl?: string;
      baseMessage?: string;
      pincode?: string;
    },
  ) =>
    apiRequest<{ id: number; referenceCode: string; status: string; whatsappUrl: string }>(
      "/api/store/custom-orders",
      {
        method: "POST",
        token,
        body: payload,
      },
    ),

  createOrder: (
    token: string | null,
    payload: {
      customerName: string;
      email: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      paymentMethod: string;
      notes?: string;
      items: Array<{ productId: number; quantity: number }>;
    },
  ) =>
    apiRequest<{
      id: number;
      orderCode: string;
      status: string;
      paymentStatus: string;
      totalPriceInr: number;
    }>("/api/store/orders", {
      method: "POST",
      token,
      body: payload,
    }),

  createRazorpayOrder: (orderCode: string) =>
    apiRequest<RazorpayOrderResponse>("/api/store/payments/razorpay/order", {
      method: "POST",
      body: { orderCode },
    }),

  verifyRazorpayPayment: (payload: {
    orderCode: string;
    serverOrderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    apiRequest<{
      orderCode: string;
      status: string;
      paymentStatus: string;
    }>("/api/store/payments/razorpay/verify", {
      method: "POST",
      body: payload,
    }),

  trackOrder: (orderCode: string, phone: string) =>
    apiRequest<TrackOrderResponse>(
      `/api/store/orders/track/${orderCode}?phone=${encodeURIComponent(phone)}`,
    ),

  getProductReviews: (slug: string) =>
    apiRequest<ProductReviewSummary>(`/api/store/products/${slug}/reviews`),

  getReviewEligibility: (token: string, productId: number) =>
    apiRequest<ReviewEligibility>(`/api/account/reviews/eligibility/${productId}`, { token }),

  submitProductReview: (
    token: string,
    payload: {
      productId: number;
      orderId: number;
      rating: number;
      feedback?: string;
    },
  ) =>
    apiRequest<{
      message: string;
      review: {
        id: number;
        productId: number;
        orderId: number;
        rating: number;
        comment: string;
        isVerifiedPurchase: boolean;
      };
    }>("/api/account/reviews", {
      method: "POST",
      token,
      body: payload,
    }),

  getDashboard: (token: string) => apiRequest<DashboardMetrics>("/api/admin/dashboard", { token }),

  getAdminCategories: (token: string) =>
    apiRequest<AdminCategory[]>("/api/admin/categories", { token }),

  saveCategory: (
    token: string,
    payload: {
      id?: number;
      name: string;
      slug: string;
      description: string;
      priceRange: string;
      themeColor: string;
      imageUrl: string;
      sortOrder: number;
      isActive: boolean;
    },
  ) =>
    apiRequest<AdminCategory>(`/api/admin/categories${payload.id ? `/${payload.id}` : ""}`, {
      method: payload.id ? "PUT" : "POST",
      token,
      body: payload,
    }),

  deleteCategory: (token: string, id: number) =>
    apiRequest<{ message: string }>(`/api/admin/categories/${id}`, {
      method: "DELETE",
      token,
    }),

  getAdminProducts: (token: string) =>
    apiRequest<AdminProduct[]>("/api/admin/products", { token }),

  saveProduct: (token: string, payload: Record<string, unknown> & { id?: number }) =>
    apiRequest<AdminProduct>(`/api/admin/products${payload.id ? `/${payload.id}` : ""}`, {
      method: payload.id ? "PUT" : "POST",
      token,
      body: payload,
    }),

  uploadProductImages: (token: string, productId: number, files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    return apiRequest<{
      images: AdminProduct["images"];
      heroImageUrl: string;
      imageCount: number;
    }>(`/api/admin/products/${productId}/images`, {
      method: "POST",
      token,
      body: formData,
      isFormData: true,
    });
  },

  reorderProductImages: (token: string, productId: number, imageIds: number[]) =>
    apiRequest<{
      images: AdminProduct["images"];
      heroImageUrl: string;
      imageCount: number;
    }>(`/api/admin/products/${productId}/images/order`, {
      method: "PUT",
      token,
      body: { imageIds },
    }),

  deleteProductImage: (token: string, productId: number, imageId: number) =>
    apiRequest<{
      message: string;
      images: AdminProduct["images"];
      heroImageUrl: string;
      imageCount: number;
    }>(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
      token,
    }),

  deleteProduct: (token: string, id: number) =>
    apiRequest<{ message: string }>(`/api/admin/products/${id}`, {
      method: "DELETE",
      token,
    }),

  adjustInventory: (
    token: string,
    payload: { productId: number; quantityChange: number; reason: string; notes?: string },
  ) =>
    apiRequest<{ id: number; name: string; stockQuantity: number }>("/api/admin/inventory/adjust", {
      method: "POST",
      token,
      body: payload,
    }),

  getAdminOrders: (token: string) => apiRequest<OrderSummary[]>("/api/admin/orders", { token }),

  updateOrderStatus: (
    token: string,
    id: number,
    payload: { status: string; trackingNumber?: string },
  ) =>
    apiRequest<OrderSummary>(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      token,
      body: payload,
    }),

  getAdminCustomOrders: (token: string) =>
    apiRequest<AdminCustomOrder[]>("/api/admin/custom-orders", { token }),

  updateAdminCustomOrder: (
    token: string,
    id: number,
    payload: { status: string; quoteAmountInr?: number; adminNotes?: string },
  ) =>
    apiRequest<AdminCustomOrder>(`/api/admin/custom-orders/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  getAdminUsers: (token: string) =>
    apiRequest<
      Array<{
        id: number;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAtUtc: string;
      }>
    >("/api/admin/users", { token }),
};
