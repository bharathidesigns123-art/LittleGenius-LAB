import type { Category, HomeData, ProductDetail, ProductSummary, Review } from "@/lib/types";

export const siteBaseUrl = "https://littlegeniuslab.in";
export const whatsappNumber = "916383711863";
export const instagramUrl = "https://instagram.com/littlegenius_lab";
export const supportEmail = "hello@littlegeniuslab.in";

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsAppUrl = buildWhatsAppUrl(
  "Hi LittleGenius LAB, I need help choosing a personalized 3D printed gift.",
);

export const homeTrustBadges = [
  {
    title: "4.8/5 loved by customers",
    description: "Verified buyers mention smooth finish, gift-ready packaging, and quick help.",
  },
  {
    title: "Made direct in Tamil Nadu",
    description: "Buy from the maker, not a marketplace reseller, with clearer customization support.",
  },
  {
    title: "Dispatch clarity before checkout",
    description: "Ready products usually dispatch in 2-3 working days after payment.",
  },
  {
    title: "Replacement support",
    description: "Damaged or defective deliveries are replaced after quick WhatsApp verification.",
  },
];

export const deliveryPromiseCards = [
  {
    title: "Ready products",
    description: "Printed, checked, and dispatched in 2-3 working days for most catalog items.",
  },
  {
    title: "Custom gifts",
    description: "Design preview on WhatsApp first, then 5-7 working days after approval.",
  },
  {
    title: "Shipping across India",
    description: "South India often arrives faster; metro and non-metro estimates are shared at dispatch.",
  },
  {
    title: "COD status",
    description: "COD is temporarily unavailable. UPI, cards, and netbanking are supported through Razorpay.",
  },
];

export const competitorDifferentiators = [
  {
    title: "Faster delivery than marketplace browsing",
    description: "Clear production timelines, dispatch estimates, and WhatsApp updates from the same team that prints your order.",
  },
  {
    title: "Better customization support",
    description: "Send references, color notes, names, and gift messages directly before production starts.",
  },
  {
    title: "Premium packaging",
    description: "Each toy is checked, cushioned, and packed for gifting rather than bulk marketplace shipping.",
  },
  {
    title: "Direct-from-maker pricing",
    description: "No Etsy-style seller hunting. You get maker support, revisions for custom work, and transparent INR pricing.",
  },
];

export const homeFaqs = [
  {
    question: "How fast can I get a 3D printed gift in India?",
    answer:
      "Ready products usually dispatch in 2-3 working days and then take 2-5 days in transit depending on the delivery pincode.",
  },
  {
    question: "Can I request a personalized toy from a photo?",
    answer:
      "Yes. Share a photo or character description through the custom order page and the team will follow up on WhatsApp with a quote and design preview.",
  },
  {
    question: "Is COD available?",
    answer:
      "COD is temporarily unavailable. LittleGenius LAB currently supports prepaid checkout through UPI, cards, and netbanking.",
  },
  {
    question: "What happens if my product arrives damaged?",
    answer:
      "Share an unboxing video and photos within 48 hours of delivery. Verified damage or defects are handled with an easy replacement.",
  },
];

export const productFaqs = [
  {
    question: "Can I customize this product?",
    answer:
      "Small color, name, and gift-message requests can be discussed on WhatsApp before ordering. Fully custom figurines should be placed through the custom order page.",
  },
  {
    question: "When will this product dispatch?",
    answer:
      "Most ready products dispatch in 2-3 working days. Product-specific dispatch timing is shown near the buy buttons.",
  },
  {
    question: "Is it gift packed?",
    answer:
      "Orders are checked and packed securely for gifting. You can ask about special packaging or bulk gifts on WhatsApp.",
  },
];

export const customerReviews: Review[] = [
  {
    customerName: "Priya S.",
    customerLocation: "Chennai",
    rating: 5,
    quote:
      "The custom keychain looked exactly like the reference. The WhatsApp updates made it feel very safe to order.",
  },
  {
    customerName: "Rohit M.",
    customerLocation: "Bengaluru",
    rating: 5,
    quote:
      "Packaging was neat and the finish felt premium. It arrived in time for a birthday gift.",
  },
  {
    customerName: "Aishwarya K.",
    customerLocation: "Coimbatore",
    rating: 4,
    quote:
      "Loved that I could confirm the color on WhatsApp before they printed. Much easier than comparing sellers.",
  },
];

export const socialProofTiles = [
  {
    title: "Birthday desk toy",
    caption: "Shared after a Chennai birthday order",
  },
  {
    title: "Name keychain",
    caption: "Popular for return gifts and school bags",
  },
  {
    title: "Custom figurine",
    caption: "Preview approved on WhatsApp before print",
  },
  {
    title: "Gift-ready parcel",
    caption: "Packed for safer India-wide shipping",
  },
];

