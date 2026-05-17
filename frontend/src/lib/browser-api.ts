import type {
  AccountProfile,
  AdminCategory,
  AdminCustomOrder,
  AdminProduct,
  AdminUserListResponse,
  AdminUserRow,
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
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  isFormData?: boolean;
};

type BlobUploadResponse = {
  uploadUrl: string;
  readUrl?: string;
  blobUrl?: string;
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

async function uploadBlobFile(file: File, token?: string | null): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const sasResp = await apiRequest<BlobUploadResponse>("/api/store/uploads/sas", {
    method: "POST",
    token,
    body: { fileName, contentType: file.type },
  });

  const uploadUrl = sasResp.uploadUrl || sasResp.blobUrl;
  if (!uploadUrl) {
    throw new Error("Failed to get upload URL");
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Upload failed: ${uploadRes.status} ${text || uploadRes.statusText}`);
  }

  // Return the clean blobUrl (without SAS token) so it can be stored permanently in the DB.
  // The frontend asset-url helper will append a fresh SAS token for viewing.
  return sasResp.blobUrl || sasResp.readUrl?.split("?")[0] || uploadUrl.split("?")[0];
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

  forgotPassword: (payload: { email: string }) =>
    apiRequest<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: payload }),

  validatePasswordResetToken: (payload: { token: string }) =>
    apiRequest<{ isValid: boolean }>("/api/auth/reset-password/validate", {
      method: "POST",
      body: payload,
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    apiRequest<{ message: string }>("/api/auth/reset-password", { method: "POST", body: payload }),

  getMe: (token: string) => apiRequest<AccountProfile>("/api/auth/me", { token }),

  getProfile: (token: string) => apiRequest<AccountProfile>("/api/account/profile", { token }),

  updateProfile: (token: string, payload: { fullName: string; phone: string }) =>
    apiRequest<AccountProfile["user"]>("/api/account/profile", {
      method: "PUT",
      token,
      body: payload,
    }),

  getAccountOrders: (token: string) => apiRequest<OrderSummary[]>("/api/account/orders", { token }),

  uploadImage: async (formData: FormData) => {
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");
    return { url: await uploadBlobFile(file) };
  },


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
      guestId?: string | null;
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

  getGuestOrders: (guestId: string) =>
    apiRequest<OrderSummary[]>(`/api/store/guest-orders?guestId=${encodeURIComponent(guestId)}`),

  mergeGuestOrders: (token: string, guestId: string) =>
    apiRequest<{ merged: number; message?: string }>("/api/store/orders/merge-guest", {
      method: "POST",
      token,
      body: { guestId },
    }),

  prepareRazorpayCheckout: (
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
      guestId?: string | null;
      items: Array<{ productId: number; quantity: number }>;
    },
  ) =>
    apiRequest<RazorpayOrderResponse>("/api/store/payments/razorpay/prepare", {
      method: "POST",
      token,
      body: payload,
    }),

  verifyRazorpayPayment: (payload: {
    orderCode?: string | null;
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

  cancelAccountOrder: (token: string, id: number, reason?: string) =>
    apiRequest<OrderSummary>(`/api/account/orders/${id}/cancel`, {
      method: "POST",
      token,
      body: { reason },
    }),

  trackOrder: (orderCode: string, phone: string) =>
    apiRequest<TrackOrderResponse>(
      `/api/store/orders/track/${orderCode}?phone=${encodeURIComponent(phone)}`,
    ),

  trackCustomOrder: (referenceCode: string, phone: string) =>
    apiRequest<TrackOrderResponse>(
      `/api/store/custom-orders/track/${referenceCode}?phone=${encodeURIComponent(phone)}`,
    ),

  cancelTrackedOrder: (orderCode: string, phone: string, reason?: string) =>
    apiRequest<TrackOrderResponse>(`/api/store/orders/track/${orderCode}/cancel`, {
      method: "POST",
      body: { phone, reason },
    }),

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

  uploadCategoryImage: (token: string, file: File) => uploadBlobFile(file, token),

  getAdminProducts: (token: string) =>
    apiRequest<AdminProduct[]>("/api/admin/products", { token }),

  saveProduct: (token: string, payload: Record<string, unknown> & { id?: number }) =>
    apiRequest<AdminProduct>(`/api/admin/products${payload.id ? `/${payload.id}` : ""}`, {
      method: payload.id ? "PUT" : "POST",
      token,
      body: payload,
    }),

  uploadProductImages: async (token: string, productId: number, files: File[]) => {
    if (!files || files.length === 0) return null;
    if (!productId) throw new Error('productId required');

    const uploadedUrls: string[] = [];

    for (const file of files) {
      uploadedUrls.push(await uploadBlobFile(file, token));
    }

    // register uploaded URLs with admin API
    return apiRequest<{
      images: AdminProduct["images"];
      heroImageUrl: string;
      imageCount: number;
    }>(`/api/admin/products/${productId}/images/register`, {
      method: "POST",
      token,
      body: { imageUrls: uploadedUrls },
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

  getAdminOrders: (
    token: string,
    filters?: { status?: string; dateFrom?: string; dateTo?: string; customer?: string },
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    if (filters?.customer) params.set("customer", filters.customer);
    return apiRequest<OrderSummary[]>(`/api/admin/orders${params.size ? `?${params}` : ""}`, { token });
  },

  updateOrderStatus: (
    token: string,
    id: number,
    payload: {
      status: string;
      trackingNumber?: string;
      packageWeightKg?: number | null;
      packageDimensionsCm?: string;
      courierPartner?: string;
    },
  ) =>
    apiRequest<OrderSummary>(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      token,
      body: payload,
    }),

  updateRefundStatus: (
    token: string,
    id: number,
    payload: { refundStatus: string; adminNote?: string },
  ) =>
    apiRequest<OrderSummary>(`/api/admin/orders/${id}/refund`, {
      method: "PUT",
      token,
      body: payload,
    }),

  getAdminCustomOrders: (
    token: string,
    filters?: { status?: string; dateFrom?: string; dateTo?: string; customer?: string },
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    if (filters?.customer) params.set("customer", filters.customer);
    return apiRequest<AdminCustomOrder[]>(`/api/admin/custom-orders${params.size ? `?${params}` : ""}`, {
      token,
    });
  },

  updateAdminCustomOrder: (
    token: string,
    id: number,
    payload: {
      status: string;
      quoteAmountInr?: number;
      adminNotes?: string;
      trackingNumber?: string;
      packageWeightKg?: number | null;
      packageDimensionsCm?: string;
      courierPartner?: string;
      refundStatus?: string;
      cancellationReason?: string;
    },
  ) =>
    apiRequest<AdminCustomOrder>(`/api/admin/custom-orders/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  getAdminUsers: (
    token: string,
    params?: { q?: string; page?: number; pageSize?: number; sort?: string },
  ) => {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.pageSize != null) search.set("pageSize", String(params.pageSize));
    if (params?.sort) search.set("sort", params.sort);
    const qs = search.size ? `?${search}` : "";
    return apiRequest<AdminUserListResponse>(`/api/admin/users${qs}`, { token });
  },

  createAdminUser: (
    token: string,
    payload: {
      fullName: string;
      email: string;
      phone?: string;
      password: string;
      role?: string;
      isActive?: boolean;
    },
  ) =>
    apiRequest<AdminUserRow>("/api/admin/users", {
      method: "POST",
      token,
      body: payload,
    }),

  updateAdminUser: (
    token: string,
    id: number,
    payload: {
      fullName: string;
      email: string;
      phone?: string;
      role: string;
      isActive: boolean;
      newPassword?: string | null;
    },
  ) =>
    apiRequest<AdminUserRow>(`/api/admin/users/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  patchAdminUserStatus: (token: string, id: number, isActive: boolean) =>
    apiRequest<AdminUserRow>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      token,
      body: { isActive },
    }),

  patchAdminUserRole: (token: string, id: number, role: string) =>
    apiRequest<AdminUserRow>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      token,
      body: { role },
    }),

  deleteAdminUser: (token: string, id: number) =>
    apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),
};
