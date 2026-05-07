import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/products", "/about", "/how-it-works", "/custom-order", "/gallery"],
        disallow: [
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/login",
          "/signup",
          "/orders",
          "/track-order",
        ],
      },
    ],
    sitemap: "https://littlegeniuslab.in/sitemap.xml",
  };
}