export const contentGuides = [
  {
    title: "Personalized Gift Guide for Kids in India",
    slug: "personalized-gift-guide-kids-india",
    category: "Gift Guides",
    summary:
      "Birthday, return gift, desk toy, and keepsake ideas with budget-friendly personalization options.",
    linksTo: ["/shop", "/custom-order", "/shop/chibi"],
    faqs: [
      {
        question: "What is a good personalized gift under Rs. 999?",
        answer:
          "Custom keychains, small desk figurines, and ready 3D printed toys are strong options because they feel personal without needing long production time.",
      },
      {
        question: "How early should I order a birthday gift?",
        answer:
          "Order ready products at least one week before the event. For custom gifts, leave 10-12 days for preview, approval, printing, and shipping.",
      },
    ],
    sections: [
      {
        heading: "Best for quick gifting",
        body:
          "Ready-to-ship toys and keychains work well when you need a gift quickly. Pick items with visible stock, clear dispatch timelines, and premium packaging notes.",
      },
      {
        heading: "Best for emotional gifting",
        body:
          "Custom figurines from photos make stronger keepsakes for birthdays, anniversaries, pet lovers, and family milestones because the design is made around a real memory.",
      },
      {
        heading: "Internal shopping path",
        body:
          "Start with best sellers, compare category pages, then use the custom order page when the recipient needs something one-of-a-kind.",
      },
    ],
  },
  {
    title: "How to Care for 3D Printed Toys and Keychains",
    slug: "3d-printed-toy-care-guide",
    category: "Product Care",
    summary:
      "Simple care rules for PLA toys, keychains, desk figures, and custom keepsakes in Indian weather.",
    linksTo: ["/shipping-policy", "/refund-policy", "/shop"],
    faqs: [
      {
        question: "Can PLA toys be washed?",
        answer:
          "Use a soft dry or lightly damp cloth. Avoid soaking, dishwashers, and high heat because PLA can soften in hot environments.",
      },
      {
        question: "How do I store 3D printed gifts?",
        answer:
          "Keep them away from direct sunlight, closed cars, and heavy pressure. A shelf, desk, or display box is ideal.",
      },
    ],
    sections: [
      {
        heading: "Keep away from heat",
        body:
          "PLA is sturdy for everyday display and gentle play, but it should not be left in direct sun, inside parked cars, or near heat sources.",
      },
      {
        heading: "Clean gently",
        body:
          "A microfiber cloth is enough for most dust. For keychains, wipe lightly and dry immediately before storing.",
      },
      {
        heading: "Handle small details carefully",
        body:
          "Custom figurines may include names, ears, accessories, or other fine details. Pack them separately when travelling.",
      },
    ],
  },
  {
    title: "Personalization FAQ Before You Order",
    slug: "personalization-faq-custom-3d-gifts",
    category: "Personalization FAQ",
    summary:
      "Answers about photo quality, WhatsApp approval, revisions, production time, and what can be customized.",
    linksTo: ["/custom-order", "/how-it-works", "/shop"],
    faqs: [
      {
        question: "Do I need a perfect photo?",
        answer:
          "A clear front-facing photo helps, but you can also add a written description for hairstyle, outfit, colors, and small accessories.",
      },
      {
        question: "Do I pay before seeing the custom design?",
        answer:
          "The team first discusses the request and quote on WhatsApp. Production begins only after details are confirmed.",
      },
    ],
    sections: [
      {
        heading: "What can be personalized",
        body:
          "Names, colors, character notes, base messages, and gift occasions can be discussed. Larger shape changes need a custom order quote.",
      },
      {
        heading: "How approval works",
        body:
          "The team shares updates on WhatsApp so you can confirm important details before production starts.",
      },
      {
        heading: "How long it takes",
        body:
          "Most custom orders need 5-7 working days after design approval, plus transit time based on your pincode.",
      },
    ],
  },
];

