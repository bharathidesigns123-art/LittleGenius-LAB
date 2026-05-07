# SEO Release Checklist

Use this checklist before shipping storefront changes.

## Metadata
- [ ] Public pages include unique `title` and `description`.
- [ ] Canonical URLs are set for home, shop, categories, products, and major brand pages.
- [ ] Product and category pages generate dynamic metadata from API content.

## Crawlability
- [ ] `robots.txt` allows public pages and blocks auth/account/cart/checkout/admin routes.
- [ ] `sitemap.xml` is generated and includes key static, category, and product URLs.
- [ ] `robots.txt` references the sitemap URL.

## Structured Data
- [ ] Homepage emits valid `Organization` and `WebSite` JSON-LD.
- [ ] Product pages emit `Product` schema with pricing and availability.
- [ ] Category and product pages emit `BreadcrumbList` schema.

## Internal Linking
- [ ] Footer links include a crawlable path to `/shop`.
- [ ] Informational pages include contextual links to `/shop` or `/custom-order`.
- [ ] Product and category navigation remains crawlable with `Link` components.

## Validation
- [ ] Verify `https://littlegeniuslab.in/robots.txt` and `https://littlegeniuslab.in/sitemap.xml`.
- [ ] Test representative pages in [Google Rich Results Test](https://search.google.com/test/rich-results).
- [ ] Run Lighthouse SEO checks for home, category, and product pages.
