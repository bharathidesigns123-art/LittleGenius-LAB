import type {
  Category,
  HomeData,
  ProductDetail,
  ProductReviewSummary,
  ProductSummary,
  Review,
} from "@/lib/types";

export const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Animal Kingdom",
    slug: "animals",
    description: "Chubby proportions, rounded edges, and pastel finishes tiny hands love.",
    priceRange: "Rs. 300-500",
    themeColor: "#F5C400",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Robot Crew",
    slug: "robots",
    description: "Friendly robot sidekicks with storybook colour blocking and zero sharp edges.",
    priceRange: "Rs. 400-700",
    themeColor: "#1A3C6E",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Chibi Squad",
    slug: "chibi",
    description: "Big heads, tiny bodies, and oversized expressions that turn desks into happy corners.",
    priceRange: "Rs. 500-900",
    themeColor: "#E05C1A",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
];

export const fallbackProducts: ProductSummary[] = [
  {
    id: 1,
    name: "Chubby Elephant - Pastel Pink Edition",
    slug: "chubby-elephant-pastel-pink",
    shortDescription: "A round, squishy-looking elephant toy with big ears and a gentle smile.",
    priceInr: 400,
    badge: "Bestseller",
    heroImageUrl: fallbackCategories[0].imageUrl,
    colourway: "Pastel pink with soft grey accents",
    material: "Child-safe PLA",
    shipsIn: "2 business days",
    sizeMm: 100,
    stockQuantity: 14,
    isFeatured: true,
    averageRating: 5,
    reviewCount: 1,
    categorySlug: "animals",
    categoryName: "Animal Kingdom",
    tagline: "Your child's new best friend.",
  },
  {
    id: 2,
    name: "Captain Bolt - Cartoon Robot Toy",
    slug: "captain-bolt-cartoon-robot",
    shortDescription: "A cheerful little robot with big eyes and bright colours.",
    priceInr: 550,
    badge: "New Arrival",
    heroImageUrl: fallbackCategories[1].imageUrl,
    colourway: "Teal, mustard, and cream",
    material: "Child-safe PLA",
    shipsIn: "2 business days",
    sizeMm: 120,
    stockQuantity: 12,
    isFeatured: true,
    averageRating: 5,
    reviewCount: 1,
    categorySlug: "robots",
    categoryName: "Robot Crew",
    tagline: "Built for adventures, designed for smiles.",
  },
  {
    id: 3,
    name: "Chibi Friend - Custom Character Figurine",
    slug: "chibi-friend-custom-character",
    shortDescription: "A cute, big-headed chibi figurine with a personality that's impossible not to love.",
    priceInr: 700,
    badge: "Great Gift",
    heroImageUrl: fallbackCategories[2].imageUrl,
    colourway: "Peach, cream, and pastel blue",
    material: "Child-safe PLA",
    shipsIn: "2 business days",
    sizeMm: 150,
    stockQuantity: 8,
    isFeatured: true,
    averageRating: 5,
    reviewCount: 1,
    categorySlug: "chibi",
    categoryName: "Chibi Squad",
    tagline: "Big heads. Bigger smiles.",
  },
];

export const fallbackReviews: Review[] = [
  {
    customerName: "Priya M.",
    customerLocation: "Chennai",
    rating: 5,
    quote: "My daughter carries her elephant everywhere!",
  },
  {
    customerName: "Rajan K.",
    customerLocation: "Bengaluru",
    rating: 5,
    quote: "Captain Bolt showed up beautifully packed and instantly became the hero of bedtime stories.",
  },
  {
    customerName: "Deepa S.",
    customerLocation: "Coimbatore",
    rating: 5,
    quote: "The custom figurine looked adorable and the WhatsApp updates made the whole process feel trustworthy.",
  },
];

const fallbackElephantImages = [
  {
    id: 0,
    imageUrl: fallbackProducts[0].heroImageUrl,
    sortOrder: 0,
    width: 1200,
    height: 1200,
  },
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 1,
    width: 1200,
    height: 1200,
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 2,
    width: 1200,
    height: 1200,
  },
];

export const fallbackHomeData: HomeData = {
  hero: {
    eyebrow: "Made in Tamil Nadu, India",
    title: "Where imagination gets a shape",
    subtitle:
      "Handcrafted 3D printed toys for playful shelves, heartfelt gifting, and one-of-a-kind custom memories.",
    primaryCta: "Explore the Magic",
    secondaryCta: "Design My Custom Toy",
  },
  trustBar: ["Made in Tamil Nadu", "Child-safe PLA", "Ships in 2 Days", "WhatsApp support"],
  categories: fallbackCategories,
  featuredProducts: fallbackProducts,
  reviews: fallbackReviews,
};

export const fallbackProductDetails: Record<string, ProductDetail> = {
  "chubby-elephant-pastel-pink": {
    product: {
      id: 1,
      name: "Chubby Elephant - Pastel Pink Edition",
      slug: "chubby-elephant-pastel-pink",
      sku: "LGL-ANI-001",
      shortDescription: fallbackProducts[0].shortDescription,
      fullDescription:
        "Meet your new little friend. This chubby 3D printed elephant is designed to be everything a toy should be - soft-looking, colourful, and impossible to put down.",
      priceInr: 400,
      badge: "Bestseller",
      heroImageUrl: fallbackProducts[0].heroImageUrl,
      colourway: "Pastel pink with soft grey accents",
      material: "Child-safe PLA",
      finish: "Smooth matte surface",
      shipsIn: "2 business days",
      madeIn: "Tamil Nadu, India",
      tagline: "Your child's new best friend.",
      sizeMm: 100,
      stockQuantity: 14,
      averageRating: 5,
      reviewCount: 1,
      categorySlug: "animals",
      categoryName: "Animal Kingdom",
    },
    images: fallbackElephantImages,
    reviews: fallbackReviews,
    relatedProducts: fallbackProducts
      .filter((product) => product.slug !== "chubby-elephant-pastel-pink")
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceInr: product.priceInr,
        heroImageUrl: product.heroImageUrl,
      })),
  },
};

export const fallbackProductReviewSummaries: Record<string, ProductReviewSummary> = {
  "chubby-elephant-pastel-pink": {
    productId: 1,
    averageRating: 5,
    reviewCount: 1,
    reviews: [
      {
        id: 1,
        customerName: fallbackReviews[0].customerName,
        customerLocation: fallbackReviews[0].customerLocation,
        rating: fallbackReviews[0].rating,
        comment: fallbackReviews[0].quote,
        isVerifiedPurchase: true,
        createdAtUtc: new Date(Date.UTC(2026, 0, 2)).toISOString(),
        updatedAtUtc: new Date(Date.UTC(2026, 0, 2)).toISOString(),
      },
    ],
  },
};
