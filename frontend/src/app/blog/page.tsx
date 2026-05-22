import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { PageSection } from "@/components/ui/page-section";
import { SurfaceCard } from "@/components/ui/surface-card";
import { buildFaqSchema, contentGuides, siteBaseUrl } from "@/lib/commerce-content";

export const metadata: Metadata = {
  title: "Gift Guides, Product Care and Personalization FAQs",
  description:
    "Read LittleGenius LAB gift guides, 3D printed toy care tips, and personalization FAQs for Indian custom gift shoppers.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const faqSchema = buildFaqSchema(contentGuides.flatMap((guide) => guide.faqs).slice(0, 6));
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "LittleGenius LAB Guides",
    url: `${siteBaseUrl}/blog`,
    blogPost: contentGuides.map((guide) => ({
      "@type": "BlogPosting",
      headline: guide.title,
      description: guide.summary,
      url: `${siteBaseUrl}/blog/${guide.slug}`,
      author: {
        "@type": "Organization",
        name: "LittleGenius LAB",
      },
      publisher: {
        "@type": "Organization",
        name: "LittleGenius LAB",
      },
    })),
  };

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageSection className="section-scene scene-clean">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="eyebrow">LittleGenius LAB guides</p>
            <h1 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-6xl">
              Gift ideas, care tips, and custom order answers
            </h1>
          </div>
          <p className="text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
            Helpful, crawlable content for parents, gift buyers, and personalized gift shoppers in India.
            Each guide links back to relevant collections, policies, and custom order paths.
          </p>
        </div>
      </PageSection>

      <PageSection className="section-scene scene-pop">
        <div className="grid gap-5 md:grid-cols-3">
          {contentGuides.map((guide) => (
            <SurfaceCard key={guide.slug} className="p-6" tone="elevated">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">{guide.category}</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-[var(--color-blue)]">{guide.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{guide.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-blue)]">
                {guide.linksTo.map((href) => (
                  <Link key={href} href={href} className="rounded-full bg-[var(--color-surface-2)] px-3 py-1.5">
                    {href === "/shop" ? "Shop" : href.replace("/", "").replace("-", " ")}
                  </Link>
                ))}
              </div>
              <Link href={`/blog/${guide.slug}`} className="site-button site-button-primary mt-6 w-full">
                Read guide
              </Link>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection className="section-scene scene-clean">
        <SurfaceCard className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center" tone="muted">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-blue)]">Need help choosing?</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">
              Browse best sellers or send the occasion, budget, and delivery pincode on WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="site-button site-button-secondary">
              Shop best sellers
            </Link>
            <Link href="/custom-order" className="site-button site-button-primary">
              Start custom order
            </Link>
          </div>
        </SurfaceCard>
      </PageSection>
    </StorefrontShell>
  );
}
