import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About LittleGenius LAB",
  description:
    "Learn about LittleGenius LAB, our Tamil Nadu studio, safe PLA materials, and how we craft 3D printed toys for families across India.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <StorefrontShell>
      {/* Hero Section */}
      <section className="page-shell py-10 sm:py-16">
        <div className="grid items-center gap-8 sm:gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)] mb-4">
              Our Story
            </p>
            <h1 className="display-font text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl md:text-6xl">
              Where Every Toy <br /> Tells a Story
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
              LittleGenius LAB was born in a small studio in <strong>Surandai, Tamil Nadu</strong> with a simple mission: to turn the magic of imagination into something you can hold in your hands.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
              We don&apos;t believe in mass-produced, characterless plastic. We believe in toys that have a personality, toys that are safe for our children, and toys that spark a sense of wonder.
            </p>
          </div>
          <div className="relative px-1 sm:px-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2.2rem] bg-[var(--color-surface-2)] p-8 shadow-2xl sm:rounded-[3rem] sm:p-12 sm:rotate-3">
               <div className="text-[7rem] sm:text-[10rem] lg:text-[12rem]">🧸</div>
            </div>
            <div className="absolute -bottom-4 left-1/2 w-[min(230px,90%)] -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-xl sm:-bottom-6 sm:left-0 sm:w-auto sm:max-w-[220px] sm:translate-x-0 sm:p-6 sm:-rotate-6">
               <p className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wider mb-1">Proudly Made In</p>
               <p className="text-lg font-bold text-[var(--color-orange)]">Tamil Nadu 🇮🇳</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--color-blue)] py-20 text-white">
        <div className="page-shell">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="display-font text-2xl font-bold mb-3">Creative Design</h3>
              <p className="text-white/70 text-sm leading-relaxed">Every animal, robot, and chibi character is designed from scratch with rounded edges and chubby proportions that children love.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="display-font text-2xl font-bold mb-3">Safe & Sustainable</h3>
              <p className="text-white/70 text-sm leading-relaxed">We use biodegradable PLA plastic made from plant starch. It&apos;s non-toxic, eco-friendly, and safe for little ones.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="display-font text-2xl font-bold mb-3">Community First</h3>
              <p className="text-white/70 text-sm leading-relaxed">By manufacturing locally in Surandai, we support our community while ensuring world-class quality in every print.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Founder's Note */}
      <section className="page-shell py-14 sm:py-20">
        <div className="surface-card card-shadow mx-auto max-w-4xl rounded-[2rem] p-6 sm:rounded-[3rem] sm:p-12 md:p-16">
          <h2 className="display-font mb-6 text-center text-2xl font-bold text-[var(--color-blue)] sm:text-3xl">
            A Note from the Lab
          </h2>
          <div className="text-center text-base italic leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
            &quot;As makers, we saw how technology like 3D printing could be used to create something truly personal. LittleGenius LAB is our way of bringing that technology home. Whether it&apos;s a gift for a first birthday or a custom figurine of a beloved pet, we pour our heart into every layer we print.&quot;
          </div>
          <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
            Discover our <Link href="/shop" className="font-semibold text-[var(--color-blue)]">ready-to-ship toy collection</Link> or
            begin a <Link href="/custom-order" className="font-semibold text-[var(--color-blue)]">custom toy order</Link>.
          </p>
          <div className="mt-10 text-center">
            <p className="font-bold text-[var(--color-blue)]">Team LittleGenius LAB</p>
            <p className="text-sm text-[var(--color-ink-soft)]">Surandai, Tamil Nadu</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-shell pb-20">
        <div className="rounded-[2rem] border border-[var(--color-yellow)] bg-[var(--color-surface-2)] p-6 text-center sm:rounded-[3rem] sm:p-12">
          <h2 className="display-font mb-6 text-3xl font-bold text-[var(--color-blue)] sm:text-4xl">
            Ready to find your new best friend?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="site-button site-button-primary">
              Explore the Collection
            </Link>
            <Link href="/custom-order" className="site-button site-button-secondary">
              Start a Custom Order
            </Link>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