export const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Personalized Gifts",
    slug: "custom",
    description: "Photo-based figurines, names, colors, and keepsakes made with WhatsApp approval.",
    priceRange: "From Rs. 800",
    themeColor: "#ef314d",
    imageUrl: "/android-chrome-512x512.png",
  },
  {
    id: 2,
    name: "Keychains",
    slug: "keychains",
    description: "Custom name, anime-style, and return gift keychains with direct maker support.",
    priceRange: "Rs. 199-599",
    themeColor: "#ffbe1a",
    imageUrl: "/android-chrome-512x512.png",
  },
  {
    id: 3,
    name: "Desk Toys",
    slug: "desk-toys",
    description: "Small 3D printed toys and collectibles for shelves, desks, and gifting.",
    priceRange: "Rs. 299-999",
    themeColor: "#155eb5",
    imageUrl: "/android-chrome-512x512.png",
  },
  {
    id: 4,
    name: "Chibi Figurines",
    slug: "chibi",
    description: "Cute character-style figurines with smooth PLA finishes and gift-ready packaging.",
    priceRange: "From Rs. 699",
    themeColor: "#72bf2e",
    imageUrl: "/android-chrome-512x512.png",
  },
];

export const fallbackProducts: ProductSummary[] = [
  {
    id: 101,
    name: "Personalized Name Keychain",
    slug: "personalized-name-keychain",
    shortDescription: "A custom 3D printed name keychain for bags, keys, and return gifts.",
    priceInr: 299,
    compareAtPriceInr: 399,
    badge: "Best seller",
    heroImageUrl: "/android-chrome-512x512.png",
    colourway: "Custom colors",
    material: "PLA",
    shipsIn: "Ships in 2 days",
    sizeMm: 80,
    stockQuantity: 12,
    isFeatured: true,
    averageRating: 4.8,
    reviewCount: 28,
    categorySlug: "keychains",
    categoryName: "Keychains",
    tagline: "Fast personalized gifting",
  },
  {
    id: 102,
    name: "Custom Chibi Desk Figurine",
    slug: "custom-chibi-desk-figurine",
    shortDescription: "A cute chibi-style keepsake designed from your photo and notes.",
    priceInr: 899,
    compareAtPriceInr: 1099,
    badge: "Custom pick",
    heroImageUrl: "/android-chrome-512x512.png",
    colourway: "Made to order",
    material: "PLA",
    shipsIn: "Ships in 6 days",
    sizeMm: 120,
    stockQuantity: 8,
    isFeatured: true,
    averageRating: 4.9,
    reviewCount: 17,
    categorySlug: "custom",
    categoryName: "Personalized Gifts",
    tagline: "Made from your memory",
  },
  {
    id: 103,
    name: "Mini Desk Toy Gift",
    slug: "mini-desk-toy-gift",
    shortDescription: "A small 3D printed collectible for birthdays, desks, and display shelves.",
    priceInr: 499,
    compareAtPriceInr: 599,
    badge: "Ready to ship",
    heroImageUrl: "/android-chrome-512x512.png",
    colourway: "Pastel mix",
    material: "PLA",
    shipsIn: "Ships in 2 days",
    sizeMm: 90,
    stockQuantity: 15,
    isFeatured: true,
    averageRating: 4.7,
    reviewCount: 21,
    categorySlug: "desk-toys",
    categoryName: "Desk Toys",
    tagline: "Gift-ready collectible",
  },
];

export const fallbackHomeData: HomeData = {
  hero: {
    eyebrow: "Made in Tamil Nadu, India",
    title: "Personalized 3D printed gifts made direct from the maker",
    subtitle:
      "Shop ready toys, custom keychains, and photo-based keepsakes with WhatsApp support, clear dispatch timelines, and India-wide shipping.",
    primaryCta: "Shop best sellers",
    secondaryCta: "Ask on WhatsApp",
  },
  trustBar: [
    "4.8/5 customer rating",
    "WhatsApp customization support",
    "Dispatch estimate before checkout",
    "Premium gift packaging",
    "Easy replacement support",
  ],
  categories: fallbackCategories,
  featuredProducts: fallbackProducts,
  reviews: customerReviews,
};

export function getFallbackProductDetail(slug: string): ProductDetail | null {
  const product = fallbackProducts.find((item) => item.slug === slug);
  if (!product) {
    return null;
  }

  return {
    product: {
      ...product,
      sku: `LGL-${product.id}`,
      fullDescription:
        "A gift-ready 3D printed product made with PLA, checked for finish, and supported by the LittleGenius LAB team on WhatsApp for personalization questions.",
      finish: "Smooth PLA finish",
      madeIn: "Tamil Nadu, India",
      tagline: product.tagline ?? product.shortDescription,
    },
    images: [
      {
        id: product.id,
        imageUrl: product.heroImageUrl,
        sortOrder: 1,
        width: 1200,
        height: 1200,
      },
    ],
    reviews: customerReviews,
    relatedProducts: fallbackProducts
      .filter((item) => item.slug !== slug)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        priceInr: item.priceInr,
        heroImageUrl: item.heroImageUrl,
      })),
  };
}

export function getContentGuide(slug: string) {
  return contentGuides.find((guide) => guide.slug === slug);
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
