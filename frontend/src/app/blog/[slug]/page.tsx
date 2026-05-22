import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { FaqSection } from "@/components/store/conversion-content";
import { PageSection } from "@/components/ui/page-section";
import { SurfaceCard } from "@/components/ui/surface-card";
import { buildFaqSchema, contentGuides, getContentGuide, siteBaseUrl } from "@/lib/commerce-content";

export const revalidate = 86400;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return contentGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getContentGuide(slug);

  if (!guide) {
    return {
      title: "Guide not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `/blog/${guide.slug}`,
    },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: `${siteBaseUrl}/blog/${guide.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const guide = getContentGuide(slug);

  if (!guide) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: guide.title,
    description: guide.summary,
    mainEntityOfPage: `${siteBaseUrl}/blog/${guide.slug}`,
    author: {
      "@type": "Organization",
      name: "LittleGenius LAB",
    },
    publisher: {
      "@type": "Organization",
      name: "LittleGenius LAB",
      logo: {
        "@type": "ImageObject",
        url: `${siteBaseUrl}/android-chrome-512x512.png`,
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteBaseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${siteBaseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `${siteBaseUrl}/blog/${guide.slug}`,
      },
    ],
  };
  const faqSchema = buildFaqSchema(guide.faqs);
  const relatedGuides = contentGuides.filter((item) => item.slug !== guide.slug);

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageSection className="section-scene scene-clean">
        <article className="mx-auto max-w-4xl">
          <p className="eyebrow">{guide.category}</p>
          <h1 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--color-ink-soft)] sm:text-lg">
            {guide.summary}
          </p>

          <div className="mt-8 grid gap-4">
            {guide.sections.map((section) => (
              <SurfaceCard key={section.heading} className="p-6" tone="muted">
                <h2 className="text-2xl font-semibold text-[var(--color-blue)]">{section.heading}</h2>
                <p className="mt-4 text-sm leading-8 text-[var(--color-ink-soft)]">{section.body}</p>
              </SurfaceCard>
            ))}
          </div>

          <SurfaceCard className="mt-8 p-6" tone="elevated">
            <h2 className="text-2xl font-semibold text-[var(--color-blue)]">Helpful shopping links</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {guide.linksTo.map((href) => (
                <Link key={href} href={href} className="site-button site-button-secondary">
                  {href === "/shop" ? "Shop collection" : href.replace("/", "").replace("-", " ")}
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </article>
      </PageSection>

      <PageSection className="section-scene scene-pop">
        <FaqSection faqs={guide.faqs} title="Quick answers from this guide" />
      </PageSection>

      <PageSection className="section-scene scene-clean">
        <div className="grid gap-4 md:grid-cols-2">
          {relatedGuides.map((item) => (
            <SurfaceCard key={item.slug} className="p-6" tone="muted">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">{item.category}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-blue)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.summary}</p>
              <Link href={`/blog/${item.slug}`} className="section-link mt-5">
                Read next
              </Link>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>
    </StorefrontShell>
  );
}
