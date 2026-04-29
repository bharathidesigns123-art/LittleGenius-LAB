export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceRange: string;
  themeColor: string;
  imageUrl: string;
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  priceInr: number;
  compareAtPriceInr?: number | null;
  badge: string;
  heroImageUrl: string;
  colourway: string;
  material: string;
  shipsIn: string;
  sizeMm: number;
  stockQuantity: number;
  isFeatured: boolean;
  averageRating?: number;
  reviewCount?: number;
  categorySlug: string;
  categoryName: string;
  tagline?: string;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  sortOrder: number;
  width: number;
  height: number;
};

export type Review = {
  customerName: string;
  customerLocation: string;
  rating: number;
  quote: string;
};

export type ProductDetail = {
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    fullDescription: string;
    priceInr: number;
    compareAtPriceInr?: number | null;
    badge: string;
    heroImageUrl: string;
    colourway: string;
    material: string;
    finish: string;
    shipsIn: string;
    madeIn: string;
    tagline: string;
    sizeMm: number;
    stockQuantity: number;
    averageRating?: number;
    reviewCount?: number;
    categorySlug: string;
    categoryName: string;
  };
  images: ProductImage[];
  reviews: Review[];
  relatedProducts: Array<{
    id: number;
    name: string;
    slug: string;
    priceInr: number;
    heroImageUrl: string;
  }>;
};

export type HomeData = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  trustBar: string[];
  categories: Category[];
  featuredProducts: ProductSummary[];
  reviews: Review[];
};

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Address = {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
};

export type AccountProfile = {
  user: AuthUser;
  addresses: Address[];
};

export type OrderSummary = {
  id: number;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPriceInr: number;
  createdAtUtc: string;
  trackingNumber?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    totalPriceInr: number;
  }>;
};

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  imageUrl: string;
  priceInr: number;
  quantity: number;
};

export type TrackOrderResponse = {
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  createdAtUtc: string;
  items: Array<{
    productName: string;
    quantity: number;
    totalPriceInr: number;
  }>;
};

export type RazorpayOrderResponse = {
  publicKey: string;
  callbackUrl: string;
  orderCode: string;
  customer: {
    customerName: string;
    email: string;
    phone: string;
  };
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
  };
};

export type DashboardMetrics = {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  lowStockProducts: number;
};

export type ProductReviewEntry = {
  id: number;
  customerName: string;
  customerLocation: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type ProductReviewSummary = {
  productId: number;
  averageRating: number;
  reviewCount: number;
  reviews: ProductReviewEntry[];
};

export type ReviewEligibility = {
  canReview: boolean;
  reason?: string | null;
  eligibleOrders: Array<{
    orderId: number;
    orderCode: string;
    deliveredAtUtc: string;
    existingReview?: {
      id: number;
      rating: number;
      comment: string;
    } | null;
  }>;
};

export type AdminCategory = Category & {
  isActive?: boolean;
  sortOrder?: number;
};

export type AdminProduct = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  priceInr: number;
  compareAtPriceInr?: number | null;
  colourway: string;
  material: string;
  finish: string;
  shipsIn: string;
  madeIn: string;
  tagline: string;
  sizeMm: number;
  stockQuantity: number;
  lowStockThreshold: number;
  displayOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  badge: string;
  heroImageUrl: string;
  images: ProductImage[];
  imageCount: number;
  categoryName: string;
};

export type AdminCustomOrder = {
  id: number;
  referenceCode: string;
  name: string;
  email: string;
  whatsAppNumber: string;
  occasion: string;
  size: string;
  colorPreference: string;
  photoUrl?: string | null;
  characterDescription?: string | null;
  status: string;
  quoteAmountInr?: number | null;
  adminNotes?: string | null;
  createdAtUtc: string;
};
